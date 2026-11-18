<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Auth.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../helpers/AuditLog.php';

Auth::requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$db     = Database::getInstance();
$uri    = $_SERVER['REQUEST_URI'];
$path   = rtrim(parse_url($uri, PHP_URL_PATH), '/');
$role   = Auth::role();
$userId = Auth::userId();

$segments = explode('/', trim($path, '/'));
$baseIdx  = array_search('grading', $segments);
$sub1     = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;
$sub2     = isset($segments[$baseIdx + 2]) ? $segments[$baseIdx + 2] : null;

// ================================================================
// 1. GET /api/grading/scales — List grading scales with bands
// ================================================================
if ($method === 'GET' && ($sub1 === 'scales' || $sub1 === null) && $sub2 === null) {
    $scalesStmt = $db->query(
        "SELECT gs.*, p.program_name, p.program_code 
         FROM grade_scales gs
         LEFT JOIN programs p ON p.id = gs.program_id
         ORDER BY gs.is_default DESC, gs.id ASC"
    );
    $scales = $scalesStmt->fetchAll(PDO::FETCH_ASSOC);

    $bandsStmt = $db->query("SELECT * FROM grade_scale_bands ORDER BY grade_scale_id ASC, minimum_percentage DESC");
    $allBands = $bandsStmt->fetchAll(PDO::FETCH_ASSOC);

    $bandsByScale = [];
    foreach ($allBands as $b) {
        $bandsByScale[$b['grade_scale_id']][] = $b;
    }

    foreach ($scales as &$s) {
        $s['bands'] = $bandsByScale[$s['id']] ?? [];
    }

    Response::success(['scales' => $scales]);

// ================================================================
// 2. POST /api/grading/scales — Create new grading scale
// ================================================================
} elseif ($method === 'POST' && $sub1 === 'scales') {
    Auth::requireRole('ADMIN');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $scaleName = trim($input['scale_name'] ?? '');
    $programId = !empty($input['program_id']) ? (int)$input['program_id'] : null;
    $minPass   = isset($input['minimum_overall_pass_percentage']) ? (float)$input['minimum_overall_pass_percentage'] : 40.00;
    $isDefault = !empty($input['is_default']) ? 1 : 0;
    $bands     = $input['bands'] ?? [];

    if (empty($scaleName)) {
        Response::error('Scale name is required.', 422);
    }
    if (empty($bands) || !is_array($bands)) {
        Response::error('At least one grade band is required.', 422);
    }

    $db->beginTransaction();
    try {
        if ($isDefault) {
            $db->exec("UPDATE grade_scales SET is_default = 0");
        }

        $ins = $db->prepare(
            "INSERT INTO grade_scales (program_id, scale_name, minimum_overall_pass_percentage, is_default, status)
             VALUES (?, ?, ?, ?, 'ACTIVE')"
        );
        $ins->execute([$programId, $scaleName, $minPass, $isDefault]);
        $scaleId = (int)$db->lastInsertId();

        $bandIns = $db->prepare(
            "INSERT INTO grade_scale_bands (grade_scale_id, minimum_percentage, maximum_percentage, letter_grade, grade_point, is_passing)
             VALUES (?, ?, ?, ?, ?, ?)"
        );

        foreach ($bands as $band) {
            $bandIns->execute([
                $scaleId,
                (float)$band['minimum_percentage'],
                (float)$band['maximum_percentage'],
                strtoupper(trim($band['letter_grade'])),
                (float)$band['grade_point'],
                !empty($band['is_passing']) ? 1 : 0
            ]);
        }

        AuditLog::log($db, $userId, 'CREATE_GRADE_SCALE', 'grade_scales', $scaleId, null, [
            'name' => $scaleName,
            'bands_count' => count($bands)
        ]);

        $db->commit();
        Response::success(['id' => $scaleId], 'Grade scale created successfully.', 201);
    } catch (Exception $e) {
        $db->rollBack();
        Response::error($e->getMessage(), 400);
    }

// ================================================================
// 3. PUT /api/grading/scales/{id} — Update grading scale
// ================================================================
} elseif ($method === 'PUT' && $sub1 === 'scales' && is_numeric($sub2)) {
    Auth::requireRole('ADMIN');
    $scaleId = (int)$sub2;

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $scaleName = trim($input['scale_name'] ?? '');
    $minPass   = isset($input['minimum_overall_pass_percentage']) ? (float)$input['minimum_overall_pass_percentage'] : 40.00;
    $bands     = $input['bands'] ?? [];

    $db->beginTransaction();
    try {
        $upd = $db->prepare(
            "UPDATE grade_scales 
             SET scale_name = ?, minimum_overall_pass_percentage = ?
             WHERE id = ?"
        );
        $upd->execute([$scaleName, $minPass, $scaleId]);

        if (!empty($bands)) {
            $db->prepare("DELETE FROM grade_scale_bands WHERE grade_scale_id = ?")->execute([$scaleId]);

            $bandIns = $db->prepare(
                "INSERT INTO grade_scale_bands (grade_scale_id, minimum_percentage, maximum_percentage, letter_grade, grade_point, is_passing)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            foreach ($bands as $band) {
                $bandIns->execute([
                    $scaleId,
                    (float)$band['minimum_percentage'],
                    (float)$band['maximum_percentage'],
                    strtoupper(trim($band['letter_grade'])),
                    (float)$band['grade_point'],
                    !empty($band['is_passing']) ? 1 : 0
                ]);
            }
        }

        AuditLog::log($db, $userId, 'UPDATE_GRADE_SCALE', 'grade_scales', $scaleId, null, $input);
        $db->commit();
        Response::success(null, 'Grade scale updated successfully.');
    } catch (Exception $e) {
        $db->rollBack();
        Response::error($e->getMessage(), 400);
    }

// ================================================================
// 4. POST /api/grading/calculate — Process/Calculate grades for offering
// ================================================================
} elseif ($method === 'POST' && $sub1 === 'calculate') {
    Auth::requireRole('ADMIN');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $offeringId = (int)($input['offering_id'] ?? 0);

    if (!$offeringId) {
        Response::error('Offering ID is required.', 422);
    }

    // 1. Fetch course offering details
    $offStmt = $db->prepare(
        "SELECT co.*, c.course_code, c.course_title, c.credit_hours, p.id AS program_id, p.program_name
         FROM course_offerings co
         JOIN courses c ON c.id = co.course_id
         LEFT JOIN programs p ON p.id = co.program_id
         WHERE co.id = ? LIMIT 1"
    );
    $offStmt->execute([$offeringId]);
    $offering = $offStmt->fetch(PDO::FETCH_ASSOC);

    if (!$offering) {
        Response::notFound('Course offering not found.');
    }

    // 2. Fetch assessment components
    $compStmt = $db->prepare(
        "SELECT ac.*, mss.status AS submission_status 
         FROM assessment_components ac
         LEFT JOIN mark_sheet_submissions mss ON mss.assessment_component_id = ac.id
         WHERE ac.offering_id = ?
         ORDER BY ac.id ASC"
    );
    $compStmt->execute([$offeringId]);
    $components = $compStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($components)) {
        Response::error('No assessment components defined for this course offering.', 400);
    }

    // Validate total weight equals 100%
    $totalWeight = 0;
    foreach ($components as $c) {
        $totalWeight += (float)$c['weight_percentage'];
    }
    if (abs($totalWeight - 100.0) > 0.05) {
        Response::error("Assessment weights sum to {$totalWeight}%, but must equal exactly 100%.", 422);
    }

    // Check if mandatory components are approved
    $unapproved = [];
    foreach ($components as $c) {
        if ($c['is_mandatory'] && $c['submission_status'] !== 'APPROVED') {
            $unapproved[] = $c['component_name'] . ' (' . ($c['submission_status'] ?: 'NO_SUBMISSION') . ')';
        }
    }
    if (!empty($unapproved) && empty($input['force_draft'])) {
        Response::error('Cannot process final results: Mandatory components are not approved yet: ' . implode(', ', $unapproved), 422);
    }

    // 3. Find grade scale (prefer program-specific, fallback to default)
    $scaleStmt = $db->prepare(
        "SELECT * FROM grade_scales 
         WHERE (program_id = ? OR is_default = 1) AND status = 'ACTIVE'
         ORDER BY (program_id IS NOT NULL AND program_id = ?) DESC, is_default DESC 
         LIMIT 1"
    );
    $scaleStmt->execute([$offering['program_id'], $offering['program_id']]);
    $scale = $scaleStmt->fetch(PDO::FETCH_ASSOC);

    if (!$scale) {
        Response::error('No active grading scale found for this program or default.', 500);
    }

    $bandsStmt = $db->prepare("SELECT * FROM grade_scale_bands WHERE grade_scale_id = ? ORDER BY minimum_percentage DESC");
    $bandsStmt->execute([$scale['id']]);
    $bands = $bandsStmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Fetch all enrollments
    $enrStmt = $db->prepare(
        "SELECT se.id AS enrollment_id, se.student_user_id, u.full_name, sp.roll_number, sp.registration_number
         FROM student_enrollments se
         JOIN users u ON u.id = se.student_user_id
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE se.offering_id = ? AND se.status = 'ENROLLED'
         ORDER BY sp.roll_number ASC"
    );
    $enrStmt->execute([$offeringId]);
    $enrollments = $enrStmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Fetch all marks for this offering
    $marksStmt = $db->prepare(
        "SELECT am.*, ac.weight_percentage, ac.maximum_marks, ac.minimum_pass_percentage, ac.is_mandatory, ac.component_name
         FROM assessment_marks am
         JOIN assessment_components ac ON ac.id = am.assessment_component_id
         WHERE ac.offering_id = ?"
    );
    $marksStmt->execute([$offeringId]);
    $allMarks = $marksStmt->fetchAll(PDO::FETCH_ASSOC);

    $marksByEnrollment = [];
    foreach ($allMarks as $m) {
        $marksByEnrollment[$m['enrollment_id']][$m['assessment_component_id']] = $m;
    }

    // 6. Calculate for each student
    $calculatedResults = [];
    $policySnapshot = [
        'scale_id'    => $scale['id'],
        'scale_name'  => $scale['scale_name'],
        'min_overall' => (float)$scale['minimum_overall_pass_percentage'],
        'components'  => array_map(function($c) {
            return [
                'id' => $c['id'],
                'name' => $c['component_name'],
                'weight' => (float)$c['weight_percentage'],
                'max' => (float)$c['maximum_marks'],
                'min_pass_pct' => (float)($c['minimum_pass_percentage'] ?? 0),
                'is_mandatory' => (bool)$c['is_mandatory']
            ];
        }, $components)
    ];

    $db->beginTransaction();
    try {
        $upsertResult = $db->prepare(
            "INSERT INTO course_results 
             (enrollment_id, total_percentage, total_marks, letter_grade, grade_point, result_status, grading_policy_snapshot, calculated_at)
             VALUES (?, ?, ?, ?, ?, 'PROVISIONAL', ?, NOW())
             ON DUPLICATE KEY UPDATE
             total_percentage = VALUES(total_percentage),
             total_marks = VALUES(total_marks),
             letter_grade = VALUES(letter_grade),
             grade_point = VALUES(grade_point),
             result_status = IF(result_status = 'PUBLISHED', 'PUBLISHED', 'PROVISIONAL'),
             grading_policy_snapshot = VALUES(grading_policy_snapshot),
             calculated_at = NOW()"
        );

        foreach ($enrollments as $enr) {
            $enrId = $enr['enrollment_id'];
            $stMarks = $marksByEnrollment[$enrId] ?? [];

            $totalWeightedPercentage = 0.000;
            $totalObtainedMarks = 0.00;
            $mandatoryFailed = false;
            $componentBreakdown = [];

            foreach ($components as $comp) {
                $compId = $comp['id'];
                $markRow = $stMarks[$compId] ?? null;

                $maxMarks   = (float)$comp['maximum_marks'];
                $weight     = (float)$comp['weight_percentage'];
                $minPassPct = (float)($comp['minimum_pass_percentage'] ?? 0);
                $isMandatory= (bool)$comp['is_mandatory'];

                $obtained   = $markRow ? (float)($markRow['obtained_marks'] ?? 0) : 0;
                $attendance = $markRow ? ($markRow['attendance_status'] ?? 'NOT_ENTERED') : 'NOT_ENTERED';

                if ($attendance === 'ABSENT' && $isMandatory) {
                    $mandatoryFailed = true;
                }

                // Check component minimum passing threshold
                if ($minPassPct > 0 && $maxMarks > 0) {
                    $pctInComp = ($obtained / $maxMarks) * 100.0;
                    if ($pctInComp < $minPassPct && $isMandatory) {
                        $mandatoryFailed = true;
                    }
                }

                $weightedContribution = 0;
                if ($maxMarks > 0 && $attendance === 'PRESENT') {
                    $weightedContribution = ($obtained / $maxMarks) * $weight;
                }

                $totalWeightedPercentage += $weightedContribution;
                $totalObtainedMarks += $obtained;

                $componentBreakdown[] = [
                    'component_id' => $compId,
                    'name' => $comp['component_name'],
                    'obtained' => $obtained,
                    'max' => $maxMarks,
                    'weight' => $weight,
                    'contribution' => round($weightedContribution, 3),
                    'attendance' => $attendance
                ];
            }

            $roundedPercentage = round($totalWeightedPercentage, 3);

            // Determine Grade Band
            $letterGrade = 'F';
            $gradePoint = 0.00;
            $isPassing = false;

            if (!$mandatoryFailed && $roundedPercentage >= (float)$scale['minimum_overall_pass_percentage']) {
                foreach ($bands as $band) {
                    $minP = (float)$band['minimum_percentage'];
                    $maxP = (float)$band['maximum_percentage'];

                    // Check if rounded percentage is in band range
                    if ($roundedPercentage >= $minP && $roundedPercentage <= $maxP) {
                        $letterGrade = $band['letter_grade'];
                        $gradePoint = (float)$band['grade_point'];
                        $isPassing = (bool)$band['is_passing'];
                        break;
                    }
                }
            } else {
                $letterGrade = 'F';
                $gradePoint = 0.00;
                $isPassing = false;
            }

            $snapshot = $policySnapshot;
            $snapshot['component_breakdown'] = $componentBreakdown;
            $snapshot['mandatory_failed'] = $mandatoryFailed;

            $upsertResult->execute([
                $enrId,
                $roundedPercentage,
                $totalObtainedMarks,
                $letterGrade,
                $gradePoint,
                json_encode($snapshot)
            ]);

            $calculatedResults[] = [
                'enrollment_id'    => $enrId,
                'student_name'     => $enr['full_name'],
                'roll_number'      => $enr['roll_number'],
                'total_percentage' => $roundedPercentage,
                'total_marks'      => $totalObtainedMarks,
                'letter_grade'     => $letterGrade,
                'grade_point'      => $gradePoint,
                'status'           => $isPassing ? 'PASS' : 'FAIL',
                'mandatory_failed' => $mandatoryFailed,
                'breakdown'        => $componentBreakdown
            ];
        }

        AuditLog::log($db, $userId, 'CALCULATE_GRADES', 'course_offerings', $offeringId, null, [
            'students_count' => count($calculatedResults)
        ]);

        $db->commit();
        Response::success([
            'offering'  => $offering,
            'scale'     => $scale,
            'results'   => $calculatedResults
        ], 'Grades calculated and provisional results generated successfully.');
    } catch (Exception $e) {
        $db->rollBack();
        Response::error($e->getMessage(), 400);
    }

} else {
    Response::notFound('Grading endpoint not found.');
}


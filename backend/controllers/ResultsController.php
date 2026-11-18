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
$baseIdx  = array_search('results', $segments);
$sub1     = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;
$sub2     = isset($segments[$baseIdx + 2]) ? $segments[$baseIdx + 2] : null;
$sub3     = isset($segments[$baseIdx + 3]) ? $segments[$baseIdx + 3] : null;

// ================================================================
// 1. POST /api/results/publish — Publish results for course offering
// ================================================================
if ($method === 'POST' && $sub1 === 'publish') {
    Auth::requireRole('ADMIN');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $offeringId = (int)($input['offering_id'] ?? 0);

    if (!$offeringId) {
        Response::error('Offering ID is required.', 422);
    }

    // Verify all mandatory components have approved submissions
    $compStmt = $db->prepare(
        "SELECT ac.component_name, ac.is_mandatory, mss.status AS sub_status
         FROM assessment_components ac
         LEFT JOIN mark_sheet_submissions mss ON mss.assessment_component_id = ac.id
         WHERE ac.offering_id = ?"
    );
    $compStmt->execute([$offeringId]);
    $comps = $compStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($comps as $c) {
        if ($c['is_mandatory'] && $c['sub_status'] !== 'APPROVED') {
            Response::error("Cannot publish: Component '{$c['component_name']}' is not yet APPROVED.", 422);
        }
    }

    // Verify provisional results exist
    $chkStmt = $db->prepare(
        "SELECT COUNT(*) FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         WHERE se.offering_id = ?"
    );
    $chkStmt->execute([$offeringId]);
    if ($chkStmt->fetchColumn() == 0) {
        Response::error('No calculated results found for this course offering. Please run grade calculation first.', 400);
    }

    $pubStmt = $db->prepare(
        "UPDATE course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         SET cr.result_status = 'PUBLISHED',
             cr.published_at = NOW(),
             cr.published_by = ?
         WHERE se.offering_id = ? AND cr.result_status IN ('PROVISIONAL', 'INCOMPLETE')"
    );
    $pubStmt->execute([$userId, $offeringId]);
    $affected = $pubStmt->rowCount();

    AuditLog::log($db, $userId, 'PUBLISH_RESULTS', 'course_offerings', $offeringId, null, [
        'published_count' => $affected
    ]);

    Response::success(['published_count' => $affected], 'Results published successfully.');

// ================================================================
// 2. POST /api/results/unlock — Unlock published results for correction
// ================================================================
} elseif ($method === 'POST' && $sub1 === 'unlock') {
    Auth::requireRole('ADMIN');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $offeringId = (int)($input['offering_id'] ?? 0);
    $resultIds  = $input['result_ids'] ?? [];
    $reason     = trim($input['reason'] ?? '');

    if (empty($reason)) {
        Response::error('Administrative justification/reason is required to unlock published results.', 422);
    }

    $db->beginTransaction();
    try {
        if ($offeringId) {
            $unStmt = $db->prepare(
                "UPDATE course_results cr
                 JOIN student_enrollments se ON se.id = cr.enrollment_id
                 SET cr.result_status = 'PROVISIONAL',
                     cr.published_at = NULL,
                     cr.published_by = NULL
                 WHERE se.offering_id = ? AND cr.result_status = 'PUBLISHED'"
            );
            $unStmt->execute([$offeringId]);
            $unlockedCount = $unStmt->rowCount();

            AuditLog::log($db, $userId, 'UNLOCK_RESULTS', 'course_offerings', $offeringId, ['status' => 'PUBLISHED'], [
                'status' => 'PROVISIONAL',
                'reason' => $reason,
                'count' => $unlockedCount
            ]);
        } elseif (!empty($resultIds)) {
            $inClause = implode(',', array_map('intval', $resultIds));
            $db->exec("UPDATE course_results SET result_status = 'PROVISIONAL', published_at = NULL, published_by = NULL WHERE id IN ({$inClause}) AND result_status = 'PUBLISHED'");
            $unlockedCount = count($resultIds);

            AuditLog::log($db, $userId, 'UNLOCK_RESULTS_BATCH', 'course_results', null, null, [
                'result_ids' => $resultIds,
                'reason' => $reason
            ]);
        } else {
            throw new InvalidArgumentException('Either offering_id or result_ids array must be provided.');
        }

        $db->commit();
        Response::success(null, 'Results unlocked successfully for revisions.');
    } catch (Exception $e) {
        $db->rollBack();
        Response::error($e->getMessage(), 400);
    }

// ================================================================
// 3. GET /api/results/student/{studentId} — Student published results
// ================================================================
} elseif ($method === 'GET' && $sub1 === 'student' && is_numeric($sub2)) {
    $targetStudentId = (int)$sub2;

    // Security check: Students can only query their own results
    if ($role === 'STUDENT' && $userId !== $targetStudentId) {
        Response::forbidden('Access denied. You can only view your own academic results.');
    }

    // Students only ever see PUBLISHED results! Admins can see PROVISIONAL if needed
    $statusFilter = ($role === 'STUDENT') ? "AND cr.result_status = 'PUBLISHED'" : "";

    $stmt = $db->prepare(
        "SELECT cr.*, 
                c.course_code, c.course_title, c.credit_hours, c.course_type,
                co.semester_number, co.section,
                s.id AS session_id, s.session_name,
                p.program_name, p.program_code
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         LEFT JOIN programs p ON p.id = co.program_id
         WHERE se.student_user_id = ? {$statusFilter}
         ORDER BY s.start_date DESC, co.semester_number ASC, c.course_code ASC"
    );
    $stmt->execute([$targetStudentId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate overall statistics
    $totalCredits = 0;
    $totalQualityPoints = 0;
    $passedCredits = 0;
    $semesterGroups = [];

    foreach ($results as $r) {
        $credits = (float)$r['credit_hours'];
        $gp = (float)($r['grade_point'] ?? 0);
        $semKey = $r['session_name'] . ' - Sem ' . $r['semester_number'];

        $totalCredits += $credits;
        $totalQualityPoints += ($credits * $gp);
        if ($r['letter_grade'] !== 'F' && $gp > 0) {
            $passedCredits += $credits;
        }

        $semesterGroups[$semKey]['session_id'] = $r['session_id'];
        $semesterGroups[$semKey]['session_name'] = $r['session_name'];
        $semesterGroups[$semKey]['semester_number'] = $r['semester_number'];
        $semesterGroups[$semKey]['courses'][] = $r;
    }

    // Calculate SGPA for each semester group
    foreach ($semesterGroups as &$group) {
        $semCr = 0;
        $semQp = 0;
        foreach ($group['courses'] as $c) {
            $cr = (float)$c['credit_hours'];
            $gp = (float)($c['grade_point'] ?? 0);
            $semCr += $cr;
            $semQp += ($cr * $gp);
        }
        $group['total_credits'] = $semCr;
        $group['sgpa'] = $semCr > 0 ? round($semQp / $semCr, 2) : 0.00;
    }

    $cgpa = $totalCredits > 0 ? round($totalQualityPoints / $totalCredits, 2) : 0.00;

    Response::success([
        'student_id'     => $targetStudentId,
        'cgpa'           => $cgpa,
        'total_credits'  => $totalCredits,
        'passed_credits' => $passedCredits,
        'semesters'      => array_values($semesterGroups),
        'results'        => $results
    ]);

// ================================================================
// 4. GET /api/results/offering/{offeringId} — Results by offering
// ================================================================
} elseif ($method === 'GET' && $sub1 === 'offering' && is_numeric($sub2)) {
    $offeringId = (int)$sub2;

    if ($role === 'STUDENT') {
        Response::forbidden('Students cannot access course offering results directly.');
    }

    // If faculty, verify course is assigned
    if ($role === 'FACULTY') {
        $chk = $db->prepare("SELECT id FROM course_offerings WHERE id = ? AND faculty_user_id = ?");
        $chk->execute([$offeringId, $userId]);
        if (!$chk->fetchColumn()) {
            Response::forbidden('You do not teach this course offering.');
        }
    }

    $stmt = $db->prepare(
        "SELECT cr.*, 
                u.full_name AS student_name, u.email,
                sp.roll_number, sp.registration_number,
                c.course_code, c.course_title, c.credit_hours
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN users u ON u.id = se.student_user_id
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         WHERE se.offering_id = ?
         ORDER BY sp.roll_number ASC, u.full_name ASC"
    );
    $stmt->execute([$offeringId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Summary statistics
    $total = count($results);
    $passed = 0;
    $failed = 0;
    $gradeDist = [];

    foreach ($results as $r) {
        $lg = $r['letter_grade'] ?: 'UNKNOWN';
        $gradeDist[$lg] = ($gradeDist[$lg] ?? 0) + 1;
        if ($r['letter_grade'] === 'F' || (float)$r['grade_point'] === 0.0) {
            $failed++;
        } else {
            $passed++;
        }
    }

    Response::success([
        'offering_id' => $offeringId,
        'total'       => $total,
        'passed'      => $passed,
        'failed'      => $failed,
        'distribution'=> $gradeDist,
        'results'     => $results
    ]);

// ================================================================
// 5. GET /api/results/published — List of published result batches
// ================================================================
} elseif ($method === 'GET' && $sub1 === 'published') {
    Auth::requireRole(['ADMIN', 'FACULTY']);

    $where = ["cr.result_status = 'PUBLISHED'"];
    $params = [];

    if ($role === 'FACULTY') {
        $where[] = "co.faculty_user_id = ?";
        $params[] = $userId;
    }

    $stmt = $db->prepare(
        "SELECT co.id AS offering_id, co.section, co.semester_number,
                c.course_code, c.course_title, c.credit_hours,
                s.session_name, p.program_name,
                u_fac.full_name AS faculty_name,
                cr.published_at,
                COUNT(cr.id) AS total_students,
                SUM(CASE WHEN cr.letter_grade != 'F' THEN 1 ELSE 0 END) AS pass_count,
                SUM(CASE WHEN cr.letter_grade = 'F' THEN 1 ELSE 0 END) AS fail_count,
                ROUND(AVG(cr.grade_point), 2) AS avg_grade_point
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         LEFT JOIN programs p ON p.id = co.program_id
         LEFT JOIN users u_fac ON u_fac.id = co.faculty_user_id
         WHERE " . implode(' AND ', $where) . "
         GROUP BY co.id, cr.published_at
         ORDER BY cr.published_at DESC"
    );
    $stmt->execute($params);
    Response::success(['published' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// ================================================================
// 6. GET /api/results — Main Results Listing
// ================================================================
} elseif ($method === 'GET' && $sub1 === null) {
    if ($role === 'STUDENT') {
        // Automatically redirect to student results
        $stmt = $db->prepare(
            "SELECT cr.*, c.course_code, c.course_title, c.credit_hours, s.session_name, co.semester_number
             FROM course_results cr
             JOIN student_enrollments se ON se.id = cr.enrollment_id
             JOIN course_offerings co ON co.id = se.offering_id
             JOIN courses c ON c.id = co.course_id
             JOIN academic_sessions s ON s.id = co.academic_session_id
             WHERE se.student_user_id = ? AND cr.result_status = 'PUBLISHED'
             ORDER BY co.semester_number ASC"
        );
        $stmt->execute([$userId]);
        Response::success(['results' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    // Admin or Faculty view
    $where = ['1=1'];
    $params = [];

    if ($role === 'FACULTY') {
        $where[] = 'co.faculty_user_id = ?';
        $params[] = $userId;
    }

    if (!empty($_GET['status'])) {
        $where[] = 'cr.result_status = ?';
        $params[] = strtoupper($_GET['status']);
    }

    if (!empty($_GET['offering_id'])) {
        $where[] = 'co.id = ?';
        $params[] = $_GET['offering_id'];
    }

    if (!empty($_GET['session_id'])) {
        $where[] = 'co.academic_session_id = ?';
        $params[] = $_GET['session_id'];
    }

    $stmt = $db->prepare(
        "SELECT cr.*, 
                u.full_name AS student_name, sp.roll_number, sp.registration_number,
                c.course_code, c.course_title, c.credit_hours,
                co.semester_number, co.section,
                s.session_name, p.program_name
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN users u ON u.id = se.student_user_id
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         LEFT JOIN programs p ON p.id = co.program_id
         WHERE " . implode(' AND ', $where) . "
         ORDER BY sp.roll_number ASC
         LIMIT 200"
    );
    $stmt->execute($params);
    Response::success(['results' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

} else {
    Response::notFound('Results endpoint not found.');
}


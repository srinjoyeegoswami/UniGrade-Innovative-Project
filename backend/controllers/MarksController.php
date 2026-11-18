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
$baseIdx  = array_search('marks', $segments);
$actionOrId = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;
$sub        = isset($segments[$baseIdx + 2]) ? $segments[$baseIdx + 2] : null;

// ================================================================
// 1. GET /api/marks/submissions — List mark sheet submissions
// ================================================================
if ($method === 'GET' && $actionOrId === 'submissions') {
    $where = ['1=1'];
    $params = [];

    if ($role === 'FACULTY') {
        $where[] = 'co.faculty_user_id = ?';
        $params[] = $userId;
    }

    $status = $_GET['status'] ?? null;
    if ($status) {
        $where[] = 'mss.status = ?';
        $params[] = strtoupper($status);
    }

    $stmt = $db->prepare(
        "SELECT mss.*, ac.component_name, ac.maximum_marks, ac.weight_percentage,
                c.course_code, c.course_title, co.section, co.semester_number,
                u_sub.full_name AS submitted_by_name, u_rev.full_name AS reviewed_by_name,
                (SELECT COUNT(*) FROM student_enrollments se WHERE se.offering_id = co.id AND se.status = 'ENROLLED') AS enrolled_students_count,
                (SELECT COUNT(*) FROM assessment_marks am WHERE am.assessment_component_id = ac.id) AS marked_students_count
         FROM mark_sheet_submissions mss
         JOIN assessment_components ac ON ac.id = mss.assessment_component_id
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         LEFT JOIN users u_sub ON u_sub.id = mss.submitted_by
         LEFT JOIN users u_rev ON u_rev.id = mss.reviewed_by
         WHERE " . implode(' AND ', $where) . "
         ORDER BY mss.updated_at DESC"
    );
    $stmt->execute($params);
    Response::success(['submissions' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// ================================================================
// 2. GET /api/marks/submission/{componentId}
// ================================================================
} elseif ($method === 'GET' && $actionOrId === 'submission' && $sub !== null) {
    $componentId = (int)$sub;
    $stmt = $db->prepare("SELECT * FROM mark_sheet_submissions WHERE assessment_component_id = ? LIMIT 1");
    $stmt->execute([$componentId]);
    $subRecord = $stmt->fetch(PDO::FETCH_ASSOC);
    Response::success(['submission' => $subRecord]);

// ================================================================
// 3. POST /api/marks/save-draft — Save marks as draft
// ================================================================
} elseif ($method === 'POST' && $actionOrId === 'save-draft') {
    if ($role !== 'FACULTY' && $role !== 'ADMIN') {
        Response::forbidden('Only faculty or admins can save marks.');
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $componentId = (int)($input['component_id'] ?? 0);
    $marksData   = $input['marks'] ?? [];

    if (!$componentId) {
        Response::error('Component ID is required.', 422);
    }

    // Verify component exists & faculty has permission
    $cStmt = $db->prepare(
        "SELECT ac.*, co.faculty_user_id 
         FROM assessment_components ac 
         JOIN course_offerings co ON co.id = ac.offering_id 
         WHERE ac.id = ? LIMIT 1"
    );
    $cStmt->execute([$componentId]);
    $comp = $cStmt->fetch(PDO::FETCH_ASSOC);

    if (!$comp) {
        Response::notFound('Assessment component not found.');
    }

    if ($role === 'FACULTY' && (int)$comp['faculty_user_id'] !== $userId) {
        Response::forbidden('You are not assigned to this course offering.');
    }

    // Check if submission is already approved or published
    $subStmt = $db->prepare("SELECT status FROM mark_sheet_submissions WHERE assessment_component_id = ? LIMIT 1");
    $subStmt->execute([$componentId]);
    $subStatus = $subStmt->fetchColumn();

    if ($subStatus === 'APPROVED' && $role !== 'ADMIN') {
        Response::error('This mark sheet has already been approved and cannot be modified.', 403);
    }

    $db->beginTransaction();
    try {
        $upsertMark = $db->prepare(
            "INSERT INTO assessment_marks 
             (assessment_component_id, enrollment_id, obtained_marks, attendance_status, remarks, entered_by, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
             obtained_marks = VALUES(obtained_marks),
             attendance_status = VALUES(attendance_status),
             remarks = VALUES(remarks),
             entered_by = VALUES(entered_by),
             updated_at = NOW()"
        );

        $maxMarks = (float)$comp['maximum_marks'];

        foreach ($marksData as $row) {
            $enrollmentId = (int)($row['enrollment_id'] ?? 0);
            if (!$enrollmentId) continue;

            $att = strtoupper(trim($row['attendance_status'] ?? 'NOT_ENTERED'));
            if (!in_array($att, ['PRESENT', 'ABSENT', 'EXCUSED', 'NOT_ENTERED'])) {
                $att = 'NOT_ENTERED';
            }

            $obtained = null;
            if ($att === 'PRESENT' && isset($row['obtained_marks']) && $row['obtained_marks'] !== '' && $row['obtained_marks'] !== null) {
                $obtained = (float)$row['obtained_marks'];
                if ($obtained < 0 || $obtained > $maxMarks) {
                    throw new InvalidArgumentException("Marks for enrollment {$enrollmentId} must be between 0 and {$maxMarks}");
                }
            } elseif ($att === 'ABSENT') {
                $obtained = 0.00;
            }

            $remarks = !empty($row['remarks']) ? trim($row['remarks']) : null;

            $upsertMark->execute([$componentId, $enrollmentId, $obtained, $att, $remarks, $userId]);
        }

        // Upsert submission record as DRAFT if not already existing
        $upsertSub = $db->prepare(
            "INSERT INTO mark_sheet_submissions (assessment_component_id, submitted_by, status, created_at, updated_at)
             VALUES (?, ?, 'DRAFT', NOW(), NOW())
             ON DUPLICATE KEY UPDATE 
             status = IF(status = 'RETURNED', 'DRAFT', status),
             updated_at = NOW()"
        );
        $upsertSub->execute([$componentId, $userId]);

        AuditLog::log($db, $userId, 'SAVE_MARKS_DRAFT', 'assessment_components', $componentId, null, [
            'count' => count($marksData)
        ]);

        $db->commit();
        Response::success(null, 'Marks draft saved successfully.');
    } catch (Exception $e) {
        $db->rollBack();
        Response::error($e->getMessage(), 400);
    }

// ================================================================
// 4. POST /api/marks/submit — Faculty submits mark sheet
// ================================================================
} elseif ($method === 'POST' && $actionOrId === 'submit') {
    if ($role !== 'FACULTY' && $role !== 'ADMIN') {
        Response::forbidden('Only faculty or admins can submit mark sheets.');
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $componentId = (int)($input['component_id'] ?? 0);

    if (!$componentId) {
        Response::error('Component ID is required.', 422);
    }

    // Component details
    $cStmt = $db->prepare(
        "SELECT ac.*, co.id AS offering_id, co.faculty_user_id 
         FROM assessment_components ac 
         JOIN course_offerings co ON co.id = ac.offering_id 
         WHERE ac.id = ? LIMIT 1"
    );
    $cStmt->execute([$componentId]);
    $comp = $cStmt->fetch(PDO::FETCH_ASSOC);

    if (!$comp) {
        Response::notFound('Assessment component not found.');
    }

    if ($role === 'FACULTY' && (int)$comp['faculty_user_id'] !== $userId) {
        Response::forbidden('You are not assigned to this course offering.');
    }

    // Validate that all enrolled students have marks/attendance
    $enrStmt = $db->prepare(
        "SELECT se.id, se.student_user_id, am.obtained_marks, am.attendance_status
         FROM student_enrollments se
         LEFT JOIN assessment_marks am ON am.enrollment_id = se.id AND am.assessment_component_id = ?
         WHERE se.offering_id = ? AND se.status = 'ENROLLED'"
    );
    $enrStmt->execute([$componentId, $comp['offering_id']]);
    $enrollments = $enrStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($enrollments)) {
        Response::error('No enrolled students in this course offering to submit marks for.', 400);
    }

    $unmarked = 0;
    foreach ($enrollments as $enr) {
        if (empty($enr['attendance_status']) || $enr['attendance_status'] === 'NOT_ENTERED') {
            $unmarked++;
        }
    }

    if ($unmarked > 0) {
        Response::error("Cannot submit: {$unmarked} student(s) still have attendance marked as 'NOT_ENTERED'.", 422);
    }

    $subStmt = $db->prepare(
        "INSERT INTO mark_sheet_submissions (assessment_component_id, submitted_by, status, submitted_at, updated_at)
         VALUES (?, ?, 'SUBMITTED', NOW(), NOW())
         ON DUPLICATE KEY UPDATE
         status = 'SUBMITTED',
         submitted_by = VALUES(submitted_by),
         submitted_at = NOW(),
         updated_at = NOW()"
    );
    $subStmt->execute([$componentId, $userId]);

    AuditLog::log($db, $userId, 'SUBMIT_MARK_SHEET', 'assessment_components', $componentId, null, [
        'status' => 'SUBMITTED'
    ]);

    Response::success(null, 'Mark sheet submitted successfully for administrative review.');

// ================================================================
// 5. POST /api/marks/review — Admin reviews and approves/returns
// ================================================================
} elseif ($method === 'POST' && $actionOrId === 'review') {
    Auth::requireRole('ADMIN');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $componentId = (int)($input['component_id'] ?? 0);
    $action      = strtolower(trim($input['action'] ?? '')); // 'approve' | 'return'
    $comment     = trim($input['comment'] ?? '');

    if (!$componentId || !in_array($action, ['approve', 'return'])) {
        Response::error("Invalid review request. Action must be 'approve' or 'return'.", 422);
    }

    $newStatus = ($action === 'approve') ? 'APPROVED' : 'RETURNED';

    $update = $db->prepare(
        "UPDATE mark_sheet_submissions 
         SET status = ?, reviewed_by = ?, review_comment = ?, reviewed_at = NOW(), updated_at = NOW()
         WHERE assessment_component_id = ?"
    );
    $update->execute([$newStatus, $userId, $comment ?: null, $componentId]);

    AuditLog::log($db, $userId, 'REVIEW_MARK_SHEET', 'assessment_components', $componentId, null, [
        'status' => $newStatus,
        'comment' => $comment
    ]);

    Response::success(['status' => $newStatus], "Mark sheet has been {$newStatus}.");

// ================================================================
// 6. GET /api/marks/{componentId} — Get marks table for component
// ================================================================
} elseif ($method === 'GET' && is_numeric($actionOrId)) {
    $componentId = (int)$actionOrId;

    // Fetch component and offering info
    $cStmt = $db->prepare(
        "SELECT ac.*, co.id AS offering_id, co.faculty_user_id, co.section, co.semester_number,
                c.course_code, c.course_title, s.session_name, p.program_name
         FROM assessment_components ac
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         LEFT JOIN programs p ON p.id = co.program_id
         WHERE ac.id = ? LIMIT 1"
    );
    $cStmt->execute([$componentId]);
    $component = $cStmt->fetch(PDO::FETCH_ASSOC);

    if (!$component) {
        Response::notFound('Assessment component not found.');
    }

    if ($role === 'FACULTY' && (int)$component['faculty_user_id'] !== $userId) {
        Response::forbidden('You do not have access to marks for this course offering.');
    }

    // Get submission status
    $sStmt = $db->prepare("SELECT * FROM mark_sheet_submissions WHERE assessment_component_id = ? LIMIT 1");
    $sStmt->execute([$componentId]);
    $submission = $sStmt->fetch(PDO::FETCH_ASSOC);

    // Get all enrolled students and their existing marks
    $mStmt = $db->prepare(
        "SELECT se.id AS enrollment_id, se.student_user_id,
                u.full_name AS student_name, u.email,
                sp.roll_number, sp.registration_number,
                am.id AS mark_id, am.obtained_marks, am.attendance_status, am.remarks, am.updated_at
         FROM student_enrollments se
         JOIN users u ON u.id = se.student_user_id
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         LEFT JOIN assessment_marks am ON am.enrollment_id = se.id AND am.assessment_component_id = ?
         WHERE se.offering_id = ? AND se.status = 'ENROLLED'
         ORDER BY sp.roll_number ASC, u.full_name ASC"
    );
    $mStmt->execute([$componentId, $component['offering_id']]);
    $students = $mStmt->fetchAll(PDO::FETCH_ASSOC);

    Response::success([
        'component'  => $component,
        'submission' => $submission ?: ['status' => 'DRAFT'],
        'students'   => $students
    ]);

} else {
    Response::notFound('Invalid marks endpoint.');
}


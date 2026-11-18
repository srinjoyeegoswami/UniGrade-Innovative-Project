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
$baseIdx  = array_search('enrollments', $segments);
$id       = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;

// ==== LIST ====
if ($method === 'GET' && $id === null) {
    $where  = ['1=1'];
    $params = [];

    if ($role === 'STUDENT') {
        $where[] = 'se.student_user_id = ?';
        $params[] = $userId;
    } elseif ($role !== 'ADMIN') {
        Response::forbidden('Access denied.'); exit;
    }

    if (!empty($_GET['offering_id'])) { $where[] = 'se.offering_id = ?'; $params[] = $_GET['offering_id']; }
    if (!empty($_GET['status']))      { $where[] = 'se.status = ?';      $params[] = strtoupper($_GET['status']); }

    $stmt = $db->prepare(
        "SELECT se.id, se.offering_id, se.student_user_id, se.enrollment_date, se.status,
                u.full_name AS student_name, sp.roll_number,
                c.course_title, c.course_code, co.semester_number, co.section, s.session_name
         FROM student_enrollments se
         JOIN users u ON u.id = se.student_user_id
         LEFT JOIN student_profiles sp ON sp.user_id = se.student_user_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         WHERE " . implode(' AND ', $where) . "
         ORDER BY se.enrollment_date DESC"
    );
    $stmt->execute($params);
    Response::success(['enrollments' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// ==== BULK ENROLL ====
} elseif ($method === 'POST' && $id === 'bulk') {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($input['offering_id']) || empty($input['student_ids']) || !is_array($input['student_ids'])) {
        Response::error('offering_id and student_ids[] are required.', 422); exit;
    }

    $offeringId = (int)$input['offering_id'];
    $cap = $db->prepare("SELECT enrollment_capacity FROM course_offerings WHERE id = ? LIMIT 1");
    $cap->execute([$offeringId]);
    $capacity = (int)($cap->fetchColumn() ?? 60);

    $cur = $db->prepare("SELECT COUNT(*) FROM student_enrollments WHERE offering_id = ? AND status = 'ENROLLED'");
    $cur->execute([$offeringId]);
    $currentCount = (int)$cur->fetchColumn();

    if (($currentCount + count($input['student_ids'])) > $capacity) {
        Response::error("Enrollment would exceed capacity ({$capacity}).", 409); exit;
    }

    $db->beginTransaction();
    $enrolled = 0;
    $skipped  = 0;
    foreach ($input['student_ids'] as $sid) {
        $dup = $db->prepare("SELECT id FROM student_enrollments WHERE offering_id = ? AND student_user_id = ? LIMIT 1");
        $dup->execute([$offeringId, (int)$sid]);
        if ($dup->fetchColumn()) { $skipped++; continue; }
        $ins = $db->prepare("INSERT INTO student_enrollments (offering_id,student_user_id,enrollment_date,status) VALUES (?,?,CURDATE(),'ENROLLED')");
        $ins->execute([$offeringId, (int)$sid]);
        $enrolled++;
    }
    $db->commit();
    Response::success(['enrolled' => $enrolled, 'skipped' => $skipped], "Bulk enrollment done.");

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $v     = new Validator($input);
    $v->required('offering_id');
    $v->required('student_user_id');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    // Capacity check
    $cap = $db->prepare("SELECT enrollment_capacity FROM course_offerings WHERE id = ? LIMIT 1");
    $cap->execute([(int)$input['offering_id']]);
    $capacity = (int)($cap->fetchColumn() ?? 60);

    $cur = $db->prepare("SELECT COUNT(*) FROM student_enrollments WHERE offering_id = ? AND status = 'ENROLLED'");
    $cur->execute([(int)$input['offering_id']]);
    if ((int)$cur->fetchColumn() >= $capacity) {
        Response::error("Enrollment capacity ({$capacity}) reached.", 409); exit;
    }

    // Duplicate check
    $dup = $db->prepare("SELECT id FROM student_enrollments WHERE offering_id = ? AND student_user_id = ? LIMIT 1");
    $dup->execute([(int)$input['offering_id'], (int)$input['student_user_id']]);
    if ($dup->fetchColumn()) { Response::error('Student is already enrolled.', 409); exit; }

    $ins = $db->prepare("INSERT INTO student_enrollments (offering_id,student_user_id,enrollment_date,status) VALUES (?,?,CURDATE(),'ENROLLED')");
    $ins->execute([(int)$input['offering_id'], (int)$input['student_user_id']]);
    Response::success(['id' => (int)$db->lastInsertId()], 'Enrolled successfully.', 201);

// ==== UPDATE STATUS ====
} elseif ($method === 'PUT' && $id !== null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT id FROM student_enrollments WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Enrollment not found.'); exit; }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($input['status'])) { Response::error('status is required.', 422); exit; }

    $allowed = ['ENROLLED','DROPPED','COMPLETED'];
    if (!in_array(strtoupper($input['status']), $allowed)) {
        Response::error('Invalid status.', 422); exit;
    }

    $db->prepare("UPDATE student_enrollments SET status = ? WHERE id = ?")->execute([strtoupper($input['status']), (int)$id]);
    Response::success(null, 'Enrollment status updated.');

// ==== DELETE ====
} elseif ($method === 'DELETE' && $id !== null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT id FROM student_enrollments WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Enrollment not found.'); exit; }

    // No marks check
    $marks = $db->prepare("SELECT COUNT(*) FROM assessment_marks WHERE enrollment_id = ? AND attendance_status != 'NOT_ENTERED'");
    $marks->execute([(int)$id]);
    if ((int)$marks->fetchColumn() > 0) {
        Response::error('Cannot remove enrollment with existing marks.', 409); exit;
    }

    $db->prepare("DELETE FROM student_enrollments WHERE id = ?")->execute([(int)$id]);
    Response::success(null, 'Enrollment removed.');

} else {
    Response::notFound('Endpoint not found.');
}

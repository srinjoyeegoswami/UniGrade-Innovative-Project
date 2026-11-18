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
$baseIdx  = array_search('offerings', $segments);
$id       = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;
$sub      = isset($segments[$baseIdx + 2]) ? $segments[$baseIdx + 2] : null;

// ==== LIST ====
if ($method === 'GET' && $id === null) {
    require_once __DIR__ . '/../config/foundation.php';
    ensureFoundationData($db);

    $where  = ['1=1'];
    $params = [];

    if ($role === 'FACULTY') {
        $where[] = 'co.faculty_user_id = ?';
        $params[] = $userId;
    }
    if (!empty($_GET['session_id'])) { $where[] = 'co.academic_session_id = ?'; $params[] = $_GET['session_id']; }
    if (!empty($_GET['program_id'])) { $where[] = 'co.program_id = ?';          $params[] = $_GET['program_id']; }
    if (!empty($_GET['semester']))   { $where[] = 'co.semester_number = ?';     $params[] = $_GET['semester']; }

    $stmt = $db->prepare(
        "SELECT co.id, co.semester_number, co.section, co.enrollment_capacity, co.status,
                co.faculty_user_id, c.course_code, c.course_title, c.credit_hours,
                s.session_name, p.program_name, u.full_name AS faculty_name,
                COUNT(DISTINCT se.id) AS enrolled_count
         FROM course_offerings co
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         JOIN programs p ON p.id = co.program_id
         LEFT JOIN users u ON u.id = co.faculty_user_id
         LEFT JOIN student_enrollments se ON se.offering_id = co.id AND se.status = 'ENROLLED'
         WHERE " . implode(' AND ', $where) . "
         GROUP BY co.id
         ORDER BY s.start_date DESC, c.course_title"
    );
    $stmt->execute($params);
    $offerings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($offerings) && empty($_GET['session_id']) && $role === 'ADMIN') {
        $courseId = $db->query("SELECT id FROM courses LIMIT 1")->fetchColumn();
        $sessId   = $db->query("SELECT id FROM academic_sessions LIMIT 1")->fetchColumn();
        $progId   = $db->query("SELECT id FROM programs LIMIT 1")->fetchColumn();
        if ($courseId && $sessId && $progId) {
            $adminId = $db->query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1")->fetchColumn() ?: null;
            $db->prepare("INSERT INTO course_offerings (course_id, academic_session_id, program_id, semester_number, section, enrollment_capacity, faculty_user_id, status) VALUES
                (?, ?, ?, 1, 'A', 60, ?, 'ACTIVE')
            ")->execute([$courseId, $sessId, $progId, $adminId]);
            $stmt->execute($params);
            $offerings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }

    Response::success(['offerings' => $offerings]);

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    require_once __DIR__ . '/../config/foundation.php';
    ensureFoundationData($db);

    // Validate and resolve foreign keys
    $cId = (int)$db->query("SELECT id FROM courses WHERE id = " . (int)($input['course_id'] ?? 0))->fetchColumn();
    if (!$cId) $cId = (int)$db->query("SELECT id FROM courses ORDER BY id ASC LIMIT 1")->fetchColumn();
    $input['course_id'] = $cId;

    $pId = (int)$db->query("SELECT id FROM programs WHERE id = " . (int)($input['program_id'] ?? 0))->fetchColumn();
    if (!$pId) $pId = (int)$db->query("SELECT id FROM programs ORDER BY id ASC LIMIT 1")->fetchColumn();
    $input['program_id'] = $pId;

    $sId = (int)$db->query("SELECT id FROM academic_sessions WHERE id = " . (int)($input['academic_session_id'] ?? 0))->fetchColumn();
    if (!$sId) $sId = (int)$db->query("SELECT id FROM academic_sessions ORDER BY id ASC LIMIT 1")->fetchColumn();
    $input['academic_session_id'] = $sId;

    $facId = !empty($input['faculty_user_id']) ? (int)$input['faculty_user_id'] : null;
    if ($facId && !$db->query("SELECT id FROM users WHERE id = $facId")->fetchColumn()) {
        $facId = null;
    }
    if (!$facId) {
        $facId = $db->query("SELECT id FROM users WHERE role IN ('FACULTY','ADMIN') ORDER BY id ASC LIMIT 1")->fetchColumn() ?: 1;
    }
    $input['faculty_user_id'] = (int)$facId;

    $v = new Validator($input);
    $v->required('course_id');
    $v->required('program_id');
    $v->required('academic_session_id');
    $v->required('semester_number');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    $ins = $db->prepare("INSERT INTO course_offerings (course_id,program_id,academic_session_id,semester_number,section,faculty_user_id,enrollment_capacity,status) VALUES (?,?,?,?,?,?,?,'ACTIVE')");
    $ins->execute([$input['course_id'], $input['program_id'], $input['academic_session_id'], $input['semester_number'], $input['section'] ?? 'A', $input['faculty_user_id'], $input['enrollment_capacity'] ?? 60]);
    Response::success(['id' => (int)$db->lastInsertId()], 'Offering created.', 201);

// ==== UPDATE ====
} elseif ($method === 'PUT' && $id !== null && $sub === null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT id FROM course_offerings WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Offering not found.'); exit; }

    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $fields = []; $params = [];
    foreach (['course_id','program_id','academic_session_id','semester_number','section','faculty_user_id','enrollment_capacity','status'] as $f) {
        if (isset($input[$f])) { $fields[] = "{$f} = ?"; $params[] = $input[$f]; }
    }
    if ($fields) {
        $params[] = (int)$id;
        $db->prepare("UPDATE course_offerings SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
    }
    Response::success(null, 'Offering updated.');

// ==== GET ONE ====
} elseif ($method === 'GET' && $id !== null && $sub === null) {
    $stmt = $db->prepare(
        "SELECT co.id, co.semester_number, co.section, co.enrollment_capacity, co.status,
                co.faculty_user_id, co.course_id, co.program_id, co.academic_session_id,
                c.course_code, c.course_title, c.credit_hours, c.course_type,
                s.session_name, s.start_date, s.end_date,
                p.program_name, p.degree_type,
                u.full_name AS faculty_name, fp.employee_code, fp.designation,
                COUNT(DISTINCT se.id) AS enrolled_count
         FROM course_offerings co
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         JOIN programs p ON p.id = co.program_id
         LEFT JOIN users u ON u.id = co.faculty_user_id
         LEFT JOIN faculty_profiles fp ON fp.user_id = co.faculty_user_id
         LEFT JOIN student_enrollments se ON se.offering_id = co.id AND se.status = 'ENROLLED'
         WHERE co.id = ?
         GROUP BY co.id LIMIT 1"
    );
    $stmt->execute([(int)$id]);
    $offering = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$offering) { Response::notFound('Offering not found.'); exit; }
    Response::success(['offering' => $offering]);

// ==== STUDENTS ====
} elseif ($method === 'GET' && $id !== null && $sub === 'students') {
    // ADMIN or assigned FACULTY
    if ($role === 'FACULTY') {
        $ck = $db->prepare("SELECT id FROM course_offerings WHERE id = ? AND faculty_user_id = ? LIMIT 1");
        $ck->execute([(int)$id, $userId]);
        if (!$ck->fetchColumn()) { Response::forbidden('Access denied.'); exit; }
    } elseif ($role !== 'ADMIN') {
        Response::forbidden('Access denied.'); exit;
    }

    $stmt = $db->prepare(
        "SELECT se.id AS enrollment_id, se.status AS enrollment_status, se.enrollment_date,
                u.id AS student_id, u.full_name, u.email,
                sp.roll_number, sp.registration_number, sp.current_semester
         FROM student_enrollments se
         JOIN users u ON u.id = se.student_user_id
         LEFT JOIN student_profiles sp ON sp.user_id = se.student_user_id
         WHERE se.offering_id = ?
         ORDER BY sp.roll_number"
    );
    $stmt->execute([(int)$id]);
    Response::success(['students' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// ==== COMPONENTS ====
} elseif ($method === 'GET' && $id !== null && $sub === 'components') {
    $stmt = $db->prepare(
        "SELECT ac.id, ac.component_name, ac.assessment_type, ac.maximum_marks,
                ac.weight_percentage, ac.minimum_pass_percentage, ac.is_mandatory,
                ac.examination_date, ac.start_time, ac.end_time, ac.venue, ac.status
         FROM assessment_components ac
         WHERE ac.offering_id = ?
         ORDER BY ac.examination_date, ac.component_name"
    );
    $stmt->execute([(int)$id]);
    Response::success(['components' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// ==== SCHEDULE ====
} elseif ($method === 'GET' && $id !== null && $sub === 'schedule') {
    $stmt = $db->prepare(
        "SELECT ac.id, ac.component_name, ac.assessment_type, ac.examination_date,
                ac.start_time, ac.end_time, ac.venue, ac.status, ac.maximum_marks
         FROM assessment_components ac
         WHERE ac.offering_id = ? AND ac.examination_date IS NOT NULL
         ORDER BY ac.examination_date ASC, ac.start_time ASC"
    );
    $stmt->execute([(int)$id]);
    Response::success(['schedule' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

} else {
    Response::notFound('Endpoint not found.');
}

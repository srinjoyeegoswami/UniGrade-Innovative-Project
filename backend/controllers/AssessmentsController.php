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
$baseIdx  = array_search('assessments', $segments);
$id       = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;

// ==== SCHEDULE VIEW ====
if ($method === 'GET' && $id === 'schedule') {
    $where  = ['ac.examination_date IS NOT NULL'];
    $params = [];

    if ($role === 'FACULTY') {
        $where[] = 'co.faculty_user_id = ?';
        $params[] = $userId;
    } elseif ($role === 'STUDENT') {
        $where[] = 'EXISTS (SELECT 1 FROM student_enrollments se WHERE se.offering_id = co.id AND se.student_user_id = ? AND se.status = \'ENROLLED\')';
        $params[] = $userId;
    }

    $stmt = $db->prepare(
        "SELECT ac.id, ac.component_name, ac.assessment_type, ac.examination_date,
                ac.start_time, ac.end_time, ac.venue, ac.status, ac.maximum_marks,
                c.course_title, c.course_code, co.section, co.semester_number, s.session_name
         FROM assessment_components ac
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         WHERE " . implode(' AND ', $where) . "
         ORDER BY ac.examination_date ASC, ac.start_time ASC"
    );
    $stmt->execute($params);
    Response::success(['schedule' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// ==== LIST ====
} elseif ($method === 'GET' && $id === null) {
    require_once __DIR__ . '/../config/foundation.php';
    ensureFoundationData($db);

    $where  = ['1=1'];
    $params = [];

    if (!empty($_GET['offering_id'])) { $where[] = 'ac.offering_id = ?'; $params[] = $_GET['offering_id']; }

    if ($role === 'FACULTY') {
        $where[] = 'co.faculty_user_id = ?';
        $params[] = $userId;
    } elseif ($role === 'STUDENT') {
        $where[] = 'EXISTS (SELECT 1 FROM student_enrollments se2 WHERE se2.offering_id = co.id AND se2.student_user_id = ? AND se2.status = \'ENROLLED\')';
        $params[] = $userId;
        // Students only see components from published offerings or general view
    }

    $stmt = $db->prepare(
        "SELECT ac.id, ac.offering_id, ac.component_name, ac.assessment_type, ac.maximum_marks,
                ac.weight_percentage, ac.minimum_pass_percentage, ac.is_mandatory,
                ac.examination_date, ac.start_time, ac.end_time, ac.venue, ac.status,
                c.course_title, co.section, co.semester_number, s.session_name
         FROM assessment_components ac
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         WHERE " . implode(' AND ', $where) . "
         ORDER BY ac.examination_date ASC, ac.component_name"
    );
    $stmt->execute($params);
    Response::success(['assessments' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $offCheck = (int)$db->query("SELECT id FROM course_offerings WHERE id = " . (int)($input['offering_id'] ?? 0))->fetchColumn();
    if (!$offCheck) {
        $offCheck = (int)$db->query("SELECT id FROM course_offerings ORDER BY id ASC LIMIT 1")->fetchColumn();
    }
    $input['offering_id'] = $offCheck;

    $v = new Validator($input);
    $v->required('offering_id');
    $v->required('component_name');
    $v->required('assessment_type');
    $v->required('maximum_marks');
    $v->required('weight_percentage');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    // Validate total weight ≤ 100
    $currentWeight = $db->prepare("SELECT COALESCE(SUM(weight_percentage),0) FROM assessment_components WHERE offering_id = ?");
    $currentWeight->execute([(int)$input['offering_id']]);
    $totalWeight = (float)$currentWeight->fetchColumn() + (float)$input['weight_percentage'];
    if ($totalWeight > 100.01) {
        Response::error("Total weight would exceed 100% (current: " . round($totalWeight - $input['weight_percentage'], 2) . "%).", 422); exit;
    }

    $ins = $db->prepare(
        "INSERT INTO assessment_components
         (offering_id,component_name,assessment_type,maximum_marks,weight_percentage,minimum_pass_percentage,is_mandatory,examination_date,start_time,end_time,venue,status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,'SCHEDULED')"
    );
    $ins->execute([
        (int)$input['offering_id'],
        $input['component_name'],
        $input['assessment_type'],
        $input['maximum_marks'],
        $input['weight_percentage'],
        $input['minimum_pass_percentage'] ?? null,
        isset($input['is_mandatory']) ? (int)$input['is_mandatory'] : 1,
        $input['examination_date'] ?? null,
        $input['start_time'] ?? null,
        $input['end_time'] ?? null,
        $input['venue'] ?? null,
    ]);
    Response::success(['id' => (int)$db->lastInsertId()], 'Assessment component created.', 201);

// ==== UPDATE ====
} elseif ($method === 'PUT' && $id !== null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT id FROM assessment_components WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Assessment not found.'); exit; }

    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $fields = []; $params = [];
    foreach (['component_name','assessment_type','maximum_marks','weight_percentage','minimum_pass_percentage','is_mandatory','examination_date','start_time','end_time','venue','status'] as $f) {
        if (array_key_exists($f, $input)) { $fields[] = "{$f} = ?"; $params[] = $input[$f]; }
    }
    if ($fields) {
        $params[] = (int)$id;
        $db->prepare("UPDATE assessment_components SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
    }
    Response::success(null, 'Assessment updated.');

// ==== DELETE ====
} elseif ($method === 'DELETE' && $id !== null) {
    Auth::requireRole('ADMIN');
    // Check no marks submitted
    $marksCount = $db->prepare("SELECT COUNT(*) FROM assessment_marks WHERE assessment_component_id = ? AND attendance_status != 'NOT_ENTERED'");
    $marksCount->execute([(int)$id]);
    if ((int)$marksCount->fetchColumn() > 0) {
        Response::error('Cannot delete assessment with submitted marks.', 409); exit;
    }
    $db->prepare("DELETE FROM assessment_components WHERE id = ?")->execute([(int)$id]);
    Response::success(null, 'Assessment deleted.');

} else {
    Response::notFound('Endpoint not found.');
}

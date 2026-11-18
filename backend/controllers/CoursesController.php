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

$segments = explode('/', trim($path, '/'));
$baseIdx  = array_search('courses', $segments);
$id       = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;

// ==== LIST ====
if ($method === 'GET' && $id === null) {
    $deptId = $_GET['department_id'] ?? null;
    $status = $_GET['status'] ?? 'ACTIVE';
    $where  = ['c.status = ?'];
    $params = [strtoupper($status)];
    if ($deptId) { $where[] = 'c.department_id = ?'; $params[] = $deptId; }

    $stmt = $db->prepare(
        "SELECT c.id, c.course_code, c.course_title, c.description, c.credit_hours,
                c.course_type, c.status, c.department_id, d.department_name
         FROM courses c
         LEFT JOIN departments d ON d.id = c.department_id
         WHERE " . implode(' AND ', $where) . "
         ORDER BY c.course_code"
    );
    $stmt->execute($params);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($courses) && !$deptId) {
        $firstDept = $db->query("SELECT id FROM departments LIMIT 1")->fetchColumn();
        if (!$firstDept) {
            $db->exec("INSERT INTO departments (department_name, department_code, description, status) VALUES ('Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering', 'ACTIVE')");
            $firstDept = (int)$db->lastInsertId();
        }
        $db->prepare("INSERT INTO courses (course_code, course_title, description, department_id, credit_hours, course_type, status) VALUES
            ('CS101', 'Data Structures & Algorithms', 'Fundamental algorithms and data organization', ?, 4, 'THEORY', 'ACTIVE'),
            ('CS102', 'Database Management Systems', 'Relational database architecture and SQL', ?, 4, 'THEORY', 'ACTIVE'),
            ('CS103', 'Operating Systems', 'Processes, memory management, and file systems', ?, 3, 'THEORY', 'ACTIVE'),
            ('CS104', 'Web Application Engineering', 'Full-stack web development and REST APIs', ?, 4, 'PRACTICAL', 'ACTIVE')
        ")->execute([$firstDept, $firstDept, $firstDept, $firstDept]);
        $stmt->execute($params);
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    Response::success(['courses' => $courses]);

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    require_once __DIR__ . '/../config/foundation.php';
    ensureFoundationData($db);

    // Auto-resolve valid department_id
    $validDeptId = null;
    if (!empty($input['department_id'])) {
        $chk = $db->prepare("SELECT id FROM departments WHERE id = ? LIMIT 1");
        $chk->execute([(int)$input['department_id']]);
        $validDeptId = $chk->fetchColumn();
    }
    if (!$validDeptId) {
        $validDeptId = $db->query("SELECT id FROM departments ORDER BY id ASC LIMIT 1")->fetchColumn();
    }
    $input['department_id'] = (int)$validDeptId;

    $v = new Validator($input);
    $v->required('course_code');
    $v->required('course_title');
    $v->required('credit_hours');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    $ck = $db->prepare("SELECT id FROM courses WHERE course_code = ? LIMIT 1");
    $ck->execute([strtoupper($input['course_code'])]);
    $existingCourseId = $ck->fetchColumn();

    if ($existingCourseId) {
        $db->prepare("UPDATE courses SET course_title = ?, description = ?, department_id = ?, credit_hours = ?, course_type = ?, status = 'ACTIVE' WHERE id = ?")
           ->execute([$input['course_title'], $input['description'] ?? null, $input['department_id'], $input['credit_hours'], $input['course_type'] ?? 'THEORY', $existingCourseId]);
        Response::success(['id' => (int)$existingCourseId], 'Course updated.', 200);
        exit;
    }

    $ins = $db->prepare("INSERT INTO courses (course_code,course_title,description,department_id,credit_hours,course_type,status) VALUES (?,?,?,?,?,?,'ACTIVE')");
    $ins->execute([strtoupper($input['course_code']), $input['course_title'], $input['description'] ?? null, $input['department_id'], $input['credit_hours'], $input['course_type'] ?? 'THEORY']);
    Response::success(['id' => (int)$db->lastInsertId()], 'Course created.', 201);

// ==== UPDATE ====
} elseif ($method === 'PUT' && $id !== null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT id FROM courses WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Course not found.'); exit; }

    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $fields = []; $params = [];
    foreach (['course_code','course_title','description','department_id','credit_hours','course_type','status'] as $f) {
        if (isset($input[$f])) { $fields[] = "{$f} = ?"; $params[] = $input[$f]; }
    }
    if ($fields) {
        $params[] = (int)$id;
        $db->prepare("UPDATE courses SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
    }
    Response::success(null, 'Course updated.');

// ==== SOFT DELETE ====
} elseif ($method === 'DELETE' && $id !== null) {
    Auth::requireRole('ADMIN');
    $db->prepare("UPDATE courses SET status = 'INACTIVE' WHERE id = ?")->execute([(int)$id]);
    Response::success(null, 'Course deactivated.');

} else {
    Response::notFound('Endpoint not found.');
}

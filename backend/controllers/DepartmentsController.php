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
$userId = Auth::userId();

$segments = explode('/', trim($path, '/'));
$baseIdx  = array_search('departments', $segments);
$id       = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;

// ==== LIST ====
if ($method === 'GET' && $id === null) {
    $rows = $db->query(
        "SELECT d.id, d.department_name, d.department_code, d.description, d.status,
                COUNT(DISTINCT p.id) AS program_count,
                COUNT(DISTINCT sp.id) AS student_count
         FROM departments d
         LEFT JOIN programs p ON p.department_id = d.id AND p.status = 'ACTIVE'
         LEFT JOIN student_profiles sp ON sp.program_id = p.id
         GROUP BY d.id
         ORDER BY d.department_name"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Auto-seed default departments if none exist so dropdowns are always populated
    if (empty($rows)) {
        $db->exec("INSERT INTO departments (department_name, department_code, description, status) VALUES
            ('Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering', 'ACTIVE'),
            ('Information Technology', 'IT', 'Department of Information Technology', 'ACTIVE'),
            ('Electronics & Communication', 'ECE', 'Department of Electronics and Communication Engineering', 'ACTIVE'),
            ('General Sciences & Humanities', 'GEN', 'Foundational sciences and humanities', 'ACTIVE')
        ");
        $rows = $db->query(
            "SELECT d.id, d.department_name, d.department_code, d.description, d.status,
                    0 AS program_count, 0 AS student_count
             FROM departments d
             ORDER BY d.department_name"
        )->fetchAll(PDO::FETCH_ASSOC);
    }

    Response::success(['departments' => $rows]);

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $v     = new Validator($input);
    $v->required('department_name');
    $v->required('department_code');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    $ck = $db->prepare("SELECT id FROM departments WHERE department_code = ? LIMIT 1");
    $ck->execute([strtoupper($input['department_code'])]);
    if ($ck->fetchColumn()) { Response::error('Department code already exists.', 409); exit; }

    $ins = $db->prepare("INSERT INTO departments (department_name, department_code, description, status) VALUES (?,?,?,'ACTIVE')");
    $ins->execute([$input['department_name'], strtoupper($input['department_code']), $input['description'] ?? null]);
    $newId = (int)$db->lastInsertId();

    Response::success(['id' => $newId], 'Department created.', 201);

// ==== UPDATE ====
} elseif ($method === 'PUT' && $id !== null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT id FROM departments WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Department not found.'); exit; }

    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $fields = []; $params = [];
    foreach (['department_name','department_code','description','status'] as $f) {
        if (isset($input[$f])) { $fields[] = "{$f} = ?"; $params[] = $input[$f]; }
    }
    if ($fields) {
        $params[] = (int)$id;
        $db->prepare("UPDATE departments SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
    }
    Response::success(null, 'Department updated.');

// ==== SOFT DELETE ====
} elseif ($method === 'DELETE' && $id !== null) {
    Auth::requireRole('ADMIN');
    // Check no active programs
    $prog = $db->prepare("SELECT COUNT(*) FROM programs WHERE department_id = ? AND status = 'ACTIVE'");
    $prog->execute([(int)$id]);
    if ((int)$prog->fetchColumn() > 0) {
        Response::error('Cannot delete department with active programs.', 409); exit;
    }
    $db->prepare("UPDATE departments SET status = 'INACTIVE' WHERE id = ?")->execute([(int)$id]);
    Response::success(null, 'Department deactivated.');

} else {
    Response::notFound('Endpoint not found.');
}

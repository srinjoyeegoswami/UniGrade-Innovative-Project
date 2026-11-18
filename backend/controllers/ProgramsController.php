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
$baseIdx  = array_search('programs', $segments);
$id       = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;
$sub      = isset($segments[$baseIdx + 2]) ? $segments[$baseIdx + 2] : null;

// ==== LIST ====
if ($method === 'GET' && $id === null) {
    $deptId = $_GET['department_id'] ?? null;
    $where  = ['p.status = \'ACTIVE\''];
    $params = [];
    if ($deptId) { $where[] = 'p.department_id = ?'; $params[] = $deptId; }
    $whereClause = implode(' AND ', $where);

    $rows = $db->prepare(
        "SELECT p.id, p.program_name, p.program_code, p.degree_type, p.duration_years,
                p.status, p.department_id, d.department_name,
                COUNT(DISTINCT sp.id) AS student_count
         FROM programs p
         JOIN departments d ON d.id = p.department_id
         LEFT JOIN student_profiles sp ON sp.program_id = p.id
         WHERE {$whereClause}
         GROUP BY p.id
         ORDER BY d.department_name, p.program_name"
    );
    $rows->execute($params);
    $programs = $rows->fetchAll(PDO::FETCH_ASSOC);

    if (empty($programs) && !$deptId) {
        $firstDept = $db->query("SELECT id FROM departments LIMIT 1")->fetchColumn();
        if (!$firstDept) {
            $db->exec("INSERT INTO departments (department_name, department_code, description, status) VALUES
                ('Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering', 'ACTIVE'),
                ('Information Technology', 'IT', 'Department of Information Technology', 'ACTIVE'),
                ('Electronics & Communication', 'ECE', 'Department of Electronics and Communication Engineering', 'ACTIVE'),
                ('General Sciences & Humanities', 'GEN', 'Foundational sciences and humanities', 'ACTIVE')
            ");
            $firstDept = (int)$db->lastInsertId();
        }
        $db->prepare("INSERT INTO programs (department_id, program_name, program_code, degree_type, duration_years, total_semesters, status) VALUES
            (?, 'Bachelor of Technology in CSE', 'BTECH-CSE', 'UNDERGRADUATE', 4, 8, 'ACTIVE'),
            (?, 'Master of Technology in CSE', 'MTECH-CSE', 'POSTGRADUATE', 2, 4, 'ACTIVE'),
            (?, 'Bachelor of Technology in IT', 'BTECH-IT', 'UNDERGRADUATE', 4, 8, 'ACTIVE')
        ")->execute([$firstDept, $firstDept, $firstDept]);
        $rows->execute($params);
        $programs = $rows->fetchAll(PDO::FETCH_ASSOC);
    }

    Response::success(['programs' => $programs]);

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $v     = new Validator($input);
    $v->required('program_name');
    $v->required('program_code');
    $v->required('department_id');
    $v->required('degree_type');
    $v->required('duration_years');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    $ck = $db->prepare("SELECT id FROM programs WHERE program_code = ? LIMIT 1");
    $ck->execute([strtoupper($input['program_code'])]);
    if ($ck->fetchColumn()) { Response::error('Program code already exists.', 409); exit; }

    $ins = $db->prepare("INSERT INTO programs (department_id,program_name,program_code,degree_type,duration_years,status) VALUES (?,?,?,?,?,'ACTIVE')");
    $ins->execute([$input['department_id'], $input['program_name'], strtoupper($input['program_code']), $input['degree_type'], $input['duration_years']]);
    Response::success(['id' => (int)$db->lastInsertId()], 'Program created.', 201);

// ==== UPDATE ====
} elseif ($method === 'PUT' && $id !== null && $sub === null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT id FROM programs WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Program not found.'); exit; }

    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $fields = []; $params = [];
    foreach (['department_id','program_name','program_code','degree_type','duration_years','status'] as $f) {
        if (isset($input[$f])) { $fields[] = "{$f} = ?"; $params[] = $input[$f]; }
    }
    if ($fields) {
        $params[] = (int)$id;
        $db->prepare("UPDATE programs SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
    }
    Response::success(null, 'Program updated.');

// ==== STUDENTS IN PROGRAM ====
} elseif ($method === 'GET' && $id !== null && $sub === 'students') {
    Auth::requireRole('ADMIN');
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $count = $db->prepare("SELECT COUNT(*) FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.program_id = ?");
    $count->execute([(int)$id]);
    $total = (int)$count->fetchColumn();

    $stmt = $db->prepare(
        "SELECT u.id, u.full_name, u.email, u.account_status,
                sp.roll_number, sp.registration_number, sp.current_semester, sp.admission_year
         FROM student_profiles sp
         JOIN users u ON u.id = sp.user_id
         WHERE sp.program_id = ?
         ORDER BY sp.roll_number
         LIMIT ? OFFSET ?"
    );
    $stmt->execute([(int)$id, $limit, $offset]);
    Response::paginated($stmt->fetchAll(PDO::FETCH_ASSOC), $total, $page, $limit);

} else {
    Response::notFound('Endpoint not found.');
}

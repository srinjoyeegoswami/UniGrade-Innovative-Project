<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Auth.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../helpers/AuditLog.php';

Auth::requireAuth();
Auth::requireRole('ADMIN');

$method = $_SERVER['REQUEST_METHOD'];
$db     = Database::getInstance();
$uri    = $_SERVER['REQUEST_URI'];
$path   = rtrim(parse_url($uri, PHP_URL_PATH), '/');
$userId = Auth::userId();

$segments   = explode('/', trim($path, '/'));
$facIdx     = array_search('faculty', $segments);
$id         = isset($segments[$facIdx + 1]) ? $segments[$facIdx + 1] : null;
$sub        = isset($segments[$facIdx + 2]) ? $segments[$facIdx + 2] : null;

// ==== LIST ====
if ($method === 'GET' && $id === null) {
    $page    = max(1, (int)($_GET['page'] ?? 1));
    $limit   = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
    $offset  = ($page - 1) * $limit;
    $search  = trim($_GET['search'] ?? '');
    $deptId  = $_GET['department_id'] ?? null;
    $status  = $_GET['status'] ?? null;

    $where  = ["u.role = 'FACULTY'"];
    $params = [];

    if ($search !== '') {
        $where[]  = "(u.full_name LIKE ? OR u.email LIKE ? OR fp.employee_code LIKE ?)";
        $like     = "%{$search}%";
        $params   = array_merge($params, [$like, $like, $like]);
    }
    if ($deptId) { $where[] = 'fp.department_id = ?'; $params[] = $deptId; }
    if ($status)  { $where[] = 'u.account_status = ?'; $params[] = strtoupper($status); }

    $whereClause = implode(' AND ', $where);

    $countStmt = $db->prepare("SELECT COUNT(*) FROM users u LEFT JOIN faculty_profiles fp ON fp.user_id = u.id WHERE {$whereClause}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $db->prepare(
        "SELECT u.id, u.full_name, u.email, u.account_status, u.created_at,
                fp.employee_code, fp.designation, fp.contact_number, fp.date_of_joining, fp.department_id,
                d.department_name
         FROM users u
         LEFT JOIN faculty_profiles fp ON fp.user_id = u.id
         LEFT JOIN departments d ON d.id = fp.department_id
         WHERE {$whereClause}
         ORDER BY u.full_name ASC
         LIMIT ? OFFSET ?"
    );
    $stmt->execute(array_merge($params, [$limit, $offset]));
    Response::paginated($stmt->fetchAll(PDO::FETCH_ASSOC), $total, $page, $limit);

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    require_once __DIR__ . '/../config/foundation.php';
    ensureFoundationData($db);

    // Auto-resolve valid department_id from database
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
    $v->required('full_name');
    $v->required('email')->email('email');
    $v->required('password')->minLength('password', 4);
    $v->required('employee_code');
    $v->required('designation');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    // Check if user already exists
    $ck = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $ck->execute([$input['email']]);
    $existingUserId = $ck->fetchColumn();

    $db->beginTransaction();
    if ($existingUserId) {
        $newId = (int)$existingUserId;
        $db->prepare("UPDATE users SET full_name = ?, role = 'FACULTY', account_status = 'ACTIVE' WHERE id = ?")
           ->execute([$input['full_name'], $newId]);
    } else {
        $hash = password_hash($input['password'], PASSWORD_BCRYPT);
        $ins  = $db->prepare("INSERT INTO users (full_name,email,password_hash,role,account_status) VALUES (?,?,?,'FACULTY','ACTIVE')");
        $ins->execute([$input['full_name'], $input['email'], $hash]);
        $newId = (int)$db->lastInsertId();
    }

    $fp = $db->prepare("INSERT INTO faculty_profiles (user_id,employee_code,department_id,designation,contact_number,date_of_joining)
        VALUES (?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE employee_code = VALUES(employee_code), department_id = VALUES(department_id), designation = VALUES(designation), contact_number = VALUES(contact_number), date_of_joining = VALUES(date_of_joining)
    ");
    $fp->execute([$newId, $input['employee_code'], $input['department_id'], $input['designation'], $input['contact_number'] ?? null, $input['date_of_joining'] ?? null]);
    $db->commit();

    AuditLog::log($userId, 'CREATE_FACULTY', 'users', $newId, null, ['email'=>$input['email']], $_SERVER['REMOTE_ADDR'] ?? '');
    Response::success(['id' => $newId], 'Faculty member created.', 201);

// ==== GET ONE ====
} elseif ($method === 'GET' && $id !== null && $sub === null) {
    $stmt = $db->prepare(
        "SELECT u.id, u.full_name, u.email, u.account_status, u.created_at,
                fp.employee_code, fp.designation, fp.contact_number, fp.date_of_joining, fp.department_id,
                d.department_name
         FROM users u
         LEFT JOIN faculty_profiles fp ON fp.user_id = u.id
         LEFT JOIN departments d ON d.id = fp.department_id
         WHERE u.id = ? AND u.role = 'FACULTY' LIMIT 1"
    );
    $stmt->execute([(int)$id]);
    $faculty = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$faculty) { Response::notFound('Faculty not found.'); exit; }

    // Assigned courses
    $courses = $db->prepare(
        "SELECT co.id, co.semester_number, co.section, co.status,
                c.course_code, c.course_title, c.credit_hours,
                s.session_name, p.program_name
         FROM course_offerings co
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         JOIN programs p ON p.id = co.program_id
         WHERE co.faculty_user_id = ?
         ORDER BY s.start_date DESC"
    );
    $courses->execute([(int)$id]);
    $faculty['assigned_courses'] = $courses->fetchAll(PDO::FETCH_ASSOC);

    Response::success(['faculty' => $faculty]);

// ==== UPDATE ====
} elseif ($method === 'PUT' && $id !== null && $sub === null) {
    $check = $db->prepare("SELECT id FROM users WHERE id = ? AND role = 'FACULTY' LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Faculty not found.'); exit; }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $db->beginTransaction();

    $uFields = []; $uParams = [];
    foreach (['full_name','email','account_status'] as $f) {
        if (isset($input[$f])) { $uFields[] = "{$f} = ?"; $uParams[] = $input[$f]; }
    }
    if ($uFields) {
        $uParams[] = (int)$id;
        $db->prepare("UPDATE users SET " . implode(', ', $uFields) . " WHERE id = ?")->execute($uParams);
    }

    $fFields = []; $fParams = [];
    foreach (['employee_code','department_id','designation','contact_number','date_of_joining'] as $f) {
        if (isset($input[$f])) { $fFields[] = "{$f} = ?"; $fParams[] = $input[$f]; }
    }
    if ($fFields) {
        $fParams[] = (int)$id;
        $db->prepare("UPDATE faculty_profiles SET " . implode(', ', $fFields) . " WHERE user_id = ?")->execute($fParams);
    }

    $db->commit();
    AuditLog::log($userId, 'UPDATE_FACULTY', 'users', (int)$id, null, $input, $_SERVER['REMOTE_ADDR'] ?? '');
    Response::success(null, 'Faculty updated.');

// ==== COURSES ====
} elseif ($method === 'GET' && $id !== null && $sub === 'courses') {
    $stmt = $db->prepare(
        "SELECT co.id, co.semester_number, co.section, co.status, co.enrollment_capacity,
                c.course_code, c.course_title, c.credit_hours,
                s.session_name, p.program_name,
                COUNT(DISTINCT se.id) AS enrolled_count
         FROM course_offerings co
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         JOIN programs p ON p.id = co.program_id
         LEFT JOIN student_enrollments se ON se.offering_id = co.id AND se.status = 'ENROLLED'
         WHERE co.faculty_user_id = ?
         GROUP BY co.id
         ORDER BY s.start_date DESC, c.course_title"
    );
    $stmt->execute([(int)$id]);
    Response::success(['courses' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

} else {
    Response::notFound('Endpoint not found.');
}

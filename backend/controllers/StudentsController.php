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

// Extract ID and sub-resource from URI: /api/students/{id}/{sub}
$segments   = explode('/', trim($path, '/'));
$studentsIdx = array_search('students', $segments);
$id         = isset($segments[$studentsIdx + 1]) ? $segments[$studentsIdx + 1] : null;
$sub        = isset($segments[$studentsIdx + 2]) ? $segments[$studentsIdx + 2] : null;

// ---- Helpers ----
function requireAdmin(): void {
    Auth::requireRole('ADMIN');
}

// ==== LIST ====
if ($method === 'GET' && $id === null) {
    requireAdmin();

    $page     = max(1, (int)($_GET['page'] ?? 1));
    $limit    = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
    $offset   = ($page - 1) * $limit;
    $search   = trim($_GET['search'] ?? '');
    $deptId   = $_GET['department_id'] ?? null;
    $progId   = $_GET['program_id'] ?? null;
    $semester = $_GET['semester'] ?? null;
    $status   = $_GET['status'] ?? null;

    $where  = ['1=1'];
    $params = [];

    if ($search !== '') {
        $where[]  = "(u.full_name LIKE ? OR sp.roll_number LIKE ? OR sp.registration_number LIKE ?)";
        $like     = "%{$search}%";
        $params   = array_merge($params, [$like, $like, $like]);
    }
    if ($deptId) { $where[] = 'p.department_id = ?'; $params[] = $deptId; }
    if ($progId) { $where[] = 'sp.program_id = ?';   $params[] = $progId; }
    if ($semester){ $where[] = 'sp.current_semester = ?'; $params[] = $semester; }
    if ($status)  { $where[] = 'u.account_status = ?';    $params[] = strtoupper($status); }
    $where[] = "u.role = 'STUDENT'";

    $whereClause = implode(' AND ', $where);

    $countStmt = $db->prepare("SELECT COUNT(*) FROM users u LEFT JOIN student_profiles sp ON sp.user_id=u.id LEFT JOIN programs p ON p.id=sp.program_id WHERE {$whereClause}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $db->prepare(
        "SELECT u.id, u.full_name, u.email, u.account_status, u.created_at,
                sp.roll_number, sp.registration_number, sp.program_id, sp.current_semester,
                sp.admission_year, sp.contact_number,
                p.program_name, d.department_name
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         LEFT JOIN programs p ON p.id = sp.program_id
         LEFT JOIN departments d ON d.id = p.department_id
         WHERE {$whereClause}
         ORDER BY u.full_name ASC
         LIMIT ? OFFSET ?"
    );
    $stmt->execute(array_merge($params, [$limit, $offset]));
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::paginated($students, $total, $page, $limit);

// ==== BULK IMPORT ====
} elseif ($method === 'POST' && $id === 'bulk-import') {
    requireAdmin();

    if (!isset($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) {
        Response::error('CSV file is required.', 422);
        exit;
    }

    $handle = fopen($_FILES['csv']['tmp_name'], 'r');
    $headers = fgetcsv($handle);
    $headers = array_map('trim', $headers);
    $required = ['full_name', 'email', 'password', 'roll_number', 'registration_number', 'program_id', 'admission_year', 'current_semester'];
    $missing  = array_diff($required, $headers);
    if (!empty($missing)) {
        Response::error('CSV missing columns: ' . implode(', ', $missing), 422);
        exit;
    }
    $colIdx = array_flip($headers);

    $db->beginTransaction();
    $imported = 0;
    $errors   = [];
    $row      = 1;

    while (($data = fgetcsv($handle)) !== false) {
        $row++;
        $r = [];
        foreach ($headers as $i => $h) {
            $r[$h] = isset($data[$i]) ? trim($data[$i]) : '';
        }
        // Basic validate
        if (empty($r['email']) || !filter_var($r['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Row {$row}: invalid email.";
            continue;
        }
        $check = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $check->execute([$r['email']]);
        if ($check->fetchColumn()) {
            $errors[] = "Row {$row}: email already exists.";
            continue;
        }

        $hash = password_hash($r['password'] ?: 'ChangeMe@123', PASSWORD_BCRYPT);
        $ins  = $db->prepare("INSERT INTO users (full_name,email,password_hash,role,account_status) VALUES (?,?,?,'STUDENT','ACTIVE')");
        $ins->execute([$r['full_name'], $r['email'], $hash]);
        $uid  = (int) $db->lastInsertId();

        $sp = $db->prepare("INSERT INTO student_profiles (user_id,roll_number,registration_number,program_id,admission_year,current_semester) VALUES (?,?,?,?,?,?)");
        $sp->execute([$uid, $r['roll_number'], $r['registration_number'], $r['program_id'], $r['admission_year'], $r['current_semester']]);

        AuditLog::log($userId, 'CREATE_STUDENT', 'users', $uid, null, ['email'=>$r['email']], $_SERVER['REMOTE_ADDR'] ?? '');
        $imported++;
    }
    fclose($handle);

    $db->commit();
    Response::success(['imported' => $imported, 'errors' => $errors], "Bulk import completed: {$imported} records imported.");

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    requireAdmin();

    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    require_once __DIR__ . '/../config/foundation.php';
    ensureFoundationData($db);

    // Auto-resolve valid program_id from database
    $validProgId = null;
    if (!empty($input['program_id'])) {
        $chk = $db->prepare("SELECT id FROM programs WHERE id = ? LIMIT 1");
        $chk->execute([(int)$input['program_id']]);
        $validProgId = $chk->fetchColumn();
    }
    if (!$validProgId) {
        $validProgId = $db->query("SELECT id FROM programs ORDER BY id ASC LIMIT 1")->fetchColumn();
    }
    $input['program_id'] = (int)$validProgId;

    $v = new Validator($input);
    $v->required('full_name');
    $v->required('email')->email('email');
    $v->required('password')->minLength('password', 4);
    $v->required('roll_number');
    $v->required('registration_number');
    $v->required('admission_year');
    $v->required('current_semester');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    // Check if user already exists (e.g. from open access login)
    $ck = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $ck->execute([$input['email']]);
    $existingUserId = $ck->fetchColumn();

    $db->beginTransaction();
    if ($existingUserId) {
        $newUserId = (int)$existingUserId;
        $db->prepare("UPDATE users SET full_name = ?, role = 'STUDENT', account_status = 'ACTIVE' WHERE id = ?")
           ->execute([$input['full_name'], $newUserId]);
    } else {
        $hash = password_hash($input['password'], PASSWORD_BCRYPT);
        $ins  = $db->prepare("INSERT INTO users (full_name,email,password_hash,role,account_status) VALUES (?,?,?,'STUDENT','ACTIVE')");
        $ins->execute([$input['full_name'], $input['email'], $hash]);
        $newUserId = (int)$db->lastInsertId();
    }

    $sp = $db->prepare("INSERT INTO student_profiles (user_id,roll_number,registration_number,program_id,admission_year,current_semester,contact_number)
        VALUES (?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE roll_number = VALUES(roll_number), registration_number = VALUES(registration_number), program_id = VALUES(program_id), admission_year = VALUES(admission_year), current_semester = VALUES(current_semester), contact_number = VALUES(contact_number)
    ");
    $sp->execute([$newUserId, $input['roll_number'], $input['registration_number'], $input['program_id'], $input['admission_year'], $input['current_semester'], $input['contact_number'] ?? null]);
    $db->commit();

    AuditLog::log($userId, 'CREATE_STUDENT', 'users', $newUserId, null, ['email'=>$input['email']], $_SERVER['REMOTE_ADDR'] ?? '');
    Response::success(['id' => $newUserId], 'Student created successfully.', 201);

// ==== GET ONE ====
} elseif ($method === 'GET' && $id !== null && $sub === null) {
    // Student can only see own profile
    if ($role === 'STUDENT' && (int)$id !== $userId) {
        Response::forbidden('Access denied.'); exit;
    }
    if ($role === 'FACULTY') {
        Response::forbidden('Access denied.'); exit;
    }

    $stmt = $db->prepare(
        "SELECT u.id, u.full_name, u.email, u.account_status, u.created_at,
                sp.roll_number, sp.registration_number, sp.program_id, sp.current_semester,
                sp.admission_year, sp.contact_number,
                p.program_name, p.degree_type, d.department_name, d.id AS department_id
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         LEFT JOIN programs p ON p.id = sp.program_id
         LEFT JOIN departments d ON d.id = p.department_id
         WHERE u.id = ? AND u.role = 'STUDENT' LIMIT 1"
    );
    $stmt->execute([(int)$id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$student) { Response::notFound('Student not found.'); exit; }

    // Enrollments
    $enr = $db->prepare(
        "SELECT se.id, se.status, se.enrollment_date,
                c.course_title, c.course_code, c.credit_hours,
                co.semester_number, co.section, s.session_name
         FROM student_enrollments se
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         WHERE se.student_user_id = ?"
    );
    $enr->execute([(int)$id]);
    $student['enrollments'] = $enr->fetchAll(PDO::FETCH_ASSOC);

    Response::success(['student' => $student]);

// ==== UPDATE ====
} elseif ($method === 'PUT' && $id !== null && $sub === null) {
    requireAdmin();

    $stmt = $db->prepare("SELECT u.id FROM users u WHERE u.id = ? AND u.role = 'STUDENT' LIMIT 1");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetchColumn()) { Response::notFound('Student not found.'); exit; }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $db->beginTransaction();

    if (!empty($input['full_name']) || !empty($input['account_status'])) {
        $fields = [];
        $params = [];
        if (!empty($input['full_name'])) { $fields[] = 'full_name = ?'; $params[] = $input['full_name']; }
        if (!empty($input['account_status'])) { $fields[] = 'account_status = ?'; $params[] = strtoupper($input['account_status']); }
        if (!empty($input['email'])) { $fields[] = 'email = ?'; $params[] = $input['email']; }
        if ($fields) {
            $params[] = (int)$id;
            $db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
        }
    }

    $spFields = [];
    $spParams = [];
    foreach (['program_id','current_semester','contact_number','admission_year','roll_number','registration_number'] as $f) {
        if (isset($input[$f])) { $spFields[] = "{$f} = ?"; $spParams[] = $input[$f]; }
    }
    if ($spFields) {
        $spParams[] = (int)$id;
        $db->prepare("UPDATE student_profiles SET " . implode(', ', $spFields) . " WHERE user_id = ?")->execute($spParams);
    }

    $db->commit();
    AuditLog::log($userId, 'UPDATE_STUDENT', 'users', (int)$id, null, $input, $_SERVER['REMOTE_ADDR'] ?? '');
    Response::success(null, 'Student updated successfully.');

// ==== SOFT DELETE ====
} elseif ($method === 'DELETE' && $id !== null && $sub === null) {
    requireAdmin();

    $stmt = $db->prepare("SELECT id FROM users WHERE id = ? AND role = 'STUDENT' LIMIT 1");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetchColumn()) { Response::notFound('Student not found.'); exit; }

    $db->prepare("UPDATE users SET account_status = 'INACTIVE' WHERE id = ?")->execute([(int)$id]);
    AuditLog::log($userId, 'DELETE_STUDENT', 'users', (int)$id, ['account_status'=>'ACTIVE'], ['account_status'=>'INACTIVE'], $_SERVER['REMOTE_ADDR'] ?? '');
    Response::success(null, 'Student deactivated.');

// ==== RESULTS ====
} elseif ($method === 'GET' && $id !== null && $sub === 'results') {
    if ($role === 'STUDENT' && (int)$id !== $userId) { Response::forbidden('Access denied.'); exit; }
    if ($role === 'FACULTY') { Response::forbidden('Access denied.'); exit; }

    $stmt = $db->prepare(
        "SELECT cr.id, cr.total_percentage, cr.total_marks, cr.letter_grade, cr.grade_point,
                cr.result_status, cr.published_at,
                c.course_title, c.course_code, c.credit_hours,
                s.session_name, co.semester_number
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         WHERE se.student_user_id = ? AND cr.result_status = 'PUBLISHED'
         ORDER BY s.start_date DESC, co.semester_number"
    );
    $stmt->execute([(int)$id]);
    Response::success(['results' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// ==== TRANSCRIPT ====
} elseif ($method === 'GET' && $id !== null && $sub === 'transcript') {
    if ($role === 'STUDENT' && (int)$id !== $userId) { Response::forbidden('Access denied.'); exit; }
    if ($role === 'FACULTY') { Response::forbidden('Access denied.'); exit; }

    // Get student info
    $st = $db->prepare(
        "SELECT u.full_name, u.email, sp.roll_number, sp.registration_number,
                sp.admission_year, p.program_name, d.department_name
         FROM users u
         JOIN student_profiles sp ON sp.user_id = u.id
         JOIN programs p ON p.id = sp.program_id
         JOIN departments d ON d.id = p.department_id
         WHERE u.id = ? LIMIT 1"
    );
    $st->execute([(int)$id]);
    $studentInfo = $st->fetch(PDO::FETCH_ASSOC);
    if (!$studentInfo) { Response::notFound('Student not found.'); exit; }

    // Semester-wise results
    $res = $db->prepare(
        "SELECT s.session_name, co.semester_number,
                c.course_code, c.course_title, c.credit_hours,
                cr.total_percentage, cr.letter_grade, cr.grade_point, cr.result_status,
                SUM(c.credit_hours * cr.grade_point) OVER (PARTITION BY s.id, co.semester_number) /
                SUM(c.credit_hours) OVER (PARTITION BY s.id, co.semester_number) AS sgpa
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         WHERE se.student_user_id = ? AND cr.result_status = 'PUBLISHED'
         ORDER BY s.start_date ASC, co.semester_number, c.course_code"
    );
    $res->execute([(int)$id]);
    $allRows = $res->fetchAll(PDO::FETCH_ASSOC);

    // Group by session
    $transcript = [];
    foreach ($allRows as $row) {
        $key = $row['session_name'] . '_' . $row['semester_number'];
        if (!isset($transcript[$key])) {
            $transcript[$key] = [
                'session_name'    => $row['session_name'],
                'semester_number' => $row['semester_number'],
                'sgpa'            => round((float)$row['sgpa'], 2),
                'courses'         => [],
            ];
        }
        $transcript[$key]['courses'][] = [
            'course_code'      => $row['course_code'],
            'course_title'     => $row['course_title'],
            'credit_hours'     => $row['credit_hours'],
            'total_percentage' => $row['total_percentage'],
            'letter_grade'     => $row['letter_grade'],
            'grade_point'      => $row['grade_point'],
            'result_status'    => $row['result_status'],
        ];
    }

    // CGPA
    $cgpa_q = $db->prepare(
        "SELECT SUM(c.credit_hours * cr.grade_point) / SUM(c.credit_hours) AS cgpa
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         WHERE se.student_user_id = ? AND cr.result_status = 'PUBLISHED'"
    );
    $cgpa_q->execute([(int)$id]);
    $cgpa = round((float)($cgpa_q->fetchColumn() ?? 0), 2);

    Response::success([
        'student'    => $studentInfo,
        'transcript' => array_values($transcript),
        'cgpa'       => $cgpa,
    ]);

} else {
    Response::notFound('Endpoint not found.');
}

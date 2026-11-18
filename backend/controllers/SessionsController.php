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
$baseIdx  = array_search('sessions', $segments);
$id       = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;

// ==== LIST ====
if ($method === 'GET' && $id === null) {
    $rows = $db->query(
        "SELECT id, session_name, start_date, end_date, status
         FROM academic_sessions
         ORDER BY start_date DESC"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Auto-seed default session if none exists
    if (empty($rows)) {
        $db->exec("INSERT INTO academic_sessions (session_name, start_date, end_date, status) VALUES
            ('2026-2027 Academic Year', '2026-07-01', '2027-06-30', 'ACTIVE')
        ");

        $rows = $db->query(
            "SELECT id, session_name, start_date, end_date, status
             FROM academic_sessions
             ORDER BY start_date DESC"
        )->fetchAll(PDO::FETCH_ASSOC);
    }

    Response::success(['sessions' => $rows]);

// ==== CREATE ====
} elseif ($method === 'POST' && $id === null) {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $v     = new Validator($input);
    $v->required('session_name');
    $v->required('start_date');
    $v->required('end_date');
    if ($v->fails()) { Response::validationError($v->errors()); exit; }

    if ($input['end_date'] <= $input['start_date']) {
        Response::error('End date must be after start date.', 422); exit;
    }

    // Check duplicate session name
    $dup = $db->prepare(
        "SELECT id FROM academic_sessions
         WHERE session_name = ? AND status != 'ARCHIVED' LIMIT 1"
    );
    $dup->execute([$input['session_name']]);
    if ($dup->fetchColumn()) {
        Response::error('An academic session with this name already exists.', 409); exit;
    }

    $ins = $db->prepare("INSERT INTO academic_sessions (session_name, start_date, end_date, status) VALUES (?,?,?,'INACTIVE')");
    $ins->execute([$input['session_name'], $input['start_date'], $input['end_date']]);
    Response::success(['id' => (int)$db->lastInsertId()], 'Academic session created.', 201);

// ==== UPDATE ====
} elseif ($method === 'PUT' && $id !== null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT id FROM academic_sessions WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    if (!$check->fetchColumn()) { Response::notFound('Session not found.'); exit; }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    // Only one ACTIVE session at a time
    if (isset($input['status']) && strtoupper($input['status']) === 'ACTIVE') {
        $db->prepare("UPDATE academic_sessions SET status = 'INACTIVE' WHERE status = 'ACTIVE' AND id != ?")->execute([(int)$id]);
    }

    $fields = []; $params = [];
    foreach (['session_name','start_date','end_date','status'] as $f) {
        if (isset($input[$f])) { $fields[] = "{$f} = ?"; $params[] = $input[$f]; }
    }
    if ($fields) {
        $params[] = (int)$id;
        $db->prepare("UPDATE academic_sessions SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
    }
    Response::success(null, 'Session updated.');

// ==== SOFT DELETE ====
} elseif ($method === 'DELETE' && $id !== null) {
    Auth::requireRole('ADMIN');
    $check = $db->prepare("SELECT status FROM academic_sessions WHERE id = ? LIMIT 1");
    $check->execute([(int)$id]);
    $row = $check->fetchColumn();
    if ($row === false) { Response::notFound('Session not found.'); exit; }
    if ($row === 'ACTIVE') { Response::error('Cannot delete an active session.', 409); exit; }

    $db->prepare("UPDATE academic_sessions SET status = 'ARCHIVED' WHERE id = ?")->execute([(int)$id]);
    Response::success(null, 'Session archived.');

} else {
    Response::notFound('Endpoint not found.');
}

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
$baseIdx  = array_search('announcements', $segments);
$id       = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : null;

if ($method === 'GET') {
    if ($role === 'ADMIN') {
        $stmt = $db->query(
            "SELECT a.*, u.full_name AS created_by_name 
             FROM announcements a 
             LEFT JOIN users u ON u.id = a.created_by 
             ORDER BY a.created_at DESC"
        );
    } else {
        $stmt = $db->prepare(
            "SELECT a.*, u.full_name AS created_by_name 
             FROM announcements a 
             LEFT JOIN users u ON u.id = a.created_by 
             WHERE a.is_active = 1 
               AND (a.target_role = 'ALL' OR a.target_role = ?)
               AND (a.expires_at IS NULL OR a.expires_at > NOW())
             ORDER BY a.created_at DESC"
        );
        $stmt->execute([$role]);
    }
    Response::success(['announcements' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

} elseif ($method === 'POST') {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');
    $targetRole = strtoupper(trim($input['target_role'] ?? 'ALL'));
    $expiresAt = !empty($input['expires_at']) ? $input['expires_at'] : null;

    if (empty($title) || empty($content)) {
        Response::error('Title and content are required.', 422);
    }

    $ins = $db->prepare(
        "INSERT INTO announcements (title, content, created_by, target_role, is_active, expires_at)
         VALUES (?, ?, ?, ?, 1, ?)"
    );
    $ins->execute([$title, $content, $userId, $targetRole, $expiresAt]);
    $newId = (int)$db->lastInsertId();

    AuditLog::log($db, $userId, 'CREATE_ANNOUNCEMENT', 'announcements', $newId, null, ['title' => $title]);
    Response::success(['id' => $newId], 'Announcement created successfully.', 201);

} elseif ($method === 'PUT' && is_numeric($id)) {
    Auth::requireRole('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');
    $targetRole = strtoupper(trim($input['target_role'] ?? 'ALL'));
    $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
    $expiresAt = !empty($input['expires_at']) ? $input['expires_at'] : null;

    $upd = $db->prepare(
        "UPDATE announcements 
         SET title = ?, content = ?, target_role = ?, is_active = ?, expires_at = ?
         WHERE id = ?"
    );
    $upd->execute([$title, $content, $targetRole, $isActive, $expiresAt, (int)$id]);
    Response::success(null, 'Announcement updated successfully.');

} elseif ($method === 'DELETE' && is_numeric($id)) {
    Auth::requireRole('ADMIN');
    $del = $db->prepare("DELETE FROM announcements WHERE id = ?");
    $del->execute([(int)$id]);
    Response::success(null, 'Announcement deleted successfully.');

} else {
    Response::notFound('Announcement endpoint not found.');
}


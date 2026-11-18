<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Auth.php';
require_once __DIR__ . '/../helpers/Response.php';

Auth::requireRole('ADMIN');
$method = $_SERVER['REQUEST_METHOD'];
$db     = Database::getInstance();

if ($method === 'GET') {
    $where = ['1=1'];
    $params = [];

    if (!empty($_GET['action'])) {
        $where[] = 'al.action = ?';
        $params[] = $_GET['action'];
    }
    if (!empty($_GET['entity_type'])) {
        $where[] = 'al.entity_type = ?';
        $params[] = $_GET['entity_type'];
    }
    if (!empty($_GET['user_id'])) {
        $where[] = 'al.user_id = ?';
        $params[] = $_GET['user_id'];
    }

    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;

    // Count
    $cntStmt = $db->prepare("SELECT COUNT(*) FROM audit_logs al WHERE " . implode(' AND ', $where));
    $cntStmt->execute($params);
    $total = (int)$cntStmt->fetchColumn();

    // Data
    $stmt = $db->prepare(
        "SELECT al.*, u.full_name AS user_name, u.email AS user_email, u.role AS user_role
         FROM audit_logs al
         LEFT JOIN users u ON u.id = al.user_id
         WHERE " . implode(' AND ', $where) . "
         ORDER BY al.created_at DESC
         LIMIT {$limit} OFFSET {$offset}"
    );
    $stmt->execute($params);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::paginated($logs, $total, $page, $limit);
} else {
    Response::notFound('Method not allowed on /api/audit-logs');
}


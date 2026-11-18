<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Auth.php';
require_once __DIR__ . '/../helpers/Response.php';

Auth::requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$db     = Database::getInstance();
$role   = Auth::role();
$userId = Auth::userId();

// List submissions
if ($method === 'GET') {
    $where = ['1=1'];
    $params = [];

    if ($role === 'FACULTY') {
        $where[] = 'co.faculty_user_id = ?';
        $params[] = $userId;
    }

    $status = $_GET['status'] ?? null;
    if ($status) {
        $where[] = 'mss.status = ?';
        $params[] = strtoupper($status);
    }

    $stmt = $db->prepare(
        "SELECT mss.*, ac.component_name, ac.maximum_marks, ac.weight_percentage,
                c.course_code, c.course_title, co.section, co.semester_number,
                u_sub.full_name AS submitted_by_name, u_rev.full_name AS reviewed_by_name
         FROM mark_sheet_submissions mss
         JOIN assessment_components ac ON ac.id = mss.assessment_component_id
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         LEFT JOIN users u_sub ON u_sub.id = mss.submitted_by
         LEFT JOIN users u_rev ON u_rev.id = mss.reviewed_by
         WHERE " . implode(' AND ', $where) . "
         ORDER BY mss.updated_at DESC"
    );
    $stmt->execute($params);
    Response::success(['submissions' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} else {
    Response::notFound('Method not supported on /api/submissions');
}


<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Auth.php';
require_once __DIR__ . '/../helpers/Response.php';

Auth::requireRole(['ADMIN', 'FACULTY']);
$method = $_SERVER['REQUEST_METHOD'];
$db     = Database::getInstance();
$uri    = $_SERVER['REQUEST_URI'];
$path   = rtrim(parse_url($uri, PHP_URL_PATH), '/');

$segments = explode('/', trim($path, '/'));
$baseIdx  = array_search('reports', $segments);
$reportType = isset($segments[$baseIdx + 1]) ? $segments[$baseIdx + 1] : 'performance';

// 1. Grade distribution report
if ($reportType === 'grade-distribution') {
    $where = ["cr.result_status = 'PUBLISHED'"];
    $params = [];

    if (!empty($_GET['session_id'])) {
        $where[] = "co.academic_session_id = ?";
        $params[] = $_GET['session_id'];
    }
    if (!empty($_GET['department_id'])) {
        $where[] = "c.department_id = ?";
        $params[] = $_GET['department_id'];
    }
    if (!empty($_GET['course_id'])) {
        $where[] = "co.course_id = ?";
        $params[] = $_GET['course_id'];
    }

    $stmt = $db->prepare(
        "SELECT cr.letter_grade, COUNT(*) AS count, ROUND(AVG(cr.grade_point), 2) AS avg_grade_point
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         WHERE " . implode(' AND ', $where) . "
         GROUP BY cr.letter_grade
         ORDER BY FIELD(cr.letter_grade, 'O', 'A+', 'A', 'B+', 'B', 'C', 'F')"
    );
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::success(['grade_distribution' => $data]);

// 2. Pass / Fail statistics report
} elseif ($reportType === 'pass-fail') {
    $where = ["cr.result_status = 'PUBLISHED'"];
    $params = [];

    if (!empty($_GET['session_id'])) {
        $where[] = "co.academic_session_id = ?";
        $params[] = $_GET['session_id'];
    }

    $stmt = $db->prepare(
        "SELECT d.department_name, d.department_code,
                COUNT(cr.id) AS total_candidates,
                SUM(CASE WHEN cr.letter_grade != 'F' THEN 1 ELSE 0 END) AS passed,
                SUM(CASE WHEN cr.letter_grade = 'F' THEN 1 ELSE 0 END) AS failed,
                ROUND((SUM(CASE WHEN cr.letter_grade != 'F' THEN 1 ELSE 0 END) / COUNT(cr.id)) * 100, 2) AS pass_percentage
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN departments d ON d.id = c.department_id
         WHERE " . implode(' AND ', $where) . "
         GROUP BY d.id
         ORDER BY pass_percentage DESC"
    );
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::success(['pass_fail_stats' => $data]);

// 3. Mark sheet submissions status report
} elseif ($reportType === 'submissions') {
    $stmt = $db->query(
        "SELECT mss.status, COUNT(*) AS count
         FROM mark_sheet_submissions mss
         GROUP BY mss.status"
    );
    $stats = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $detailStmt = $db->query(
        "SELECT mss.*, ac.component_name, c.course_code, c.course_title, 
                u.full_name AS faculty_name, s.session_name
         FROM mark_sheet_submissions mss
         JOIN assessment_components ac ON ac.id = mss.assessment_component_id
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         JOIN users u ON u.id = mss.submitted_by
         ORDER BY mss.updated_at DESC
         LIMIT 50"
    );
    $details = $detailStmt->fetchAll(PDO::FETCH_ASSOC);

    Response::success([
        'summary' => $stats,
        'details' => $details
    ]);

// 4. Faculty workload report
} elseif ($reportType === 'faculty-workload') {
    $stmt = $db->query(
        "SELECT u.id AS faculty_id, u.full_name, fp.employee_code, fp.designation, d.department_name,
                COUNT(DISTINCT co.id) AS active_offerings_count,
                COUNT(DISTINCT se.id) AS total_enrolled_students,
                COUNT(DISTINCT ac.id) AS total_assessment_components
         FROM users u
         JOIN faculty_profiles fp ON fp.user_id = u.id
         LEFT JOIN departments d ON d.id = fp.department_id
         LEFT JOIN course_offerings co ON co.faculty_user_id = u.id AND co.status = 'ACTIVE'
         LEFT JOIN student_enrollments se ON se.offering_id = co.id AND se.status = 'ENROLLED'
         LEFT JOIN assessment_components ac ON ac.offering_id = co.id
         WHERE u.role = 'FACULTY'
         GROUP BY u.id
         ORDER BY total_enrolled_students DESC"
    );
    Response::success(['workload' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

// 5. Overall performance summary
} else {
    $where = ["cr.result_status = 'PUBLISHED'"];
    $params = [];

    if (!empty($_GET['program_id'])) {
        $where[] = "sp.program_id = ?";
        $params[] = $_GET['program_id'];
    }

    $stmt = $db->prepare(
        "SELECT sp.roll_number, u.full_name, p.program_code,
                COUNT(cr.id) AS courses_taken,
                ROUND(AVG(cr.total_percentage), 2) AS avg_percentage,
                ROUND(SUM(c.credit_hours * cr.grade_point) / SUM(c.credit_hours), 2) AS gpa
         FROM student_enrollments se
         JOIN users u ON u.id = se.student_user_id
         JOIN student_profiles sp ON sp.user_id = u.id
         JOIN course_results cr ON cr.enrollment_id = se.id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         LEFT JOIN programs p ON p.id = sp.program_id
         WHERE " . implode(' AND ', $where) . "
         GROUP BY u.id
         ORDER BY gpa DESC
         LIMIT 100"
    );
    $stmt->execute($params);
    Response::success(['performance' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}


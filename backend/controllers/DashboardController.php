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

if ($method === 'GET' && str_ends_with($path, '/dashboard/admin')) {

    Auth::requireRole('ADMIN');

    // Counts
    $stats = [];

    $stats['total_students']    = (int) $db->query("SELECT COUNT(*) FROM users WHERE role='STUDENT' AND account_status='ACTIVE'")->fetchColumn();
    $stats['total_faculty']     = (int) $db->query("SELECT COUNT(*) FROM users WHERE role='FACULTY' AND account_status='ACTIVE'")->fetchColumn();
    $stats['total_departments'] = (int) $db->query("SELECT COUNT(*) FROM departments WHERE status='ACTIVE'")->fetchColumn();
    $stats['total_courses']     = (int) $db->query("SELECT COUNT(*) FROM courses WHERE status='ACTIVE'")->fetchColumn();
    $stats['active_sessions']   = (int) $db->query("SELECT COUNT(*) FROM academic_sessions WHERE status='ACTIVE'")->fetchColumn();
    $stats['total_examinations']= (int) $db->query("SELECT COUNT(*) FROM assessment_components")->fetchColumn();
    $stats['pending_submissions']= (int) $db->query("SELECT COUNT(*) FROM mark_sheet_submissions WHERE status='SUBMITTED'")->fetchColumn();
    $stats['published_results'] = (int) $db->query("SELECT COUNT(*) FROM course_results WHERE result_status='PUBLISHED'")->fetchColumn();

    // Recent examinations
    $recent_examinations = $db->query(
        "SELECT ac.id, ac.component_name, ac.assessment_type, ac.examination_date, ac.status,
                c.course_title, c.course_code, co.section, co.semester_number
         FROM assessment_components ac
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         ORDER BY ac.examination_date DESC LIMIT 5"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Recent submissions
    $recent_submissions = $db->query(
        "SELECT ms.id, ms.status, ms.submitted_at,
                u.full_name AS faculty_name, c.course_title, ac.component_name
         FROM mark_sheet_submissions ms
         JOIN users u ON u.id = ms.submitted_by
         JOIN assessment_components ac ON ac.id = ms.assessment_component_id
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         ORDER BY ms.submitted_at DESC LIMIT 5"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Recent registrations
    $recent_registrations = $db->query(
        "SELECT u.id, u.full_name, u.email, u.created_at, sp.roll_number, sp.registration_number
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.role = 'STUDENT'
         ORDER BY u.created_at DESC LIMIT 5"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Enrollment by department
    $enrollment_by_dept = $db->query(
        "SELECT d.department_name, d.department_code, COUNT(u.id) AS student_count
         FROM departments d
         LEFT JOIN programs p ON p.department_id = d.id
         LEFT JOIN student_profiles sp ON sp.program_id = p.id
         LEFT JOIN users u ON u.id = sp.user_id AND u.account_status = 'ACTIVE'
         WHERE d.status = 'ACTIVE'
         GROUP BY d.id, d.department_name, d.department_code
         ORDER BY student_count DESC"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Grade distribution
    $grade_distribution = $db->query(
        "SELECT letter_grade, COUNT(*) AS count, MAX(grade_point) AS max_gp
         FROM course_results
         WHERE result_status = 'PUBLISHED' AND letter_grade IS NOT NULL
         GROUP BY letter_grade
         ORDER BY max_gp DESC"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Pass/fail stats
    $pass_fail = $db->query(
        "SELECT result_status, COUNT(*) AS count
         FROM course_results
         WHERE result_status = 'PUBLISHED'
         GROUP BY result_status"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Monthly enrollment last 6 months
    $monthly_enrollment = $db->query(
        "SELECT DATE_FORMAT(enrollment_date, '%Y-%m') AS month, COUNT(*) AS count
         FROM student_enrollments
         WHERE enrollment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY month
         ORDER BY month ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    Response::success(array_merge($stats, [
        'summary'                => $stats,
        'recent_examinations'    => $recent_examinations,
        'recent_submissions'     => $recent_submissions,
        'recent_registrations'   => $recent_registrations,
        'enrollment_by_department' => $enrollment_by_dept,
        'grade_distribution'     => $grade_distribution,
        'pass_fail_stats'        => $pass_fail,
        'monthly_enrollment'     => $monthly_enrollment,
    ]));

} elseif ($method === 'GET' && str_ends_with($path, '/dashboard/faculty')) {

    Auth::requireRole('FACULTY');
    $userId = Auth::userId();

    // Assigned courses
    $assigned_courses = $db->prepare(
        "SELECT co.id, co.semester_number, co.section, co.enrollment_capacity, co.status,
                c.course_code, c.course_title, c.credit_hours,
                s.session_name,
                COUNT(DISTINCT se.id) AS enrolled_count,
                (SELECT ms.status FROM mark_sheet_submissions ms
                 JOIN assessment_components ac2 ON ac2.id = ms.assessment_component_id
                 WHERE ac2.offering_id = co.id AND ms.submitted_by = co.faculty_user_id
                 ORDER BY ms.created_at DESC LIMIT 1) AS latest_submission_status
         FROM course_offerings co
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         LEFT JOIN student_enrollments se ON se.offering_id = co.id AND se.status = 'ENROLLED'
         WHERE co.faculty_user_id = ? AND co.status = 'ACTIVE'
         GROUP BY co.id"
    );
    $assigned_courses->execute([$userId]);
    $assigned_courses = $assigned_courses->fetchAll(PDO::FETCH_ASSOC);

    // Upcoming examinations
    $upcoming_exams = $db->prepare(
        "SELECT ac.id, ac.component_name, ac.assessment_type, ac.examination_date,
                ac.start_time, ac.end_time, ac.venue, c.course_title, co.section
         FROM assessment_components ac
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         WHERE co.faculty_user_id = ? AND ac.examination_date >= CURDATE()
           AND ac.status = 'SCHEDULED'
         ORDER BY ac.examination_date ASC LIMIT 5"
    );
    $upcoming_exams->execute([$userId]);

    // Pending submissions
    $pending_subs = $db->prepare(
        "SELECT ms.id, ms.status, ms.submitted_at, ac.component_name, c.course_title
         FROM mark_sheet_submissions ms
         JOIN assessment_components ac ON ac.id = ms.assessment_component_id
         JOIN course_offerings co ON co.id = ac.offering_id
         JOIN courses c ON c.id = co.course_id
         WHERE ms.submitted_by = ? AND ms.status IN ('DRAFT','RETURNED')
         ORDER BY ms.updated_at DESC LIMIT 10"
    );
    $pending_subs->execute([$userId]);

    Response::success([
        'assigned_courses'      => $assigned_courses,
        'upcoming_examinations' => $upcoming_exams->fetchAll(PDO::FETCH_ASSOC),
        'pending_submissions'   => $pending_subs->fetchAll(PDO::FETCH_ASSOC),
    ]);

} elseif ($method === 'GET' && str_ends_with($path, '/dashboard/student')) {

    Auth::requireRole('STUDENT');
    $userId = Auth::userId();

    // Profile
    $stmt = $db->prepare(
        "SELECT u.id, u.full_name, u.email, u.created_at,
                sp.roll_number, sp.registration_number, sp.current_semester, sp.admission_year,
                p.program_name, p.degree_type, d.department_name
         FROM users u
         JOIN student_profiles sp ON sp.user_id = u.id
         JOIN programs p ON p.id = sp.program_id
         JOIN departments d ON d.id = p.department_id
         WHERE u.id = ? LIMIT 1"
    );
    $stmt->execute([$userId]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    // Enrolled courses
    $enrolled_courses = $db->prepare(
        "SELECT co.id AS offering_id, co.semester_number, co.section,
                c.course_code, c.course_title, c.credit_hours, c.course_type,
                s.session_name, u.full_name AS faculty_name, se.status AS enrollment_status
         FROM student_enrollments se
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         LEFT JOIN users u ON u.id = co.faculty_user_id
         WHERE se.student_user_id = ? AND se.status = 'ENROLLED'"
    );
    $enrolled_courses->execute([$userId]);
    $enrolled = $enrolled_courses->fetchAll(PDO::FETCH_ASSOC);

    // Upcoming exams
    $upcoming_exams = $db->prepare(
        "SELECT ac.component_name, ac.assessment_type, ac.examination_date,
                ac.start_time, ac.end_time, ac.venue, c.course_title, co.section
         FROM student_enrollments se
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN assessment_components ac ON ac.offering_id = co.id
         WHERE se.student_user_id = ? AND ac.examination_date >= CURDATE()
           AND ac.status = 'SCHEDULED'
         ORDER BY ac.examination_date ASC LIMIT 5"
    );
    $upcoming_exams->execute([$userId]);

    // Recent results
    $recent_results = $db->prepare(
        "SELECT cr.total_percentage, cr.letter_grade, cr.grade_point, cr.result_status,
                cr.published_at, c.course_title, c.credit_hours, s.session_name
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         WHERE se.student_user_id = ? AND cr.result_status = 'PUBLISHED'
         ORDER BY cr.published_at DESC LIMIT 5"
    );
    $recent_results->execute([$userId]);

    // CGPA
    $cgpa_row = $db->prepare(
        "SELECT SUM(c.credit_hours * cr.grade_point) / SUM(c.credit_hours) AS cgpa
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         WHERE se.student_user_id = ? AND cr.result_status = 'PUBLISHED'"
    );
    $cgpa_row->execute([$userId]);
    $cgpa = round((float)($cgpa_row->fetchColumn() ?? 0), 2);

    // Semester performance
    $sem_perf = $db->prepare(
        "SELECT s.session_name, co.semester_number,
                SUM(c.credit_hours * cr.grade_point) / SUM(c.credit_hours) AS sgpa,
                SUM(c.credit_hours) AS total_credits
         FROM course_results cr
         JOIN student_enrollments se ON se.id = cr.enrollment_id
         JOIN course_offerings co ON co.id = se.offering_id
         JOIN courses c ON c.id = co.course_id
         JOIN academic_sessions s ON s.id = co.academic_session_id
         WHERE se.student_user_id = ? AND cr.result_status = 'PUBLISHED'
         GROUP BY s.id, co.semester_number
         ORDER BY s.start_date ASC"
    );
    $sem_perf->execute([$userId]);
    $semester_perf = $sem_perf->fetchAll(PDO::FETCH_ASSOC);
    $latest_sgpa   = !empty($semester_perf) ? (float) end($semester_perf)['sgpa'] : 0.0;

    Response::success([
        'profile'              => $profile,
        'enrolled_courses'     => $enrolled,
        'upcoming_examinations'=> $upcoming_exams->fetchAll(PDO::FETCH_ASSOC),
        'recent_results'       => $recent_results->fetchAll(PDO::FETCH_ASSOC),
        'cgpa'                 => $cgpa,
        'latest_sgpa'          => round($latest_sgpa, 2),
        'semester_performance' => $semester_perf,
    ]);

} else {
    Response::notFound('Endpoint not found.');
}

<?php
/**
 * UniGrade Complete Indian Tech Dataset Seeder
 * Populates authentic Indian names, Tech curriculum, Course Offerings,
 * Assessment Schemes, Enrollments, Marks & Published Results.
 */
require_once __DIR__ . '/../backend/config/database.php';

try {
    $db = Database::getInstance();
    $db->beginTransaction();

    echo "1. Seeding Departments...\n";
    $depts = [
        ['CSE', 'Computer Science & Engineering', 'Department of Computer Science and Engineering'],
        ['IT', 'Information Technology', 'Department of Information Technology'],
        ['AIDS', 'Artificial Intelligence & Data Science', 'Department of Artificial Intelligence and Data Science'],
        ['ECE', 'Electronics & Communication Engineering', 'Department of Electronics and Hardware Engineering']
    ];
    $deptMap = [];
    foreach ($depts as $d) {
        $chk = $db->prepare("SELECT id FROM departments WHERE department_code = ? LIMIT 1");
        $chk->execute([$d[0]]);
        $did = $chk->fetchColumn();
        if (!$did) {
            $ins = $db->prepare("INSERT INTO departments (department_code, department_name, description, status) VALUES (?, ?, ?, 'ACTIVE')");
            $ins->execute([$d[0], $d[1], $d[2]]);
            $did = (int)$db->lastInsertId();
        } else {
            $upd = $db->prepare("UPDATE departments SET department_name = ?, description = ?, status = 'ACTIVE' WHERE id = ?");
            $upd->execute([$d[1], $d[2], $did]);
        }
        $deptMap[$d[0]] = (int)$did;
    }

    echo "2. Seeding Academic Programs...\n";
    $programs = [
        ['BTECH-CSE', 'B.Tech in Computer Science & Engineering', 'CSE', 'UNDERGRADUATE', 4],
        ['BTECH-IT', 'B.Tech in Information Technology', 'IT', 'UNDERGRADUATE', 4],
        ['BTECH-AI', 'B.Tech in Artificial Intelligence & Data Science', 'AIDS', 'UNDERGRADUATE', 4]
    ];
    $progMap = [];
    foreach ($programs as $p) {
        $chk = $db->prepare("SELECT id FROM programs WHERE program_code = ? LIMIT 1");
        $chk->execute([$p[0]]);
        $pid = $chk->fetchColumn();
        $deptId = $deptMap[$p[2]];
        if (!$pid) {
            $ins = $db->prepare("INSERT INTO programs (program_code, program_name, department_id, degree_type, duration_years, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')");
            $ins->execute([$p[0], $p[1], $deptId, $p[3], $p[4]]);
            $pid = (int)$db->lastInsertId();
        } else {
            $upd = $db->prepare("UPDATE programs SET program_name = ?, department_id = ?, degree_type = ?, duration_years = ?, status = 'ACTIVE' WHERE id = ?");
            $upd->execute([$p[1], $deptId, $p[3], $p[4], $pid]);
        }
        $progMap[$p[0]] = (int)$pid;
    }

    echo "3. Seeding Academic Sessions...\n";
    $sessions = [
        ['2026-2027 Academic Year', '2026-07-01', '2027-06-30', 'ACTIVE'],
        ['2025-2026 Academic Year', '2025-07-01', '2026-06-30', 'ARCHIVED']
    ];
    $sessMap = [];
    foreach ($sessions as $s) {
        $chk = $db->prepare("SELECT id FROM academic_sessions WHERE session_name = ? LIMIT 1");
        $chk->execute([$s[0]]);
        $sid = $chk->fetchColumn();
        if (!$sid) {
            $ins = $db->prepare("INSERT INTO academic_sessions (session_name, start_date, end_date, status) VALUES (?, ?, ?, ?)");
            $ins->execute([$s[0], $s[1], $s[2], $s[3]]);
            $sid = (int)$db->lastInsertId();
        } else {
            $upd = $db->prepare("UPDATE academic_sessions SET start_date = ?, end_date = ?, status = ? WHERE id = ?");
            $upd->execute([$s[1], $s[2], $s[3], $sid]);
        }
        $sessMap[$s[0]] = (int)$sid;
    }

    echo "4. Seeding Users (Indian Admin, Faculty & Students)...\n";
    $users = [
        ['Dr. Rajesh Sharma', 'admin@unigrade.edu', 'Admin@123', 'ADMIN'],
        ['Dr. Ananya Iyer', 'ananya.iyer@unigrade.edu', 'Faculty@123', 'FACULTY'],
        ['Prof. Vikram Malhotra', 'vikram.malhotra@unigrade.edu', 'Faculty@123', 'FACULTY'],
        ['Dr. Priya Mukherjee', 'priya.mukherjee@unigrade.edu', 'Faculty@123', 'FACULTY'],
        ['Srinjoyee Goswami', 'srinjoyee.goswami@gmail.com', 'Student@123', 'STUDENT'],
        ['Aarav Mehta', 'aarav.mehta@gmail.com', 'Student@123', 'STUDENT'],
        ['Diya Patel', 'diya.patel@gmail.com', 'Student@123', 'STUDENT'],
        ['Rohan Verma', 'rohan.verma@gmail.com', 'Student@123', 'STUDENT']
    ];
    $userMap = [];
    foreach ($users as $u) {
        $hash = password_hash($u[2], PASSWORD_BCRYPT);
        $chk = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $chk->execute([$u[1]]);
        $uid = $chk->fetchColumn();
        if (!$uid) {
            $ins = $db->prepare("INSERT INTO users (full_name, email, password_hash, role, account_status) VALUES (?, ?, ?, ?, 'ACTIVE')");
            $ins->execute([$u[0], $u[1], $hash, $u[3]]);
            $uid = (int)$db->lastInsertId();
        } else {
            $upd = $db->prepare("UPDATE users SET full_name = ?, password_hash = ?, role = ?, account_status = 'ACTIVE' WHERE id = ?");
            $upd->execute([$u[0], $hash, $u[3], $uid]);
        }
        $userMap[$u[1]] = (int)$uid;
    }

    echo "5. Seeding Faculty Profiles...\n";
    $facProfiles = [
        ['ananya.iyer@unigrade.edu', 'FAC-CSE-01', 'CSE', 'Professor & Head of Department', '+91 98450 11223', '2018-07-01'],
        ['vikram.malhotra@unigrade.edu', 'FAC-IT-01', 'IT', 'Associate Professor', '+91 98450 22334', '2020-01-15'],
        ['priya.mukherjee@unigrade.edu', 'FAC-AI-01', 'AIDS', 'Assistant Professor', '+91 98450 33445', '2022-08-01']
    ];
    foreach ($facProfiles as $fp) {
        $uid = $userMap[$fp[0]];
        $deptId = $deptMap[$fp[2]];
        $chk = $db->prepare("SELECT id FROM faculty_profiles WHERE user_id = ? LIMIT 1");
        $chk->execute([$uid]);
        $fid = $chk->fetchColumn();
        if (!$fid) {
            $ins = $db->prepare("INSERT INTO faculty_profiles (user_id, employee_code, department_id, designation, contact_number, date_of_joining) VALUES (?, ?, ?, ?, ?, ?)");
            $ins->execute([$uid, $fp[1], $deptId, $fp[3], $fp[4], $fp[5]]);
        } else {
            $upd = $db->prepare("UPDATE faculty_profiles SET employee_code = ?, department_id = ?, designation = ?, contact_number = ?, date_of_joining = ? WHERE user_id = ?");
            $upd->execute([$fp[1], $deptId, $fp[3], $fp[4], $fp[5], $uid]);
        }
    }

    echo "6. Seeding Student Profiles...\n";
    $stuProfiles = [
        ['srinjoyee.goswami@gmail.com', 'CS2026001', 'UG2026CS001', 'BTECH-CSE', 2026, 1, '+91 98300 12345'],
        ['aarav.mehta@gmail.com', 'CS2026002', 'UG2026CS002', 'BTECH-CSE', 2026, 1, '+91 98300 23456'],
        ['diya.patel@gmail.com', 'CS2026003', 'UG2026CS003', 'BTECH-CSE', 2026, 1, '+91 98300 34567'],
        ['rohan.verma@gmail.com', 'IT2026001', 'UG2026IT001', 'BTECH-IT', 2026, 1, '+91 98300 45678']
    ];
    foreach ($stuProfiles as $sp) {
        $uid = $userMap[$sp[0]];
        $pid = $progMap[$sp[3]];
        $chk = $db->prepare("SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1");
        $chk->execute([$uid]);
        $sid = $chk->fetchColumn();
        if (!$sid) {
            $ins = $db->prepare("INSERT INTO student_profiles (user_id, roll_number, registration_number, program_id, admission_year, current_semester, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $ins->execute([$uid, $sp[1], $sp[2], $pid, $sp[4], $sp[5], $sp[6]]);
        } else {
            $upd = $db->prepare("UPDATE student_profiles SET roll_number = ?, registration_number = ?, program_id = ?, admission_year = ?, current_semester = ?, contact_number = ? WHERE user_id = ?");
            $upd->execute([$sp[1], $sp[2], $pid, $sp[4], $sp[5], $sp[6], $uid]);
        }
    }

    echo "7. Seeding Tech Courses...\n";
    $courses = [
        ['CS101', 'Data Structures & Algorithms', 'Fundamental linear & non-linear data structures, trees, graphs, sorting & dynamic programming.', 'CSE', 4, 'THEORY'],
        ['CS102', 'Database Management Systems', 'Relational data model, relational algebra, SQL querying, normalization and ACID transaction management.', 'CSE', 4, 'THEORY'],
        ['CS103', 'Operating Systems & Linux Architecture', 'Process scheduling, concurrency, virtual memory management, system calls and storage subsystems.', 'CSE', 4, 'THEORY'],
        ['IT101', 'Full-Stack Web Technologies', 'Modern web architectures, responsive client frameworks (React), microservices and cloud deployment.', 'IT', 4, 'PRACTICAL'],
        ['AI101', 'Artificial Intelligence & Machine Learning', 'Supervised and unsupervised learning, deep neural network architectures and natural language processing.', 'AIDS', 4, 'THEORY'],
        ['CS104', 'Computer Networks & Cybersecurity', 'TCP/IP networking, packet routing, socket programming, cryptography and network protection protocols.', 'CSE', 3, 'THEORY']
    ];
    $courseMap = [];
    foreach ($courses as $c) {
        $deptId = $deptMap[$c[3]];
        $chk = $db->prepare("SELECT id FROM courses WHERE course_code = ? LIMIT 1");
        $chk->execute([$c[0]]);
        $cid = $chk->fetchColumn();
        if (!$cid) {
            $ins = $db->prepare("INSERT INTO courses (course_code, course_title, description, department_id, credit_hours, course_type, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')");
            $ins->execute([$c[0], $c[1], $c[2], $deptId, $c[4], $c[5]]);
            $cid = (int)$db->lastInsertId();
        } else {
            $upd = $db->prepare("UPDATE courses SET course_title = ?, description = ?, department_id = ?, credit_hours = ?, course_type = ?, status = 'ACTIVE' WHERE id = ?");
            $upd->execute([$c[1], $c[2], $deptId, $c[4], $c[5], $cid]);
        }
        $courseMap[$c[0]] = (int)$cid;
    }

    echo "8. Seeding Course Offerings...\n";
    $activeSessId = $sessMap['2026-2027 Academic Year'];
    $offeringsData = [
        ['CS101', 'BTECH-CSE', 'ananya.iyer@unigrade.edu', 1, 'A', 60],
        ['CS102', 'BTECH-CSE', 'vikram.malhotra@unigrade.edu', 1, 'A', 60],
        ['AI101', 'BTECH-AI', 'priya.mukherjee@unigrade.edu', 1, 'A', 60],
        ['IT101', 'BTECH-IT', 'vikram.malhotra@unigrade.edu', 1, 'A', 60]
    ];
    $offeringMap = [];
    foreach ($offeringsData as $od) {
        $cid = $courseMap[$od[0]];
        $pid = $progMap[$od[1]];
        $fuid = $userMap[$od[2]];
        $chk = $db->prepare("SELECT id FROM course_offerings WHERE course_id = ? AND program_id = ? AND academic_session_id = ? AND semester_number = ? AND section = ? LIMIT 1");
        $chk->execute([$cid, $pid, $activeSessId, $od[3], $od[4]]);
        $oid = $chk->fetchColumn();
        if (!$oid) {
            $ins = $db->prepare("INSERT INTO course_offerings (course_id, program_id, academic_session_id, semester_number, section, faculty_user_id, enrollment_capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')");
            $ins->execute([$cid, $pid, $activeSessId, $od[3], $od[4], $fuid, $od[5]]);
            $oid = (int)$db->lastInsertId();
        } else {
            $upd = $db->prepare("UPDATE course_offerings SET faculty_user_id = ?, enrollment_capacity = ?, status = 'ACTIVE' WHERE id = ?");
            $upd->execute([$fuid, $od[5], $oid]);
        }
        $offeringMap[$od[0]] = (int)$oid;
    }

    echo "9. Seeding Assessment Components for Offerings...\n";
    $insComp = $db->prepare("INSERT INTO assessment_components (offering_id, component_name, assessment_type, maximum_marks, weight_percentage, minimum_pass_percentage, is_mandatory, examination_date, start_time, end_time, venue, status) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)");
    
    // Check if components exist
    foreach ($offeringMap as $ccode => $offId) {
        $cCount = (int)$db->query("SELECT COUNT(*) FROM assessment_components WHERE offering_id = $offId")->fetchColumn();
        if ($cCount === 0) {
            $insComp->execute([$offId, 'Mid-Semester Examination', 'MIDTERM', 50.00, 30.00, 40.00, '2026-10-15', '10:00:00', '12:00:00', 'Tech Aud-1', 'COMPLETED']);
            $insComp->execute([$offId, 'End-Semester Final Examination', 'FINAL', 100.00, 50.00, 40.00, '2026-12-10', '09:30:00', '12:30:00', 'Exam Hall Alpha', 'COMPLETED']);
            $insComp->execute([$offId, 'Lab Practical & Project Evaluation', 'PRACTICAL', 50.00, 20.00, 40.00, '2026-11-20', '14:00:00', '17:00:00', 'Advanced CS Lab 2', 'COMPLETED']);
        }
    }

    echo "10. Seeding Student Enrollments...\n";
    $enrollData = [
        ['CS101', 'srinjoyee.goswami@gmail.com'],
        ['CS101', 'aarav.mehta@gmail.com'],
        ['CS101', 'diya.patel@gmail.com'],
        ['CS101', 'rohan.verma@gmail.com'],

        ['CS102', 'srinjoyee.goswami@gmail.com'],
        ['CS102', 'aarav.mehta@gmail.com'],
        ['CS102', 'diya.patel@gmail.com'],

        ['AI101', 'srinjoyee.goswami@gmail.com'],
        ['AI101', 'aarav.mehta@gmail.com'],
        ['AI101', 'diya.patel@gmail.com'],

        ['IT101', 'rohan.verma@gmail.com']
    ];
    $enrollMap = [];
    foreach ($enrollData as $ed) {
        $offId = $offeringMap[$ed[0]];
        $suid = $userMap[$ed[1]];
        $chk = $db->prepare("SELECT id FROM student_enrollments WHERE offering_id = ? AND student_user_id = ? LIMIT 1");
        $chk->execute([$offId, $suid]);
        $eid = $chk->fetchColumn();
        if (!$eid) {
            $ins = $db->prepare("INSERT INTO student_enrollments (offering_id, student_user_id, enrollment_date, status) VALUES (?, ?, '2026-07-15', 'ENROLLED')");
            $ins->execute([$offId, $suid]);
            $eid = (int)$db->lastInsertId();
        }
        $enrollMap[$ed[0] . '_' . $ed[1]] = (int)$eid;
    }

    echo "11. Seeding Assessment Marks for CS101...\n";
    $cs101OffId = $offeringMap['CS101'];
    $comps = $db->query("SELECT id, assessment_type FROM assessment_components WHERE offering_id = $cs101OffId ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
    $midCompId = $comps[0]['id'] ?? null;
    $finCompId = $comps[1]['id'] ?? null;
    $praCompId = $comps[2]['id'] ?? null;

    $facultyUser = $userMap['ananya.iyer@unigrade.edu'];
    $adminUser = $userMap['admin@unigrade.edu'];

    if ($midCompId && $finCompId && $praCompId) {
        $studentMarks = [
            'srinjoyee.goswami@gmail.com' => ['mid' => 47.00, 'fin' => 94.00, 'pra' => 48.00, 'rem' => 'Outstanding analytical performance'],
            'aarav.mehta@gmail.com'       => ['mid' => 43.00, 'fin' => 86.00, 'pra' => 44.00, 'rem' => 'Strong algorithmic foundations'],
            'diya.patel@gmail.com'        => ['mid' => 38.00, 'fin' => 78.00, 'pra' => 40.00, 'rem' => 'Consistent performance in exams'],
            'rohan.verma@gmail.com'       => ['mid' => 36.00, 'fin' => 74.00, 'pra' => 39.00, 'rem' => 'Good conceptual comprehension']
        ];

        $insM = $db->prepare("INSERT INTO assessment_marks (assessment_component_id, enrollment_id, obtained_marks, attendance_status, remarks, entered_by)
            VALUES (?, ?, ?, 'PRESENT', ?, ?) ON DUPLICATE KEY UPDATE obtained_marks=VALUES(obtained_marks), attendance_status='PRESENT', remarks=VALUES(remarks)");

        foreach ($studentMarks as $semail => $m) {
            $eid = $enrollMap['CS101_' . $semail];
            $insM->execute([$midCompId, $eid, $m['mid'], $m['rem'], $facultyUser]);
            $insM->execute([$finCompId, $eid, $m['fin'], $m['rem'], $facultyUser]);
            $insM->execute([$praCompId, $eid, $m['pra'], $m['rem'], $facultyUser]);
        }

        echo "12. Seeding Mark Sheet Submissions (Approved)...\n";
        $insSub = $db->prepare("INSERT INTO mark_sheet_submissions (assessment_component_id, submitted_by, status, reviewed_by, review_comment, submitted_at, reviewed_at)
            VALUES (?, ?, 'APPROVED', ?, 'Physical examination sheets verified and approved.', NOW(), NOW())
            ON DUPLICATE KEY UPDATE status='APPROVED', reviewed_by=VALUES(reviewed_by), review_comment=VALUES(review_comment), reviewed_at=NOW()");
        $insSub->execute([$midCompId, $facultyUser, $adminUser]);
        $insSub->execute([$finCompId, $facultyUser, $adminUser]);
        $insSub->execute([$praCompId, $facultyUser, $adminUser]);
    }

    echo "13. Seeding Grade Scale & Bands...\n";
    $scaleChk = $db->query("SELECT id FROM grade_scales WHERE is_default = 1 LIMIT 1")->fetchColumn();
    if (!$scaleChk) {
        $db->exec("INSERT INTO grade_scales (program_id, scale_name, minimum_overall_pass_percentage, is_default, status)
            VALUES (NULL, 'Standard University Scale (10-Point UGC)', 40.00, 1, 'ACTIVE')");
        $scaleChk = (int)$db->lastInsertId();
    }
    $bands = [
        [90.00, 100.00, 'O', 10.00, 1],
        [80.00, 89.99, 'A+', 9.00, 1],
        [70.00, 79.99, 'A', 8.00, 1],
        [60.00, 69.99, 'B+', 7.00, 1],
        [50.00, 59.99, 'B', 6.00, 1],
        [40.00, 49.99, 'C', 5.00, 1],
        [0.00, 39.99, 'F', 0.00, 0]
    ];
    $bCount = (int)$db->query("SELECT COUNT(*) FROM grade_scale_bands WHERE grade_scale_id = $scaleChk")->fetchColumn();
    if ($bCount === 0) {
        $insB = $db->prepare("INSERT INTO grade_scale_bands (grade_scale_id, minimum_percentage, maximum_percentage, letter_grade, grade_point, is_passing) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($bands as $b) {
            $insB->execute([$scaleChk, $b[0], $b[1], $b[2], $b[3], $b[4]]);
        }
    }

    echo "14. Seeding Pre-Calculated and Published Results for CS101...\n";
    $resData = [
        'srinjoyee.goswami@gmail.com' => ['pct' => 94.400, 'marks' => 189.00, 'grade' => 'O', 'gp' => 10.00],
        'aarav.mehta@gmail.com'       => ['pct' => 86.400, 'marks' => 173.00, 'grade' => 'A+', 'gp' => 9.00],
        'diya.patel@gmail.com'        => ['pct' => 77.800, 'marks' => 156.00, 'grade' => 'A', 'gp' => 8.00],
        'rohan.verma@gmail.com'       => ['pct' => 74.200, 'marks' => 149.00, 'grade' => 'A', 'gp' => 8.00]
    ];
    $insRes = $db->prepare("INSERT INTO course_results (enrollment_id, total_percentage, total_marks, letter_grade, grade_point, result_status, calculated_at, published_at, published_by)
        VALUES (?, ?, ?, ?, ?, 'PUBLISHED', NOW(), NOW(), ?)
        ON DUPLICATE KEY UPDATE total_percentage=VALUES(total_percentage), total_marks=VALUES(total_marks), letter_grade=VALUES(letter_grade), grade_point=VALUES(grade_point), result_status='PUBLISHED', published_at=NOW(), published_by=VALUES(published_by)");

    foreach ($resData as $semail => $rd) {
        $eid = $enrollMap['CS101_' . $semail];
        $insRes->execute([$eid, $rd['pct'], $rd['marks'], $rd['grade'], $rd['gp'], $adminUser]);
    }

    $db->commit();
    echo "\n=== COMPLETE INDIAN TECH SEEDING SUCCESSFUL! ===\n";

} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

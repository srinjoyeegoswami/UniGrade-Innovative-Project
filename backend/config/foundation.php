<?php
/**
 * UniGrade Foundation Seeder
 * Automatically ensures modern Indian tech curriculum, departments, programs, sessions, offerings & exam schemes.
 */
function ensureFoundationData(PDO $db): void {
    try {
        // 1. Departments
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
            }
            $deptMap[$d[0]] = (int)$did;
        }

        // 2. Programs
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
            $deptId = $deptMap[$p[2]] ?? 1;
            if (!$pid) {
                $ins = $db->prepare("INSERT INTO programs (program_code, program_name, department_id, degree_type, duration_years, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')");
                $ins->execute([$p[0], $p[1], $deptId, $p[3], $p[4]]);
                $pid = (int)$db->lastInsertId();
            }
            $progMap[$p[0]] = (int)$pid;
        }

        // 3. Academic Sessions
        $chkSess = $db->query("SELECT id FROM academic_sessions WHERE session_name = '2026-2027 Academic Year' LIMIT 1")->fetchColumn();
        if (!$chkSess) {
            $db->exec("INSERT INTO academic_sessions (session_name, start_date, end_date, status) VALUES ('2026-2027 Academic Year', '2026-07-01', '2027-06-30', 'ACTIVE')");
            $sessId = (int)$db->lastInsertId();
        } else {
            $sessId = (int)$chkSess;
        }

        // 4. Tech Courses
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
            $deptId = $deptMap[$c[3]] ?? 1;
            $chk = $db->prepare("SELECT id FROM courses WHERE course_code = ? LIMIT 1");
            $chk->execute([$c[0]]);
            $cid = $chk->fetchColumn();
            if (!$cid) {
                $ins = $db->prepare("INSERT INTO courses (course_code, course_title, description, department_id, credit_hours, course_type, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')");
                $ins->execute([$c[0], $c[1], $c[2], $deptId, $c[4], $c[5]]);
                $cid = (int)$db->lastInsertId();
            }
            $courseMap[$c[0]] = (int)$cid;
        }

        // 5. Ensure Admin and Faculty Users
        $adminId = (int)$db->query("SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id ASC LIMIT 1")->fetchColumn();
        if (!$adminId) {
            $adminId = 1;
        }
        $facultyId = (int)$db->query("SELECT id FROM users WHERE role = 'FACULTY' ORDER BY id ASC LIMIT 1")->fetchColumn();
        if (!$facultyId) {
            $facultyId = $adminId;
        }

        // 6. Course Offerings & Assessment Components
        $offCount = (int)$db->query("SELECT COUNT(*) FROM course_offerings")->fetchColumn();
        if ($offCount === 0) {
            $btechCseId = $progMap['BTECH-CSE'] ?? 1;
            $insOff = $db->prepare("INSERT INTO course_offerings (course_id, program_id, academic_session_id, semester_number, section, faculty_user_id, enrollment_capacity, status) VALUES (?, ?, ?, 1, 'A', ?, 60, 'ACTIVE')");
            $insComp = $db->prepare("INSERT INTO assessment_components (offering_id, component_name, assessment_type, maximum_marks, weight_percentage, minimum_pass_percentage, is_mandatory, examination_date, start_time, end_time, venue, status) VALUES (?, ?, ?, ?, ?, 40.00, 1, ?, ?, ?, ?, 'SCHEDULED')");

            foreach ($courseMap as $ccode => $cid) {
                $insOff->execute([$cid, $btechCseId, $sessId, $facultyId]);
                $offId = (int)$db->lastInsertId();

                $insComp->execute([$offId, 'Mid-Semester Examination', 'MIDTERM', 50.00, 30.00, '2026-10-15', '10:00:00', '12:00:00', 'Tech Aud-1']);
                $insComp->execute([$offId, 'End-Semester Final Examination', 'FINAL', 100.00, 50.00, '2026-12-10', '09:30:00', '12:30:00', 'Exam Hall Alpha']);
                $insComp->execute([$offId, 'Lab Practical & Project Evaluation', 'PRACTICAL', 50.00, 20.00, '2026-11-20', '14:00:00', '17:00:00', 'Advanced CS Lab 2']);
            }
        }

        // 7. Universal Grade Scales & Bands
        $scaleChk = $db->query("SELECT id FROM grade_scales WHERE is_default = 1 LIMIT 1")->fetchColumn();
        if (!$scaleChk) {
            $db->exec("INSERT INTO grade_scales (program_id, scale_name, minimum_overall_pass_percentage, is_default, status)
                VALUES (NULL, 'Standard University Scale (10-Point UGC)', 40.00, 1, 'ACTIVE')");
            $scaleChk = (int)$db->lastInsertId();
            $bands = [
                [90.00, 100.00, 'O', 10.00, 1],
                [80.00, 89.99, 'A+', 9.00, 1],
                [70.00, 79.99, 'A', 8.00, 1],
                [60.00, 69.99, 'B+', 7.00, 1],
                [50.00, 59.99, 'B', 6.00, 1],
                [40.00, 49.99, 'C', 5.00, 1],
                [0.00, 39.99, 'F', 0.00, 0]
            ];
            $insB = $db->prepare("INSERT INTO grade_scale_bands (grade_scale_id, minimum_percentage, maximum_percentage, letter_grade, grade_point, is_passing) VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($bands as $b) {
                $insB->execute([$scaleChk, $b[0], $b[1], $b[2], $b[3], $b[4]]);
            }
        }

    } catch (\Throwable $e) {
        error_log('[FoundationData] Error: ' . $e->getMessage());
    }
}

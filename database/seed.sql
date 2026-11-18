-- ============================================================
-- UniGrade — Direct SQL Seed Script
-- All passwords hashed with bcrypt:
-- Admin@123, Faculty@123, Student@123 -> $2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi
-- ============================================================

USE unigrade_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_logs;
TRUNCATE TABLE announcements;
TRUNCATE TABLE course_results;
TRUNCATE TABLE grade_scale_bands;
TRUNCATE TABLE grade_scales;
TRUNCATE TABLE mark_sheet_submissions;
TRUNCATE TABLE assessment_marks;
TRUNCATE TABLE assessment_components;
TRUNCATE TABLE student_enrollments;
TRUNCATE TABLE course_offerings;
TRUNCATE TABLE courses;
TRUNCATE TABLE academic_sessions;
TRUNCATE TABLE faculty_profiles;
TRUNCATE TABLE student_profiles;
TRUNCATE TABLE programs;
TRUNCATE TABLE departments;
TRUNCATE TABLE users;

-- 1. Users
INSERT INTO users (id, full_name, email, password_hash, role, account_status) VALUES
(1, 'Dr. Admin User', 'admin@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'ADMIN', 'ACTIVE'),
(2, 'Dr. Sarah Johnson', 'faculty1@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'FACULTY', 'ACTIVE'),
(3, 'Prof. Michael Chen', 'faculty2@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'FACULTY', 'ACTIVE'),
(4, 'Dr. Priya Sharma', 'faculty3@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'FACULTY', 'ACTIVE'),
(5, 'Alice Thompson', 'student1@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(6, 'Bob Martinez', 'student2@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(7, 'Carol White', 'student3@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(8, 'David Lee', 'student4@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(9, 'Emma Wilson', 'student5@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(10, 'Frank Brown', 'student6@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(11, 'Grace Davis', 'student7@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(12, 'Henry Miller', 'student8@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(13, 'Iris Garcia', 'student9@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE'),
(14, 'James Rodriguez', 'student10@unigrade.edu', '$2y$10$TKh8H1.PfYi1kwoYFIAHqeQNKI6oiPK4JNGMFbNE8EQGaE7wfJGCi', 'STUDENT', 'ACTIVE');

-- 2. Departments
INSERT INTO departments (id, department_name, department_code, description, status) VALUES
(1, 'Computer Science', 'CS', 'Department of Computer Science and Engineering', 'ACTIVE'),
(2, 'Mathematics', 'MATH', 'Department of Mathematics and Statistics', 'ACTIVE'),
(3, 'Business Administration', 'BA', 'School of Business and Management Studies', 'ACTIVE');

-- 3. Programs
INSERT INTO programs (id, department_id, program_name, program_code, degree_type, duration_years, status) VALUES
(1, 1, 'B.Sc. Computer Science', 'BSCS', 'Bachelor of Science', 3, 'ACTIVE'),
(2, 1, 'Bachelor of Computer Applications', 'BCA', 'Bachelor', 3, 'ACTIVE'),
(3, 3, 'Bachelor of Business Administration', 'BBA', 'Bachelor', 3, 'ACTIVE');

-- 4. Faculty Profiles
INSERT INTO faculty_profiles (id, user_id, employee_code, department_id, designation, contact_number, date_of_joining) VALUES
(1, 2, 'FAC001', 1, 'Associate Professor', '+1-555-0101', '2020-08-01'),
(2, 3, 'FAC002', 2, 'Assistant Professor', '+1-555-0102', '2021-01-15'),
(3, 4, 'FAC003', 3, 'Professor', '+1-555-0103', '2018-07-01');

-- 5. Student Profiles
INSERT INTO student_profiles (id, user_id, roll_number, registration_number, program_id, admission_year, current_semester, contact_number) VALUES
(1, 5, 'CS2025001', 'UG2025CS001', 1, 2025, 1, '+1-555-0201'),
(2, 6, 'CS2025002', 'UG2025CS002', 1, 2025, 1, '+1-555-0202'),
(3, 7, 'CS2025003', 'UG2025CS003', 1, 2025, 1, '+1-555-0203'),
(4, 8, 'CS2025004', 'UG2025CS004', 1, 2025, 1, '+1-555-0204'),
(5, 9, 'CS2025005', 'UG2025CS005', 1, 2025, 1, '+1-555-0205'),
(6, 10, 'CS2025006', 'UG2025CS006', 1, 2025, 1, '+1-555-0206'),
(7, 11, 'CS2025007', 'UG2025CS007', 1, 2025, 1, '+1-555-0207'),
(8, 12, 'CS2025008', 'UG2025CS008', 1, 2025, 1, '+1-555-0208'),
(9, 13, 'CS2025009', 'UG2025CS009', 1, 2025, 1, '+1-555-0209'),
(10, 14, 'CS2025010', 'UG2025CS010', 1, 2025, 1, '+1-555-0210');

-- 6. Academic Sessions
INSERT INTO academic_sessions (id, session_name, start_date, end_date, status) VALUES
(1, '2025-2026', '2025-07-01', '2026-06-30', 'ACTIVE'),
(2, '2024-2025', '2024-07-01', '2025-06-30', 'ARCHIVED');

-- 7. Courses Catalog
INSERT INTO courses (id, course_code, course_title, description, department_id, credit_hours, course_type, status) VALUES
(1, 'CS101', 'Programming Fundamentals', 'Introduction to procedural and object-oriented programming in C/C++', 1, 4, 'THEORY', 'ACTIVE'),
(2, 'CS102', 'Data Structures and Algorithms', 'Arrays, linked lists, trees, graphs, sorting, and algorithmic complexity', 1, 4, 'THEORY', 'ACTIVE'),
(3, 'CS103', 'Database Management Systems', 'Relational database design, normalisation, SQL, transactions, and indexing', 1, 4, 'THEORY', 'ACTIVE'),
(4, 'CS104', 'Computer Networks', 'OSI model, TCP/IP, network protocols, routing algorithms, and security', 1, 3, 'THEORY', 'ACTIVE'),
(5, 'MA101', 'Engineering Mathematics I', 'Differential calculus, linear algebra, and matrices', 2, 3, 'THEORY', 'ACTIVE'),
(6, 'MA102', 'Engineering Mathematics II', 'Integral calculus, differential equations, and complex analysis', 2, 3, 'THEORY', 'ACTIVE'),
(7, 'BA101', 'Principles of Management', 'Fundamentals of organizational planning, leadership, and control', 3, 3, 'THEORY', 'ACTIVE'),
(8, 'BA102', 'Business Communication', 'Written and oral corporate communication, report writing, and presentations', 3, 3, 'THEORY', 'ACTIVE');

-- 8. Course Offerings (2025-2026, Semester 1, B.Sc. CS)
INSERT INTO course_offerings (id, course_id, program_id, academic_session_id, semester_number, section, faculty_user_id, enrollment_capacity, status) VALUES
(1, 1, 1, 1, 1, 'A', 2, 60, 'ACTIVE'), -- CS101 -> Dr. Sarah Johnson
(2, 2, 1, 1, 1, 'A', 2, 60, 'ACTIVE'), -- CS102 -> Dr. Sarah Johnson
(3, 3, 1, 1, 1, 'A', 2, 60, 'ACTIVE'), -- CS103 -> Dr. Sarah Johnson
(4, 5, 1, 1, 1, 'A', 3, 60, 'ACTIVE'); -- MA101 -> Prof. Michael Chen

-- 9. Enrollments (10 students x 4 offerings = 40 enrollments)
INSERT INTO student_enrollments (id, offering_id, student_user_id, enrollment_date, status) VALUES
(1, 1, 5, '2025-07-15', 'ENROLLED'), (2, 1, 6, '2025-07-15', 'ENROLLED'), (3, 1, 7, '2025-07-15', 'ENROLLED'), (4, 1, 8, '2025-07-15', 'ENROLLED'), (5, 1, 9, '2025-07-15', 'ENROLLED'),
(6, 1, 10, '2025-07-15', 'ENROLLED'), (7, 1, 11, '2025-07-15', 'ENROLLED'), (8, 1, 12, '2025-07-15', 'ENROLLED'), (9, 1, 13, '2025-07-15', 'ENROLLED'), (10, 1, 14, '2025-07-15', 'ENROLLED'),
(11, 2, 5, '2025-07-15', 'ENROLLED'), (12, 2, 6, '2025-07-15', 'ENROLLED'), (13, 2, 7, '2025-07-15', 'ENROLLED'), (14, 2, 8, '2025-07-15', 'ENROLLED'), (15, 2, 9, '2025-07-15', 'ENROLLED'),
(16, 2, 10, '2025-07-15', 'ENROLLED'), (17, 2, 11, '2025-07-15', 'ENROLLED'), (18, 2, 12, '2025-07-15', 'ENROLLED'), (19, 2, 13, '2025-07-15', 'ENROLLED'), (20, 2, 14, '2025-07-15', 'ENROLLED'),
(21, 3, 5, '2025-07-15', 'ENROLLED'), (22, 3, 6, '2025-07-15', 'ENROLLED'), (23, 3, 7, '2025-07-15', 'ENROLLED'), (24, 3, 8, '2025-07-15', 'ENROLLED'), (25, 3, 9, '2025-07-15', 'ENROLLED'),
(26, 3, 10, '2025-07-15', 'ENROLLED'), (27, 3, 11, '2025-07-15', 'ENROLLED'), (28, 3, 12, '2025-07-15', 'ENROLLED'), (29, 3, 13, '2025-07-15', 'ENROLLED'), (30, 3, 14, '2025-07-15', 'ENROLLED'),
(31, 4, 5, '2025-07-15', 'ENROLLED'), (32, 4, 6, '2025-07-15', 'ENROLLED'), (33, 4, 7, '2025-07-15', 'ENROLLED'), (34, 4, 8, '2025-07-15', 'ENROLLED'), (35, 4, 9, '2025-07-15', 'ENROLLED'),
(36, 4, 10, '2025-07-15', 'ENROLLED'), (37, 4, 11, '2025-07-15', 'ENROLLED'), (38, 4, 12, '2025-07-15', 'ENROLLED'), (39, 4, 13, '2025-07-15', 'ENROLLED'), (40, 4, 14, '2025-07-15', 'ENROLLED');

-- 10. Assessment Components (Internal 20%, Midterm 30%, Final 50% = 100%)
INSERT INTO assessment_components (id, offering_id, component_name, assessment_type, maximum_marks, weight_percentage, minimum_pass_percentage, is_mandatory, examination_date, start_time, end_time, venue, status) VALUES
(1, 1, 'Internal Assessment', 'INTERNAL', 40.00, 20.00, 40.00, 1, '2025-09-15', '10:00:00', '11:00:00', 'Classroom 101', 'COMPLETED'),
(2, 1, 'Midterm Examination', 'MIDTERM', 40.00, 30.00, 40.00, 1, '2025-10-20', '10:00:00', '12:00:00', 'Exam Hall A', 'COMPLETED'),
(3, 1, 'Final Examination', 'FINAL', 80.00, 50.00, 40.00, 1, '2025-12-10', '09:30:00', '12:30:00', 'Central Auditorium', 'COMPLETED'),
(4, 2, 'Internal Assessment', 'INTERNAL', 40.00, 20.00, 40.00, 1, '2025-09-16', '10:00:00', '11:00:00', 'Classroom 102', 'COMPLETED'),
(5, 2, 'Midterm Examination', 'MIDTERM', 40.00, 30.00, 40.00, 1, '2025-10-21', '10:00:00', '12:00:00', 'Exam Hall A', 'COMPLETED'),
(6, 2, 'Final Examination', 'FINAL', 80.00, 50.00, 40.00, 1, '2025-12-11', '09:30:00', '12:30:00', 'Central Auditorium', 'COMPLETED'),
(7, 3, 'Internal Assessment', 'INTERNAL', 40.00, 20.00, 40.00, 1, '2025-09-17', '10:00:00', '11:00:00', 'Lab 2', 'COMPLETED'),
(8, 3, 'Midterm Examination', 'MIDTERM', 40.00, 30.00, 40.00, 1, '2025-10-22', '10:00:00', '12:00:00', 'Exam Hall B', 'COMPLETED'),
(9, 3, 'Final Examination', 'FINAL', 80.00, 50.00, 40.00, 1, '2025-12-12', '09:30:00', '12:30:00', 'Central Auditorium', 'SCHEDULED'),
(10, 4, 'Internal Assessment', 'INTERNAL', 40.00, 20.00, 40.00, 1, '2025-09-18', '11:00:00', '12:00:00', 'Math Hall', 'COMPLETED'),
(11, 4, 'Midterm Examination', 'MIDTERM', 40.00, 30.00, 40.00, 1, '2025-10-23', '10:00:00', '12:00:00', 'Exam Hall B', 'COMPLETED'),
(12, 4, 'Final Examination', 'FINAL', 80.00, 50.00, 40.00, 1, '2025-12-15', '09:30:00', '12:30:00', 'Central Auditorium', 'SCHEDULED');

-- 11. Mark Sheet Submissions
INSERT INTO mark_sheet_submissions (id, assessment_component_id, submitted_by, status, reviewed_by, review_comment, submitted_at, reviewed_at) VALUES
(1, 1, 2, 'APPROVED', 1, 'Internal marks verified against lab record books.', '2025-09-20 14:00:00', '2025-09-21 10:00:00'),
(2, 2, 2, 'APPROVED', 1, 'Midterm answer scripts moderated and approved.', '2025-10-25 15:30:00', '2025-10-26 11:00:00'),
(3, 3, 2, 'APPROVED', 1, 'Final exam scripts evaluated. Ready for official publication.', '2025-12-14 16:00:00', '2025-12-15 09:30:00'),
(4, 4, 2, 'APPROVED', 1, 'Approved.', '2025-09-20 14:30:00', '2025-09-21 10:15:00'),
(5, 5, 2, 'APPROVED', 1, 'Approved.', '2025-10-25 16:00:00', '2025-10-26 11:30:00'),
(6, 6, 2, 'SUBMITTED', NULL, NULL, '2025-12-15 14:00:00', NULL),
(7, 7, 2, 'DRAFT', NULL, NULL, NULL, NULL),
(8, 10, 3, 'DRAFT', NULL, NULL, NULL, NULL);

-- 12. Grade Scales
INSERT INTO grade_scales (id, program_id, scale_name, minimum_overall_pass_percentage, is_default, status) VALUES
(1, NULL, 'Standard University Scale', 40.00, 1, 'ACTIVE');

-- 13. Grade Scale Bands
INSERT INTO grade_scale_bands (id, grade_scale_id, minimum_percentage, maximum_percentage, letter_grade, grade_point, is_passing) VALUES
(1, 1, 90.00, 100.00, 'O', 10.00, 1),
(2, 1, 80.00, 89.99, 'A+', 9.00, 1),
(3, 1, 70.00, 79.99, 'A', 8.00, 1),
(4, 1, 60.00, 69.99, 'B+', 7.00, 1),
(5, 1, 50.00, 59.99, 'B', 6.00, 1),
(6, 1, 40.00, 49.99, 'C', 5.00, 1),
(7, 1, 0.00, 39.99, 'F', 0.00, 0);

-- 14. Assessment Marks for CS101 (Offerings 1)
INSERT INTO assessment_marks (assessment_component_id, enrollment_id, obtained_marks, attendance_status, entered_by) VALUES
(1, 1, 36.00, 'PRESENT', 2), (2, 1, 32.00, 'PRESENT', 2), (3, 1, 68.00, 'PRESENT', 2), -- Alice (84.5% -> A+)
(1, 2, 30.00, 'PRESENT', 2), (2, 2, 25.00, 'PRESENT', 2), (3, 2, 55.00, 'PRESENT', 2), -- Bob (68.1% -> B+)
(1, 3, 38.00, 'PRESENT', 2), (2, 3, 36.00, 'PRESENT', 2), (3, 3, 74.00, 'PRESENT', 2), -- Carol (92.2% -> O)
(1, 4, 20.00, 'PRESENT', 2), (2, 4, 18.00, 'PRESENT', 2), (3, 4, 38.00, 'PRESENT', 2), -- David (47.2% -> C)
(1, 5, 34.00, 'PRESENT', 2), (2, 5, 30.00, 'PRESENT', 2), (3, 5, 65.00, 'PRESENT', 2), -- Emma (80.1% -> A+)
(1, 6, 28.00, 'PRESENT', 2), (2, 6, 22.00, 'PRESENT', 2), (3, 6, 48.00, 'PRESENT', 2), -- Frank (60.5% -> B+)
(1, 7, 36.00, 'PRESENT', 2), (2, 7, 34.00, 'PRESENT', 2), (3, 7, 70.00, 'PRESENT', 2), -- Grace (87.2% -> A+)
(1, 8, 16.00, 'PRESENT', 2), (2, 8, 14.00, 'PRESENT', 2), (3, 8, 30.00, 'PRESENT', 2), -- Henry (37.2% -> F)
(1, 9, 32.00, 'PRESENT', 2), (2, 9, 28.00, 'PRESENT', 2), (3, 9, 62.00, 'PRESENT', 2), -- Iris (75.7% -> A)
(1, 10, 24.00, 'PRESENT', 2), (2, 10, 20.00, 'PRESENT', 2), (3, 10, 42.00, 'PRESENT', 2); -- James (53.2% -> B)

-- 15. Published Course Results for CS101 (Offerings 1)
INSERT INTO course_results (enrollment_id, total_percentage, total_marks, letter_grade, grade_point, result_status, calculated_at, published_at, published_by) VALUES
(1, 84.500, 136.00, 'A+', 9.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(2, 68.125, 110.00, 'B+', 7.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(3, 92.250, 148.00, 'O', 10.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(4, 47.250, 76.00, 'C', 5.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(5, 80.125, 129.00, 'A+', 9.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(6, 60.500, 98.00, 'B+', 7.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(7, 87.250, 140.00, 'A+', 9.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(8, 37.250, 60.00, 'F', 0.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(9, 75.750, 122.00, 'A', 8.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1),
(10, 53.250, 86.00, 'B', 6.00, 'PUBLISHED', '2025-12-15 10:00:00', '2025-12-15 11:00:00', 1);

-- 16. Announcements
INSERT INTO announcements (id, title, content, created_by, target_role, is_active, created_at) VALUES
(1, 'Welcome to UniGrade Academic Year 2025-2026', 'Welcome to the central examination and grading portal. Ensure profile details and course registrations are up to date.', 1, 'ALL', 1, '2025-07-15 09:00:00'),
(2, 'Semester 1 Official Examination Results Released', 'The central examination department has released official course results for Semester 1. Students can view grade cards and print verified transcripts.', 1, 'STUDENT', 1, '2025-12-15 12:00:00');

-- 17. Audit Logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, created_at) VALUES
(1, 'PUBLISH_RESULTS', 'course_offerings', 1, '{"offering_id":1,"course_code":"CS101","candidates_count":10}', '127.0.0.1', '2025-12-15 11:00:00'),
(2, 'SUBMIT_MARK_SHEET', 'assessment_components', 3, '{"component_name":"Final Examination","marks_count":10}', '127.0.0.1', '2025-12-14 16:00:00'),
(1, 'REVIEW_MARK_SHEET', 'assessment_components', 3, '{"status":"APPROVED"}', '127.0.0.1', '2025-12-15 09:30:00');

SET FOREIGN_KEY_CHECKS = 1;


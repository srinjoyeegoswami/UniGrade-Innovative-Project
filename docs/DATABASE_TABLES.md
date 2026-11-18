# MySQL Database Tables Documentation — `unigrade_db`

### Table: `academic_sessions`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `session_name` | varchar(100) | NO | - | NULL | - |
| `start_date` | date | NO | - | NULL | - |
| `end_date` | date | NO | - | NULL | - |
| `status` | enum('ACTIVE','INACTIVE','ARCHIVED') | NO | MUL | INACTIVE | - |

**Total Records:** 3

**Sample Data:**

| id | session_name | start_date | end_date | status |
| :--- | :--- | :--- | :--- | :--- |
| 3 | 2026-2027 Academic Year | 2026-07-01 | 2027-06-30 | ACTIVE |
| 4 | 2025-2026 Academic Year | 2025-07-01 | 2026-06-30 | ARCHIVED |
| 5 | 2026-2030 | 2026-11-17 | 2030-06-16 | INACTIVE |

---

### Table: `announcements`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `title` | varchar(255) | NO | - | NULL | - |
| `content` | text | NO | - | NULL | - |
| `created_by` | int | NO | - | NULL | - |
| `target_role` | enum('ALL','ADMIN','FACULTY','STUDENT') | NO | - | ALL | - |
| `is_active` | tinyint(1) | NO | MUL | 1 | - |
| `created_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| `expires_at` | timestamp | YES | - | NULL | - |

**Total Records:** 1

**Sample Data:**

| id | title | content | created_by | target_role | is_active | created_at | expires_at |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | UniGrade Online System Initialized | Welcome to the university examin... | 1 | ALL | 1 | 2026-11-13 03:21:58 | NULL |

---

### Table: `assessment_components`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `offering_id` | int | NO | MUL | NULL | - |
| `component_name` | varchar(100) | NO | - | NULL | - |
| `assessment_type` | enum('INTERNAL','CLASS_TEST','QUIZ','ASSIGNMENT','PRACTICAL','MIDTERM','FINAL','OTHER') | NO | - | NULL | - |
| `maximum_marks` | decimal(8,2) | NO | - | NULL | - |
| `weight_percentage` | decimal(5,2) | NO | - | NULL | - |
| `minimum_pass_percentage` | decimal(5,2) | YES | - | NULL | - |
| `is_mandatory` | tinyint(1) | NO | - | 1 | - |
| `examination_date` | date | YES | - | NULL | - |
| `start_time` | time | YES | - | NULL | - |
| `end_time` | time | YES | - | NULL | - |
| `venue` | varchar(255) | YES | - | NULL | - |
| `status` | enum('SCHEDULED','ONGOING','COMPLETED','CANCELLED') | NO | - | SCHEDULED | - |

**Total Records:** 12

**Sample Data:**

| id | offering_id | component_name | assessment_type | maximum_marks | weight_percentage | minimum_pass_percentage | is_mandatory | examination_date | start_time | end_time | venue | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | Mid-Semester Examination | MIDTERM | 50.00 | 30.00 | 40.00 | 1 | 2026-10-15 | 10:00:00 | 12:00:00 | Tech Aud-1 | COMPLETED |
| 2 | 1 | End-Semester Final Examination | FINAL | 100.00 | 50.00 | 40.00 | 1 | 2026-12-10 | 09:30:00 | 12:30:00 | Exam Hall Alpha | COMPLETED |
| 3 | 1 | Lab Practical & Project Evaluation | PRACTICAL | 50.00 | 20.00 | 40.00 | 1 | 2026-11-20 | 14:00:00 | 17:00:00 | Advanced CS Lab 2 | COMPLETED |
| 4 | 2 | Mid-Semester Examination | MIDTERM | 50.00 | 30.00 | 40.00 | 1 | 2026-10-15 | 10:00:00 | 12:00:00 | Tech Aud-1 | COMPLETED |
| 5 | 2 | End-Semester Final Examination | FINAL | 100.00 | 50.00 | 40.00 | 1 | 2026-12-10 | 09:30:00 | 12:30:00 | Exam Hall Alpha | COMPLETED |
| 6 | 2 | Lab Practical & Project Evaluation | PRACTICAL | 50.00 | 20.00 | 40.00 | 1 | 2026-11-20 | 14:00:00 | 17:00:00 | Advanced CS Lab 2 | COMPLETED |
| 7 | 3 | Mid-Semester Examination | MIDTERM | 50.00 | 30.00 | 40.00 | 1 | 2026-10-15 | 10:00:00 | 12:00:00 | Tech Aud-1 | COMPLETED |
| 8 | 3 | End-Semester Final Examination | FINAL | 100.00 | 50.00 | 40.00 | 1 | 2026-12-10 | 09:30:00 | 12:30:00 | Exam Hall Alpha | COMPLETED |
| 9 | 3 | Lab Practical & Project Evaluation | PRACTICAL | 50.00 | 20.00 | 40.00 | 1 | 2026-11-20 | 14:00:00 | 17:00:00 | Advanced CS Lab 2 | COMPLETED |
| 10 | 4 | Mid-Semester Examination | MIDTERM | 50.00 | 30.00 | 40.00 | 1 | 2026-10-15 | 10:00:00 | 12:00:00 | Tech Aud-1 | COMPLETED |
| 11 | 4 | End-Semester Final Examination | FINAL | 100.00 | 50.00 | 40.00 | 1 | 2026-12-10 | 09:30:00 | 12:30:00 | Exam Hall Alpha | COMPLETED |
| 12 | 4 | Lab Practical & Project Evaluation | PRACTICAL | 50.00 | 20.00 | 40.00 | 1 | 2026-11-20 | 14:00:00 | 17:00:00 | Advanced CS Lab 2 | COMPLETED |

---

### Table: `assessment_marks`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `assessment_component_id` | int | NO | MUL | NULL | - |
| `enrollment_id` | int | NO | MUL | NULL | - |
| `obtained_marks` | decimal(8,2) | YES | - | NULL | - |
| `attendance_status` | enum('PRESENT','ABSENT','EXCUSED','NOT_ENTERED') | NO | - | NOT_ENTERED | - |
| `remarks` | text | YES | - | NULL | - |
| `entered_by` | int | NO | MUL | NULL | - |
| `updated_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Total Records:** 12

**Sample Data:**

| id | assessment_component_id | enrollment_id | obtained_marks | attendance_status | remarks | entered_by | updated_at |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 1 | 47.00 | PRESENT | Outstanding analytical performance | 13 | 2026-11-16 17:35:35 |
| 2 | 2 | 1 | 94.00 | PRESENT | Outstanding analytical performance | 13 | 2026-11-16 17:35:35 |
| 3 | 3 | 1 | 48.00 | PRESENT | Outstanding analytical performance | 13 | 2026-11-16 17:35:35 |
| 4 | 1 | 2 | 43.00 | PRESENT | Strong algorithmic foundations | 13 | 2026-11-16 17:35:35 |
| 5 | 2 | 2 | 86.00 | PRESENT | Strong algorithmic foundations | 13 | 2026-11-16 17:35:35 |
| 6 | 3 | 2 | 44.00 | PRESENT | Strong algorithmic foundations | 13 | 2026-11-16 17:35:35 |
| 7 | 1 | 3 | 38.00 | PRESENT | Consistent performance in exams | 13 | 2026-11-16 17:35:35 |
| 8 | 2 | 3 | 78.00 | PRESENT | Consistent performance in exams | 13 | 2026-11-16 17:35:35 |
| 9 | 3 | 3 | 40.00 | PRESENT | Consistent performance in exams | 13 | 2026-11-16 17:35:35 |
| 10 | 1 | 4 | 36.00 | PRESENT | Good conceptual comprehension | 13 | 2026-11-16 17:35:35 |
| 11 | 2 | 4 | 74.00 | PRESENT | Good conceptual comprehension | 13 | 2026-11-16 17:35:35 |
| 12 | 3 | 4 | 39.00 | PRESENT | Good conceptual comprehension | 13 | 2026-11-16 17:35:35 |

---

### Table: `audit_logs`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `user_id` | int | YES | MUL | NULL | - |
| `action` | varchar(100) | NO | MUL | NULL | - |
| `entity_type` | varchar(50) | NO | - | NULL | - |
| `entity_id` | int | YES | - | NULL | - |
| `old_values` | json | YES | - | NULL | - |
| `new_values` | json | YES | - | NULL | - |
| `ip_address` | varchar(45) | YES | - | NULL | - |
| `created_at` | timestamp | NO | MUL | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

**Total Records:** 14

**Sample Data:**

| id | user_id | action | entity_type | entity_id | old_values | new_values | ip_address | created_at |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-13 19:47:02 |
| 2 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-13 19:50:05 |
| 3 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-13 21:38:39 |
| 4 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-13 22:22:31 |
| 5 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-14 02:42:39 |
| 6 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-14 02:48:08 |
| 7 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-14 02:51:15 |
| 8 | 1 | CREATE_STUDENT | users | 12 | NULL | {"email": "srinjoyee.goswami@gma... | ::1 | 2026-11-14 02:51:48 |
| 9 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-14 02:55:55 |
| 10 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-14 03:01:51 |
| 11 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-16 17:47:03 |
| 12 | 1 | LOGIN | users | 1 | NULL | NULL | ::1 | 2026-11-16 20:11:46 |
| 13 | 1 | LOGOUT | users | 1 | NULL | NULL | ::1 | 2026-11-16 20:28:01 |
| 14 | 12 | LOGIN | users | 12 | NULL | NULL | ::1 | 2026-11-16 20:28:05 |

---

### Table: `course_offerings`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `course_id` | int | NO | MUL | NULL | - |
| `program_id` | int | NO | MUL | NULL | - |
| `academic_session_id` | int | NO | MUL | NULL | - |
| `semester_number` | tinyint | NO | - | 1 | - |
| `section` | varchar(10) | NO | - | A | - |
| `faculty_user_id` | int | NO | MUL | NULL | - |
| `enrollment_capacity` | int | NO | - | 60 | - |
| `status` | enum('ACTIVE','INACTIVE','COMPLETED') | NO | - | ACTIVE | - |

**Total Records:** 4

**Sample Data:**

| id | course_id | program_id | academic_session_id | semester_number | section | faculty_user_id | enrollment_capacity | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 1 | 3 | 1 | A | 13 | 60 | ACTIVE |
| 2 | 2 | 1 | 3 | 1 | A | 14 | 60 | ACTIVE |
| 3 | 5 | 4 | 3 | 1 | A | 15 | 60 | ACTIVE |
| 4 | 4 | 2 | 3 | 1 | A | 14 | 60 | ACTIVE |

---

### Table: `course_results`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `enrollment_id` | int | NO | UNI | NULL | - |
| `total_percentage` | decimal(6,3) | YES | - | NULL | - |
| `total_marks` | decimal(8,2) | YES | - | NULL | - |
| `letter_grade` | varchar(5) | YES | - | NULL | - |
| `grade_point` | decimal(4,2) | YES | - | NULL | - |
| `result_status` | enum('INCOMPLETE','PROCESSING','PROVISIONAL','PUBLISHED','WITHHELD') | NO | MUL | INCOMPLETE | - |
| `grading_policy_snapshot` | json | YES | - | NULL | - |
| `calculated_at` | timestamp | YES | - | NULL | - |
| `published_at` | timestamp | YES | - | NULL | - |
| `published_by` | int | YES | MUL | NULL | - |

**Total Records:** 4

**Sample Data:**

| id | enrollment_id | total_percentage | total_marks | letter_grade | grade_point | result_status | grading_policy_snapshot | calculated_at | published_at | published_by |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 94.400 | 189.00 | O | 10.00 | PUBLISHED | NULL | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 1 |
| 2 | 2 | 86.400 | 173.00 | A+ | 9.00 | PUBLISHED | NULL | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 1 |
| 3 | 3 | 77.800 | 156.00 | A | 8.00 | PUBLISHED | NULL | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 1 |
| 4 | 4 | 74.200 | 149.00 | A | 8.00 | PUBLISHED | NULL | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 1 |

---

### Table: `courses`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `course_code` | varchar(20) | NO | UNI | NULL | - |
| `course_title` | varchar(255) | NO | - | NULL | - |
| `description` | text | YES | - | NULL | - |
| `department_id` | int | NO | MUL | NULL | - |
| `credit_hours` | tinyint | NO | - | 3 | - |
| `course_type` | enum('THEORY','PRACTICAL','LAB','SEMINAR') | NO | - | THEORY | - |
| `status` | enum('ACTIVE','INACTIVE') | NO | MUL | ACTIVE | - |

**Total Records:** 6

**Sample Data:**

| id | course_code | course_title | description | department_id | credit_hours | course_type | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | CS101 | Data Structures & Algorithms | Fundamental linear & non-linear ... | 1 | 4 | THEORY | ACTIVE |
| 2 | CS102 | Database Management Systems | Relational data model, relationa... | 1 | 4 | THEORY | ACTIVE |
| 3 | CS103 | Operating Systems & Linux Archit... | Process scheduling, concurrency,... | 1 | 4 | THEORY | ACTIVE |
| 4 | IT101 | Full-Stack Web Technologies | Modern web architectures, respon... | 2 | 4 | PRACTICAL | ACTIVE |
| 5 | AI101 | Artificial Intelligence & Machin... | Supervised and unsupervised lear... | 5 | 4 | THEORY | ACTIVE |
| 6 | CS104 | Computer Networks & Cybersecurity | TCP/IP networking, packet routin... | 1 | 3 | THEORY | ACTIVE |

---

### Table: `departments`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `department_name` | varchar(255) | NO | - | NULL | - |
| `department_code` | varchar(20) | NO | UNI | NULL | - |
| `description` | text | YES | - | NULL | - |
| `status` | enum('ACTIVE','INACTIVE') | NO | MUL | ACTIVE | - |
| `created_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

**Total Records:** 5

**Sample Data:**

| id | department_name | department_code | description | status | created_at |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Computer Science & Engineering | CSE | Department of Computer Science a... | ACTIVE | 2026-11-13 21:38:48 |
| 2 | Information Technology | IT | Department of Information Techno... | ACTIVE | 2026-11-13 21:38:48 |
| 3 | Electronics & Communication Engi... | ECE | Department of Electronics and Ha... | ACTIVE | 2026-11-13 21:38:48 |
| 4 | General Sciences & Humanities | GEN | Foundational sciences and humani... | ACTIVE | 2026-11-13 21:38:48 |
| 5 | Artificial Intelligence & Data S... | AIDS | Department of Artificial Intelli... | ACTIVE | 2026-11-16 17:35:35 |

---

### Table: `faculty_profiles`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `user_id` | int | NO | UNI | NULL | - |
| `employee_code` | varchar(50) | NO | UNI | NULL | - |
| `department_id` | int | NO | MUL | NULL | - |
| `designation` | varchar(100) | NO | - | NULL | - |
| `contact_number` | varchar(20) | YES | - | NULL | - |
| `date_of_joining` | date | NO | - | NULL | - |

**Total Records:** 3

**Sample Data:**

| id | user_id | employee_code | department_id | designation | contact_number | date_of_joining |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 4 | 13 | FAC-CSE-01 | 1 | Professor & Head of Department | +91 98450 11223 | 2018-07-01 |
| 5 | 14 | FAC-IT-01 | 2 | Associate Professor | +91 98450 22334 | 2020-01-15 |
| 6 | 15 | FAC-AI-01 | 5 | Assistant Professor | +91 98450 33445 | 2022-08-01 |

---

### Table: `grade_scale_bands`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `grade_scale_id` | int | NO | MUL | NULL | - |
| `minimum_percentage` | decimal(5,2) | NO | - | NULL | - |
| `maximum_percentage` | decimal(5,2) | NO | - | NULL | - |
| `letter_grade` | varchar(5) | NO | - | NULL | - |
| `grade_point` | decimal(4,2) | NO | - | NULL | - |
| `is_passing` | tinyint(1) | NO | - | 1 | - |

**Total Records:** 7

**Sample Data:**

| id | grade_scale_id | minimum_percentage | maximum_percentage | letter_grade | grade_point | is_passing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 90.00 | 100.00 | O | 10.00 | 1 |
| 2 | 1 | 80.00 | 89.99 | A+ | 9.00 | 1 |
| 3 | 1 | 70.00 | 79.99 | A | 8.00 | 1 |
| 4 | 1 | 60.00 | 69.99 | B+ | 7.00 | 1 |
| 5 | 1 | 50.00 | 59.99 | B | 6.00 | 1 |
| 6 | 1 | 40.00 | 49.99 | C | 5.00 | 1 |
| 7 | 1 | 0.00 | 39.99 | F | 0.00 | 0 |

---

### Table: `grade_scales`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `program_id` | int | YES | MUL | NULL | - |
| `scale_name` | varchar(100) | NO | - | NULL | - |
| `minimum_overall_pass_percentage` | decimal(5,2) | NO | - | 40.00 | - |
| `is_default` | tinyint(1) | NO | - | 0 | - |
| `status` | enum('ACTIVE','INACTIVE') | NO | - | ACTIVE | - |
| `created_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

**Total Records:** 1

**Sample Data:**

| id | program_id | scale_name | minimum_overall_pass_percentage | is_default | status | created_at |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | NULL | Standard University Scale | 40.00 | 1 | ACTIVE | 2026-11-13 03:21:58 |

---

### Table: `mark_sheet_submissions`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `assessment_component_id` | int | NO | UNI | NULL | - |
| `submitted_by` | int | NO | MUL | NULL | - |
| `status` | enum('DRAFT','SUBMITTED','RETURNED','APPROVED') | NO | - | DRAFT | - |
| `reviewed_by` | int | YES | MUL | NULL | - |
| `review_comment` | text | YES | - | NULL | - |
| `submitted_at` | timestamp | YES | - | NULL | - |
| `reviewed_at` | timestamp | YES | - | NULL | - |
| `created_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| `updated_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Total Records:** 3

**Sample Data:**

| id | assessment_component_id | submitted_by | status | reviewed_by | review_comment | submitted_at | reviewed_at | created_at | updated_at |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 13 | APPROVED | 1 | Physical examination sheets veri... | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |
| 2 | 2 | 13 | APPROVED | 1 | Physical examination sheets veri... | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |
| 3 | 3 | 13 | APPROVED | 1 | Physical examination sheets veri... | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |

---

### Table: `password_reset_tokens`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `user_id` | int | NO | MUL | NULL | - |
| `token_hash` | varchar(255) | NO | - | NULL | - |
| `expires_at` | timestamp | NO | - | NULL | - |
| `used_at` | timestamp | YES | - | NULL | - |
| `created_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

**Total Records:** 0

---

### Table: `programs`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `department_id` | int | NO | MUL | NULL | - |
| `program_name` | varchar(255) | NO | - | NULL | - |
| `program_code` | varchar(20) | NO | UNI | NULL | - |
| `degree_type` | varchar(100) | NO | - | NULL | - |
| `duration_years` | tinyint | NO | - | 3 | - |
| `status` | enum('ACTIVE','INACTIVE') | NO | MUL | ACTIVE | - |

**Total Records:** 4

**Sample Data:**

| id | department_id | program_name | program_code | degree_type | duration_years | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | B.Tech in Computer Science & Eng... | BTECH-CSE | UNDERGRADUATE | 4 | ACTIVE |
| 2 | 2 | B.Tech in Information Technology | BTECH-IT | UNDERGRADUATE | 4 | ACTIVE |
| 3 | 1 | Master of Technology in Computer... | MTECH-CSE | POSTGRADUATE | 2 | ACTIVE |
| 4 | 5 | B.Tech in Artificial Intelligenc... | BTECH-AI | UNDERGRADUATE | 4 | ACTIVE |

---

### Table: `student_enrollments`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `offering_id` | int | NO | MUL | NULL | - |
| `student_user_id` | int | NO | MUL | NULL | - |
| `enrollment_date` | date | NO | - | NULL | - |
| `status` | enum('ENROLLED','DROPPED','COMPLETED') | NO | - | ENROLLED | - |

**Total Records:** 11

**Sample Data:**

| id | offering_id | student_user_id | enrollment_date | status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 12 | 2026-07-15 | ENROLLED |
| 2 | 1 | 16 | 2026-07-15 | ENROLLED |
| 3 | 1 | 17 | 2026-07-15 | ENROLLED |
| 4 | 1 | 18 | 2026-07-15 | ENROLLED |
| 5 | 2 | 12 | 2026-07-15 | ENROLLED |
| 6 | 2 | 16 | 2026-07-15 | ENROLLED |
| 7 | 2 | 17 | 2026-07-15 | ENROLLED |
| 8 | 3 | 12 | 2026-07-15 | ENROLLED |
| 9 | 3 | 16 | 2026-07-15 | ENROLLED |
| 10 | 3 | 17 | 2026-07-15 | ENROLLED |
| 11 | 4 | 18 | 2026-07-15 | ENROLLED |

---

### Table: `student_profiles`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `user_id` | int | NO | UNI | NULL | - |
| `roll_number` | varchar(50) | NO | UNI | NULL | - |
| `registration_number` | varchar(50) | NO | UNI | NULL | - |
| `program_id` | int | NO | MUL | NULL | - |
| `admission_year` | year | NO | - | NULL | - |
| `current_semester` | tinyint | NO | - | 1 | - |
| `contact_number` | varchar(20) | YES | - | NULL | - |

**Total Records:** 4

**Sample Data:**

| id | user_id | roll_number | registration_number | program_id | admission_year | current_semester | contact_number |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 11 | 12 | CS2026001 | UG2026CS001 | 1 | 2026 | 1 | +91 98300 12345 |
| 13 | 16 | CS2026002 | UG2026CS002 | 1 | 2026 | 1 | +91 98300 23456 |
| 14 | 17 | CS2026003 | UG2026CS003 | 1 | 2026 | 1 | +91 98300 34567 |
| 15 | 18 | IT2026001 | UG2026IT001 | 2 | 2026 | 1 | +91 98300 45678 |

---

### Table: `users`

| Field | Type | Null | Key | Default | Extra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | int | NO | PRI | NULL | auto_increment |
| `full_name` | varchar(255) | NO | - | NULL | - |
| `email` | varchar(255) | NO | UNI | NULL | - |
| `password_hash` | varchar(255) | NO | - | NULL | - |
| `role` | enum('ADMIN','FACULTY','STUDENT') | NO | MUL | NULL | - |
| `account_status` | enum('ACTIVE','INACTIVE','SUSPENDED') | NO | MUL | ACTIVE | - |
| `created_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| `updated_at` | timestamp | NO | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Total Records:** 8

**Sample Data:**

| id | full_name | email | password_hash | role | account_status | created_at | updated_at |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Dr. Rajesh Sharma | admin@unigrade.edu | $2y$10$PkZRWSiSfMsZN8dd4XjQQO9a9... | ADMIN | ACTIVE | 2026-11-13 03:21:58 | 2026-11-16 20:11:46 |
| 12 | Srinjoyee Goswami | srinjoyee.goswami@gmail.com | $2y$10$WIwbA.wmot1xoCzaF/4ZQOM49... | STUDENT | ACTIVE | 2026-11-14 02:51:48 | 2026-11-16 20:28:05 |
| 13 | Dr. Ananya Iyer | ananya.iyer@unigrade.edu | $2y$10$AqNZE4xgICZ3dtlM7guuv.WaT... | FACULTY | ACTIVE | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |
| 14 | Prof. Vikram Malhotra | vikram.malhotra@unigrade.edu | $2y$10$dfIzs./3ADTs4opY0W/eTeiFl... | FACULTY | ACTIVE | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |
| 15 | Dr. Priya Mukherjee | priya.mukherjee@unigrade.edu | $2y$10$OfPmGzz0ayccDxUJvdNfwuKI5... | FACULTY | ACTIVE | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |
| 16 | Aarav Mehta | aarav.mehta@gmail.com | $2y$10$4hiFcd2/ZT8hapNQYE/0YeWbD... | STUDENT | ACTIVE | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |
| 17 | Diya Patel | diya.patel@gmail.com | $2y$10$/f3.cCtUuEYbMteC5z6LtOnVr... | STUDENT | ACTIVE | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |
| 18 | Rohan Verma | rohan.verma@gmail.com | $2y$10$O/1Sl53L/l4RKQEPZNSOA.cr1... | STUDENT | ACTIVE | 2026-11-16 17:35:35 | 2026-11-16 17:35:35 |

---


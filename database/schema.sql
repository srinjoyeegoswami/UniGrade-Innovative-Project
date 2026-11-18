-- ============================================================
-- UniGrade - University Examination & Grading Management System
-- Database Schema - MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS unigrade_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unigrade_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT             NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    role            ENUM('ADMIN','FACULTY','STUDENT') NOT NULL,
    account_status  ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: departments
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id                  INT             NOT NULL AUTO_INCREMENT,
    department_name     VARCHAR(255)    NOT NULL,
    department_code     VARCHAR(20)     NOT NULL,
    description         TEXT            NULL,
    status              ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_departments_code (department_code),
    INDEX idx_departments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: programs
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
    id              INT             NOT NULL AUTO_INCREMENT,
    department_id   INT             NOT NULL,
    program_name    VARCHAR(255)    NOT NULL,
    program_code    VARCHAR(20)     NOT NULL,
    degree_type     VARCHAR(100)    NOT NULL,
    duration_years  TINYINT         NOT NULL DEFAULT 3,
    status          ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    UNIQUE KEY uq_programs_code (program_code),
    INDEX idx_programs_dept (department_id),
    INDEX idx_programs_status (status),
    CONSTRAINT fk_programs_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: student_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS student_profiles (
    id                      INT             NOT NULL AUTO_INCREMENT,
    user_id                 INT             NOT NULL,
    roll_number             VARCHAR(50)     NOT NULL,
    registration_number     VARCHAR(50)     NOT NULL,
    program_id              INT             NOT NULL,
    admission_year          YEAR            NOT NULL,
    current_semester        TINYINT         NOT NULL DEFAULT 1,
    contact_number          VARCHAR(20)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_student_user (user_id),
    UNIQUE KEY uq_student_roll (roll_number),
    UNIQUE KEY uq_student_reg (registration_number),
    INDEX idx_student_program (program_id),
    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: faculty_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id                  INT             NOT NULL AUTO_INCREMENT,
    user_id             INT             NOT NULL,
    employee_code       VARCHAR(50)     NOT NULL,
    department_id       INT             NOT NULL,
    designation         VARCHAR(100)    NOT NULL,
    contact_number      VARCHAR(20)     NULL,
    date_of_joining     DATE            NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_faculty_user (user_id),
    UNIQUE KEY uq_faculty_emp_code (employee_code),
    INDEX idx_faculty_dept (department_id),
    CONSTRAINT fk_faculty_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_faculty_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: academic_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS academic_sessions (
    id              INT             NOT NULL AUTO_INCREMENT,
    session_name    VARCHAR(100)    NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    status          ENUM('ACTIVE','INACTIVE','ARCHIVED') NOT NULL DEFAULT 'INACTIVE',
    PRIMARY KEY (id),
    INDEX idx_sessions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: courses
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id              INT             NOT NULL AUTO_INCREMENT,
    course_code     VARCHAR(20)     NOT NULL,
    course_title    VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    department_id   INT             NOT NULL,
    credit_hours    TINYINT         NOT NULL DEFAULT 3,
    course_type     ENUM('THEORY','PRACTICAL','LAB','SEMINAR') NOT NULL DEFAULT 'THEORY',
    status          ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    UNIQUE KEY uq_courses_code (course_code),
    INDEX idx_courses_dept (department_id),
    INDEX idx_courses_status (status),
    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: course_offerings
-- ============================================================
CREATE TABLE IF NOT EXISTS course_offerings (
    id                      INT             NOT NULL AUTO_INCREMENT,
    course_id               INT             NOT NULL,
    program_id              INT             NOT NULL,
    academic_session_id     INT             NOT NULL,
    semester_number         TINYINT         NOT NULL,
    section                 VARCHAR(10)     NOT NULL DEFAULT 'A',
    faculty_user_id         INT             NOT NULL,
    enrollment_capacity     INT             NOT NULL DEFAULT 60,
    status                  ENUM('ACTIVE','INACTIVE','COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    INDEX idx_offerings_course (course_id),
    INDEX idx_offerings_program (program_id),
    INDEX idx_offerings_session (academic_session_id),
    INDEX idx_offerings_faculty (faculty_user_id),
    INDEX idx_offerings_status (status),
    CONSTRAINT fk_offerings_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_offerings_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_offerings_session
        FOREIGN KEY (academic_session_id) REFERENCES academic_sessions(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_offerings_faculty
        FOREIGN KEY (faculty_user_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: student_enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS student_enrollments (
    id                  INT             NOT NULL AUTO_INCREMENT,
    offering_id         INT             NOT NULL,
    student_user_id     INT             NOT NULL,
    enrollment_date     DATE            NOT NULL,
    status              ENUM('ENROLLED','DROPPED','COMPLETED') NOT NULL DEFAULT 'ENROLLED',
    PRIMARY KEY (id),
    UNIQUE KEY uq_enrollment (offering_id, student_user_id),
    INDEX idx_enrollments_student (student_user_id),
    INDEX idx_enrollments_offering (offering_id),
    INDEX idx_enrollments_status (status),
    CONSTRAINT fk_enrollments_offering
        FOREIGN KEY (offering_id) REFERENCES course_offerings(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_user_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: assessment_components
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_components (
    id                          INT             NOT NULL AUTO_INCREMENT,
    offering_id                 INT             NOT NULL,
    component_name              VARCHAR(100)    NOT NULL,
    assessment_type             ENUM('INTERNAL','CLASS_TEST','QUIZ','ASSIGNMENT','PRACTICAL','MIDTERM','FINAL','OTHER') NOT NULL,
    maximum_marks               DECIMAL(8,2)    NOT NULL,
    weight_percentage           DECIMAL(5,2)    NOT NULL,
    minimum_pass_percentage     DECIMAL(5,2)    NULL,
    is_mandatory                TINYINT(1)      NOT NULL DEFAULT 1,
    examination_date            DATE            NULL,
    start_time                  TIME            NULL,
    end_time                    TIME            NULL,
    venue                       VARCHAR(255)    NULL,
    status                      ENUM('SCHEDULED','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    PRIMARY KEY (id),
    INDEX idx_assessment_offering (offering_id),
    INDEX idx_assessment_type (assessment_type),
    INDEX idx_assessment_status (status),
    INDEX idx_assessment_date (examination_date),
    CONSTRAINT fk_assessment_offering
        FOREIGN KEY (offering_id) REFERENCES course_offerings(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: assessment_marks
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_marks (
    id                          INT             NOT NULL AUTO_INCREMENT,
    assessment_component_id     INT             NOT NULL,
    enrollment_id               INT             NOT NULL,
    obtained_marks              DECIMAL(8,2)    NULL,
    attendance_status           ENUM('PRESENT','ABSENT','EXCUSED','NOT_ENTERED') NOT NULL DEFAULT 'NOT_ENTERED',
    remarks                     TEXT            NULL,
    entered_by                  INT             NOT NULL,
    updated_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_mark (assessment_component_id, enrollment_id),
    INDEX idx_marks_component (assessment_component_id),
    INDEX idx_marks_enrollment (enrollment_id),
    INDEX idx_marks_entered_by (entered_by),
    CONSTRAINT fk_marks_component
        FOREIGN KEY (assessment_component_id) REFERENCES assessment_components(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_marks_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_marks_entered_by
        FOREIGN KEY (entered_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: mark_sheet_submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS mark_sheet_submissions (
    id                          INT             NOT NULL AUTO_INCREMENT,
    assessment_component_id     INT             NOT NULL,
    submitted_by                INT             NOT NULL,
    status                      ENUM('DRAFT','SUBMITTED','RETURNED','APPROVED') NOT NULL DEFAULT 'DRAFT',
    reviewed_by                 INT             NULL,
    review_comment              TEXT            NULL,
    submitted_at                TIMESTAMP       NULL,
    reviewed_at                 TIMESTAMP       NULL,
    created_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_submission_component (assessment_component_id),
    INDEX idx_submissions_submitted_by (submitted_by),
    INDEX idx_submissions_reviewed_by (reviewed_by),
    INDEX idx_submissions_status (status),
    CONSTRAINT fk_submissions_component
        FOREIGN KEY (assessment_component_id) REFERENCES assessment_components(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_submissions_submitted_by
        FOREIGN KEY (submitted_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_submissions_reviewed_by
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: grade_scales
-- ============================================================
CREATE TABLE IF NOT EXISTS grade_scales (
    id                              INT             NOT NULL AUTO_INCREMENT,
    program_id                      INT             NULL,
    scale_name                      VARCHAR(100)    NOT NULL,
    minimum_overall_pass_percentage DECIMAL(5,2)    NOT NULL DEFAULT 40.00,
    is_default                      TINYINT(1)      NOT NULL DEFAULT 0,
    status                          ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at                      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_grade_scales_program (program_id),
    INDEX idx_grade_scales_default (is_default),
    CONSTRAINT fk_grade_scales_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: grade_scale_bands
-- ============================================================
CREATE TABLE IF NOT EXISTS grade_scale_bands (
    id                  INT             NOT NULL AUTO_INCREMENT,
    grade_scale_id      INT             NOT NULL,
    minimum_percentage  DECIMAL(5,2)    NOT NULL,
    maximum_percentage  DECIMAL(5,2)    NOT NULL,
    letter_grade        VARCHAR(5)      NOT NULL,
    grade_point         DECIMAL(4,2)    NOT NULL,
    is_passing          TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    INDEX idx_bands_scale (grade_scale_id),
    CONSTRAINT fk_bands_scale
        FOREIGN KEY (grade_scale_id) REFERENCES grade_scales(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: course_results
-- ============================================================
CREATE TABLE IF NOT EXISTS course_results (
    id                      INT             NOT NULL AUTO_INCREMENT,
    enrollment_id           INT             NOT NULL,
    total_percentage        DECIMAL(6,3)    NULL,
    total_marks             DECIMAL(8,2)    NULL,
    letter_grade            VARCHAR(5)      NULL,
    grade_point             DECIMAL(4,2)    NULL,
    result_status           ENUM('INCOMPLETE','PROCESSING','PROVISIONAL','PUBLISHED','WITHHELD') NOT NULL DEFAULT 'INCOMPLETE',
    grading_policy_snapshot JSON            NULL,
    calculated_at           TIMESTAMP       NULL,
    published_at            TIMESTAMP       NULL,
    published_by            INT             NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_result_enrollment (enrollment_id),
    INDEX idx_results_status (result_status),
    INDEX idx_results_published_by (published_by),
    CONSTRAINT fk_results_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_results_published_by
        FOREIGN KEY (published_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id              INT             NOT NULL AUTO_INCREMENT,
    user_id         INT             NULL,
    action          VARCHAR(100)    NOT NULL,
    entity_type     VARCHAR(50)     NOT NULL,
    entity_id       INT             NULL,
    old_values      JSON            NULL,
    new_values      JSON            NULL,
    ip_address      VARCHAR(45)     NOT NULL DEFAULT '',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at),
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
    id              INT             NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255)    NOT NULL,
    content         TEXT            NOT NULL,
    created_by      INT             NOT NULL,
    target_role     ENUM('ALL','ADMIN','FACULTY','STUDENT') NOT NULL DEFAULT 'ALL',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP       NULL,
    PRIMARY KEY (id),
    INDEX idx_announcements_role (target_role),
    INDEX idx_announcements_active (is_active),
    INDEX idx_announcements_created_by (created_by),
    CONSTRAINT fk_announcements_created_by
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: password_reset_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id              INT             NOT NULL AUTO_INCREMENT,
    user_id         INT             NOT NULL,
    token_hash      VARCHAR(255)    NOT NULL,
    expires_at      TIMESTAMP       NOT NULL,
    used_at         TIMESTAMP       NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_prt_user (user_id),
    INDEX idx_prt_expires (expires_at),
    CONSTRAINT fk_prt_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

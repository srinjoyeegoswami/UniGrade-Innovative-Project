# UniGrade Database Documentation

## 1. Overview
The **UniGrade** relational database is designed for MySQL 8+ on InnoDB using `utf8mb4` encoding. It enforces strict referential integrity, foreign key constraints, indexes on lookup fields, and composite unique keys to prevent duplicate enrollments, overlapping grade bands, and duplicate marks entries.

## 2. Key Entity Relationships
- **users (1) ── (1) student_profiles**: 1-to-1 extension of user credentials for student role.
- **users (1) ── (1) faculty_profiles**: 1-to-1 extension of user credentials for faculty examiners.
- **departments (1) ── (N) programs**: Academic faculties hosting multiple degree programs.
- **programs (1) ── (N) course_offerings**: Degree curricula offering courses across semesters.
- **academic_sessions (1) ── (N) course_offerings**: Active calendar academic periods (e.g., 2025-2026).
- **courses (1) ── (N) course_offerings**: Catalog subjects scheduled into specific sections (Sec A, B).
- **course_offerings (1) ── (N) student_enrollments**: Class roster of enrolled students (`UNIQUE(offering_id, student_user_id)`).
- **course_offerings (1) ── (N) assessment_components**: Evaluation breakdown (Internal 20%, Midterm 30%, Final 50%).
- **assessment_components (1) ── (N) assessment_marks**: Individual student scores linked to enrollments (`UNIQUE(assessment_component_id, enrollment_id)`).
- **assessment_components (1) ── (1) mark_sheet_submissions**: Faculty submission lifecycle (DRAFT -> SUBMITTED -> APPROVED / RETURNED).
- **student_enrollments (1) ── (1) course_results**: Calculated final course outcome, weighted percentage, letter grade, and grade points (`UNIQUE(enrollment_id)`).
- **audit_logs**: Immutable ledger recording all critical system events with actor user ID, action, target entity, and serialized old/new JSON states.

## 3. Database Setup Instructions

### Option A: Using Plain SQL (phpMyAdmin or MySQL CLI)
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Option B: Using PHP Seeder (CLI)
```bash
# 1. Create database schema
mysql -u root -p < database/schema.sql

# 2. Run PHP seeder (computes real runtime bcrypt hashes)
php database/seed.php
```


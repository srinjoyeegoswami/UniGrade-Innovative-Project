# UniGrade — University Examination & Grading Management System

[![Architecture](https://img.shields.io/badge/Architecture-React_%2B_PHP_REST_%2B_MySQL-171717.svg)](#)
[![PHP](https://img.shields.io/badge/PHP-8.0%2B-242424.svg)](#)
[![React](https://img.shields.io/badge/React-18-171717.svg)](#)
[![Design](https://img.shields.io/badge/Design-Swiss_Monochrome-101010.svg)](#)

UniGrade is a centralized university examination and grading management web application engineered for academic administrations, faculties, and students. It completely digitizes the examination lifecycle: from institutional curriculum scheduling and course offerings to candidate enrollments, marks entry, automated weighted grade calculation, administrative approval gates, and official transcript generation.

---

## 1. System Architecture

```
React 18 + Vite (Frontend)
   │  (Axios with withCredentials, CSRF token validation)
   ▼
PHP 8+ REST API (Backend)
   │  (Router, Role Authorization, Prepared PDO Queries, Audit Trail)
   ▼
MySQL 8+ Relational Database (InnoDB)
   (Normalized Schema, FK Constraints, Unique Indexes, JSON Snapshots)
```

The React frontend never communicates with MySQL directly; every operation passes through strictly authenticated and authorized PHP REST endpoints.

---

## 2. Key Features by Role

### Administrator
- **Executive Dashboard**: Real-time statistics on candidates, faculties, exam schedules, and pending marks submissions.
- **Academic Governance**: Department, degree program, academic session, course catalog, and section offering management.
- **Roster & Enrollments**: Single and cohort student enrollment into course sections.
- **Assessment Management**: Configurable assessment components (Internal, Midterm, Final), maximum scores, mandatory passing requirements, and exam hall venue scheduling.
- **Grading Scale Configuration**: Dynamic grade scale boundaries (O, A+, A, B+, B, C, F), grade points, and passing thresholds.
- **Mark Sheet Moderation**: Audit and review marks submitted by faculty with instant approve or return-for-correction workflows.
- **Automated Grading Engine**: Server-side weighted percentage calculation, mandatory component verification, automated letter grade assignment, SGPA, and CGPA calculation.
- **Result Publication & Revaluation Control**: Gated official publishing to student transcripts, plus authorized result unlocking with audit justification.
- **Analytics & Reporting**: Monochrome cohort performance charts, grade distribution, pass/fail statistics, and CSV exports.
- **Security Audit Trail**: Immutable logging of all academic mutations with serialized old/new JSON states.

### Faculty / Examiner
- **Examiner Dashboard**: Summary of assigned course offerings, enrolled students, and upcoming exam schedules.
- **Course Rosters**: Inspect enrolled candidates and course parameters.
- **Candidate Marks Entry**: Real-time validation against maximum marks, attendance status tracking (`PRESENT`, `ABSENT`, `EXCUSED`), automatic 0.00 assignment for absent candidates, draft saving, and official submission.
- **Correction Handling**: Receive administrator review notes on returned mark sheets for revision.
- **Certified Results**: Review released official results for assigned courses.

### Student
- **Student Dashboard**: Cumulative CGPA, latest semester SGPA, enrolled coursework, and upcoming examination timetables.
- **Academic Results Portal**: Semester-by-semester official grade cards showing course credits, obtained marks, percentage, letter grades, and grade points (unpublished results are strictly hidden).
- **Official Printable Transcript**: Dedicated printable academic transcript with institutional header, semester breakdowns, degree standing, and verification codes.
- **Announcements**: Central circulars from the university examination board.

---

## 3. Strict Monochrome Visual Design System

UniGrade adheres to a **Swiss minimalist, monochromatic visual identity**. No neon or bright rainbow accents are used; semantic status is communicated through typography, borders, contrast, and monochrome badge fills:

| Token | Hex | Role |
|---|---|---|
| Charcoal Black | `#171717` | Sidebar background, primary brand accents, dark panels |
| Deep Black | `#101010` | Primary buttons, critical headers, modal headers |
| Soft Black | `#242424` | Secondary dark surfaces, interactive highlights |
| Off White | `#F4F4F1` | Main application background, subtle table rows |
| Pure White | `#FFFFFF` | Cards, active forms, data tables, modals |
| Light Grey | `#EAEAE7` | Hover backgrounds, secondary surfaces |
| Border Grey | `#D8D8D4` | Dividers, table borders, card outlines |
| Medium Grey | `#858580` | Secondary metadata, helper labels, icons |
| Dark Grey | `#555550` | Body text, captions |

---

## 4. Grading & Evaluation Formulas

### 1. Component Weighted Contribution
$$\text{Contribution} = \left(\frac{\text{Obtained Marks}}{\text{Maximum Marks}}\right) \times \text{Weight Percentage}$$

$$\text{Total Percentage} = \sum \text{Component Contributions}$$

*Example: Internal (36/40 @ 20% = 18%) + Midterm (32/40 @ 30% = 24%) + Final (68/80 @ 50% = 42.5%) = 84.5% (Grade A+, 9 Grade Points).*

### 2. Mandatory Component Gating
Even if a student's total percentage exceeds the passing threshold, if they are marked `ABSENT` or score below the configured `minimum_pass_percentage` on a mandatory component, the grading engine automatically assigns:
- `Letter Grade = 'F'`
- `Grade Point = 0.00`
- `Outcome = 'FAIL'`

### 3. Semester Grade Point Average (SGPA)
$$\text{SGPA} = \frac{\sum (\text{Course Credits} \times \text{Grade Point})}{\sum \text{Course Credits}}$$

### 4. Cumulative Grade Point Average (CGPA)
$$\text{CGPA} = \frac{\sum_{\text{all published semesters}} (\text{Course Credits} \times \text{Grade Point})}{\sum_{\text{all published semesters}} \text{Course Credits}}$$

---

## 5. Demonstration Credentials

All sample users are pre-configured in the database seed scripts:

| Role | Name | Email | Password |
|---|---|---|---|
| **Administrator** | Dr. Admin User | `admin@unigrade.edu` | `Admin@123` |
| **Faculty (CS)** | Dr. Sarah Johnson | `faculty1@unigrade.edu` | `Faculty@123` |
| **Faculty (Math)** | Prof. Michael Chen | `faculty2@unigrade.edu` | `Faculty@123` |
| **Faculty (Business)** | Dr. Priya Sharma | `faculty3@unigrade.edu` | `Faculty@123` |
| **Student (CS)** | Alice Thompson | `student1@unigrade.edu` | `Student@123` |
| **Students 2 to 10** | Bob, Carol, David, etc. | `student[2-10]@unigrade.edu` | `Student@123` |

*Quick-fill demo buttons are provided on the login page for instant one-click demonstration.*

---

## 6. Installation & Execution Guide

### Prerequisites
- PHP 8.0 or newer (with `pdo_mysql`, `session`, `json` extensions enabled)
- MySQL 8.0+ or MariaDB 10.4+ (e.g., standard XAMPP or WAMP)
- Node.js 18+ and npm (for frontend Vite development server)

---

### Step 1: Database Initialization
1. Start MySQL in your XAMPP / WAMP control panel.
2. Import the schema and seed data:
```bash
# Using MySQL CLI
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# Or execute database/seed.php via CLI
php database/seed.php
```

---

### Step 2: Backend Configuration
1. Ensure `backend/.env` exists and matches your MySQL configuration:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=unigrade_db
DB_USER=root
DB_PASS=
APP_ENV=development
APP_SECRET=unigrade_secure_dev_secret_key_2026_x89a
SESSION_NAME=unigrade_session
SESSION_LIFETIME=7200
```
2. Place the project in your local web server root (e.g., `C:\xampp\htdocs\unigrade\`) so the API is accessible at:
   `http://localhost/unigrade/backend/api/`
   
   *(If running standalone PHP server without Apache, run: `php -S localhost:8000 -t backend`)*

---

### Step 3: Frontend Setup & Development Server
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
The application will open at:
👉 **`http://localhost:5173`**

*(Requests to `/api/*` are automatically reverse-proxied by Vite to the PHP backend).*

---

## 7. Project File Structure

```
innovative_project/
├── backend/
│   ├── config/
│   │   ├── database.php          # PDO Singleton with environment loader
│   │   └── cors.php              # CORS headers & OPTIONS preflight
│   ├── helpers/
│   │   ├── Auth.php              # Session auth, CSRF, role enforcement
│   │   ├── Response.php          # Standard JSON responses (200, 201, 401, 403, 422)
│   │   ├── Validator.php         # Request validation engine
│   │   └── AuditLog.php          # Immutable audit trail logger
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── DashboardController.php
│   │   ├── StudentsController.php
│   │   ├── FacultyController.php
│   │   ├── DepartmentsController.php
│   │   ├── ProgramsController.php
│   │   ├── SessionsController.php
│   │   ├── CoursesController.php
│   │   ├── OfferingsController.php
│   │   ├── EnrollmentsController.php
│   │   ├── AssessmentsController.php
│   │   ├── MarksController.php
│   │   ├── SubmissionsController.php
│   │   ├── GradingController.php
│   │   ├── ResultsController.php
│   │   ├── ReportsController.php
│   │   ├── AnnouncementsController.php
│   │   └── AuditLogsController.php
│   ├── .env.example
│   ├── .htaccess                 # URL rewrite to index.php
│   └── index.php                 # Front controller & router
│
├── database/
│   ├── schema.sql                # Complete 18-table MySQL 8 schema
│   ├── seed.sql                  # Direct SQL seed script with bcrypt hashes
│   ├── seed.php                  # PHP CLI seeder script
│   └── README.md
│
├── docs/
│   ├── api.md                    # Complete REST API reference
│   ├── sample-students.csv       # Sample CSV for student import
│   └── sample-marks.csv          # Sample CSV for marks evaluation
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Button, Input, Modal, Badge, Toast, Pagination...
│   │   │   ├── layout/           # Sidebar, Topbar, AdminLayout, FacultyLayout, StudentLayout
│   │   │   ├── tables/           # DataTable with sorting, searching, pagination
│   │   │   └── charts/           # Monochrome Recharts (Bar, Pie, Area)
│   │   ├── pages/
│   │   │   ├── auth/Login.jsx    # Split-screen monochrome login
│   │   │   ├── admin/            # 19 Admin management & analytics pages
│   │   │   ├── faculty/          # 7 Faculty examiner & mark entry pages
│   │   │   └── student/          # 8 Student portal & printable transcript pages
│   │   ├── services/             # Axios API service layer
│   │   ├── routes/               # RoleRoute, ProtectedRoute, AppRoutes
│   │   ├── context/              # AuthContext session provider
│   │   ├── utils/                # Date, marks, grade formatters & constants
│   │   └── styles/               # Monochrome variables, globals, and print stylesheet
│   ├── package.json
│   └── vite.config.js
│
├── start-backend.bat
├── start-frontend.bat
└── README.md
```

---

## 8. Security & Academic Integrity

- **Role-Based Server Verification**: Buttons hidden in React are backed by server-side `Auth::requireRole()` checks in every PHP controller.
- **Direct Student Record Protection**: Students querying `/api/results/student/{id}` can only access their own user ID; requests for other students return `403 Forbidden`.
- **Strict Publication Gate**: Results are only visible to students when marked `PUBLISHED`. Drafts and provisional marks remain hidden from students.
- **Bcrypt Passwords**: All credentials stored using standard `PASSWORD_BCRYPT` with cost 10.
- **SQL Injection Prevention**: 100% of database queries use PDO prepared statements with parameterized inputs.
- **Audit Logging**: Changes to grading scales, mark reviews, result publications, and unlocks record timestamp, user ID, IP address, and JSON before/after snapshots.


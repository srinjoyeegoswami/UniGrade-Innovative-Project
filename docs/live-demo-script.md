# UniGrade — Live Demonstration Guide (Clean Database)

Use this script to present UniGrade live from scratch with the clean database (`database/fresh_install.sql`).

---

## Initial Credentials
- **Role**: Administrator
- **Email**: `admin@unigrade.edu`
- **Password**: `Admin@123`

---

## 5-Minute Live Flow

### STEP 1: Log In as Administrator
1. Open [http://localhost:5173/login](http://localhost:5173/login).
2. Click the quick button **"Administrator"** or type `admin@unigrade.edu` / `Admin@123`.
3. Notice the real-time Dashboard starts clean with 0 students, 0 courses, 0 pending marks.

### STEP 2: Configure Academic Hierarchy (30 seconds)
1. Navigate to **Departments** (`/admin/departments`) -> Click **"Add Department"**:
   - Code: `CS`
   - Name: `Computer Science`
2. Navigate to **Programs** (`/admin/programs`) -> Click **"Add Program"**:
   - Code: `BSCS`
   - Name: `B.Sc. Computer Science`
   - Department: `Computer Science`
   - Duration: `3 Years`
3. Navigate to **Academic Sessions** (`/admin/sessions`) -> Click **"Add Session"**:
   - Name: `2026-2027`
   - Dates: Current year
   - Click **"Set Active"**

### STEP 3: Register Faculty & Student (1 minute)
1. Navigate to **Faculty** (`/admin/faculty`) -> Click **"Add Faculty Member"**:
   - Name: `Dr. Robert Vance`
   - Email: `vance@unigrade.edu`
   - Employee Code: `FAC101`
   - Department: `Computer Science`
   - Password: `Faculty@123`
2. Navigate to **Students** (`/admin/students`) -> Click **"Add Student"**:
   - Name: `Alex Mercer`
   - Email: `alex@unigrade.edu`
   - Roll: `CS2026001`
   - Registration: `UG2026001`
   - Program: `B.Sc. Computer Science`
   - Password: `Student@123`

### STEP 4: Create Course & Schedule Offering (1 minute)
1. Navigate to **Course Catalog** (`/admin/courses`) -> Click **"Add Course"**:
   - Code: `CS101`
   - Title: `Programming Fundamentals`
   - Credits: `4 Cr`
   - Type: `THEORY`
2. Navigate to **Course Offerings** (`/admin/offerings`) -> Click **"New Course Offering"**:
   - Course: `CS101`
   - Program: `BSCS`
   - Session: `2026-2027`
   - Semester: `1`, Section: `A`
   - Instructor: `Dr. Robert Vance`
3. Navigate to **Student Enrollment** (`/admin/enrollments`):
   - Select `CS101 (Sec A)`
   - Click **"Enroll Student"** -> Choose `Alex Mercer` -> Confirm.

### STEP 5: Define Assessment Weights (30 seconds)
1. Navigate to **Examinations** (`/admin/examinations`):
   - Select `CS101 (Sec A)`
   - Click **"Add Assessment Component"**:
     - Name: `Internal Assessment`, Max: `40`, Weight: `40%`, Min Pass: `40%`
   - Click **"Add Assessment Component"**:
     - Name: `Final Examination`, Max: `60`, Weight: `60%`, Min Pass: `40%`
   - Total weight indicator changes to **100% (Valid)**.

---

### STEP 6: Examiner Logs In & Enters Marks (1 minute)
1. Log out of Admin.
2. Log in as Faculty: `vance@unigrade.edu` / `Faculty@123`.
3. Open **Marks Entry** (`/faculty/marks`):
   - Select `CS101` and `Internal Assessment`.
   - Set Alex Mercer to `PRESENT`, enter `34` / 40.
   - Click **"Save Draft"** -> Then click **"Submit for Administrative Review"**.
4. Switch to `Final Examination`:
   - Set Alex Mercer to `PRESENT`, enter `52` / 60.
   - Click **"Submit for Administrative Review"**.

---

### STEP 7: Admin Moderates & Publishes Results (1 minute)
1. Log back in as Administrator: `admin@unigrade.edu` / `Admin@123`.
2. Open **Mark Submissions** (`/admin/marks`):
   - Click **"Inspect Marks"** on each submitted paper.
   - Click **"Approve Mark Sheet"**.
3. Open **Result Processing** (`/admin/results`):
   - Select `CS101 (Sec A)`.
   - Click **"Run Grading Engine"**:
     - Real-time credit calculation runs:
     - Internal: $(34 / 40) \times 40 = 34\%$
     - Final: $(52 / 60) \times 60 = 52\%$
     - Total: $86\%$ -> Grade **A+** (9.00 Grade Points).
   - Click **"Publish Official Results"**!

---

### STEP 8: Student Inspects Grade & Prints Transcript (30 seconds)
1. Log out of Admin.
2. Log in as Student: `alex@unigrade.edu` / `Student@123`.
3. Student Dashboard immediately highlights:
   - **Cumulative CGPA: 9.00**
   - **Semester SGPA: 9.00**
   - Course `CS101`: Grade **A+**.
4. Click **"Official Transcript"** -> Click **"Print Official Transcript"** (`Ctrl+P`).
   - Shows pristine university academic transcript layout formatted for official records.


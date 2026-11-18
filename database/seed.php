<?php
/**
 * UniGrade — Database Seeder
 * Run from CLI:  php database/seed.php
 *
 * Loads backend/.env for DB credentials, then inserts all seed data.
 */

// ----------------------------------------------------------------
// Bootstrap: load .env and connect
// ----------------------------------------------------------------

$envFile = __DIR__ . '/../backend/.env';
if (!file_exists($envFile)) {
    // If running the script from the project root, try alternate path
    $envFile = __DIR__ . '/../backend/.env';
    if (!file_exists($envFile)) {
        die("ERROR: backend/.env not found. Copy backend/.env.example to backend/.env and configure it.\n");
    }
}

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env   = [];
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') !== false) {
        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
    $env['DB_HOST'] ?? 'localhost',
    $env['DB_PORT'] ?? '3306',
    $env['DB_NAME'] ?? 'unigrade_db'
);

try {
    $pdo = new PDO($dsn, $env['DB_USER'] ?? 'root', $env['DB_PASS'] ?? '', [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    die("DB connection failed: " . $e->getMessage() . "\n");
}

echo "Connected to database.\n";

// ----------------------------------------------------------------
// Helper: insert a row and return last insert ID
// ----------------------------------------------------------------
function insert(PDO $pdo, string $table, array $data): int {
    $cols = implode(', ', array_keys($data));
    $phs  = implode(', ', array_map(fn($k) => ":$k", array_keys($data)));
    $stmt = $pdo->prepare("INSERT INTO $table ($cols) VALUES ($phs)");
    $stmt->execute($data);
    return (int) $pdo->lastInsertId();
}

$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

// ----------------------------------------------------------------
// 1. Departments
// ----------------------------------------------------------------
echo "Seeding departments...\n";
$deptCS   = insert($pdo, 'departments', ['department_name' => 'Computer Science',       'department_code' => 'CS',   'description' => 'Department of Computer Science and Engineering',       'status' => 'ACTIVE']);
$deptMATH = insert($pdo, 'departments', ['department_name' => 'Mathematics',             'department_code' => 'MATH', 'description' => 'Department of Mathematics and Statistics',              'status' => 'ACTIVE']);
$deptBA   = insert($pdo, 'departments', ['department_name' => 'Business Administration', 'department_code' => 'BA',   'description' => 'Department of Business Administration and Management', 'status' => 'ACTIVE']);

// ----------------------------------------------------------------
// 2. Programs
// ----------------------------------------------------------------
echo "Seeding programs...\n";
$progBSCS = insert($pdo, 'programs', ['department_id' => $deptCS,   'program_name' => 'B.Sc. Computer Science', 'program_code' => 'BSCS', 'degree_type' => 'Bachelor', 'duration_years' => 3, 'status' => 'ACTIVE']);
$progBCA  = insert($pdo, 'programs', ['department_id' => $deptCS,   'program_name' => 'Bachelor of Computer Applications', 'program_code' => 'BCA',  'degree_type' => 'Bachelor', 'duration_years' => 3, 'status' => 'ACTIVE']);
$progBBA  = insert($pdo, 'programs', ['department_id' => $deptBA,   'program_name' => 'Bachelor of Business Administration', 'program_code' => 'BBA',  'degree_type' => 'Bachelor', 'duration_years' => 3, 'status' => 'ACTIVE']);

// ----------------------------------------------------------------
// 3. Users — Admin
// ----------------------------------------------------------------
echo "Seeding users...\n";
$adminId = insert($pdo, 'users', [
    'full_name'     => 'Dr. Admin User',
    'email'         => 'admin@unigrade.edu',
    'password_hash' => password_hash('Admin@123', PASSWORD_BCRYPT),
    'role'          => 'ADMIN',
    'account_status'=> 'ACTIVE',
]);

// ----------------------------------------------------------------
// 4. Users — Faculty
// ----------------------------------------------------------------
$fac1Id = insert($pdo, 'users', [
    'full_name'     => 'Dr. Sarah Johnson',
    'email'         => 'faculty1@unigrade.edu',
    'password_hash' => password_hash('Faculty@123', PASSWORD_BCRYPT),
    'role'          => 'FACULTY',
    'account_status'=> 'ACTIVE',
]);
$fac2Id = insert($pdo, 'users', [
    'full_name'     => 'Prof. Michael Chen',
    'email'         => 'faculty2@unigrade.edu',
    'password_hash' => password_hash('Faculty@123', PASSWORD_BCRYPT),
    'role'          => 'FACULTY',
    'account_status'=> 'ACTIVE',
]);
$fac3Id = insert($pdo, 'users', [
    'full_name'     => 'Dr. Priya Sharma',
    'email'         => 'faculty3@unigrade.edu',
    'password_hash' => password_hash('Faculty@123', PASSWORD_BCRYPT),
    'role'          => 'FACULTY',
    'account_status'=> 'ACTIVE',
]);

// ----------------------------------------------------------------
// 5. Faculty profiles
// ----------------------------------------------------------------
insert($pdo, 'faculty_profiles', ['user_id' => $fac1Id, 'employee_code' => 'FAC001', 'department_id' => $deptCS,   'designation' => 'Associate Professor', 'contact_number' => '9800000001', 'date_of_joining' => '2018-07-01']);
insert($pdo, 'faculty_profiles', ['user_id' => $fac2Id, 'employee_code' => 'FAC002', 'department_id' => $deptMATH, 'designation' => 'Assistant Professor', 'contact_number' => '9800000002', 'date_of_joining' => '2020-01-15']);
insert($pdo, 'faculty_profiles', ['user_id' => $fac3Id, 'employee_code' => 'FAC003', 'department_id' => $deptBA,   'designation' => 'Professor',           'contact_number' => '9800000003', 'date_of_joining' => '2015-06-01']);

// ----------------------------------------------------------------
// 6. Users — Students (10)
// ----------------------------------------------------------------
$students = [
    ['Alice Thompson',   'student1@unigrade.edu',  'CS2025001', 'UG2025CS001'],
    ['Bob Martinez',     'student2@unigrade.edu',  'CS2025002', 'UG2025CS002'],
    ['Carol White',      'student3@unigrade.edu',  'CS2025003', 'UG2025CS003'],
    ['David Lee',        'student4@unigrade.edu',  'CS2025004', 'UG2025CS004'],
    ['Emma Wilson',      'student5@unigrade.edu',  'CS2025005', 'UG2025CS005'],
    ['Frank Brown',      'student6@unigrade.edu',  'CS2025006', 'UG2025CS006'],
    ['Grace Davis',      'student7@unigrade.edu',  'CS2025007', 'UG2025CS007'],
    ['Henry Miller',     'student8@unigrade.edu',  'CS2025008', 'UG2025CS008'],
    ['Iris Garcia',      'student9@unigrade.edu',  'CS2025009', 'UG2025CS009'],
    ['James Rodriguez',  'student10@unigrade.edu', 'CS2025010', 'UG2025CS010'],
];

$studentUserIds = [];
foreach ($students as $i => [$name, $email, $roll, $reg]) {
    $uid = insert($pdo, 'users', [
        'full_name'     => $name,
        'email'         => $email,
        'password_hash' => password_hash('Student@123', PASSWORD_BCRYPT),
        'role'          => 'STUDENT',
        'account_status'=> 'ACTIVE',
    ]);
    insert($pdo, 'student_profiles', [
        'user_id'             => $uid,
        'roll_number'         => $roll,
        'registration_number' => $reg,
        'program_id'          => $progBSCS,
        'admission_year'      => 2025,
        'current_semester'    => 1,
        'contact_number'      => '980000' . str_pad($i + 10, 4, '0', STR_PAD_LEFT),
    ]);
    $studentUserIds[] = $uid;
}

// ----------------------------------------------------------------
// 7. Academic Sessions
// ----------------------------------------------------------------
echo "Seeding academic sessions...\n";
$sess2526 = insert($pdo, 'academic_sessions', ['session_name' => '2025-2026', 'start_date' => '2025-07-01', 'end_date' => '2026-06-30', 'status' => 'ACTIVE']);
$sess2425 = insert($pdo, 'academic_sessions', ['session_name' => '2024-2025', 'start_date' => '2024-07-01', 'end_date' => '2025-06-30', 'status' => 'ARCHIVED']);

// ----------------------------------------------------------------
// 8. Courses (8 courses)
// ----------------------------------------------------------------
echo "Seeding courses...\n";
$cCS101 = insert($pdo, 'courses', ['course_code' => 'CS101', 'course_title' => 'Introduction to Programming',      'description' => 'Fundamentals of programming using Python', 'department_id' => $deptCS,   'credit_hours' => 4, 'course_type' => 'THEORY',    'status' => 'ACTIVE']);
$cCS102 = insert($pdo, 'courses', ['course_code' => 'CS102', 'course_title' => 'Data Structures',                  'description' => 'Linear and non-linear data structures',   'department_id' => $deptCS,   'credit_hours' => 4, 'course_type' => 'THEORY',    'status' => 'ACTIVE']);
$cCS103 = insert($pdo, 'courses', ['course_code' => 'CS103', 'course_title' => 'Computer Organization',            'description' => 'Hardware and architecture basics',         'department_id' => $deptCS,   'credit_hours' => 3, 'course_type' => 'THEORY',    'status' => 'ACTIVE']);
$cCS104 = insert($pdo, 'courses', ['course_code' => 'CS104', 'course_title' => 'Programming Lab',                  'description' => 'Hands-on programming practicals',          'department_id' => $deptCS,   'credit_hours' => 2, 'course_type' => 'LAB',       'status' => 'ACTIVE']);
$cMA101 = insert($pdo, 'courses', ['course_code' => 'MA101', 'course_title' => 'Mathematics I',                    'description' => 'Calculus, matrices, and algebra',          'department_id' => $deptMATH, 'credit_hours' => 4, 'course_type' => 'THEORY',    'status' => 'ACTIVE']);
$cMA102 = insert($pdo, 'courses', ['course_code' => 'MA102', 'course_title' => 'Statistics and Probability',       'description' => 'Descriptive and inferential statistics',   'department_id' => $deptMATH, 'credit_hours' => 3, 'course_type' => 'THEORY',    'status' => 'ACTIVE']);
$cBA101 = insert($pdo, 'courses', ['course_code' => 'BA101', 'course_title' => 'Principles of Management',         'description' => 'Foundations of business management',      'department_id' => $deptBA,   'credit_hours' => 3, 'course_type' => 'THEORY',    'status' => 'ACTIVE']);
$cBA102 = insert($pdo, 'courses', ['course_code' => 'BA102', 'course_title' => 'Business Communication',           'description' => 'Written and verbal communication skills', 'department_id' => $deptBA,   'credit_hours' => 2, 'course_type' => 'SEMINAR',   'status' => 'ACTIVE']);

// ----------------------------------------------------------------
// 9. Course Offerings (Sem 1, 2025-2026, B.Sc. CS)
// ----------------------------------------------------------------
echo "Seeding course offerings...\n";
$offCS101 = insert($pdo, 'course_offerings', ['course_id' => $cCS101, 'program_id' => $progBSCS, 'academic_session_id' => $sess2526, 'semester_number' => 1, 'section' => 'A', 'faculty_user_id' => $fac1Id, 'enrollment_capacity' => 60, 'status' => 'ACTIVE']);
$offCS102 = insert($pdo, 'course_offerings', ['course_id' => $cCS102, 'program_id' => $progBSCS, 'academic_session_id' => $sess2526, 'semester_number' => 1, 'section' => 'A', 'faculty_user_id' => $fac1Id, 'enrollment_capacity' => 60, 'status' => 'ACTIVE']);
$offCS103 = insert($pdo, 'course_offerings', ['course_id' => $cCS103, 'program_id' => $progBSCS, 'academic_session_id' => $sess2526, 'semester_number' => 1, 'section' => 'A', 'faculty_user_id' => $fac1Id, 'enrollment_capacity' => 60, 'status' => 'ACTIVE']);
$offMA101 = insert($pdo, 'course_offerings', ['course_id' => $cMA101, 'program_id' => $progBSCS, 'academic_session_id' => $sess2526, 'semester_number' => 1, 'section' => 'A', 'faculty_user_id' => $fac2Id, 'enrollment_capacity' => 60, 'status' => 'ACTIVE']);

// ----------------------------------------------------------------
// 10. Student Enrollments (all 10 students in all 4 offerings)
// ----------------------------------------------------------------
echo "Seeding student enrollments...\n";
$enrollIds = [];  // [offeringId][studentUserId] => enrollmentId

foreach ([$offCS101, $offCS102, $offCS103, $offMA101] as $offId) {
    foreach ($studentUserIds as $uid) {
        $eid = insert($pdo, 'student_enrollments', [
            'offering_id'     => $offId,
            'student_user_id' => $uid,
            'enrollment_date' => '2025-07-15',
            'status'          => 'ENROLLED',
        ]);
        $enrollIds[$offId][$uid] = $eid;
    }
}

// ----------------------------------------------------------------
// 11. Assessment Components (3 per offering)
// ----------------------------------------------------------------
echo "Seeding assessment components...\n";

function makeComponents(PDO $pdo, int $offId, string $internalDate, string $midDate, string $finalDate): array {
    $internal = insert($pdo, 'assessment_components', [
        'offering_id'            => $offId,
        'component_name'         => 'Internal Assessment',
        'assessment_type'        => 'INTERNAL',
        'maximum_marks'          => 40,
        'weight_percentage'      => 20,
        'minimum_pass_percentage'=> 40,
        'is_mandatory'           => 1,
        'examination_date'       => $internalDate,
        'status'                 => 'COMPLETED',
    ]);
    $midterm = insert($pdo, 'assessment_components', [
        'offering_id'            => $offId,
        'component_name'         => 'Midterm Examination',
        'assessment_type'        => 'MIDTERM',
        'maximum_marks'          => 40,
        'weight_percentage'      => 30,
        'minimum_pass_percentage'=> 40,
        'is_mandatory'           => 1,
        'examination_date'       => $midDate,
        'status'                 => 'COMPLETED',
    ]);
    $final = insert($pdo, 'assessment_components', [
        'offering_id'            => $offId,
        'component_name'         => 'Final Examination',
        'assessment_type'        => 'FINAL',
        'maximum_marks'          => 80,
        'weight_percentage'      => 50,
        'minimum_pass_percentage'=> 40,
        'is_mandatory'           => 1,
        'examination_date'       => $finalDate,
        'status'                 => 'COMPLETED',
    ]);
    return ['internal' => $internal, 'midterm' => $midterm, 'final' => $final];
}

$compCS101 = makeComponents($pdo, $offCS101, '2025-09-15', '2025-10-20', '2025-12-10');
$compCS102 = makeComponents($pdo, $offCS102, '2025-09-15', '2025-10-20', '2025-12-10');
$compCS103 = makeComponents($pdo, $offCS103, '2025-09-15', '2025-10-20', '2025-12-10');
$compMA101 = makeComponents($pdo, $offMA101, '2025-09-15', '2025-10-20', '2025-12-10');

// ----------------------------------------------------------------
// 12. Assessment Marks — CS101 (all 10 students, all PRESENT)
// ----------------------------------------------------------------
echo "Seeding marks for CS101...\n";

// [student index (0-9)] => [internal, midterm, final]
$cs101Marks = [
    [36, 32, 68],  // Alice
    [30, 25, 55],  // Bob
    [38, 36, 74],  // Carol
    [20, 18, 38],  // David
    [34, 30, 65],  // Emma
    [28, 22, 48],  // Frank
    [36, 34, 70],  // Grace
    [16, 14, 30],  // Henry
    [32, 28, 62],  // Iris
    [24, 20, 42],  // James
];

foreach ($studentUserIds as $i => $uid) {
    $eid = $enrollIds[$offCS101][$uid];
    [$intM, $midM, $finM] = $cs101Marks[$i];
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS101['internal'], 'enrollment_id' => $eid, 'obtained_marks' => $intM, 'attendance_status' => 'PRESENT', 'entered_by' => $fac1Id]);
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS101['midterm'],  'enrollment_id' => $eid, 'obtained_marks' => $midM, 'attendance_status' => 'PRESENT', 'entered_by' => $fac1Id]);
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS101['final'],    'enrollment_id' => $eid, 'obtained_marks' => $finM, 'attendance_status' => 'PRESENT', 'entered_by' => $fac1Id]);
}

// ----------------------------------------------------------------
// 13. Assessment Marks — CS102 (9 students present, 1 ABSENT in final)
//     Henry (index 7) is absent in final
// ----------------------------------------------------------------
echo "Seeding marks for CS102...\n";

$cs102Marks = [
    [35, 30, 66],  // Alice
    [28, 24, 52],  // Bob
    [37, 35, 72],  // Carol
    [22, 20, 40],  // David
    [33, 29, 63],  // Emma
    [27, 21, 46],  // Frank
    [35, 33, 68],  // Grace
    [18, 15, null],// Henry — ABSENT in final
    [31, 27, 60],  // Iris
    [23, 19, 44],  // James
];

foreach ($studentUserIds as $i => $uid) {
    $eid = $enrollIds[$offCS102][$uid];
    [$intM, $midM, $finM] = $cs102Marks[$i];
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS102['internal'], 'enrollment_id' => $eid, 'obtained_marks' => $intM, 'attendance_status' => 'PRESENT', 'entered_by' => $fac1Id]);
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS102['midterm'],  'enrollment_id' => $eid, 'obtained_marks' => $midM, 'attendance_status' => 'PRESENT', 'entered_by' => $fac1Id]);

    if ($finM === null) {
        // Henry absent
        insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS102['final'], 'enrollment_id' => $eid, 'obtained_marks' => null, 'attendance_status' => 'ABSENT', 'entered_by' => $fac1Id]);
    } else {
        insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS102['final'], 'enrollment_id' => $eid, 'obtained_marks' => $finM, 'attendance_status' => 'PRESENT', 'entered_by' => $fac1Id]);
    }
}

// ----------------------------------------------------------------
// 14. Assessment Marks — CS103 & MA101: DRAFT (internal + midterm only)
// ----------------------------------------------------------------
echo "Seeding DRAFT marks for CS103 and MA101...\n";

$cs103Marks = [
    [34, 30], [28, 23], [37, 34], [19, 17], [32, 28],
    [26, 20], [34, 32], [15, 13], [30, 26], [22, 18],
];
$ma101Marks = [
    [35, 32], [29, 25], [38, 36], [21, 19], [33, 30],
    [27, 22], [35, 33], [17, 15], [31, 28], [23, 20],
];

foreach ($studentUserIds as $i => $uid) {
    $eidCS = $enrollIds[$offCS103][$uid];
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS103['internal'], 'enrollment_id' => $eidCS, 'obtained_marks' => $cs103Marks[$i][0], 'attendance_status' => 'PRESENT', 'entered_by' => $fac1Id]);
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compCS103['midterm'],  'enrollment_id' => $eidCS, 'obtained_marks' => $cs103Marks[$i][1], 'attendance_status' => 'PRESENT', 'entered_by' => $fac1Id]);

    $eidMA = $enrollIds[$offMA101][$uid];
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compMA101['internal'], 'enrollment_id' => $eidMA, 'obtained_marks' => $ma101Marks[$i][0], 'attendance_status' => 'PRESENT', 'entered_by' => $fac2Id]);
    insert($pdo, 'assessment_marks', ['assessment_component_id' => $compMA101['midterm'],  'enrollment_id' => $eidMA, 'obtained_marks' => $ma101Marks[$i][1], 'attendance_status' => 'PRESENT', 'entered_by' => $fac2Id]);
}

// ----------------------------------------------------------------
// 15. Mark Sheet Submissions
//     CS101: all 3 components APPROVED
//     CS102: all 3 components SUBMITTED
//     CS103: internal only DRAFT
//     MA101: internal only DRAFT
// ----------------------------------------------------------------
echo "Seeding mark sheet submissions...\n";

// CS101 — APPROVED
foreach (['internal', 'midterm', 'final'] as $comp) {
    insert($pdo, 'mark_sheet_submissions', [
        'assessment_component_id' => $compCS101[$comp],
        'submitted_by'            => $fac1Id,
        'status'                  => 'APPROVED',
        'reviewed_by'             => $adminId,
        'review_comment'          => 'Marks verified and approved.',
        'submitted_at'            => '2025-12-15 10:00:00',
        'reviewed_at'             => '2025-12-16 14:00:00',
    ]);
}

// CS102 — SUBMITTED
foreach (['internal', 'midterm', 'final'] as $comp) {
    insert($pdo, 'mark_sheet_submissions', [
        'assessment_component_id' => $compCS102[$comp],
        'submitted_by'            => $fac1Id,
        'status'                  => 'SUBMITTED',
        'submitted_at'            => '2025-12-14 11:00:00',
    ]);
}

// CS103 — DRAFT (internal only)
insert($pdo, 'mark_sheet_submissions', [
    'assessment_component_id' => $compCS103['internal'],
    'submitted_by'            => $fac1Id,
    'status'                  => 'DRAFT',
]);

// MA101 — DRAFT (internal only)
insert($pdo, 'mark_sheet_submissions', [
    'assessment_component_id' => $compMA101['internal'],
    'submitted_by'            => $fac2Id,
    'status'                  => 'DRAFT',
]);

// ----------------------------------------------------------------
// 16. Grade Scale
// ----------------------------------------------------------------
echo "Seeding grade scales...\n";

$scaleId = insert($pdo, 'grade_scales', [
    'program_id'                      => null,
    'scale_name'                      => 'Standard Grade Scale',
    'minimum_overall_pass_percentage' => 40.00,
    'is_default'                      => 1,
    'status'                          => 'ACTIVE',
]);

$bands = [
    ['O',  90.00, 100.00, 10.00, 1],
    ['A+', 80.00,  89.99,  9.00, 1],
    ['A',  70.00,  79.99,  8.00, 1],
    ['B+', 60.00,  69.99,  7.00, 1],
    ['B',  50.00,  59.99,  6.00, 1],
    ['C',  40.00,  49.99,  5.00, 1],
    ['F',   0.00,  39.99,  0.00, 0],
];

foreach ($bands as [$letter, $min, $max, $gp, $passing]) {
    insert($pdo, 'grade_scale_bands', [
        'grade_scale_id'    => $scaleId,
        'minimum_percentage'=> $min,
        'maximum_percentage'=> $max,
        'letter_grade'      => $letter,
        'grade_point'       => $gp,
        'is_passing'        => $passing,
    ]);
}

// ----------------------------------------------------------------
// 17. Course Results — CS101 (PUBLISHED) with exact pre-calculated values
// ----------------------------------------------------------------
echo "Seeding course results for CS101 (PUBLISHED)...\n";

// [student_index] => [total_percentage, total_marks, letter_grade, grade_point]
$cs101Results = [
    [84.500,  58.00, 'A+', 9.00],  // Alice
    [68.125,  45.50, 'A',  8.00],  // Bob
    [92.250,  65.60, 'O',  10.00], // Carol
    [47.250,  28.90, 'C',  5.00],  // David
    [80.125,  54.63, 'A+', 9.00],  // Emma
    [60.500,  39.60, 'B+', 7.00],  // Frank
    [87.250,  60.50, 'A+', 9.00],  // Grace
    [37.250,  21.00, 'F',  0.00],  // Henry
    [75.750,  51.75, 'A',  8.00],  // Iris
    [53.250,  34.75, 'B',  6.00],  // James
];

$gradingSnapshot = json_encode([
    'scale_id'   => $scaleId,
    'scale_name' => 'Standard Grade Scale',
    'components' => [
        ['name' => 'Internal Assessment', 'max' => 40, 'weight' => 20],
        ['name' => 'Midterm Examination',  'max' => 40, 'weight' => 30],
        ['name' => 'Final Examination',    'max' => 80, 'weight' => 50],
    ],
]);

foreach ($studentUserIds as $i => $uid) {
    $eid = $enrollIds[$offCS101][$uid];
    [$pct, $marks, $grade, $gp] = $cs101Results[$i];
    insert($pdo, 'course_results', [
        'enrollment_id'           => $eid,
        'total_percentage'        => $pct,
        'total_marks'             => $marks,
        'letter_grade'            => $grade,
        'grade_point'             => $gp,
        'result_status'           => 'PUBLISHED',
        'grading_policy_snapshot' => $gradingSnapshot,
        'calculated_at'           => '2025-12-17 09:00:00',
        'published_at'            => '2025-12-18 10:00:00',
        'published_by'            => $adminId,
    ]);
}

// ----------------------------------------------------------------
// 18. Course Results — CS102 (PROVISIONAL)
// ----------------------------------------------------------------
echo "Seeding course results for CS102 (PROVISIONAL)...\n";

// Henry is absent in final → result is incomplete / 0 for final
// Weighted: internal=20%, midterm=30%, final=50%
// For absent student (Henry), final=0 marks (absent)
$cs102Results = [];
foreach ($studentUserIds as $i => $uid) {
    [$intM, $midM, $finM] = $cs102Marks[$i];
    if ($finM === null) $finM = 0; // absent → 0
    $pct    = ($intM / 40 * 20) + ($midM / 40 * 30) + ($finM / 80 * 50);
    $total  = round($intM * 0.20 + $midM * 0.30 + $finM * 0.50 * (40/80), 2); // scaled marks approach
    // Determine grade
    $grade = 'F'; $gp = 0;
    if ($pct >= 90)      { $grade = 'O';  $gp = 10; }
    elseif ($pct >= 80)  { $grade = 'A+'; $gp = 9;  }
    elseif ($pct >= 70)  { $grade = 'A';  $gp = 8;  }
    elseif ($pct >= 60)  { $grade = 'B+'; $gp = 7;  }
    elseif ($pct >= 50)  { $grade = 'B';  $gp = 6;  }
    elseif ($pct >= 40)  { $grade = 'C';  $gp = 5;  }

    $eid = $enrollIds[$offCS102][$uid];
    insert($pdo, 'course_results', [
        'enrollment_id'           => $eid,
        'total_percentage'        => round($pct, 3),
        'total_marks'             => round($pct / 100 * 160, 2),
        'letter_grade'            => $grade,
        'grade_point'             => $gp,
        'result_status'           => 'PROVISIONAL',
        'grading_policy_snapshot' => $gradingSnapshot,
        'calculated_at'           => '2025-12-17 09:00:00',
        'published_at'            => null,
        'published_by'            => null,
    ]);
}

// ----------------------------------------------------------------
// 19. Announcements
// ----------------------------------------------------------------
echo "Seeding announcements...\n";

insert($pdo, 'announcements', [
    'title'       => 'Welcome to UniGrade Academic Year 2025-2026',
    'content'     => 'We are pleased to welcome all students and faculty to the new academic year. Please ensure your profiles are complete and check your enrolled courses. Best of luck!',
    'created_by'  => $adminId,
    'target_role' => 'ALL',
    'is_active'   => 1,
    'expires_at'  => '2025-09-30 23:59:59',
]);

insert($pdo, 'announcements', [
    'title'       => 'Semester 1 Final Examination Schedule Released',
    'content'     => 'The final examination schedule for Semester 1 (2025-2026) has been released. All examinations will be held in December 2025. Students are advised to check their timetables and prepare accordingly. No request for re-scheduling will be entertained.',
    'created_by'  => $adminId,
    'target_role' => 'STUDENT',
    'is_active'   => 1,
    'expires_at'  => '2026-01-15 23:59:59',
]);

// ----------------------------------------------------------------
// Done
// ----------------------------------------------------------------
$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

echo "\n========================================\n";
echo "Seeding complete!\n";
echo "========================================\n";
echo "Summary:\n";
echo "  Departments : 3\n";
echo "  Programs    : 3\n";
echo "  Users       : " . (1 + 3 + 10) . " (1 admin, 3 faculty, 10 students)\n";
echo "  Sessions    : 2\n";
echo "  Courses     : 8\n";
echo "  Offerings   : 4\n";
echo "  Enrollments : " . (10 * 4) . "\n";
echo "  Components  : " . (4 * 3) . "\n";
echo "  Grade Scale : 1 (Standard, 7 bands)\n";
echo "  CS101 results (PUBLISHED)   : 10\n";
echo "  CS102 results (PROVISIONAL) : 10\n";
echo "  Announcements: 2\n";

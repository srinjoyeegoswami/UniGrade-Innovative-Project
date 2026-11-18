# UniGrade REST API Specification

All API endpoints return JSON in the standard format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

## 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates user credentials, sets session cookie & returns profile |
| `POST` | `/api/auth/logout` | Authenticated | Clears current user session and invalidates cookie |
| `GET` | `/api/auth/me` | Authenticated | Returns currently authenticated user and role profile |
| `POST` | `/api/auth/change-password` | Authenticated | Verifies old password and updates to new bcrypt hash |

## 2. Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin | Real-time counts, grade distribution, pass/fail and recent submissions |
| `GET` | `/api/dashboard/faculty` | Faculty | Assigned offerings, pending mark sheets, upcoming exam timetable |
| `GET` | `/api/dashboard/student` | Student | Enrolled courses, upcoming examinations, current CGPA, latest SGPA |

## 3. Students Management (`/api/students`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/students` | Admin | Paginated list of students with filters by department, program, search |
| `POST` | `/api/students` | Admin | Registers user account and student academic profile |
| `GET` | `/api/students/{id}` | Admin / Self | Full student profile with enrollment history |
| `PUT` | `/api/students/{id}` | Admin | Updates personal and academic details |
| `DELETE` | `/api/students/{id}` | Admin | Soft deactivates student account |
| `GET` | `/api/students/{id}/results` | Admin / Self | Official published course results |
| `GET` | `/api/students/{id}/transcript` | Admin / Self | Full semester-wise breakdown for transcript generation |

## 4. Faculty Management (`/api/faculty`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/faculty` | Admin | List of all instructors and examiners |
| `POST` | `/api/faculty` | Admin | Registers faculty user and employee profile |
| `GET` | `/api/faculty/{id}` | Admin | Faculty profile details |
| `PUT` | `/api/faculty/{id}` | Admin | Updates faculty record |
| `DELETE` | `/api/faculty/{id}` | Admin | Deactivates faculty account |

## 5. Course Catalog & Offerings (`/api/courses`, `/api/offerings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/courses` | Authenticated | Lists all courses in catalog |
| `POST` | `/api/courses` | Admin | Creates new course with credit hours |
| `PUT` | `/api/courses/{id}` | Admin | Updates course details |
| `GET` | `/api/offerings` | Authenticated | Lists course offerings (Admin: all, Faculty: assigned) |
| `POST` | `/api/offerings` | Admin | Schedules course in session & assigns instructor |
| `PUT` | `/api/offerings/{id}` | Admin | Updates course offering parameters |

## 6. Student Enrollments (`/api/enrollments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/enrollments` | Authenticated | Lists enrollments for specified course offering |
| `POST` | `/api/enrollments` | Admin | Enrolls individual student into course section |
| `POST` | `/api/enrollments/bulk` | Admin | Cohort enrollment of multiple students |
| `DELETE` | `/api/enrollments/{id}` | Admin | Drops student enrollment |

## 7. Examination Assessment Components (`/api/assessments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/assessments` | Authenticated | Lists components for course offering |
| `POST` | `/api/assessments` | Admin | Defines assessment component, max marks, weight %, venue |
| `PUT` | `/api/assessments/{id}` | Admin | Updates component properties |
| `GET` | `/api/assessments/schedule` | Authenticated | Role-filtered master examination timetable |

## 8. Marks Entry & Submissions (`/api/marks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/marks/{componentId}` | Faculty/Admin | Returns candidate class roster and recorded marks |
| `POST` | `/api/marks/save-draft` | Faculty/Admin | Upserts marks without finalizing (status: DRAFT) |
| `POST` | `/api/marks/submit` | Faculty/Admin | Validates complete attendance and submits for review |
| `POST` | `/api/marks/review` | Admin | Approves or returns submission with audit comment |
| `GET` | `/api/marks/submissions` | Faculty/Admin | Lists submission batches and statuses |

## 9. Grading Engine & Policy Scales (`/api/grading`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/grading/scales` | Authenticated | Lists grading policies and band boundaries |
| `POST` | `/api/grading/scales` | Admin | Creates new grading scale with bands |
| `PUT` | `/api/grading/scales/{id}` | Admin | Updates scale and grade bands |
| `POST` | `/api/grading/calculate` | Admin | Executes automated credit-weighted grading calculation |

## 10. Official Results & Transcripts (`/api/results`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/results` | Authenticated | Lists results (Admin: all, Student: published only) |
| `GET` | `/api/results/student/{id}` | Admin / Self | Returns semester groups, SGPA, CGPA |
| `POST` | `/api/results/publish` | Admin | Officially publishes results, releasing to students |
| `POST` | `/api/results/unlock` | Admin | Reverts published results to provisional with audit justification |

## 11. Reports & Audit Trail (`/api/reports`, `/api/audit-logs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports/performance` | Admin/Faculty | Cohort GPA and course completion analytics |
| `GET` | `/api/reports/grade-distribution` | Admin/Faculty | Dispersion frequencies across letter grades |
| `GET` | `/api/reports/pass-fail` | Admin/Faculty | Department-wise pass/fail rates |
| `GET` | `/api/reports/faculty-workload` | Admin/Faculty | Instructor teaching and exam loads |
| `GET` | `/api/audit-logs` | Admin | Paginated security log of system actions and JSON payloads |


export const ROLES = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
};

export const RESULT_STATUSES = {
  INCOMPLETE: 'INCOMPLETE',
  PROCESSING: 'PROCESSING',
  PROVISIONAL: 'PROVISIONAL',
  PUBLISHED: 'PUBLISHED',
  WITHHELD: 'WITHHELD',
};

export const SUBMISSION_STATUSES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  RETURNED: 'RETURNED',
  APPROVED: 'APPROVED',
};

export const ASSESSMENT_TYPES = [
  { value: 'INTERNAL', label: 'Internal Assessment' },
  { value: 'CLASS_TEST', label: 'Class Test' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'PRACTICAL', label: 'Practical Examination' },
  { value: 'MIDTERM', label: 'Mid-Semester Examination' },
  { value: 'FINAL', label: 'Final Examination' },
  { value: 'OTHER', label: 'Other Component' },
];

export const ATTENDANCE_STATUSES = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'EXCUSED', label: 'Excused' },
  { value: 'NOT_ENTERED', label: 'Not Entered' },
];


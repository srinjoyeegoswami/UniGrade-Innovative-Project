import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import AdminLayout from '../components/layout/AdminLayout';
import FacultyLayout from '../components/layout/FacultyLayout';
import StudentLayout from '../components/layout/StudentLayout';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminStudents = lazy(() => import('../pages/admin/Students'));
const AdminStudentProfile = lazy(() => import('../pages/admin/StudentProfile'));
const AdminFaculty = lazy(() => import('../pages/admin/Faculty'));
const AdminDepartments = lazy(() => import('../pages/admin/Departments'));
const AdminPrograms = lazy(() => import('../pages/admin/Programs'));
const AdminAcademicSessions = lazy(() => import('../pages/admin/AcademicSessions'));
const AdminCourses = lazy(() => import('../pages/admin/Courses'));
const AdminCourseOfferings = lazy(() => import('../pages/admin/CourseOfferings'));
const AdminStudentEnrollment = lazy(() => import('../pages/admin/StudentEnrollment'));
const AdminExaminationManagement = lazy(() => import('../pages/admin/ExaminationManagement'));
const AdminExaminationSchedule = lazy(() => import('../pages/admin/ExaminationSchedule'));
const AdminGradingConfiguration = lazy(() => import('../pages/admin/GradingConfiguration'));
const AdminMarkSubmissions = lazy(() => import('../pages/admin/MarkSubmissions'));
const AdminResultProcessing = lazy(() => import('../pages/admin/ResultProcessing'));
const AdminPublishedResults = lazy(() => import('../pages/admin/PublishedResults'));
const AdminReports = lazy(() => import('../pages/admin/Reports'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

// Faculty Pages
const FacultyDashboard = lazy(() => import('../pages/faculty/Dashboard'));
const FacultyMyCourses = lazy(() => import('../pages/faculty/MyCourses'));
const FacultySchedule = lazy(() => import('../pages/faculty/Schedule'));
const FacultyMarksEntry = lazy(() => import('../pages/faculty/MarksEntry'));
const FacultySubmissions = lazy(() => import('../pages/faculty/Submissions'));
const FacultyPublishedResults = lazy(() => import('../pages/faculty/PublishedResults'));
const FacultySettings = lazy(() => import('../pages/faculty/Settings'));

// Student Pages
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const StudentProfile = lazy(() => import('../pages/student/Profile'));
const StudentCourses = lazy(() => import('../pages/student/MyCourses'));
const StudentExamSchedule = lazy(() => import('../pages/student/ExamSchedule'));
const StudentResults = lazy(() => import('../pages/student/MyResults'));
const StudentTranscript = lazy(() => import('../pages/student/Transcript'));
const StudentAnnouncements = lazy(() => import('../pages/student/Announcements'));
const StudentSettings = lazy(() => import('../pages/student/Settings'));

const PageLoader = () => (
  <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <LoadingSkeleton height="2rem" width="240px" />
    <LoadingSkeleton height="200px" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:id" element={<AdminStudentProfile />} />
              <Route path="faculty" element={<AdminFaculty />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="programs" element={<AdminPrograms />} />
              <Route path="sessions" element={<AdminAcademicSessions />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="offerings" element={<AdminCourseOfferings />} />
              <Route path="enrollments" element={<AdminStudentEnrollment />} />
              <Route path="examinations" element={<AdminExaminationManagement />} />
              <Route path="schedule" element={<AdminExaminationSchedule />} />
              <Route path="grading" element={<AdminGradingConfiguration />} />
              <Route path="marks" element={<AdminMarkSubmissions />} />
              <Route path="results" element={<AdminResultProcessing />} />
              <Route path="results/published" element={<AdminPublishedResults />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>

        {/* FACULTY ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['FACULTY']} />}>
            <Route path="/faculty" element={<FacultyLayout />}>
              <Route index element={<Navigate to="/faculty/dashboard" replace />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="courses" element={<FacultyMyCourses />} />
              <Route path="schedule" element={<FacultySchedule />} />
              <Route path="marks" element={<FacultyMarksEntry />} />
              <Route path="marks/:componentId" element={<FacultyMarksEntry />} />
              <Route path="submissions" element={<FacultySubmissions />} />
              <Route path="results" element={<FacultyPublishedResults />} />
              <Route path="settings" element={<FacultySettings />} />
            </Route>
          </Route>
        </Route>

        {/* STUDENT ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="schedule" element={<StudentExamSchedule />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="transcript" element={<StudentTranscript />} />
              <Route path="announcements" element={<StudentAnnouncements />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;


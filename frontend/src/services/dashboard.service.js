import api from './api';

export const getAdminDashboard = () => api.get('/dashboard/admin');
export const getFacultyDashboard = () => api.get('/dashboard/faculty');
export const getStudentDashboard = () => api.get('/dashboard/student');


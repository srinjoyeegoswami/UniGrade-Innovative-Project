import api from './api';

export const getPerformanceReport = (params) => api.get('/reports/performance', { params });
export const getGradeDistribution = (params) => api.get('/reports/grade-distribution', { params });
export const getPassFailStats = (params) => api.get('/reports/pass-fail', { params });
export const getSubmissionReport = () => api.get('/reports/submissions');
export const getFacultyWorkload = () => api.get('/reports/faculty-workload');


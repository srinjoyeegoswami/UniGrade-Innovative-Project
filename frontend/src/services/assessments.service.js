import api from './api';

export const getAssessments = (params) => api.get('/assessments', { params });
export const getAssessment = (id) => api.get(`/assessments/${id}`);
export const createAssessment = (data) => api.post('/assessments', data);
export const updateAssessment = (id, data) => api.put(`/assessments/${id}`, data);
export const deleteAssessment = (id) => api.delete(`/assessments/${id}`);
export const getSchedule = () => api.get('/assessments/schedule');


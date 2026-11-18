import api from './api';

export const getGradingScales = () => api.get('/grading/scales');
export const createGradingScale = (data) => api.post('/grading/scales', data);
export const updateGradingScale = (id, data) => api.put(`/grading/scales/${id}`, data);
export const calculateGrades = (data) => api.post('/grading/calculate', data);


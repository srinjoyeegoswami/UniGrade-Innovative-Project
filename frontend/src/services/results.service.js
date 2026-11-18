import api from './api';

export const getResults = (params) => api.get('/results', { params });
export const getStudentResults = (studentId) => api.get(`/results/student/${studentId}`);
export const getOfferingResults = (offeringId) => api.get(`/results/offering/${offeringId}`);
export const getPublishedBatches = () => api.get('/results/published');
export const publishResults = (data) => api.post('/results/publish', data);
export const unlockResults = (data) => api.post('/results/unlock', data);


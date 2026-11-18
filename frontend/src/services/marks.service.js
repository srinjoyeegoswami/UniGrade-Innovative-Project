import api from './api';

export const getComponentMarks = (componentId) => api.get(`/marks/${componentId}`);
export const saveMarksDraft = (data) => api.post('/marks/save-draft', data);
export const submitMarks = (data) => api.post('/marks/submit', data);
export const reviewMarks = (data) => api.post('/marks/review', data);
export const getSubmissions = (params) => api.get('/marks/submissions', { params });
export const getSubmissionStatus = (componentId) => api.get(`/marks/submission/${componentId}`);


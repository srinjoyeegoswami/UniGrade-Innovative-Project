import api from './api';

export const getStudents = (params) => api.get('/students', { params });
export const getStudent = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getStudentResults = (id) => api.get(`/students/${id}/results`);
export const getStudentTranscript = (id) => api.get(`/students/${id}/transcript`);
export const bulkImportStudents = (data) => api.post('/students/bulk-import', data);

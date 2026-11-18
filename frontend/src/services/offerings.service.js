import api from './api';

export const getOfferings = (params) => api.get('/offerings', { params });
export const getOffering = (id) => api.get(`/offerings/${id}`);
export const createOffering = (data) => api.post('/offerings', data);
export const updateOffering = (id, data) => api.put(`/offerings/${id}`, data);
export const getOfferingStudents = (id) => api.get(`/offerings/${id}/students`);
export const getOfferingComponents = (id) => api.get(`/offerings/${id}/components`);
export const getOfferingSchedule = (id) => api.get(`/offerings/${id}/schedule`);


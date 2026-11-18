import { get, post, put, del } from './api.js'

export const getDepartments = (params) => get('/departments', { params })
export const getDepartment = (id) => get(`/departments/${id}`)
export const createDepartment = (data) => post('/departments', data)
export const updateDepartment = (id, data) => put(`/departments/${id}`, data)
export const deleteDepartment = (id) => del(`/departments/${id}`)

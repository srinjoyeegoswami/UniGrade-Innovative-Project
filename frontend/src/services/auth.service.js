import { post, get } from './api.js'

export const login = (email, password) =>
  post('/auth/login', { email, password })

export const logout = () =>
  post('/auth/logout')

export const me = () =>
  get('/auth/me')

export const changePassword = (oldPassword, newPassword) =>
  post('/auth/change-password', { old_password: oldPassword, new_password: newPassword })

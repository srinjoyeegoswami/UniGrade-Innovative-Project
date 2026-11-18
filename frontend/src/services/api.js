import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor: attach CSRF token
api.interceptors.request.use(
  (config) => {
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    const localToken = localStorage.getItem('csrf_token')
    const token = metaToken || localToken
    if (token) {
      config.headers['X-CSRF-Token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 and error formats
api.interceptors.response.use(
  (response) => {
    // Store CSRF token if returned
    const csrfToken = response.headers['x-csrf-token']
    if (csrfToken) {
      localStorage.setItem('csrf_token', csrfToken)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear local auth state and redirect to login
      localStorage.removeItem('csrf_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    // Normalize error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject({ ...error, message })
  }
)

export const get = (url, config) => api.get(url, config)
export const post = (url, data, config) => api.post(url, data, config)
export const put = (url, data, config) => api.put(url, data, config)
export const del = (url, config) => api.delete(url, config)

export default api

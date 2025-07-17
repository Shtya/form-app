import axios from 'axios'

export const baseImg = process.env.NEXT_PUBLIC_BASE_URL
const api = axios.create({
  baseURL:  process.env.NEXT_PUBLIC_BASE_URL + 'api/v1',
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await api.post('/auth/refresh-token', { refreshToken })
        localStorage.setItem('accessToken', response.data.accessToken)
        return api(originalRequest)
      } catch (err) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
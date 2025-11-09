import axios from 'axios'

// Backend service URLs
export const API_BASE_URLS = {
  auth: 'http://localhost:4001/api/v1',
  vehicle: 'http://localhost:4002/api/v1',
  auction: 'http://localhost:4003',
  bid: 'http://localhost:4004',
  payment: 'http://localhost:4005',
  notification: 'http://localhost:4006',
} as const

// Create axios instance with default config
export const apiClient = axios.create({
  timeout: 30000, // Increased timeout for network issues
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // CORS için
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URLS.auth}/auth/refresh`,
            { refreshToken }
          )
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient


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

// Request interceptor - Add auth token and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Log request for debugging
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data || '')
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - Success:`, response.status)
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log network errors
    if (!error.response) {
      console.error('[API] Network Error:', {
        message: error.message,
        code: error.code,
        url: originalRequest?.url,
        method: originalRequest?.method,
      })
    } else {
      console.error(`[API] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - Error:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      })
    }

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


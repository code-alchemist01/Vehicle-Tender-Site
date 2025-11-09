import apiClient, { API_BASE_URLS } from './config'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt?: string
}

export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(
      `${API_BASE_URLS.auth}/auth/login`,
      data
    )
    // Backend returns: { success: true, message: "...", data: { user, tokens } }
    if (response.data.data) {
      return response.data.data
    }
    // Fallback for direct response
    return response.data
  },

  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(
      `${API_BASE_URLS.auth}/auth/register`,
      data
    )
    // Backend returns: { success: true, message: "...", data: { user, tokens } }
    if (response.data.data) {
      return response.data.data
    }
    // Fallback for direct response
    return response.data
  },

  // Get profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get(`${API_BASE_URLS.auth}/auth/profile`)
    // Backend returns: { success: true, message: "...", data: {...} }
    return response.data.data || response.data
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post(`${API_BASE_URLS.auth}/auth/logout`)
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `${API_BASE_URLS.auth}/auth/change-password`,
      data
    )
    return response.data
  },

  // Get login history
  getLoginHistory: async (): Promise<any[]> => {
    const response = await apiClient.get(
      `${API_BASE_URLS.auth}/auth/login-history`
    )
    // Backend returns: { success: true, message: "...", data: [...] }
    return response.data.data || response.data || []
  },
}


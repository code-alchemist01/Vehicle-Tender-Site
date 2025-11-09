import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi, type UserProfile } from '@/lib/api/auth'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login({ email, password })
          // Handle both response formats
          const tokens = response.tokens || (response as any).data?.tokens
          const user = response.user || (response as any).data?.user
          
          if (tokens?.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken || tokens.refreshToken)
          }
          
          set({
            user: user as UserProfile,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(data)
          // Handle both response formats
          const tokens = response.tokens || (response as any).data?.tokens
          const user = response.user || (response as any).data?.user
          
          if (tokens?.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken || tokens.refreshToken)
          }
          
          set({
            user: user as UserProfile,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          set({
            user: null,
            isAuthenticated: false,
          })
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true })
        try {
          const profile = await authApi.getProfile()
          set({
            user: profile,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)


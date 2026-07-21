import { create } from 'zustand'
import { api } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: string
  brandId?: string
  permissions: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, // true by default to show loading state while fetching profile
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        data: { email, password }
      })
      
      localStorage.setItem('token', data.token)
      
      set({ 
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      })
      return true
    } catch (error: any) {
      set({ 
        error: error.message || 'Login gagal', 
        isLoading: false,
        isAuthenticated: false 
      })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false })
  },
  
  fetchProfile: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    
    try {
      const data = await api<{ user: User }>('/auth/me')
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  }
}))

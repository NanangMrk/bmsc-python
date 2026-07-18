import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '@/lib/mock-data'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, _password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: Role) => void
}

// Simulated auth — in production this calls the API
const mockAuth: Record<string, User> = {
  'rina@bmsc.id': {
    id: 'u1',
    name: 'Rina Kartika',
    email: 'rina@bmsc.id',
    role: 'SUPER_ADMIN',
    createdAt: '2024-01-10',
  },
  'dimas@bmsc.id': {
    id: 'u2',
    name: 'Dimas Aditya',
    email: 'dimas@bmsc.id',
    role: 'ADMIN',
    createdAt: '2024-02-01',
  },
  'sarah@kopinusantara.id': {
    id: 'u3',
    name: 'Sarah Wijaya',
    email: 'sarah@kopinusantara.id',
    role: 'BRAND',
    createdAt: '2024-03-05',
  },
  'budi@bmsc.id': {
    id: 'u4',
    name: 'Budi Santoso',
    email: 'budi@bmsc.id',
    role: 'KREATOR',
    createdAt: '2024-03-10',
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, _password) => {
        // Simulate API call
        await new Promise((r) => setTimeout(r, 800))
        const user = mockAuth[email.toLowerCase()]
        if (user) {
          set({ user, isAuthenticated: true })
          return true
        }
        return false
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      switchRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
    }),
    { name: 'bmsc-auth' }
  )
)

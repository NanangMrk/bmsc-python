import { useAuthStore } from '@/stores/auth.store'

export function usePermissions() {
  const { user } = useAuthStore()

  const hasPermission = (permissionCode: string) => {
    if (!user) return false
    // SUPER_ADMIN has access to everything
    if (user.role === 'SUPER_ADMIN') return true
    
    // Check if the user's permissions array includes the requested code
    return user.permissions?.includes(permissionCode) || false
  }

  // Legacy fallback if components still want to check general edit capability
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

  return { hasPermission, canEdit, user }
}

import { useAuthStore } from '@/stores/auth.store'

export function usePermissions() {
  const { user } = useAuthStore()

  const hasPermission = (permissionCode: string) => {
    if (!user) return false
    
    // Normalize role string to handle different formats (e.g. "Super Admin", "SUPER_ADMIN", "Admin")
    const roleString = String(user.role || '').toUpperCase().replace(/[^A-Z]/g, '')
    
    // SUPER_ADMIN and ADMIN have access to everything
    if (roleString === 'SUPERADMIN' || roleString === 'ADMIN') return true
    
    // Check if the user's permissions array includes the requested code
    return Array.isArray(user.permissions) && user.permissions.includes(permissionCode)
  }

  // Legacy fallback if components still want to check general edit capability
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

  return { hasPermission, canEdit, user }
}

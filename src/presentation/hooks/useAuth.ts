// src/presentation/hooks/useAuth.ts
import { useAuthStore } from '@/presentation/store/auth.store'
import { Rol } from '@/domain/enums/rol.enum'

/**
 * Hook de sesión. Las páginas consumen ESTE hook, no el store directamente:
 * así la lógica de selección/derivación de estado vive en un solo lugar y las
 * pantallas quedan desacopladas de Zustand. Kevin y Johan deben crear sus
 * propios hooks (useFacturacion, useClinica...) siguiendo este mismo patrón.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)
  const clearError = useAuthStore((s) => s.clearError)

  const isAuthenticated = user !== null
  const rol = user?.rol ?? null

  return {
    user,
    rol,
    isAuthenticated,
    isAdmin: rol === Rol.ADMIN,
    isDoctor: rol === Rol.DOCTOR,
    /** true si el usuario puede escribir actos médicos (admin o doctor). */
    isMedico: rol === Rol.ADMIN || rol === Rol.DOCTOR,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }
}

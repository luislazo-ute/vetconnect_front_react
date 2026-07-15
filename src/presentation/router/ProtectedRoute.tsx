// src/presentation/router/ProtectedRoute.tsx
import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Rol } from '@/domain/enums/rol.enum'

interface ProtectedRouteProps {
  /** Contenido a renderizar si la autorización es correcta. */
  children: ReactNode
  /**
   * Roles permitidos. Si se omite, basta con estar autenticado.
   * Si se pasa (ej. ['ADMIN','DOCTOR']) y el rol del usuario no está en la
   * lista, se redirige a / (el backend además bloquea con 403).
   */
  allowedRoles?: Rol[]
}

/**
 * Guardia declarativa de rutas:
 * - No autenticado → redirige a /login guardando la ruta de origen.
 * - Autenticado pero con rol no permitido → redirige a /.
 * - Autorizado → renderiza children.
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  // Mientras loadSession() valida el token, no redirigir aún
  // (evita el "flash" de redirect al recargar con sesión válida).
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

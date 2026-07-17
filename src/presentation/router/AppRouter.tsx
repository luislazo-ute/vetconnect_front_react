// src/presentation/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Rol } from '@/domain/enums/rol.enum'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '@/presentation/components/AppShell'


// ─── Lazy imports ───────────────────────────────────────────────────────────
// Auth (sin shell)
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
// Públicas
const HomePage = lazy(() => import('../pages/publico/HomePage'))
const ServiciosPage = lazy(() => import('../pages/publico/ServiciosPage'))
const ServicioDetailPage = lazy(() => import('../pages/publico/ServicioDetailPage'))
const EquipoPage = lazy(() => import('../pages/publico/EquipoPage'))
const ContactoPage = lazy(() => import('../pages/publico/ContactoPage'))
// Privadas (Luis)
const PanelPage = lazy(() => import('../pages/panel/PanelPage'))
const PerfilPage = lazy(() => import('../pages/panel/PerfilPage'))
const MascotasPage = lazy(() => import('../pages/pacientes/MascotasPage'))
const CitasPage = lazy(() => import('../pages/pacientes/CitasPage'))
const ClientesPage = lazy(() => import('../pages/pacientes/ClientesPage'))
const HistorialesPage = lazy(() => import('../pages/pacientes/HistorialesPage'))
// Facturación (Kevin)
const ProductosPage = lazy(() => import('../pages/facturacion/ProductosPage'))
const CategoriasProductoPage = lazy(() => import('../pages/facturacion/CategoriasProductoPage'))
const ProveedoresPage = lazy(() => import('../pages/facturacion/ProveedoresPage'))
const FacturasPage = lazy(() => import('../pages/facturacion/FacturasPage'))
const ComprasPage = lazy(() => import('../pages/facturacion/ComprasPage'))
// Clínica (Johan)
const VacunasPage = lazy(() => import('../pages/clinica/VacunasPage'))
const RecetasPage = lazy(() => import('../pages/clinica/RecetasPage'))
const HospitalizacionesPage = lazy(() => import('../pages/clinica/HospitalizacionesPage'))
const HabitacionesPage = lazy(() => import('../pages/clinica/HabitacionesPage'))
const NotificacionesPage = lazy(() => import('../pages/clinica/NotificacionesPage'))
const RegistrosClinicosPage = lazy(() => import('../pages/mongo/RegistrosClinicosPage'))

// ─── Loader global ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

// ─── Router ─────────────────────────────────────────────────────────────────
export default function AppRouter() {
  const loadSession = useAuthStore((state) => state.loadSession)

  // Restaurar la sesión guardada al iniciar la app: valida el token contra
  // /users/profile/ y llena el store si sigue siendo válido.
  useEffect(() => {
    loadSession()
  }, [loadSession])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Autenticación (sin AppShell) ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          {/* ── Rutas con AppShell ── */}
          <Route element={<AppShell />}>
            {/* Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/servicios/:id" element={<ServicioDetailPage />} />
            <Route path="/equipo" element={<EquipoPage />} />
            <Route path="/contacto" element={<ContactoPage />} />

            {/* Privadas — cualquier usuario autenticado */}
            <Route
              path="/panel"
              element={
                <ProtectedRoute>
                  <PanelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <PerfilPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mascotas"
              element={
                <ProtectedRoute>
                  <MascotasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas"
              element={
                <ProtectedRoute>
                  <CitasPage />
                </ProtectedRoute>
              }
            />

            {/* Actos médicos — admin o doctor */}
            <Route
              path="/historiales"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.DOCTOR]}>
                  <HistorialesPage />
                </ProtectedRoute>
              }
            />

            {/* Solo admin */}
            <Route
              path="/clientes"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN]}>
                  <ClientesPage />
                </ProtectedRoute>
              }
            />

            {/* Facturación (Kevin) */}
            <Route
              path="/facturacion/productos"
              element={
                <ProtectedRoute>
                  <ProductosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facturacion/categorias-producto"
              element={
                <ProtectedRoute>
                  <CategoriasProductoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facturacion/facturas"
              element={
                <ProtectedRoute>
                  <FacturasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facturacion/proveedores"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN]}>
                  <ProveedoresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facturacion/compras"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN]}>
                  <ComprasPage />
                </ProtectedRoute>
              }
            />

            {/* Clínica (Johan) */}
            <Route
              path="/clinica/vacunas"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.DOCTOR]}>
                  <VacunasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinica/recetas"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.DOCTOR]}>
                  <RecetasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinica/hospitalizaciones"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.DOCTOR]}>
                  <HospitalizacionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinica/habitaciones"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN]}>
                  <HabitacionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notificaciones"
              element={
                <ProtectedRoute>
                  <NotificacionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registros-clinicos"
              element={
                <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.DOCTOR]}>
                  <RegistrosClinicosPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

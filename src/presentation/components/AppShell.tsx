// src/presentation/components/AppShell.tsx
import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom'
import { PawPrint, LogOut, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/presentation/hooks/useAuth'
import { Rol } from '@/domain/enums/rol.enum'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Separator } from '@/presentation/components/ui/separator'
import PawBackground from '@/presentation/components/PawBackground'

/** Iniciales del username para el avatar. */
function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

/** Clases de los enlaces de navegación (activo/inactivo). */
function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'text-sm font-medium transition-colors hover:text-primary',
    isActive ? 'text-primary' : 'text-muted-foreground',
  ].join(' ')
}

/** Etiqueta legible del rol para el badge. */
const rolLabel: Record<Rol, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Doctor',
  USUARIO: 'Cliente',
}

export default function AppShell() {
  const navigate = useNavigate()
  const { user, rol, isAuthenticated, isAdmin, isMedico, logout } = useAuth()

  async function handleLogout() {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PawBackground />
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary">
            <PawPrint className="h-5 w-5" />
            <span>VetConnect</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />

          <nav className="flex items-center gap-4">
            {/* Públicas */}
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/servicios" className={navLinkClass}>
              Servicios
            </NavLink>
            <NavLink to="/equipo" className={navLinkClass}>
              Equipo
            </NavLink>
            <NavLink to="/contacto" className={navLinkClass}>
              Contacto
            </NavLink>

            {/* Autenticado */}
            {isAuthenticated && (
              <>
                <NavLink to="/panel" className={navLinkClass}>
                  Panel
                </NavLink>
                <NavLink to="/mascotas" className={navLinkClass}>
                  Mascotas
                </NavLink>
                <NavLink to="/citas" className={navLinkClass}>
                  Citas
                </NavLink>
              </>
            )}

            {/* Actos médicos: admin o doctor */}
            {isMedico && (
              <>
                <NavLink to="/historiales" className={navLinkClass}>
                  Historiales
                </NavLink>
                <NavLink to="/clinica/vacunas" className={navLinkClass}>
                  Vacunas
                </NavLink>
                <NavLink to="/clinica/recetas" className={navLinkClass}>
                  Recetas
                </NavLink>
                <NavLink to="/clinica/hospitalizaciones" className={navLinkClass}>
                  Hospitalizaciones
                </NavLink>
              </>  
            )}

            {/* Solo admin */}
            {isAdmin && (
              <>
                <NavLink to="/clientes" className={navLinkClass}>
                  Clientes
                </NavLink>
                <NavLink to="/clinica/habitaciones" className={navLinkClass}>
                  Habitaciones
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex-1" />

          {/* Acciones del lado derecho */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                    {rol && (
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        {rolLabel[rol]}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link to="/registro">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VetConnect · Sistema veterinario
      </footer>
    </div>
  )
}

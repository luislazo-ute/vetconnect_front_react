// src/presentation/components/AppShell.tsx
import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom'
import {
  PawPrint, LogOut, User as UserIcon, Moon, Sun, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useTheme } from '@/presentation/hooks/useTheme'
import { Rol } from '@/domain/enums/rol.enum'
import { cn } from '@/presentation/utils/cn'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
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
  return cn(
    'whitespace-nowrap text-sm font-medium transition-colors hover:text-primary',
    isActive ? 'text-primary' : 'text-muted-foreground',
  )
}

const rolLabel: Record<Rol, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Doctor',
  USUARIO: 'Cliente',
}

interface NavItem {
  to: string
  label: string
}

/** Menú desplegable de navegación con un grupo de enlaces. */
function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  if (items.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-primary">
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((it) => (
          <DropdownMenuItem key={it.to} asChild>
            <Link to={it.to}>{it.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AppShell() {
  const navigate = useNavigate()
  const { user, rol, isAuthenticated, isAdmin, isMedico, logout } = useAuth()
  const { isDark, toggle } = useTheme()

  async function handleLogout() {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login', { replace: true })
  }

  // Grupos de navegación, filtrados por rol.
  const pacientes: NavItem[] = [
    { to: '/mascotas', label: 'Mascotas' },
    { to: '/citas', label: 'Citas' },
    ...(isMedico ? [{ to: '/historiales', label: 'Historiales' }] : []),
    ...(isAdmin
      ? [
          { to: '/clientes', label: 'Clientes' },
          { to: '/veterinarios', label: 'Veterinarios' },
          { to: '/usuarios', label: 'Usuarios' },
        ]
      : []),
  ]

  const facturacion: NavItem[] = [
    { to: '/facturacion/productos', label: 'Productos' },
    { to: '/facturacion/categorias-producto', label: 'Categorías' },
    { to: '/facturacion/facturas', label: 'Facturas' },
    ...(isAdmin
      ? [
          { to: '/facturacion/proveedores', label: 'Proveedores' },
          { to: '/facturacion/compras', label: 'Compras' },
        ]
      : []),
  ]

  const clinica: NavItem[] = isMedico
    ? [
        { to: '/clinica/vacunas', label: 'Vacunas' },
        { to: '/clinica/recetas', label: 'Recetas' },
        { to: '/clinica/hospitalizaciones', label: 'Hospitalizaciones' },
        ...(isAdmin ? [{ to: '/clinica/habitaciones', label: 'Habitaciones' }] : []),
        { to: '/registros-clinicos', label: 'Registros clínicos' },
      ]
    : []

  return (
    <div className="flex min-h-screen flex-col">
      <PawBackground />
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-bold text-primary">
            <PawPrint className="h-5 w-5" />
            <span className="hidden sm:inline">VetConnect</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />

          {/* Navegación (scroll horizontal si no entra en pantallas chicas) */}
          <nav className="flex flex-1 items-center gap-4 overflow-x-auto">
            <NavLink to="/" end className={navLinkClass}>Inicio</NavLink>
            <NavLink to="/servicios" className={navLinkClass}>Servicios</NavLink>
            <NavLink to="/equipo" className={navLinkClass}>Equipo</NavLink>
            <NavLink to="/contacto" className={navLinkClass}>Contacto</NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/panel" className={navLinkClass}>Panel</NavLink>
                <NavGroup label="Pacientes" items={pacientes} />
                <NavGroup label="Facturación" items={facturacion} />
                <NavGroup label="Clínica" items={clinica} />
                <NavLink to="/notificaciones" className={navLinkClass}>Notificaciones</NavLink>
              </>
            )}
          </nav>

          {/* Acciones del lado derecho */}
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Cambiar tema">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

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
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil"><UserIcon className="mr-2 h-4 w-4" />Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
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

// src/presentation/pages/panel/PanelPage.tsx
import { Link } from 'react-router-dom'
import { PawPrint, CalendarDays, Users, FileText, Stethoscope, Syringe, ClipboardList } from 'lucide-react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { Rol } from '@/domain/enums/rol.enum'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'

interface Acceso {
  to: string
  title: string
  description: string
  icon: typeof PawPrint
  roles: Rol[]
}

/** Accesos del panel. Cada uno declara qué roles pueden verlo. */
const accesos: Acceso[] = [
  {
    to: '/mascotas',
    title: 'Mascotas',
    description: 'Consulta las mascotas registradas.',
    icon: PawPrint,
    roles: [Rol.ADMIN, Rol.DOCTOR, Rol.USUARIO],
  },
  {
    to: '/citas',
    title: 'Citas',
    description: 'Revisa y gestiona las citas.',
    icon: CalendarDays,
    roles: [Rol.ADMIN, Rol.DOCTOR, Rol.USUARIO],
  },
  {
    to: '/historiales',
    title: 'Historiales médicos',
    description: 'Historiales clínicos de las mascotas.',
    icon: Stethoscope,
    roles: [Rol.ADMIN, Rol.DOCTOR],
  },
  {
    to: '/clientes',
    title: 'Clientes',
    description: 'Directorio de clientes.',
    icon: Users,
    roles: [Rol.ADMIN],
  },
  {
    to: '/perfil',
    title: 'Mi perfil',
    description: 'Tus datos de cuenta.',
    icon: FileText,
    roles: [Rol.ADMIN, Rol.DOCTOR, Rol.USUARIO],
  },
  {
    to: '/clinica/vacunas',
    title: 'Vacunas',
    description: 'Registro de vacunas aplicadas.',
    icon: Syringe,
    roles: [Rol.ADMIN, Rol.DOCTOR],
  },
  {
    to: '/clinica/recetas',
    title: 'Recetas',
    description: 'Recetas médicas emitidas.',
    icon: ClipboardList,
    roles: [Rol.ADMIN, Rol.DOCTOR],
  },
]

const rolLabel: Record<Rol, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Doctor',
  USUARIO: 'Cliente',
}

export default function PanelPage() {
  const { user, rol } = useAuth()
  if (!user || !rol) return null

  const visibles = accesos.filter((a) => a.roles.includes(rol))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">Hola, {user.username}</h1>
          <p className="text-muted-foreground">Bienvenido a tu panel de VetConnect.</p>
        </div>
        <Badge variant="secondary">{rolLabel[rol]}</Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <a.icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{a.title}</CardTitle>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

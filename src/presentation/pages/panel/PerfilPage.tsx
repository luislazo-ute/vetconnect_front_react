// src/presentation/pages/panel/PerfilPage.tsx
import { useAuth } from '@/presentation/hooks/useAuth'
import { Rol } from '@/domain/enums/rol.enum'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'

const rolLabel: Record<Rol, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Doctor',
  USUARIO: 'Cliente',
}

export default function PerfilPage() {
  const { user, rol } = useAuth()
  if (!user || !rol) return null

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
          <CardDescription>Datos de tu cuenta en VetConnect.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row label="Usuario" value={user.username} />
          <Separator />
          <Row label="Email" value={user.email} />
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rol</span>
            <Badge variant="secondary">{rolLabel[rol]}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

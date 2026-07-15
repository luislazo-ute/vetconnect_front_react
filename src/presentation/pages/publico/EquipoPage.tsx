// src/presentation/pages/publico/EquipoPage.tsx
import { Mail, Phone, Clock } from 'lucide-react'
import { useVeterinarios } from '@/presentation/hooks/useVeterinarios'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/card'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase()
}

export default function EquipoPage() {
  const { veterinarios, isLoading, error, page, totalPages, goToPage } =
    useVeterinarios()

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Nuestro equipo</h1>
        <p className="text-muted-foreground">
          Conoce a los veterinarios que cuidan de tu mascota.
        </p>
      </header>

      {isLoading ? (
        <LoadingState label="Cargando equipo…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => goToPage(page)} />
      ) : veterinarios.length === 0 ? (
        <EmptyState message="No hay veterinarios registrados" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {veterinarios.map((v) => (
              <Card key={v.id}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{iniciales(v.nombre)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{v.nombre}</CardTitle>
                    <CardDescription>{v.especialidad}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {v.horario_atencion && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {v.horario_atencion}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {v.telefono}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {v.email}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  )
}

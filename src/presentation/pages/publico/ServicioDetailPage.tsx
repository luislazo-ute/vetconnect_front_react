// src/presentation/pages/publico/ServicioDetailPage.tsx
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { useServicioDetalle } from '@/presentation/hooks/useServicioDetalle'
import { formatPrice, toNumber } from '@/presentation/utils/formatters'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { LoadingState, ErrorState } from '@/presentation/components/StateViews'

export default function ServicioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { servicio, isLoading, error } = useServicioDetalle(Number(id))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/servicios">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver a servicios
        </Link>
      </Button>

      {isLoading ? (
        <LoadingState label="Cargando servicio…" />
      ) : error || !servicio ? (
        <ErrorState message={error ?? 'Servicio no encontrado'} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl">{servicio.nombre}</CardTitle>
              {!servicio.is_active && <Badge variant="secondary">No disponible</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {servicio.descripcion || 'Sin descripción.'}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Duración estimada: {servicio.duracion_minutos} minutos
            </div>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(toNumber(servicio.precio))}
            </p>
            <Button asChild className="w-full">
              <Link to="/citas">Agendar una cita</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

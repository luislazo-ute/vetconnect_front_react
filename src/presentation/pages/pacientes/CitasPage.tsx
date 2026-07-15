// src/presentation/pages/pacientes/CitasPage.tsx
import { usePaginatedList } from '@/presentation/hooks/usePaginatedList'
import { citasUseCase } from '@/infrastructure/factories/pacientes.factory'
import { EstadoCita } from '@/domain/entities/cita.entity'
import { formatDate } from '@/presentation/utils/formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table'
import { Badge } from '@/presentation/components/ui/badge'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

/** Variante de color del badge según el estado de la cita. */
function estadoVariant(estado: string): 'default' | 'secondary' | 'destructive' {
  if (estado === EstadoCita.COMPLETADA || estado === EstadoCita.CONFIRMADA) return 'default'
  if (estado === EstadoCita.CANCELADA) return 'destructive'
  return 'secondary'
}

export default function CitasPage() {
  const { items, isLoading, error, page, totalPages, goToPage, reload } =
    usePaginatedList(citasUseCase)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Citas</h1>
        <p className="text-muted-foreground">Agenda de citas de la clínica.</p>
      </header>

      {isLoading ? (
        <LoadingState label="Cargando citas…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay citas registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Veterinario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.mascota_nombre}</TableCell>
                    <TableCell>{c.veterinario_nombre ?? '—'}</TableCell>
                    <TableCell>{formatDate(c.fecha)}</TableCell>
                    <TableCell>{c.hora?.slice(0, 5)}</TableCell>
                    <TableCell className="max-w-xs truncate">{c.motivo || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={estadoVariant(c.estado)}>{c.estado_display}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  )
}

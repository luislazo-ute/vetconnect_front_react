// src/presentation/pages/pacientes/HistorialesPage.tsx
import { usePaginatedList } from '@/presentation/hooks/usePaginatedList'
import { historialesUseCase } from '@/infrastructure/factories/pacientes.factory'
import { formatDate } from '@/presentation/utils/formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

export default function HistorialesPage() {
  const { items, isLoading, error, page, totalPages, goToPage, reload } =
    usePaginatedList(historialesUseCase)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Historiales médicos</h1>
        <p className="text-muted-foreground">Registros clínicos de las mascotas.</p>
      </header>

      {isLoading ? (
        <LoadingState label="Cargando historiales…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay historiales registrados" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Veterinario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead>Tratamiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.mascota_nombre}</TableCell>
                    <TableCell>{h.veterinario_nombre ?? '—'}</TableCell>
                    <TableCell>{formatDate(h.fecha)}</TableCell>
                    <TableCell className="max-w-xs truncate">{h.diagnostico || '—'}</TableCell>
                    <TableCell className="max-w-xs truncate">{h.tratamiento || '—'}</TableCell>
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

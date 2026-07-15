// src/presentation/pages/pacientes/MascotasPage.tsx
import { usePaginatedList } from '@/presentation/hooks/usePaginatedList'
import { mascotasUseCase } from '@/infrastructure/factories/pacientes.factory'
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

export default function MascotasPage() {
  const { items, isLoading, error, page, totalPages, goToPage, reload } =
    usePaginatedList(mascotasUseCase)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Mascotas</h1>
        <p className="text-muted-foreground">Mascotas registradas en la clínica.</p>
      </header>

      {isLoading ? (
        <LoadingState label="Cargando mascotas…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay mascotas registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Dueño</TableHead>
                  <TableHead>Registrada</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nombre}</TableCell>
                    <TableCell>{m.especie_display}</TableCell>
                    <TableCell>{m.raza || '—'}</TableCell>
                    <TableCell>{m.cliente_nombre}</TableCell>
                    <TableCell>{formatDate(m.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={m.is_active ? 'default' : 'secondary'}>
                        {m.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
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

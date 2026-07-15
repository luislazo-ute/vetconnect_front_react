// src/presentation/pages/pacientes/ClientesPage.tsx
import { usePaginatedList } from '@/presentation/hooks/usePaginatedList'
import { clientesUseCase } from '@/infrastructure/factories/pacientes.factory'
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

export default function ClientesPage() {
  const { items, isLoading, error, page, totalPages, goToPage, reload } =
    usePaginatedList(clientesUseCase)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">Directorio de clientes de la clínica.</p>
      </header>

      {isLoading ? (
        <LoadingState label="Cargando clientes…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay clientes registrados" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Registrado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.username}</TableCell>
                    <TableCell>{c.telefono || '—'}</TableCell>
                    <TableCell>{c.direccion || '—'}</TableCell>
                    <TableCell>{formatDate(c.created_at)}</TableCell>
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

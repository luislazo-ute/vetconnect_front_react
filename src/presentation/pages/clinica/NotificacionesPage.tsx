import { toast } from 'sonner'
import { CheckCheck, Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { useNotificaciones } from '@/presentation/hooks/useNotificaciones'
import { formatDate } from '@/presentation/utils/formatters'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/presentation/components/ui/table'
import { Badge } from '@/presentation/components/ui/badge'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

export default function NotificacionesPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, marcarLeida, marcarTodasLeidas } = useNotificaciones()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  async function handleMarcarLeida(id: number) {
    try {
      await marcarLeida(id)
      toast.success('Notificación marcada como leída')
    } catch {
      toast.error('Error al marcar como leída')
    }
  }

  async function handleMarcarTodasLeidas() {
    try {
      await marcarTodasLeidas()
      toast.success('Todas las notificaciones marcadas como leídas')
      reload()
    } catch {
      toast.error('Error al marcar notificaciones')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">Tus notificaciones del sistema.</p>
        </div>
        {items.some((n) => !n.leida) && (
          <Button variant="outline" onClick={handleMarcarTodasLeidas}>
            <CheckCheck className="mr-2 h-4 w-4" />Marcar todas como leídas
          </Button>
        )}
      </header>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar notificación…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando notificaciones…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay notificaciones" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-28">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((n) => (
                  <TableRow key={n.id} className={!n.leida ? 'bg-muted/30' : ''}>
                    <TableCell>
                      {!n.leida && <Bell className="h-4 w-4 text-primary" />}
                    </TableCell>
                    <TableCell className="font-medium">{n.titulo}</TableCell>
                    <TableCell className="max-w-sm truncate">{n.mensaje}</TableCell>
                    <TableCell>{formatDate(n.created_at)}</TableCell>
                    <TableCell>
                      {!n.leida ? (
                        <Button variant="ghost" size="sm" onClick={() => handleMarcarLeida(n.id)}>
                          <CheckCheck className="mr-1 h-4 w-4" />Leída
                        </Button>
                      ) : (
                        <Badge variant="secondary">Leída</Badge>
                      )}
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
import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Eye, X, PlusCircle } from 'lucide-react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useFacturas, type CrearFacturaPayload } from '@/presentation/hooks/useFacturas'
import { useClientesList } from '@/presentation/hooks/useClientesList'
import { useServiciosList } from '@/presentation/hooks/useServiciosList'
import { formatPrice, formatDate, toNumber } from '@/presentation/utils/formatters'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/presentation/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/presentation/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/presentation/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/presentation/components/ui/alert-dialog'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

interface DetalleRow {
  servicio: number
  cantidad: number
  precio_unitario: string
}

interface PagoRow {
  monto: string
  metodo_pago: string
  referencia: string
}

export default function FacturasPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, getDetalles, getPagos } = useFacturas()
  const clientes = useClientesList()
  const servicios = useServiciosList()
  const { isAdmin } = useAuth()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)
  const [detalles, setDetalles] = useState<Awaited<ReturnType<typeof getDetalles>>>([])
  const [pagos, setPagos] = useState<Awaited<ReturnType<typeof getPagos>>>([])
  const [viewId, setViewId] = useState<number | null>(null)

  const [cliente, setCliente] = useState('')
  const [detallesForm, setDetallesForm] = useState<DetalleRow[]>([])
  const [incluirPago, setIncluirPago] = useState(false)
  const [pagoForm, setPagoForm] = useState<PagoRow>({ monto: '', metodo_pago: 'efectivo', referencia: '' })

  const [submitting, setSubmitting] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    setCliente('')
    setDetallesForm([{ servicio: 0, cantidad: 1, precio_unitario: '' }])
    setIncluirPago(false)
    setPagoForm({ monto: '', metodo_pago: 'efectivo', referencia: '' })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    setCliente(String(item.cliente))
    setDetallesForm([])
    setIncluirPago(false)
    setPagoForm({ monto: '', metodo_pago: 'efectivo', referencia: '' })
    setOpen(true)
  }

  async function verDetalles(id: number) {
    setViewId(id)
    const [dets, pgs] = await Promise.all([getDetalles(id), getPagos(id)])
    setDetalles(dets)
    setPagos(pgs)
  }

  function agregarDetalle() {
    setDetallesForm([...detallesForm, { servicio: 0, cantidad: 1, precio_unitario: '' }])
  }

  function quitarDetalle(i: number) {
    setDetallesForm(detallesForm.filter((_, idx) => idx !== i))
  }

  function actualizarDetalle(i: number, field: keyof DetalleRow, value: string | number) {
    const copy = [...detallesForm]
    const updated = { ...copy[i], [field]: value }
    if (field === 'servicio' && typeof value === 'number') {
      const svc = servicios.find((s) => s.id === value)
      if (svc) updated.precio_unitario = svc.precio
    }
    copy[i] = updated
    setDetallesForm(copy)
  }

  async function handleCreate() {
    if (!cliente) { toast.error('Seleccione un cliente'); return }
    const detallesValidos = detallesForm.filter((d) => d.servicio > 0 && d.cantidad > 0 && d.precio_unitario)
    if (detallesValidos.length === 0) { toast.error('Agregue al menos un detalle'); return }

    setSubmitting(true)
    try {
      const payload: CrearFacturaPayload = {
        cliente: Number(cliente),
        detalles: detallesValidos.map((d) => ({
          servicio: d.servicio,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        })),
      }
      if (incluirPago && pagoForm.monto) {
        payload.pago = {
          monto: pagoForm.monto,
          metodo_pago: pagoForm.metodo_pago || 'efectivo',
          referencia: pagoForm.referencia || undefined,
        }
      }
      await create(payload)
      toast.success('Factura creada')
      setOpen(false)
      reload()
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al crear factura')
    } finally { setSubmitting(false) }
  }

  async function handleEdit(data: { cliente: string }) {
    if (!editing) return
    setSubmitting(true)
    try {
      await update(editing.id, { cliente: Number(data.cliente) })
      toast.success('Factura actualizada')
      setOpen(false)
      reload()
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al actualizar')
    } finally { setSubmitting(false) }
  }

  async function handleDelete(id: number) {
    try {
      await remove(id)
      toast.success('Factura eliminada')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al eliminar')
    }
  }

  async function handleTogglePagada(item: typeof items[number]) {
    try {
      await update(item.id, { pagada: !item.pagada })
      toast.success(item.pagada ? 'Factura marcada como no pagada' : 'Factura marcada como pagada')
      reload()
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al actualizar')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Facturas</h1>
          <p className="text-muted-foreground">Gestión de facturación.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />Nueva factura
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar factura' : 'Nueva factura'}</DialogTitle>
              </DialogHeader>
              {editing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleEdit({ cliente }) }} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Cliente</Label>
                    <Select value={cliente} onValueChange={setCliente}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                      <SelectContent>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.id} — {c.username || 'Cliente'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? 'Guardando…' : 'Actualizar'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Cliente</Label>
                    <Select value={cliente} onValueChange={setCliente}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                      <SelectContent>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.id} — {c.username || 'Cliente'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Detalles</Label>
                      <Button type="button" variant="outline" size="sm" onClick={agregarDetalle}>
                        <PlusCircle className="mr-1 h-3 w-3" />Agregar línea
                      </Button>
                    </div>
                    {detallesForm.map((d, i) => (
                      <div key={i} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Servicio</Label>
                          <Select value={String(d.servicio || '')} onValueChange={(v) => actualizarDetalle(i, 'servicio', Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Servicio" /></SelectTrigger>
                            <SelectContent>
                              {servicios.filter((s) => s.is_active).map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.nombre} — {formatPrice(toNumber(s.precio))}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20 space-y-1">
                          <Label className="text-xs">Cant.</Label>
                          <Input type="number" min={1} value={d.cantidad} onChange={(e) => actualizarDetalle(i, 'cantidad', Number(e.target.value))} />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">P. unitario</Label>
                          <Input type="number" step="0.01" value={d.precio_unitario} onChange={(e) => actualizarDetalle(i, 'precio_unitario', e.target.value)} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => quitarDetalle(i)} disabled={detallesForm.length === 1}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input id="incluirPago" type="checkbox" checked={incluirPago} onChange={(e) => setIncluirPago(e.target.checked)} className="h-4 w-4" />
                    <Label htmlFor="incluirPago">Incluir pago</Label>
                  </div>
                  {incluirPago && (
                    <div className="space-y-2 border rounded-md p-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Monto</Label>
                          <Input type="number" step="0.01" value={pagoForm.monto} onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Método</Label>
                          <Select value={pagoForm.metodo_pago} onValueChange={(v) => setPagoForm({ ...pagoForm, metodo_pago: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="efectivo">Efectivo</SelectItem>
                              <SelectItem value="tarjeta">Tarjeta</SelectItem>
                              <SelectItem value="transferencia">Transferencia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Referencia</Label>
                          <Input value={pagoForm.referencia} onChange={(e) => setPagoForm({ ...pagoForm, referencia: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleCreate} disabled={submitting} className="w-full">
                    {submitting ? 'Creando…' : 'Crear factura'}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </header>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar factura…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando facturas…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay facturas registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagada</TableHead>
                  {isAdmin && <TableHead className="w-32">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.id}</TableCell>
                    <TableCell>{f.cliente_username}</TableCell>
                    <TableCell>{formatDate(f.fecha)}</TableCell>
                    <TableCell>{formatPrice(toNumber(f.total))}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Button variant="ghost" size="sm" onClick={() => handleTogglePagada(f)}>
                          <Badge variant={f.pagada ? 'default' : 'secondary'}>
                            {f.pagada ? 'Sí' : 'No'}
                          </Badge>
                        </Button>
                      ) : (
                        <Badge variant={f.pagada ? 'default' : 'secondary'}>
                          {f.pagada ? 'Sí' : 'No'}
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { openEdit(f); setCliente(String(f.cliente)) }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => verDetalles(f.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminarán también todos sus detalles y pagos asociados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(f.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />

          {/* Detalles y pagos */}
          <Dialog open={viewId !== null} onOpenChange={(v) => { if (!v) setViewId(null) }}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader><DialogTitle>Factura #{viewId}</DialogTitle></DialogHeader>
              {detalles.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Detalles</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Cant.</TableHead>
                        <TableHead>P. unitario</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detalles.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>{d.servicio_nombre}</TableCell>
                          <TableCell>{d.cantidad}</TableCell>
                          <TableCell>{formatPrice(toNumber(d.precio_unitario))}</TableCell>
                          <TableCell>{formatPrice(toNumber(d.subtotal))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {detalles.length === 0 && <p className="text-sm text-muted-foreground">Sin detalles</p>}
              {pagos.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Pagos</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Referencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagos.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{formatPrice(toNumber(p.monto))}</TableCell>
                          <TableCell>{formatDate(p.fecha_pago)}</TableCell>
                          <TableCell>{p.metodo_pago}</TableCell>
                          <TableCell>{p.referencia || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

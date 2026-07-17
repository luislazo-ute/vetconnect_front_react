import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Eye, X, PlusCircle } from 'lucide-react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useCompras, type CrearCompraPayload } from '@/presentation/hooks/useCompras'
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
import { useProveedores } from '@/presentation/hooks/useProveedores'
import { useProductos } from '@/presentation/hooks/useProductos'

interface DetalleRow {
  producto: number
  cantidad: number
  precio_unitario: string
}

const ESTADOS = ['pendiente', 'completada', 'cancelada']

export default function ComprasPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, getDetalles } = useCompras()
  const { items: proveedores, reload: reloadProveedores } = useProveedores()
  const { items: productos, reload: reloadProductos } = useProductos()
  const { isAdmin } = useAuth()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)
  const [detalles, setDetalles] = useState<Awaited<ReturnType<typeof getDetalles>>>([])
  const [viewId, setViewId] = useState<number | null>(null)

  const [proveedor, setProveedor] = useState('')
  const [numeroFactura, setNumeroFactura] = useState('')
  const [detallesForm, setDetallesForm] = useState<DetalleRow[]>([])
  const [submitting, setSubmitting] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    setProveedor('')
    setNumeroFactura('')
    setDetallesForm([{ producto: 0, cantidad: 1, precio_unitario: '' }])
    reloadProveedores()
    reloadProductos()
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    setProveedor(String(item.proveedor))
    setNumeroFactura(item.numero_factura || '')
    setDetallesForm([])
    setOpen(true)
  }

  async function verDetalles(id: number) {
    setViewId(id)
    const dets = await getDetalles(id)
    setDetalles(dets)
  }

  function agregarDetalle() {
    setDetallesForm([...detallesForm, { producto: 0, cantidad: 1, precio_unitario: '' }])
  }

  function quitarDetalle(i: number) {
    setDetallesForm(detallesForm.filter((_, idx) => idx !== i))
  }

  function actualizarDetalle(i: number, field: keyof DetalleRow, value: string | number) {
    const copy = [...detallesForm]
    const updated = { ...copy[i], [field]: value }
    if (field === 'producto' && typeof value === 'number') {
      const prod = productos.find((p) => p.id === value)
      if (prod) updated.precio_unitario = prod.precio_venta
    }
    copy[i] = updated
    setDetallesForm(copy)
  }

  async function handleCreate() {
    if (!proveedor) { toast.error('Seleccione un proveedor'); return }
    if (!numeroFactura.trim()) { toast.error('Ingrese el número de factura'); return }
    const detallesValidos = detallesForm.filter((d) => d.producto > 0 && d.cantidad > 0 && d.precio_unitario)
    if (detallesValidos.length === 0) { toast.error('Agregue al menos un detalle'); return }

    setSubmitting(true)
    try {
      const payload: CrearCompraPayload = {
        proveedor: Number(proveedor),
        numero_factura: numeroFactura.trim(),
        detalles: detallesValidos.map((d) => ({
          producto: d.producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        })),
      }
      await create(payload)
      toast.success('Compra creada')
      setOpen(false)
      reload()
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al crear compra')
    } finally { setSubmitting(false) }
  }

  async function handleEdit() {
    if (!editing) return
    setSubmitting(true)
    try {
      await update(editing.id, {
        proveedor: Number(proveedor),
        numero_factura: numeroFactura.trim(),
      })
      toast.success('Compra actualizada')
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
      toast.success('Compra eliminada')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al eliminar')
    }
  }

  async function cambiarEstado(item: typeof items[number], estado: string) {
    try {
      await update(item.id, { estado })
      toast.success(`Estado cambiado a "${estado}"`)
      reload()
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al cambiar estado')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Compras</h1>
          <p className="text-muted-foreground">Gestión de compras a proveedores.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />Nueva compra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar compra' : 'Nueva compra'}</DialogTitle>
              </DialogHeader>
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Proveedor</Label>
                    <Select value={proveedor} onValueChange={setProveedor}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                      <SelectContent>
                        {proveedores.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>N° Factura</Label>
                    <Input value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} />
                  </div>
                  <Button onClick={handleEdit} disabled={submitting} className="w-full">
                    {submitting ? 'Guardando…' : 'Actualizar'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Proveedor</Label>
                      <Select value={proveedor} onValueChange={setProveedor}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                        <SelectContent>
                          {proveedores.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>N° Factura proveedor</Label>
                      <Input value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} placeholder="FC-..." />
                    </div>
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
                          <Label className="text-xs">Producto</Label>
                          <Select value={String(d.producto || '')} onValueChange={(v) => actualizarDetalle(i, 'producto', Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Producto" /></SelectTrigger>
                            <SelectContent>
                              {productos.filter((p) => p.is_active).map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.nombre} — {formatPrice(toNumber(p.precio_venta))}</SelectItem>
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

                  <Button onClick={handleCreate} disabled={submitting} className="w-full">
                    {submitting ? 'Creando…' : 'Crear compra'}
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
          <Input placeholder="Buscar compra…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando compras…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay compras registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>N° Factura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead className="w-40">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.id}</TableCell>
                    <TableCell>{c.proveedor_nombre}</TableCell>
                    <TableCell>{c.numero_factura || '—'}</TableCell>
                    <TableCell>{formatDate(c.fecha_compra)}</TableCell>
                    <TableCell>{formatPrice(toNumber(c.total))}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select value={c.estado} onValueChange={(v) => cambiarEstado(c, v)}>
                          <SelectTrigger className="h-7 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS.map((e) => (
                              <SelectItem key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={c.estado === 'completada' ? 'default' : 'secondary'}>
                          {c.estado}
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { openEdit(c); setProveedor(String(c.proveedor)); setNumeroFactura(c.numero_factura || '') }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => verDetalles(c.id)}>
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
                                <AlertDialogTitle>¿Eliminar compra?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminarán también todos sus detalles asociados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(c.id)}>Eliminar</AlertDialogAction>
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

          <Dialog open={viewId !== null} onOpenChange={(v) => { if (!v) setViewId(null) }}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader><DialogTitle>Compra #{viewId}</DialogTitle></DialogHeader>
              {detalles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cant.</TableHead>
                      <TableHead>P. unitario</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalles.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.producto_nombre}</TableCell>
                        <TableCell>{d.cantidad}</TableCell>
                        <TableCell>{formatPrice(toNumber(d.precio_unitario))}</TableCell>
                        <TableCell>{formatPrice(toNumber(d.subtotal))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Sin detalles</p>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

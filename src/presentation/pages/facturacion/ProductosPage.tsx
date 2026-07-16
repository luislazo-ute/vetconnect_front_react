import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useProductos } from '@/presentation/hooks/useProductos'
import { formatPrice, toNumber } from '@/presentation/utils/formatters'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Badge } from '@/presentation/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/presentation/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/presentation/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/presentation/components/ui/alert-dialog'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  precio_venta: z.string().min(1, 'El precio es obligatorio'),
  stock_actual: z.number().min(0, 'El stock no puede ser negativo'),
  stock_minimo: z.number().min(0, 'El stock mínimo no puede ser negativo'),
  categoria: z.number().min(1, 'Seleccione una categoría'),
  unidad_medida: z.string().optional(),
  is_active: z.boolean().optional(),
})

type ProductoFormData = z.infer<typeof productoSchema>

export default function ProductosPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, submitting } = useProductos()
  const { isAdmin } = useAuth()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    reset({ nombre: '', descripcion: '', precio_venta: '', stock_actual: 0, stock_minimo: 0, categoria: 0, unidad_medida: '', is_active: true })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    reset({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      precio_venta: item.precio_venta,
      stock_actual: item.stock_actual,
      stock_minimo: item.stock_minimo,
      categoria: item.categoria,
      unidad_medida: item.unidad_medida || '',
      is_active: item.is_active,
    })
    setOpen(true)
  }

  async function onSubmit(data: ProductoFormData) {
    try {
      if (editing) {
        await update(editing.id, data)
        toast.success('Producto actualizado')
      } else {
        await create(data)
        toast.success('Producto creado')
      }
      setOpen(false)
      reload()
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al guardar')
    }
  }

  async function handleDelete(id: number) {
    try {
      await remove(id)
      toast.success('Producto eliminado')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestión de productos de la veterinaria.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />Nuevo producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" {...register('nombre')} aria-invalid={!!errors.nombre} />
                  {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea id="descripcion" {...register('descripcion')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="precio_venta">Precio de venta</Label>
                    <Input id="precio_venta" type="number" step="0.01" {...register('precio_venta')} aria-invalid={!!errors.precio_venta} />
                    {errors.precio_venta && <p className="text-xs text-destructive">{errors.precio_venta.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="categoria">ID Categoría</Label>
                    <Input id="categoria" type="number" {...register('categoria', { valueAsNumber: true })} aria-invalid={!!errors.categoria} />
                    {errors.categoria && <p className="text-xs text-destructive">{errors.categoria.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="stock_actual">Stock actual</Label>
                    <Input id="stock_actual" type="number" {...register('stock_actual', { valueAsNumber: true })} aria-invalid={!!errors.stock_actual} />
                    {errors.stock_actual && <p className="text-xs text-destructive">{errors.stock_actual.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="stock_minimo">Stock mínimo</Label>
                    <Input id="stock_minimo" type="number" {...register('stock_minimo', { valueAsNumber: true })} aria-invalid={!!errors.stock_minimo} />
                    {errors.stock_minimo && <p className="text-xs text-destructive">{errors.stock_minimo.message}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unidad_medida">Unidad de medida</Label>
                  <Input id="unidad_medida" placeholder="ej. kg, ml, unidad" {...register('unidad_medida')} />
                </div>
                <div className="flex items-center gap-2">
                  <input id="is_active" type="checkbox" {...register('is_active')} className="h-4 w-4" />
                  <Label htmlFor="is_active">Activo</Label>
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Guardando…' : editing ? 'Actualizar' : 'Crear'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar producto…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando productos…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay productos registrados" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead className="w-24">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>{p.categoria_nombre}</TableCell>
                    <TableCell>{formatPrice(toNumber(p.precio_venta))}</TableCell>
                    <TableCell>{p.stock_actual}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? 'default' : 'secondary'}>
                        {p.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Eliminar</AlertDialogAction>
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
        </>
      )}
    </div>
  )
}

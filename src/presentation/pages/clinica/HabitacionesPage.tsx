import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useHabitaciones } from '@/presentation/hooks/useHabitaciones'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/presentation/components/ui/table'
import { Badge } from '@/presentation/components/ui/badge'
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
import { formatPrice, toNumber } from '@/presentation/utils/formatters'

const habitacionSchema = z.object({
  codigo: z.string().min(2, 'Ingrese el código (ej. H-101)'),
  tipo: z.string().optional(),
  precio_dia: z.string().min(1, 'Ingrese el precio por día'),
  estado: z.string().min(1, 'Ingrese el estado'),
  capacidad: z.number().min(1, 'La capacidad debe ser al menos 1'),
})

type HabitacionFormData = z.infer<typeof habitacionSchema>

export default function HabitacionesPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, submitting } = useHabitaciones()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HabitacionFormData>({
    resolver: zodResolver(habitacionSchema),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    reset({ codigo: '', tipo: '', precio_dia: '', estado: 'disponible', capacidad: 1 })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    reset({
      codigo: item.codigo,
      tipo: item.tipo,
      precio_dia: item.precio_dia,
      estado: item.estado,
      capacidad: item.capacidad,
    })
    setOpen(true)
  }

  async function onSubmit(data: HabitacionFormData) {
    try {
      if (editing) {
        await update(editing.id, data)
        toast.success('Habitación actualizada')
      } else {
        await create(data)
        toast.success('Habitación creada')
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
      toast.success('Habitación eliminada')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al eliminar')
    }
  }

  const estadoColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    disponible: 'default',
    ocupada: 'destructive',
    mantenimiento: 'secondary',
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Habitaciones</h1>
          <p className="text-muted-foreground">Gestión de habitaciones de hospitalización.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />Nueva habitación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar habitación' : 'Nueva habitación'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" placeholder="H-101" {...register('codigo')} aria-invalid={!!errors.codigo} />
                {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="tipo">Tipo</Label>
                <Input id="tipo" placeholder="Individual, UCI…" {...register('tipo')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="precio_dia">Precio por día</Label>
                  <Input id="precio_dia" type="number" step="0.01" placeholder="25.00" {...register('precio_dia')} aria-invalid={!!errors.precio_dia} />
                  {errors.precio_dia && <p className="text-xs text-destructive">{errors.precio_dia.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="capacidad">Capacidad</Label>
                  <Input id="capacidad" type="number" min={1} {...register('capacidad', { valueAsNumber: true })} aria-invalid={!!errors.capacidad} />
                  {errors.capacidad && <p className="text-xs text-destructive">{errors.capacidad.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" placeholder="disponible / ocupada / mantenimiento" {...register('estado')} aria-invalid={!!errors.estado} />
                {errors.estado && <p className="text-xs text-destructive">{errors.estado.message}</p>}
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Guardando…' : editing ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar habitación…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando habitaciones…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay habitaciones registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Precio/día</TableHead>
                  <TableHead>Cap.</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.codigo}</TableCell>
                    <TableCell>{h.tipo || '—'}</TableCell>
                    <TableCell>{formatPrice(toNumber(h.precio_dia))}</TableCell>
                    <TableCell>{h.capacidad}</TableCell>
                    <TableCell>
                      <Badge variant={estadoColor[h.estado] ?? 'outline'}>{h.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(h)}>
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
                              <AlertDialogTitle>¿Eliminar habitación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(h.id)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
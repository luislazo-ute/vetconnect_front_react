import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, DoorOpen } from 'lucide-react'
import { useHospitalizaciones } from '@/presentation/hooks/useHospitalizaciones'
import { formatDate } from '@/presentation/utils/formatters'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Textarea } from '@/presentation/components/ui/textarea'
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

const hospitalizacionSchema = z.object({
  mascota: z.number().min(1, 'Seleccione una mascota'),
  veterinario: z.number().min(1, 'Seleccione un veterinario'),
  habitacion: z.number().min(1, 'Seleccione una habitación'),
  fecha_ingreso: z.string().min(1, 'Ingrese la fecha de ingreso'),
  tratamiento: z.string().min(1, 'Ingrese el tratamiento'),
})

type HospitalizacionFormData = z.infer<typeof hospitalizacionSchema>

export default function HospitalizacionesPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, darAlta, remove, submitting } = useHospitalizaciones()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HospitalizacionFormData>({
    resolver: zodResolver(hospitalizacionSchema),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    reset({ mascota: 0, veterinario: 0, habitacion: 0, fecha_ingreso: '', tratamiento: '' })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    reset({
      mascota: item.mascota,
      veterinario: item.veterinario,
      habitacion: item.habitacion,
      fecha_ingreso: item.fecha_ingreso.slice(0, 10),
      tratamiento: item.tratamiento,
    })
    setOpen(true)
  }

  async function onSubmit(data: HospitalizacionFormData) {
    try {
      if (editing) {
        await update(editing.id, data)
        toast.success('Hospitalización actualizada')
      } else {
        await create(data)
        toast.success('Hospitalización creada')
      }
      setOpen(false)
      reload()
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al guardar')
    }
  }

  async function handleDarAlta(id: number) {
    try {
      await darAlta(id)
      toast.success('Alta registrada')
      reload()
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al dar de alta')
    }
  }

  async function handleDelete(id: number) {
    try {
      await remove(id)
      toast.success('Hospitalización eliminada')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hospitalizaciones</h1>
          <p className="text-muted-foreground">Hospitalizaciones activas e historial.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />Nueva hospitalización
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar hospitalización' : 'Nueva hospitalización'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="mascota">ID Mascota</Label>
                <Input id="mascota" type="number" {...register('mascota', { valueAsNumber: true })} aria-invalid={!!errors.mascota} />
                {errors.mascota && <p className="text-xs text-destructive">{errors.mascota.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="veterinario">ID Veterinario</Label>
                <Input id="veterinario" type="number" {...register('veterinario', { valueAsNumber: true })} aria-invalid={!!errors.veterinario} />
                {errors.veterinario && <p className="text-xs text-destructive">{errors.veterinario.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="habitacion">ID Habitación</Label>
                <Input id="habitacion" type="number" {...register('habitacion', { valueAsNumber: true })} aria-invalid={!!errors.habitacion} />
                {errors.habitacion && <p className="text-xs text-destructive">{errors.habitacion.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha_ingreso">Fecha de ingreso</Label>
                <Input id="fecha_ingreso" type="date" {...register('fecha_ingreso')} aria-invalid={!!errors.fecha_ingreso} />
                {errors.fecha_ingreso && <p className="text-xs text-destructive">{errors.fecha_ingreso.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="tratamiento">Tratamiento</Label>
                <Textarea id="tratamiento" rows={4} {...register('tratamiento')} aria-invalid={!!errors.tratamiento} />
                {errors.tratamiento && <p className="text-xs text-destructive">{errors.tratamiento.message}</p>}
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
          <Input placeholder="Buscar hospitalización…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando hospitalizaciones…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay hospitalizaciones registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Habitación</TableHead>
                  <TableHead>Veterinario</TableHead>
                  <TableHead>Ingreso</TableHead>
                  <TableHead>Alta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-32">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.mascota_nombre}</TableCell>
                    <TableCell>{h.habitacion_codigo}</TableCell>
                    <TableCell>{h.veterinario_nombre}</TableCell>
                    <TableCell>{formatDate(h.fecha_ingreso)}</TableCell>
                    <TableCell>{h.fecha_alta ? formatDate(h.fecha_alta) : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={h.fecha_alta ? 'secondary' : 'default'}>
                        {h.fecha_alta ? 'Dado de alta' : 'Hospitalizado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!h.fecha_alta && (
                          <Button variant="ghost" size="icon" onClick={() => handleDarAlta(h.id)} title="Dar de alta">
                            <DoorOpen className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
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
                              <AlertDialogTitle>¿Eliminar hospitalización?</AlertDialogTitle>
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
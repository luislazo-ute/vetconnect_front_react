import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useVacunas } from '@/presentation/hooks/useVacunas'
import { formatDate } from '@/presentation/utils/formatters'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Textarea } from '@/presentation/components/ui/textarea'
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

const vacunaSchema = z.object({
  mascota: z.number().min(1, 'Seleccione una mascota'),
  nombre_vacuna: z.string().min(2, 'Ingrese el nombre de la vacuna'),
  fecha_aplicacion: z.string().min(1, 'Ingrese la fecha de aplicación'),
  fecha_proxima: z.string().optional(),
  lote: z.string().min(1, 'Ingrese el lote'),
  veterinario: z.number().min(1, 'Seleccione un veterinario'),
  observaciones: z.string().optional(),
})

type VacunaFormData = z.infer<typeof vacunaSchema>

export default function VacunasPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, submitting } = useVacunas()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VacunaFormData>({
    resolver: zodResolver(vacunaSchema),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    reset({ mascota: 0, nombre_vacuna: '', fecha_aplicacion: '', fecha_proxima: '', lote: '', veterinario: 0, observaciones: '' })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    reset({
      mascota: item.mascota,
      nombre_vacuna: item.nombre_vacuna,
      fecha_aplicacion: item.fecha_aplicacion.slice(0, 10),
      fecha_proxima: item.fecha_proxima ? item.fecha_proxima.slice(0, 10) : '',
      lote: item.lote,
      veterinario: item.veterinario,
      observaciones: item.observaciones || '',
    })
    setOpen(true)
  }

  async function onSubmit(data: VacunaFormData) {
    try {
      if (editing) {
        await update(editing.id, data)
        toast.success('Vacuna actualizada')
      } else {
        await create(data)
        toast.success('Vacuna creada')
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
      toast.success('Vacuna eliminada')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vacunas</h1>
          <p className="text-muted-foreground">Registro de vacunas aplicadas.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />Nueva vacuna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar vacuna' : 'Nueva vacuna'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="mascota">ID Mascota</Label>
                <Input id="mascota" type="number" {...register('mascota', { valueAsNumber: true })} aria-invalid={!!errors.mascota} />
                {errors.mascota && <p className="text-xs text-destructive">{errors.mascota.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="nombre_vacuna">Nombre de la vacuna</Label>
                <Input id="nombre_vacuna" {...register('nombre_vacuna')} aria-invalid={!!errors.nombre_vacuna} />
                {errors.nombre_vacuna && <p className="text-xs text-destructive">{errors.nombre_vacuna.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha_aplicacion">Fecha de aplicación</Label>
                <Input id="fecha_aplicacion" type="date" {...register('fecha_aplicacion')} aria-invalid={!!errors.fecha_aplicacion} />
                {errors.fecha_aplicacion && <p className="text-xs text-destructive">{errors.fecha_aplicacion.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha_proxima">Próxima dosis</Label>
                <Input id="fecha_proxima" type="date" {...register('fecha_proxima')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lote">Lote</Label>
                <Input id="lote" {...register('lote')} aria-invalid={!!errors.lote} />
                {errors.lote && <p className="text-xs text-destructive">{errors.lote.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="veterinario">ID Veterinario</Label>
                <Input id="veterinario" type="number" {...register('veterinario', { valueAsNumber: true })} aria-invalid={!!errors.veterinario} />
                {errors.veterinario && <p className="text-xs text-destructive">{errors.veterinario.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea id="observaciones" {...register('observaciones')} />
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
          <Input placeholder="Buscar vacuna…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando vacunas…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay vacunas registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Vacuna</TableHead>
                  <TableHead>Fecha aplicación</TableHead>
                  <TableHead>Próxima dosis</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Veterinario</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.mascota_nombre}</TableCell>
                    <TableCell>{v.nombre_vacuna}</TableCell>
                    <TableCell>{formatDate(v.fecha_aplicacion)}</TableCell>
                    <TableCell>{v.fecha_proxima ? formatDate(v.fecha_proxima) : '—'}</TableCell>
                    <TableCell>{v.lote}</TableCell>
                    <TableCell>{v.veterinario_nombre}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
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
                              <AlertDialogTitle>¿Eliminar vacuna?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(v.id)}>Eliminar</AlertDialogAction>
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

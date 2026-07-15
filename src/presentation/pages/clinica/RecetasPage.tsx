import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useRecetas } from '@/presentation/hooks/useRecetas'
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

const recetaSchema = z.object({
  mascota: z.number().min(1, 'Seleccione una mascota'),
  veterinario: z.number().min(1, 'Seleccione un veterinario'),
  fecha_emision: z.string().min(1, 'Ingrese la fecha de emisión'),
  instrucciones: z.string().min(1, 'Ingrese las instrucciones'),
})

type RecetaFormData = z.infer<typeof recetaSchema>

export default function RecetasPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, submitting } = useRecetas()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RecetaFormData>({
    resolver: zodResolver(recetaSchema),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    reset({ mascota: 0, veterinario: 0, fecha_emision: '', instrucciones: '' })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    reset({
      mascota: item.mascota,
      veterinario: item.veterinario,
      fecha_emision: item.fecha_emision.slice(0, 10),
      instrucciones: item.instrucciones,
    })
    setOpen(true)
  }

  async function onSubmit(data: RecetaFormData) {
    try {
      if (editing) {
        await update(editing.id, data)
        toast.success('Receta actualizada')
      } else {
        await create(data)
        toast.success('Receta creada')
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
      toast.success('Receta eliminada')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recetas</h1>
          <p className="text-muted-foreground">Recetas médicas emitidas.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />Nueva receta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar receta' : 'Nueva receta'}</DialogTitle>
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
                <Label htmlFor="fecha_emision">Fecha de emisión</Label>
                <Input id="fecha_emision" type="date" {...register('fecha_emision')} aria-invalid={!!errors.fecha_emision} />
                {errors.fecha_emision && <p className="text-xs text-destructive">{errors.fecha_emision.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="instrucciones">Instrucciones</Label>
                <Textarea id="instrucciones" rows={4} {...register('instrucciones')} aria-invalid={!!errors.instrucciones} />
                {errors.instrucciones && <p className="text-xs text-destructive">{errors.instrucciones.message}</p>}
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
          <Input placeholder="Buscar receta…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando recetas…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay recetas registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Veterinario</TableHead>
                  <TableHead>Fecha emisión</TableHead>
                  <TableHead>Instrucciones</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.mascota_nombre}</TableCell>
                    <TableCell>{r.veterinario_nombre}</TableCell>
                    <TableCell>{formatDate(r.fecha_emision)}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.instrucciones}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
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
                              <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(r.id)}>Eliminar</AlertDialogAction>
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

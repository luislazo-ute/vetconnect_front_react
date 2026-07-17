// src/presentation/pages/pacientes/VeterinariosPage.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useCrud } from '@/presentation/hooks/useCrud'
import { veterinariosCrudUseCase } from '@/infrastructure/factories/pacientes.factory'
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

const vetSchema = z.object({
  nombre: z.string().min(2, 'Ingrese el nombre'),
  especialidad: z.string().min(2, 'Ingrese la especialidad'),
  telefono: z.string().min(7, 'Ingrese el teléfono'),
  email: z.string().email('Email no válido'),
  horario_atencion: z.string().optional(),
})

type VetFormData = z.infer<typeof vetSchema>

export default function VeterinariosPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, submitting } =
    useCrud(veterinariosCrudUseCase)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VetFormData>({
    resolver: zodResolver(vetSchema),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    reset({ nombre: '', especialidad: '', telefono: '', email: '', horario_atencion: '' })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    reset({
      nombre: item.nombre,
      especialidad: item.especialidad,
      telefono: item.telefono,
      email: item.email,
      horario_atencion: item.horario_atencion,
    })
    setOpen(true)
  }

  async function onSubmit(data: VetFormData) {
    try {
      if (editing) {
        await update(editing.id, data)
        toast.success('Veterinario actualizado')
      } else {
        await create(data)
        toast.success('Veterinario creado')
      }
      setOpen(false)
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al guardar')
    }
  }

  async function handleDelete(id: number) {
    try {
      await remove(id)
      toast.success('Veterinario eliminado')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'No se pudo eliminar (puede estar en uso)')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Veterinarios</h1>
          <p className="text-muted-foreground">Equipo médico de la clínica.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo veterinario</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar veterinario' : 'Nuevo veterinario'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...register('nombre')} aria-invalid={!!errors.nombre} />
                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="especialidad">Especialidad</Label>
                <Input id="especialidad" {...register('especialidad')} aria-invalid={!!errors.especialidad} />
                {errors.especialidad && <p className="text-xs text-destructive">{errors.especialidad.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" {...register('telefono')} aria-invalid={!!errors.telefono} />
                  {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="horario_atencion">Horario de atención</Label>
                <Input id="horario_atencion" placeholder="Lun-Vie 9:00-17:00" {...register('horario_atencion')} />
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
          <Input placeholder="Buscar veterinario…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando veterinarios…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay veterinarios registrados" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.nombre}</TableCell>
                    <TableCell>{v.especialidad}</TableCell>
                    <TableCell>{v.telefono}</TableCell>
                    <TableCell>{v.email}</TableCell>
                    <TableCell>
                      {v.user ? <Badge>Doctor</Badge> : <Badge variant="secondary">Sin cuenta</Badge>}
                    </TableCell>
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
                              <AlertDialogTitle>¿Eliminar veterinario?</AlertDialogTitle>
                              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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

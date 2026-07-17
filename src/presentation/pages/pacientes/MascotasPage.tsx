// src/presentation/pages/pacientes/MascotasPage.tsx
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useCrud } from '@/presentation/hooks/useCrud'
import { useAuth } from '@/presentation/hooks/useAuth'
import { mascotasUseCase, clientesUseCase } from '@/infrastructure/factories/pacientes.factory'
import type { Cliente } from '@/domain/entities/cliente.entity'
import { formatDate } from '@/presentation/utils/formatters'
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/presentation/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/presentation/components/ui/alert-dialog'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

const ESPECIES = ['perro', 'gato', 'ave', 'conejo', 'otro'] as const

const mascotaSchema = z.object({
  nombre: z.string().min(1, 'Ingrese el nombre'),
  especie: z.enum(ESPECIES, { message: 'Seleccione la especie' }),
  raza: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  peso: z.string().optional(),
  cliente: z.number().min(1, 'Seleccione un dueño'),
})

type MascotaFormData = z.infer<typeof mascotaSchema>

export default function MascotasPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, submitting } =
    useCrud(mascotasUseCase)
  const { isAdmin } = useAuth() // mascotas: solo el admin escribe
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])

  // Cargar clientes para el selector de dueño (solo si el admin va a crear).
  useEffect(() => {
    if (!isAdmin) return
    clientesUseCase.list(1, '').then((d) => setClientes(d.results)).catch(() => {})
  }, [isAdmin])

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<MascotaFormData>({
    resolver: zodResolver(mascotaSchema),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    reset({ nombre: '', especie: 'perro', raza: '', fecha_nacimiento: '', peso: '', cliente: 0 })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    reset({
      nombre: item.nombre,
      especie: item.especie as MascotaFormData['especie'],
      raza: item.raza,
      fecha_nacimiento: item.fecha_nacimiento ?? '',
      peso: item.peso ?? '',
      cliente: item.cliente,
    })
    setOpen(true)
  }

  async function onSubmit(data: MascotaFormData) {
    // Normalizar opcionales vacíos: el backend espera null, no cadena vacía.
    const payload = {
      ...data,
      fecha_nacimiento: data.fecha_nacimiento || null,
      peso: data.peso || null,
    }
    try {
      if (editing) {
        await update(editing.id, payload)
        toast.success('Mascota actualizada')
      } else {
        await create(payload)
        toast.success('Mascota creada')
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
      toast.success('Mascota eliminada')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'No se pudo eliminar (puede estar en uso)')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mascotas</h1>
          <p className="text-muted-foreground">Mascotas registradas en la clínica.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          {isAdmin && (
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva mascota</Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar mascota' : 'Nueva mascota'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...register('nombre')} aria-invalid={!!errors.nombre} />
                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Especie</Label>
                  <Controller
                    control={control}
                    name="especie"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Especie" /></SelectTrigger>
                        <SelectContent>
                          {ESPECIES.map((e) => (
                            <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.especie && <p className="text-xs text-destructive">{errors.especie.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="raza">Raza</Label>
                  <Input id="raza" {...register('raza')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="fecha_nacimiento">Nacimiento</Label>
                  <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input id="peso" type="number" step="0.01" {...register('peso')} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Dueño</Label>
                <Controller
                  control={control}
                  name="cliente"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione el dueño" /></SelectTrigger>
                      <SelectContent>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.username}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cliente && <p className="text-xs text-destructive">{errors.cliente.message}</p>}
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
          <Input placeholder="Buscar mascota…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando mascotas…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay mascotas registradas" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Dueño</TableHead>
                  <TableHead>Registrada</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead className="w-24">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nombre}</TableCell>
                    <TableCell>{m.especie_display}</TableCell>
                    <TableCell>{m.raza || '—'}</TableCell>
                    <TableCell>{m.cliente_nombre}</TableCell>
                    <TableCell>{formatDate(m.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={m.is_active ? 'default' : 'secondary'}>
                        {m.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
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
                                <AlertDialogTitle>¿Eliminar mascota?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(m.id)}>Eliminar</AlertDialogAction>
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

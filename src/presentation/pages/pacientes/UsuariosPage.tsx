// src/presentation/pages/pacientes/UsuariosPage.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useCrud } from '@/presentation/hooks/useCrud'
import { usuariosUseCase } from '@/infrastructure/factories/pacientes.factory'
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/presentation/components/ui/alert-dialog'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

// `password` es opcional en el schema: obligatorio al crear (se valida abajo),
// opcional al editar (si se deja vacío, no se cambia).
const usuarioSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email no válido'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().optional(),
  is_staff: z.boolean().optional(),
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

export default function UsuariosPage() {
  const { items, isLoading, error, page, totalPages, goToPage, setSearch, reload, create, update, remove, submitting } =
    useCrud(usuariosUseCase)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<typeof items[number] | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  function openCreate() {
    setEditing(null)
    reset({ username: '', email: '', first_name: '', last_name: '', password: '', is_staff: false })
    setOpen(true)
  }

  function openEdit(item: typeof items[number]) {
    setEditing(item)
    reset({
      username: item.username,
      email: item.email,
      first_name: item.first_name,
      last_name: item.last_name,
      password: '',
      is_staff: item.is_staff,
    })
    setOpen(true)
  }

  async function onSubmit(data: UsuarioFormData) {
    if (!editing && !data.password) {
      toast.error('La contraseña es obligatoria al crear un usuario')
      return
    }
    // Al editar sin cambiar la contraseña, no la enviamos.
    const payload = { ...data }
    if (editing && !data.password) delete payload.password

    try {
      if (editing) {
        await update(editing.id, payload)
        toast.success('Usuario actualizado')
      } else {
        await create(payload)
        toast.success('Usuario creado')
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
      toast.success('Usuario eliminado')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'No se pudo eliminar (puede estar en uso)')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Cuentas del sistema. Solo administradores.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo usuario</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="username">Usuario</Label>
                  <Input id="username" {...register('username')} aria-invalid={!!errors.username} />
                  {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input id="first_name" {...register('first_name')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input id="last_name" {...register('last_name')} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">
                  Contraseña {editing && <span className="text-muted-foreground">(dejar vacío para no cambiar)</span>}
                </Label>
                <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('is_staff')} className="h-4 w-4" />
                Es administrador (is_staff)
              </label>
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
          <Input placeholder="Buscar usuario…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando usuarios…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay usuarios" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge variant="secondary">{u.rol}</Badge></TableCell>
                    <TableCell>{formatDate(u.date_joined)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
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
                              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(u.id)}>Eliminar</AlertDialogAction>
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

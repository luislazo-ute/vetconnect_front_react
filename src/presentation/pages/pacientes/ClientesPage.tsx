// src/presentation/pages/pacientes/ClientesPage.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useClientes } from '@/presentation/hooks/useClientes'
import { formatDate } from '@/presentation/utils/formatters'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/presentation/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/presentation/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/presentation/components/ui/alert-dialog'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'
import type { Cliente } from '@/domain/entities/cliente.entity'

// Crear cliente = crear cuenta + datos de contacto (2 pasos en el hook).
const crearSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  telefono: z.string().min(7, 'Ingrese el teléfono'),
  direccion: z.string().optional(),
})
type CrearFormData = z.infer<typeof crearSchema>

// Editar solo toca los datos de contacto (no la cuenta).
const editarSchema = z.object({
  telefono: z.string().min(7, 'Ingrese el teléfono'),
  direccion: z.string().optional(),
})
type EditarFormData = z.infer<typeof editarSchema>

export default function ClientesPage() {
  const { items, isLoading, error, page, totalPages, goToPage, reload, create, update, remove, submitting } =
    useClientes()
  const [openCreate, setOpenCreate] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)

  const crearForm = useForm<CrearFormData>({ resolver: zodResolver(crearSchema) })
  const editarForm = useForm<EditarFormData>({ resolver: zodResolver(editarSchema) })

  function startCreate() {
    crearForm.reset({ username: '', email: '', password: '', telefono: '', direccion: '' })
    setOpenCreate(true)
  }

  function startEdit(c: Cliente) {
    setEditing(c)
    editarForm.reset({ telefono: c.telefono, direccion: c.direccion })
  }

  async function onCreate(data: CrearFormData) {
    try {
      await create(data)
      toast.success('Cliente creado')
      setOpenCreate(false)
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al crear el cliente')
    }
  }

  async function onEdit(data: EditarFormData) {
    if (!editing) return
    try {
      await update(editing.id, data)
      toast.success('Cliente actualizado')
      setEditing(null)
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'Error al actualizar')
    }
  }

  async function handleDelete(id: number) {
    try {
      await remove(id)
      toast.success('Cliente eliminado')
    } catch (err) {
      const e = err as { detail?: string }
      toast.error(e.detail ?? 'No se pudo eliminar (puede estar en uso)')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Directorio de clientes de la clínica.</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Nuevo cliente</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo cliente</DialogTitle>
              <DialogDescription>Se crea una cuenta de usuario y sus datos de contacto.</DialogDescription>
            </DialogHeader>
            <form onSubmit={crearForm.handleSubmit(onCreate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="c_username">Usuario</Label>
                  <Input id="c_username" {...crearForm.register('username')} />
                  {crearForm.formState.errors.username && <p className="text-xs text-destructive">{crearForm.formState.errors.username.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c_email">Email</Label>
                  <Input id="c_email" type="email" {...crearForm.register('email')} />
                  {crearForm.formState.errors.email && <p className="text-xs text-destructive">{crearForm.formState.errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="c_password">Contraseña</Label>
                <Input id="c_password" type="password" autoComplete="new-password" {...crearForm.register('password')} />
                {crearForm.formState.errors.password && <p className="text-xs text-destructive">{crearForm.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="c_telefono">Teléfono</Label>
                <Input id="c_telefono" {...crearForm.register('telefono')} />
                {crearForm.formState.errors.telefono && <p className="text-xs text-destructive">{crearForm.formState.errors.telefono.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="c_direccion">Dirección</Label>
                <Input id="c_direccion" {...crearForm.register('direccion')} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Guardando…' : 'Crear cliente'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Diálogo de edición (solo contacto) */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>Actualiza los datos de contacto.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editarForm.handleSubmit(onEdit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="e_telefono">Teléfono</Label>
              <Input id="e_telefono" {...editarForm.register('telefono')} />
              {editarForm.formState.errors.telefono && <p className="text-xs text-destructive">{editarForm.formState.errors.telefono.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="e_direccion">Dirección</Label>
              <Input id="e_direccion" {...editarForm.register('direccion')} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Guardando…' : 'Actualizar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <LoadingState label="Cargando clientes…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState message="No hay clientes registrados" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.username}</TableCell>
                    <TableCell>{c.telefono || '—'}</TableCell>
                    <TableCell>{c.direccion || '—'}</TableCell>
                    <TableCell>{formatDate(c.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(c)}>
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
                              <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará también su cuenta de usuario. Esta acción no se puede deshacer.
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

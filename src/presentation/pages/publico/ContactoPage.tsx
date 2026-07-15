// src/presentation/pages/publico/ContactoPage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Phone, Mail, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Textarea } from '@/presentation/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/card'

const contactoSchema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre'),
  email: z.string().min(1, 'El email es obligatorio').email('Email no válido'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

type ContactoFormData = z.infer<typeof contactoSchema>

export default function ContactoPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactoFormData>({ resolver: zodResolver(contactoSchema) })

  async function onSubmit(_data: ContactoFormData) {
    // No hay endpoint de contacto en la API: simulamos el envío y confirmamos.
    await new Promise((r) => setTimeout(r, 600))
    toast.success('Mensaje enviado. Te responderemos pronto.')
    reset()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold">Contáctanos</h1>
          <p className="text-muted-foreground">
            ¿Tienes dudas? Escríbenos y te responderemos a la brevedad.
          </p>
        </header>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            Av. Principal y calle 12, Quito, Ecuador
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            +593 2 123 4567
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            contacto@vetconnect.ec
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Envíanos un mensaje</CardTitle>
          <CardDescription>Completa el formulario y te contactaremos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" aria-invalid={!!errors.nombre} {...register('nombre')} />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea
                id="mensaje"
                rows={4}
                aria-invalid={!!errors.mensaje}
                {...register('mensaje')}
              />
              {errors.mensaje && (
                <p className="text-xs text-destructive">{errors.mensaje.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

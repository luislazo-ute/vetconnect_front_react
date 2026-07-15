// src/presentation/pages/publico/HomePage.tsx
import { Link } from 'react-router-dom'
import { PawPrint, Stethoscope, Syringe, CalendarCheck } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
// Imágenes empaquetadas en el bundle (Vite las importa como URL) — no enlazadas de la web.
import mascotasGrupo from '@/assets/images/mascotas-grupo.png'
import gatoCurioso from '@/assets/images/gato-curioso.png'

const features = [
  {
    icon: Stethoscope,
    title: 'Atención integral',
    description: 'Consultas, cirugías y control de salud para tu mascota.',
  },
  {
    icon: Syringe,
    title: 'Vacunación',
    description: 'Planes de vacunación al día y recordatorios.',
  },
  {
    icon: CalendarCheck,
    title: 'Citas en línea',
    description: 'Agenda tu cita cuando quieras desde tu cuenta.',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="grid items-center gap-8 py-8 md:grid-cols-2">
        <div className="flex flex-col items-start gap-6 text-left">
          <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <PawPrint className="h-4 w-4" />
            Clínica veterinaria
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Cuidamos a quien más quieres
          </h1>
          <p className="max-w-xl text-muted-foreground">
            VetConnect conecta a tu mascota con los mejores profesionales.
            Agenda, consulta y lleva el historial de salud en un solo lugar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/servicios">Ver servicios</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/registro">Crear cuenta</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src={mascotasGrupo}
            alt="Grupo de mascotas: perros, gatos, un conejo y un ave"
            className="w-full max-w-md object-contain"
            loading="eager"
          />
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <f.icon className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>{f.title}</CardTitle>
              <CardDescription>{f.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* CTA con imagen del gatito asomándose */}
      <section className="overflow-hidden rounded-lg bg-primary/10">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="px-6 py-12 text-center md:text-left">
            <h2 className="text-2xl font-semibold">¿Listo para empezar?</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground md:mx-0">
              Conoce a nuestro equipo de veterinarios o escríbenos si tienes dudas.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button asChild variant="outline">
                <Link to="/equipo">Nuestro equipo</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contacto">Contacto</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src={gatoCurioso}
              alt="Gatito curioso asomándose"
              className="w-full max-w-xs object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

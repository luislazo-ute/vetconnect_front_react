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
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex items-center gap-2 rounded-full bg-primary p-4 text-primary-foreground">
          <PawPrint className="h-8 w-8" />
        </div>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Cuidamos a quien más quieres
        </h1>
        <p className="max-w-xl text-muted-foreground">
          VetConnect es la clínica veterinaria que conecta a tu mascota con los
          mejores profesionales. Agenda, consulta y lleva el historial de salud
          en un solo lugar.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/servicios">Ver servicios</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/registro">Crear cuenta</Link>
          </Button>
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

      {/* CTA */}
      <section className="rounded-lg bg-muted/50 px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold">¿Listo para empezar?</h2>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
          Conoce a nuestro equipo de veterinarios o escríbenos si tienes dudas.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/equipo">Nuestro equipo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contacto">Contacto</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

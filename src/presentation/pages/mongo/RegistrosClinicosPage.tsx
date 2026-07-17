// src/presentation/pages/mongo/RegistrosClinicosPage.tsx
import { useState } from 'react'
import { Database, Image, Stethoscope, Activity, Mic, MapPin } from 'lucide-react'
import {
  galeriaUseCase,
  consultasMongoUseCase,
  monitoreoUseCase,
  notasVozUseCase,
  trackingUseCase,
} from '@/infrastructure/factories/mongo.factory'
import { useMongoColeccion } from '@/presentation/hooks/useMongoColeccion'
import { formatDate } from '@/presentation/utils/formatters'
import { cn } from '@/presentation/utils/cn'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/presentation/components/ui/table'
import { Badge } from '@/presentation/components/ui/badge'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

// Las fotos de la galería en Mongo guardan rutas de assets del móvil
// (ej. "assets/images/mascotas/perro1.jpg"). Empaquetamos esas mismas imágenes
// en el proyecto y las resolvemos por nombre de archivo (cumple la regla de no
// enlazar imágenes de la web). Vite las incluye en el bundle vía import.meta.glob.
const imagenesMascotas = import.meta.glob<string>(
  '@/assets/images/mascotas/*.jpg',
  { eager: true, import: 'default', query: '?url' },
)

/** Dada una url/ruta de Mongo, devuelve la imagen empaquetada o null. */
function resolverFoto(url?: string): string | null {
  if (!url) return null
  const nombre = url.split('/').pop() // "perro1.jpg"
  const match = Object.entries(imagenesMascotas).find(([ruta]) => ruta.endsWith('/' + nombre))
  return match ? match[1] : null
}

type TabId = 'consultas' | 'monitoreo' | 'notas' | 'tracking' | 'galeria'

const tabs: { id: TabId; label: string; icon: typeof Database }[] = [
  { id: 'consultas', label: 'Consultas', icon: Stethoscope },
  { id: 'monitoreo', label: 'Monitoreo', icon: Activity },
  { id: 'notas', label: 'Notas de voz', icon: Mic },
  { id: 'tracking', label: 'Tracking', icon: MapPin },
  { id: 'galeria', label: 'Galería', icon: Image },
]

export default function RegistrosClinicosPage() {
  const [tab, setTab] = useState<TabId>('consultas')

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Registros clínicos</h1>
          <p className="text-muted-foreground">Datos almacenados en MongoDB (solo lectura).</p>
        </div>
      </header>

      {/* Pestañas */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'consultas' && <ConsultasTab />}
      {tab === 'monitoreo' && <MonitoreoTab />}
      {tab === 'notas' && <NotasTab />}
      {tab === 'tracking' && <TrackingTab />}
      {tab === 'galeria' && <GaleriaTab />}
    </div>
  )
}

function Estado({ children }: { children: React.ReactNode }) {
  return <Badge variant="secondary">{children}</Badge>
}

function ConsultasTab() {
  const { items, isLoading, error } = useMongoColeccion(consultasMongoUseCase)
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!items.length) return <EmptyState message="Sin consultas" />
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mascota</TableHead><TableHead>Síntoma</TableHead>
            <TableHead>Fecha</TableHead><TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c._id}>
              <TableCell>#{c.mascota_id}</TableCell>
              <TableCell className="font-medium">{c.sintoma}</TableCell>
              <TableCell>{formatDate(c.fecha)}</TableCell>
              <TableCell><Estado>{c.estado}</Estado></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function MonitoreoTab() {
  const { items, isLoading, error } = useMongoColeccion(monitoreoUseCase)
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!items.length) return <EmptyState message="Sin registros de monitoreo" />
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mascota</TableHead><TableHead>Temp. (°C)</TableHead>
            <TableHead>Ritmo card.</TableHead><TableHead>Fecha</TableHead><TableHead>Alerta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((m) => (
            <TableRow key={m._id}>
              <TableCell>#{m.mascota_id}</TableCell>
              <TableCell>{m.temperatura}</TableCell>
              <TableCell>{m.ritmo_cardiaco} lpm</TableCell>
              <TableCell>{formatDate(m.timestamp)}</TableCell>
              <TableCell>
                {m.alerta ? <Badge variant="destructive">Alerta</Badge> : <Badge variant="secondary">Normal</Badge>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function NotasTab() {
  const { items, isLoading, error } = useMongoColeccion(notasVozUseCase)
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!items.length) return <EmptyState message="Sin notas de voz" />
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cita</TableHead><TableHead>Transcripción</TableHead><TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((n) => (
            <TableRow key={n._id}>
              <TableCell>#{n.cita_id}</TableCell>
              <TableCell className="max-w-md">{n.transcripcion}</TableCell>
              <TableCell>{formatDate(n.fecha)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TrackingTab() {
  const { items, isLoading, error } = useMongoColeccion(trackingUseCase)
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!items.length) return <EmptyState message="Sin registros de tracking" />
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cita</TableHead><TableHead>Veterinario</TableHead>
            <TableHead>Estado</TableHead><TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => (
            <TableRow key={t._id}>
              <TableCell>#{t.cita_id}</TableCell>
              <TableCell>#{t.veterinario_id}</TableCell>
              <TableCell><Estado>{t.estado}</Estado></TableCell>
              <TableCell>{formatDate(t.fecha)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function GaleriaTab() {
  const { items, isLoading, error } = useMongoColeccion(galeriaUseCase)
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!items.length) return <EmptyState message="Sin álbumes en la galería" />
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((g) => {
        // La colección mezcla dos formas: álbum con `fotos[]` o una sola `url`.
        const urls = g.fotos?.map((f) => f.url) ?? (g.url ? [g.url] : [])
        const fotos = urls.map(resolverFoto).filter((src): src is string => src !== null)
        return (
          <div key={g._id} className="overflow-hidden rounded-lg border">
            {fotos.length > 0 ? (
              <img
                src={fotos[0]}
                alt={g.descripcion || `Mascota ${g.mascota_id}`}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-muted text-muted-foreground">
                <Image className="h-8 w-8" />
              </div>
            )}
            <div className="p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-medium">
                  {g.mascota_nombre ?? `Mascota #${g.mascota_id}`}
                </span>
                <Badge variant="secondary">{urls.length} foto(s)</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{g.descripcion || 'Sin descripción'}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatDate(g.created_at)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

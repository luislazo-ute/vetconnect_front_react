// src/presentation/pages/publico/ServiciosPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Clock } from 'lucide-react'
import { useServicios } from '@/presentation/hooks/useServicios'
import { formatPrice, toNumber } from '@/presentation/utils/formatters'
import { Input } from '@/presentation/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import Pagination from '@/presentation/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/presentation/components/StateViews'

export default function ServiciosPage() {
  const { servicios, isLoading, error, page, totalPages, goToPage, setSearch } =
    useServicios()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(query.trim())
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Nuestros servicios</h1>
        <p className="text-muted-foreground">
          Explora los servicios que ofrecemos para el cuidado de tu mascota.
        </p>
      </header>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar servicio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Cargando servicios…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => goToPage(page)} />
      ) : servicios.length === 0 ? (
        <EmptyState message="No se encontraron servicios" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((s) => (
              <Card key={s.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{s.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {s.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {s.duracion_minutos} min
                  </div>
                  <p className="text-lg font-semibold text-primary">
                    {formatPrice(toNumber(s.precio))}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/servicios/${s.id}`}>Ver detalle</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  )
}

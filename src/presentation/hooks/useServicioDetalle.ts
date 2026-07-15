// src/presentation/hooks/useServicioDetalle.ts
import { useEffect, useState } from 'react'
import { servicioUseCase } from '@/infrastructure/factories/catalogo.factory'
import type { Servicio } from '@/domain/entities/servicio.entity'

/** Carga el detalle de un servicio por id. */
export function useServicioDetalle(id: number) {
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    setIsLoading(true)
    setError(null)
    servicioUseCase
      .getById(id)
      .then((data) => {
        if (activo) setServicio(data)
      })
      .catch((err: { detail?: string }) => {
        if (activo) setError(err.detail ?? 'No se encontró el servicio')
      })
      .finally(() => {
        if (activo) setIsLoading(false)
      })
    return () => {
      activo = false
    }
  }, [id])

  return { servicio, isLoading, error }
}

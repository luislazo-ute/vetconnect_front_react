// src/presentation/hooks/useMongoColeccion.ts
import { useEffect, useState } from 'react'
import type { ArrayListUseCase } from '@/application/use-cases/array-list.use-case'

/** Carga una colección de MongoDB (array plano) con estado de carga/error. */
export function useMongoColeccion<T>(useCase: ArrayListUseCase<T>) {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    setIsLoading(true)
    setError(null)
    useCase
      .list()
      .then((data) => {
        if (activo) setItems(data)
      })
      .catch((err: { detail?: string }) => {
        if (activo) setError(err.detail ?? 'No se pudo cargar la colección')
      })
      .finally(() => {
        if (activo) setIsLoading(false)
      })
    return () => {
      activo = false
    }
  }, [useCase])

  return { items, isLoading, error }
}

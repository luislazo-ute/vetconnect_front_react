// src/presentation/hooks/useVeterinarios.ts
import { useCallback, useEffect, useState } from 'react'
import { veterinarioUseCase } from '@/infrastructure/factories/catalogo.factory'
import type { Veterinario } from '@/domain/entities/veterinario.entity'

const PAGE_SIZE = 10

/** Carga paginada de veterinarios (equipo público). */
export function useVeterinarios() {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPage = useCallback(async (p: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await veterinarioUseCase.list(p)
      setVeterinarios(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudo cargar el equipo')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage(1)
  }, [fetchPage])

  return { veterinarios, isLoading, error, page, totalPages, goToPage: fetchPage }
}

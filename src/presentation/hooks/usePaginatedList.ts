// src/presentation/hooks/usePaginatedList.ts
import { useCallback, useEffect, useState } from 'react'
import type { ListUseCase } from '@/application/use-cases/list.use-case'

const PAGE_SIZE = 10

/**
 * Hook genérico para consumir cualquier ListUseCase<T> paginado.
 * Encapsula estado de carga, error, página actual y búsqueda.
 */
export function usePaginatedList<T>(useCase: ListUseCase<T>) {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')

  const fetchPage = useCallback(
    async (p: number, q: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await useCase.list(p, q)
        setItems(data.results)
        setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
        setPage(p)
        setSearchState(q)
      } catch (err) {
        const e = err as { detail?: string }
        setError(e.detail ?? 'No se pudieron cargar los datos')
      } finally {
        setIsLoading(false)
      }
    },
    [useCase],
  )

  useEffect(() => {
    fetchPage(1, '')
  }, [fetchPage])

  return {
    items,
    isLoading,
    error,
    page,
    totalPages,
    goToPage: (p: number) => fetchPage(p, search),
    setSearch: (q: string) => fetchPage(1, q),
    reload: () => fetchPage(page, search),
  }
}

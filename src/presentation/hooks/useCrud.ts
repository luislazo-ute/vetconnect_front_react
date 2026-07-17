// src/presentation/hooks/useCrud.ts
import { useCallback, useEffect, useState } from 'react'
import type { CrudUseCase } from '@/application/use-cases/crud.use-case'

const PAGE_SIZE = 10

/**
 * Hook genérico de CRUD paginado. Envuelve un CrudUseCase<T> y expone estado de
 * lista + acciones create/update/remove. Las páginas lo consumen en vez de tocar
 * el use-case directamente.
 */
export function useCrud<T extends { id: number }>(useCase: CrudUseCase<T>) {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  async function create(data: Partial<T>) {
    setSubmitting(true)
    try {
      await useCase.create(data)
      await fetchPage(page, search)
    } finally {
      setSubmitting(false)
    }
  }

  async function update(id: number, data: Partial<T>) {
    setSubmitting(true)
    try {
      await useCase.update(id, data)
      await fetchPage(page, search)
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: number) {
    setSubmitting(true)
    try {
      await useCase.delete(id)
      await fetchPage(page, search)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    items,
    isLoading,
    error,
    page,
    totalPages,
    submitting,
    goToPage: (p: number) => fetchPage(p, search),
    setSearch: (q: string) => fetchPage(1, q),
    reload: () => fetchPage(page, search),
    create,
    update,
    remove,
  }
}

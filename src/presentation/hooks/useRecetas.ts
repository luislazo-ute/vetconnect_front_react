import { useCallback, useEffect, useState } from 'react'
import { recetasUseCase } from '@/infrastructure/factories/clinica.factory'
import type { Receta } from '@/domain/entities/receta.entity'

const PAGE_SIZE = 10

export function useRecetas() {
  const [items, setItems] = useState<Receta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPage = useCallback(async (p: number, q: string) => {
    setIsLoading(true); setError(null)
    try {
      const data = await recetasUseCase.list(p, q)
      setItems(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p); setSearchState(q)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudieron cargar las recetas')
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchPage(1, '') }, [fetchPage])

  async function create(data: Partial<Receta>) {
    setSubmitting(true)
    try {
      await recetasUseCase.create(data)
    } finally { setSubmitting(false) }
  }

  async function update(id: number, data: Partial<Receta>) {
    setSubmitting(true)
    try {
      await recetasUseCase.update(id, data)
    } finally { setSubmitting(false) }
  }

  async function remove(id: number) {
    setSubmitting(true)
    try {
      await recetasUseCase.delete(id)
      await fetchPage(page, search)
    } finally { setSubmitting(false) }
  }

  return {
    items, isLoading, error, page, totalPages, submitting,
    goToPage: (p: number) => fetchPage(p, search),
    setSearch: (q: string) => fetchPage(1, q),
    reload: () => fetchPage(page, search),
    create, update, remove,
  }
}

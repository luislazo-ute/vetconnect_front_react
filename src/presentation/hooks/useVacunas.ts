import { useCallback, useEffect, useState } from 'react'
import { vacunasUseCase } from '@/infrastructure/factories/clinica.factory'
import type { Vacuna } from '@/domain/entities/vacuna.entity'

const PAGE_SIZE = 10

export function useVacunas() {
  const [items, setItems] = useState<Vacuna[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPage = useCallback(async (p: number, q: string) => {
    setIsLoading(true); setError(null)
    try {
      const data = await vacunasUseCase.list(p, q)
      setItems(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p); setSearchState(q)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudieron cargar las vacunas')
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchPage(1, '') }, [fetchPage])

  async function create(data: Partial<Vacuna>) {
    setSubmitting(true)
    try {
      await vacunasUseCase.create(data)
    } finally { setSubmitting(false) }
  }

  async function update(id: number, data: Partial<Vacuna>) {
    setSubmitting(true)
    try {
      await vacunasUseCase.update(id, data)
    } finally { setSubmitting(false) }
  }

  async function remove(id: number) {
    setSubmitting(true)
    try {
      await vacunasUseCase.delete(id)
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

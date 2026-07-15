import { useCallback, useEffect, useState } from 'react'
import { habitacionesUseCase } from '@/infrastructure/factories/clinica.factory'
import type { Habitacion } from '@/domain/entities/habitacion.entity'

const PAGE_SIZE = 10

export function useHabitaciones() {
  const [items, setItems] = useState<Habitacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPage = useCallback(async (p: number, q: string) => {
    setIsLoading(true); setError(null)
    try {
      const data = await habitacionesUseCase.list(p, q)
      setItems(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p); setSearchState(q)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudieron cargar las habitaciones')
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchPage(1, '') }, [fetchPage])

  async function create(data: Partial<Habitacion>) {
    setSubmitting(true)
    try {
      await habitacionesUseCase.create(data)
    } finally { setSubmitting(false) }
  }

  async function update(id: number, data: Partial<Habitacion>) {
    setSubmitting(true)
    try {
      await habitacionesUseCase.update(id, data)
    } finally { setSubmitting(false) }
  }

  async function remove(id: number) {
    setSubmitting(true)
    try {
      await habitacionesUseCase.delete(id)
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
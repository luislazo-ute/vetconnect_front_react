import { useCallback, useEffect, useState } from 'react'
import { hospitalizacionesUseCase } from '@/infrastructure/factories/clinica.factory'
import type { Hospitalizacion } from '@/domain/entities/hospitalizacion.entity'

const PAGE_SIZE = 10

export function useHospitalizaciones() {
  const [items, setItems] = useState<Hospitalizacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPage = useCallback(async (p: number, q: string) => {
    setIsLoading(true); setError(null)
    try {
      const data = await hospitalizacionesUseCase.list(p, q)
      setItems(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p); setSearchState(q)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudieron cargar las hospitalizaciones')
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchPage(1, '') }, [fetchPage])

  async function create(data: Partial<Hospitalizacion>) {
    setSubmitting(true)
    try {
      await hospitalizacionesUseCase.create(data)
    } finally { setSubmitting(false) }
  }

  async function update(id: number, data: Partial<Hospitalizacion>) {
    setSubmitting(true)
    try {
      await hospitalizacionesUseCase.update(id, data)
    } finally { setSubmitting(false) }
  }

  async function darAlta(id: number) {
    const ahora = new Date().toISOString()
    return update(id, { fecha_alta: ahora } as Partial<Hospitalizacion>)
  }

  async function remove(id: number) {
    setSubmitting(true)
    try {
      await hospitalizacionesUseCase.delete(id)
      await fetchPage(page, search)
    } finally { setSubmitting(false) }
  }

  return {
    items, isLoading, error, page, totalPages, submitting,
    goToPage: (p: number) => fetchPage(p, search),
    setSearch: (q: string) => fetchPage(1, q),
    reload: () => fetchPage(page, search),
    create, update, darAlta, remove,
  }
}
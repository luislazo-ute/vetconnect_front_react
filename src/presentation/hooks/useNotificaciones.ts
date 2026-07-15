import { useCallback, useEffect, useState } from 'react'
import { notificacionesUseCase, notificacionRepository } from '@/infrastructure/factories/clinica.factory'
import type { Notificacion } from '@/domain/entities/notificacion.entity'

const PAGE_SIZE = 10

export function useNotificaciones() {
  const [items, setItems] = useState<Notificacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')

  const fetchPage = useCallback(async (p: number, q: string) => {
    setIsLoading(true); setError(null)
    try {
      const data = await notificacionesUseCase.list(p, q)
      setItems(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p); setSearchState(q)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudieron cargar las notificaciones')
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchPage(1, '') }, [fetchPage])

  async function marcarLeida(id: number) {
    await notificacionRepository.marcarLeida(id)
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    )
  }

  async function marcarTodasLeidas() {
    await notificacionRepository.marcarTodasLeidas()
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  return {
    items, isLoading, error, page, totalPages,
    goToPage: (p: number) => fetchPage(p, search),
    setSearch: (q: string) => fetchPage(1, q),
    reload: () => fetchPage(page, search),
    marcarLeida, marcarTodasLeidas,
  }
}
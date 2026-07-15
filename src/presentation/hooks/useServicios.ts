// src/presentation/hooks/useServicios.ts
import { useCallback, useEffect, useState } from 'react'
import { servicioUseCase } from '@/infrastructure/factories/catalogo.factory'
import type { Servicio } from '@/domain/entities/servicio.entity'

interface UseServiciosState {
  servicios: Servicio[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  search: string
}

const PAGE_SIZE = 10

/**
 * Encapsula la carga paginada de servicios (público). Las páginas consumen
 * este hook y no tocan el use-case ni el adapter directamente.
 */
export function useServicios() {
  const [state, setState] = useState<UseServiciosState>({
    servicios: [],
    isLoading: true,
    error: null,
    page: 1,
    totalPages: 1,
    search: '',
  })

  const fetchPage = useCallback(async (page: number, search: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const data = await servicioUseCase.list(page, search)
      setState((s) => ({
        ...s,
        servicios: data.results,
        totalPages: Math.max(1, Math.ceil(data.count / PAGE_SIZE)),
        isLoading: false,
        page,
        search,
      }))
    } catch (err) {
      const e = err as { detail?: string }
      setState((s) => ({
        ...s,
        isLoading: false,
        error: e.detail ?? 'No se pudieron cargar los servicios',
      }))
    }
  }, [])

  useEffect(() => {
    fetchPage(1, '')
  }, [fetchPage])

  return {
    ...state,
    goToPage: (page: number) => fetchPage(page, state.search),
    setSearch: (search: string) => fetchPage(1, search),
  }
}

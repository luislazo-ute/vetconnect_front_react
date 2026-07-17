// src/presentation/hooks/useClientes.ts
import { useCallback, useEffect, useState } from 'react'
import { clientesUseCase, usuariosUseCase } from '@/infrastructure/factories/pacientes.factory'
import type { Cliente } from '@/domain/entities/cliente.entity'

const PAGE_SIZE = 10

export interface CrearClientePayload {
  username: string
  email: string
  password: string
  telefono: string
  direccion?: string
}

/**
 * Clientes: la creación es en DOS pasos porque Cliente.user es OneToOne
 * OBLIGATORIO. Primero POST /users/ (crea la cuenta), luego POST /clientes/
 * con ese user id. La edición solo toca teléfono y dirección.
 */
export function useClientes() {
  const [items, setItems] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPage = useCallback(async (p: number, q: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await clientesUseCase.list(p, q)
      setItems(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p)
      setSearchState(q)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudieron cargar los clientes')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchPage(1, '') }, [fetchPage])

  async function create(payload: CrearClientePayload) {
    setSubmitting(true)
    try {
      // Paso 1: crear la cuenta de usuario.
      const user = await usuariosUseCase.create({
        username: payload.username,
        email: payload.email,
        password: payload.password,
      })
      // Paso 2: crear el cliente vinculado a esa cuenta.
      await clientesUseCase.create({
        user: user.id,
        telefono: payload.telefono,
        direccion: payload.direccion ?? '',
      })
      await fetchPage(page, search)
    } finally {
      setSubmitting(false)
    }
  }

  async function update(id: number, data: Partial<Cliente>) {
    setSubmitting(true)
    try {
      await clientesUseCase.update(id, data)
      await fetchPage(page, search)
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: number) {
    setSubmitting(true)
    try {
      await clientesUseCase.delete(id)
      await fetchPage(page, search)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    items, isLoading, error, page, totalPages, submitting,
    goToPage: (p: number) => fetchPage(p, search),
    setSearch: (q: string) => fetchPage(1, q),
    reload: () => fetchPage(page, search),
    create, update, remove,
  }
}

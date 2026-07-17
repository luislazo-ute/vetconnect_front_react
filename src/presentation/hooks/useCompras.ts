import { useCallback, useEffect, useState } from 'react'
import { comprasUseCase, detallesCompraUseCase } from '@/infrastructure/factories/facturacion.factory'
import type { Compra } from '@/domain/entities/compra.entity'
import type { DetalleCompra } from '@/domain/entities/detalle-compra.entity'

const PAGE_SIZE = 10

export interface CrearCompraPayload {
  proveedor: number
  numero_factura: string
  detalles: Array<{ producto: number; cantidad: number; precio_unitario: string }>
}

export function useCompras() {
  const [items, setItems] = useState<Compra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPage = useCallback(async (p: number, q: string) => {
    setIsLoading(true); setError(null)
    try {
      const data = await comprasUseCase.list(p, q)
      setItems(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p); setSearchState(q)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudieron cargar las compras')
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchPage(1, '') }, [fetchPage])

  async function create(payload: CrearCompraPayload) {
    setSubmitting(true)
    try {
      const compra = await comprasUseCase.create({
        proveedor: payload.proveedor,
        numero_factura: payload.numero_factura,
      })
      for (const d of payload.detalles) {
        const subtotal = (d.cantidad * Number(d.precio_unitario)).toFixed(2)
        await detallesCompraUseCase.create({
          compra: compra.id,
          producto: d.producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal,
        })
      }
    } finally { setSubmitting(false) }
  }

  async function update(id: number, data: Partial<Compra>) {
    setSubmitting(true)
    try { await comprasUseCase.update(id, data) } finally { setSubmitting(false) }
  }

  async function remove(id: number) {
    setSubmitting(true)
    try { await comprasUseCase.delete(id); await fetchPage(page, search) } finally { setSubmitting(false) }
  }

  async function getDetalles(compraId: number): Promise<DetalleCompra[]> {
    const data = await detallesCompraUseCase.list(1, '')
    return data.results.filter((d) => d.compra === compraId)
  }

  return {
    items, isLoading, error, page, totalPages, submitting,
    goToPage: (p: number) => fetchPage(p, search),
    setSearch: (q: string) => fetchPage(1, q),
    reload: () => fetchPage(page, search),
    create, update, remove, getDetalles,
  }
}

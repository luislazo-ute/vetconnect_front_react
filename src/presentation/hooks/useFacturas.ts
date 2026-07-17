import { useCallback, useEffect, useState } from 'react'
import { facturasUseCase, detallesFacturaUseCase, pagosUseCase } from '@/infrastructure/factories/facturacion.factory'
import type { Factura } from '@/domain/entities/factura.entity'
import type { DetalleFactura } from '@/domain/entities/detalle-factura.entity'
import type { Pago } from '@/domain/entities/pago.entity'

const PAGE_SIZE = 10

export interface CrearFacturaPayload {
  cliente: number
  detalles: Array<{ servicio: number; cantidad: number; precio_unitario: string }>
  pago?: { monto: string; metodo_pago: string; referencia?: string }
}

export function useFacturas() {
  const [items, setItems] = useState<Factura[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPage = useCallback(async (p: number, q: string) => {
    setIsLoading(true); setError(null)
    try {
      const data = await facturasUseCase.list(p, q)
      setItems(data.results)
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)))
      setPage(p); setSearchState(q)
    } catch (err) {
      const e = err as { detail?: string }
      setError(e.detail ?? 'No se pudieron cargar las facturas')
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchPage(1, '') }, [fetchPage])

  async function create(payload: CrearFacturaPayload) {
    setSubmitting(true)
    try {
      const factura = await facturasUseCase.create({ cliente: payload.cliente })
      for (const d of payload.detalles) {
        const subtotal = (d.cantidad * Number(d.precio_unitario)).toFixed(2)
        await detallesFacturaUseCase.create({
          factura: factura.id,
          servicio: d.servicio,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal,
        })
      }
      if (payload.pago) {
        await pagosUseCase.create({
          factura: factura.id,
          monto: payload.pago.monto,
          metodo_pago: payload.pago.metodo_pago,
          referencia: payload.pago.referencia || '',
        })
      }
    } finally { setSubmitting(false) }
  }

  async function update(id: number, data: Partial<Factura>) {
    setSubmitting(true)
    try { await facturasUseCase.update(id, data) } finally { setSubmitting(false) }
  }

  async function remove(id: number) {
    setSubmitting(true)
    try { await facturasUseCase.delete(id); await fetchPage(page, search) } finally { setSubmitting(false) }
  }

  async function getDetalles(facturaId: number): Promise<DetalleFactura[]> {
    // Filtrar en el backend (?factura=id); traer solo la página 1 global dejaba
    // fuera los detalles de facturas que no estuvieran en esos 10 primeros.
    const data = await detallesFacturaUseCase.list(1, '', { factura: facturaId })
    return data.results
  }

  async function getPagos(facturaId: number): Promise<Pago[]> {
    const data = await pagosUseCase.list(1, '', { factura: facturaId })
    return data.results
  }

  return {
    items, isLoading, error, page, totalPages, submitting,
    goToPage: (p: number) => fetchPage(p, search),
    setSearch: (q: string) => fetchPage(1, q),
    reload: () => fetchPage(page, search),
    create, update, remove, getDetalles, getPagos,
  }
}

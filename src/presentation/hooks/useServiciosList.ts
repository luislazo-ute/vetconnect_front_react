import { useState, useEffect } from 'react'
import { servicioUseCase } from '@/infrastructure/factories/catalogo.factory'
import type { Servicio } from '@/domain/entities/servicio.entity'

export function useServiciosList() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  useEffect(() => {
    servicioUseCase.list(1, '').then((data) => setServicios(data.results)).catch(() => {})
  }, [])
  return servicios
}

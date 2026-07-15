// src/infrastructure/adapters/axios-servicio.repository.ts
import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { ServicioRepository } from '@/domain/ports/servicio.repository'
import type { Servicio } from '@/domain/entities/servicio.entity'
import type { Paginated } from '@/domain/entities/paginated.entity'

export class AxiosServicioRepository implements ServicioRepository {
  async list(page = 1, search?: string): Promise<Paginated<Servicio>> {
    try {
      const { data } = await apiClient.get<Paginated<Servicio>>('/servicios/', {
        params: { page, search: search || undefined },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number): Promise<Servicio> {
    try {
      const { data } = await apiClient.get<Servicio>(`/servicios/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}

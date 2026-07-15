// src/infrastructure/adapters/axios-read.repository.ts
import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { ReadListRepository } from '@/domain/ports/read-repository'
import type { Paginated } from '@/domain/entities/paginated.entity'

/**
 * Adapter Axios genérico de solo lectura. Se instancia con el endpoint
 * (ej. '/mascotas/') y sirve listados paginados con búsqueda opcional.
 */
export class AxiosReadRepository<T> implements ReadListRepository<T> {
  constructor(private readonly endpoint: string) {}

  async list(page = 1, search?: string): Promise<Paginated<T>> {
    try {
      const { data } = await apiClient.get<Paginated<T>>(this.endpoint, {
        params: { page, search: search || undefined },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}

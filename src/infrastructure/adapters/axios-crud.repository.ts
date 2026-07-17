import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { CrudRepository, QueryFilters } from '@/domain/ports/crud-repository'
import type { Paginated } from '@/domain/entities/paginated.entity'

export class AxiosCrudRepository<T> implements CrudRepository<T> {
  constructor(private readonly endpoint: string) {}

  async list(page = 1, search?: string, filters?: QueryFilters): Promise<Paginated<T>> {
    try {
      const { data } = await apiClient.get<Paginated<T>>(this.endpoint, {
        params: { page, search: search || undefined, ...filters },
      })
      return data
    } catch (err) { throw parseApiError(err) }
  }

  async getById(id: number): Promise<T> {
    try {
      const { data } = await apiClient.get<T>(`${this.endpoint}${id}/`)
      return data
    } catch (err) { throw parseApiError(err) }
  }

  async create(payload: Partial<T>): Promise<T> {
    try {
      const { data } = await apiClient.post<T>(this.endpoint, payload)
      return data
    } catch (err) { throw parseApiError(err) }
  }

  async update(id: number, payload: Partial<T>): Promise<T> {
    try {
      const { data } = await apiClient.patch<T>(`${this.endpoint}${id}/`, payload)
      return data
    } catch (err) { throw parseApiError(err) }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}${id}/`)
    } catch (err) { throw parseApiError(err) }
  }
}

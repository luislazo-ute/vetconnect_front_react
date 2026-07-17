// src/infrastructure/adapters/axios-array.repository.ts
import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { ArrayReadRepository } from '@/domain/ports/array-read-repository'

/**
 * Adapter Axios genérico para endpoints que devuelven un array plano
 * (colecciones de MongoDB). Se instancia con el endpoint (ej. '/mongo/consultas/').
 */
export class AxiosArrayRepository<T> implements ArrayReadRepository<T> {
  constructor(private readonly endpoint: string) {}

  async list(): Promise<T[]> {
    try {
      const { data } = await apiClient.get<T[]>(this.endpoint)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}

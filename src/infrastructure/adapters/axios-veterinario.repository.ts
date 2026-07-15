// src/infrastructure/adapters/axios-veterinario.repository.ts
import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { VeterinarioRepository } from '@/domain/ports/veterinario.repository'
import type { Veterinario } from '@/domain/entities/veterinario.entity'
import type { Paginated } from '@/domain/entities/paginated.entity'

export class AxiosVeterinarioRepository implements VeterinarioRepository {
  async list(page = 1, search?: string): Promise<Paginated<Veterinario>> {
    try {
      const { data } = await apiClient.get<Paginated<Veterinario>>('/veterinarios/', {
        params: { page, search: search || undefined },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}

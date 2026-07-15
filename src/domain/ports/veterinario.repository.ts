// src/domain/ports/veterinario.repository.ts
import type { Veterinario } from '../entities/veterinario.entity'
import type { Paginated } from '../entities/paginated.entity'

/** Contrato de acceso a veterinarios. Implementado por el adapter Axios. */
export interface VeterinarioRepository {
  /** Lista paginada de veterinarios. `search` filtra por nombre (?search=). */
  list(page: number, search?: string): Promise<Paginated<Veterinario>>
}

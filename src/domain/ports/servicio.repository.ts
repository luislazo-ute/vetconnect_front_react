// src/domain/ports/servicio.repository.ts
import type { Servicio } from '../entities/servicio.entity'
import type { Paginated } from '../entities/paginated.entity'

/** Contrato de acceso a servicios. Implementado por el adapter Axios. */
export interface ServicioRepository {
  /** Lista paginada de servicios. `search` filtra por nombre (?search=). */
  list(page: number, search?: string): Promise<Paginated<Servicio>>
  /** Detalle de un servicio por id. */
  getById(id: number): Promise<Servicio>
}

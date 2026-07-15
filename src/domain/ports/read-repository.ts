// src/domain/ports/read-repository.ts
import type { Paginated } from '../entities/paginated.entity'

/**
 * Contrato genérico de solo lectura para recursos paginados de DRF.
 * Sirve a cualquier listado que no necesite escritura (mascotas, citas,
 * clientes, historiales...). Los módulos con CRUD completo definen su propio
 * port con create/update/delete.
 */
export interface ReadListRepository<T> {
  list(page: number, search?: string): Promise<Paginated<T>>
}

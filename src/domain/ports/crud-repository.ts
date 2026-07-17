import type { Paginated } from '../entities/paginated.entity'

/** Filtros de query opcionales (ej. { factura: 3 } → ?factura=3). */
export type QueryFilters = Record<string, string | number | boolean>

export interface CrudRepository<T> {
  list(page: number, search?: string, filters?: QueryFilters): Promise<Paginated<T>>
  getById(id: number): Promise<T>
  create(data: Partial<T>): Promise<T>
  update(id: number, data: Partial<T>): Promise<T>
  delete(id: number): Promise<void>
}

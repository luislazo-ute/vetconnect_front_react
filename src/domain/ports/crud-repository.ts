import type { Paginated } from '../entities/paginated.entity'

export interface CrudRepository<T> {
  list(page: number, search?: string): Promise<Paginated<T>>
  getById(id: number): Promise<T>
  create(data: Partial<T>): Promise<T>
  update(id: number, data: Partial<T>): Promise<T>
  delete(id: number): Promise<void>
}

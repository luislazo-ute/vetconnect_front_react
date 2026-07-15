import type { CrudRepository } from '@/domain/ports/crud-repository'
import type { Paginated } from '@/domain/entities/paginated.entity'

export class CrudUseCase<T> {
  constructor(private readonly repo: CrudRepository<T>) {}

  list(page = 1, search?: string): Promise<Paginated<T>> {
    return this.repo.list(page, search)
  }

  getById(id: number): Promise<T> {
    return this.repo.getById(id)
  }

  create(data: Partial<T>): Promise<T> {
    return this.repo.create(data)
  }

  update(id: number, data: Partial<T>): Promise<T> {
    return this.repo.update(id, data)
  }

  delete(id: number): Promise<void> {
    return this.repo.delete(id)
  }
}

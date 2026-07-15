// src/application/use-cases/list.use-case.ts
import type { ReadListRepository } from '@/domain/ports/read-repository'
import type { Paginated } from '@/domain/entities/paginated.entity'

/** Caso de uso genérico de listado paginado de solo lectura. */
export class ListUseCase<T> {
  constructor(private readonly repo: ReadListRepository<T>) {}

  list(page = 1, search?: string): Promise<Paginated<T>> {
    return this.repo.list(page, search)
  }
}

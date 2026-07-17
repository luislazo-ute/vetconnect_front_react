// src/application/use-cases/array-list.use-case.ts
import type { ArrayReadRepository } from '@/domain/ports/array-read-repository'

/** Caso de uso genérico de listado no paginado (colecciones MongoDB). */
export class ArrayListUseCase<T> {
  constructor(private readonly repo: ArrayReadRepository<T>) {}

  list(): Promise<T[]> {
    return this.repo.list()
  }
}

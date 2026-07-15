// src/application/use-cases/servicio.use-case.ts
import type { ServicioRepository } from '@/domain/ports/servicio.repository'
import type { Servicio } from '@/domain/entities/servicio.entity'
import type { Paginated } from '@/domain/entities/paginated.entity'

export class ServicioUseCase {
  constructor(private readonly repo: ServicioRepository) {}

  list(page = 1, search?: string): Promise<Paginated<Servicio>> {
    return this.repo.list(page, search)
  }

  getById(id: number): Promise<Servicio> {
    return this.repo.getById(id)
  }
}

// src/application/use-cases/veterinario.use-case.ts
import type { VeterinarioRepository } from '@/domain/ports/veterinario.repository'
import type { Veterinario } from '@/domain/entities/veterinario.entity'
import type { Paginated } from '@/domain/entities/paginated.entity'

export class VeterinarioUseCase {
  constructor(private readonly repo: VeterinarioRepository) {}

  list(page = 1, search?: string): Promise<Paginated<Veterinario>> {
    return this.repo.list(page, search)
  }
}

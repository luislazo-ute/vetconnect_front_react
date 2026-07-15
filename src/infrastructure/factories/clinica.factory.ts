import { AxiosCrudRepository } from '@/infrastructure/adapters/axios-crud.repository'
import { CrudUseCase } from '@/application/use-cases/crud.use-case'
import type { Vacuna } from '@/domain/entities/vacuna.entity'

export const vacunasUseCase = new CrudUseCase<Vacuna>(
  new AxiosCrudRepository<Vacuna>('/vacunas/'),
)

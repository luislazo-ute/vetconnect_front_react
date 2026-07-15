import { AxiosCrudRepository } from '@/infrastructure/adapters/axios-crud.repository'
import { CrudUseCase } from '@/application/use-cases/crud.use-case'
import type { Vacuna } from '@/domain/entities/vacuna.entity'
import type { Receta } from '@/domain/entities/receta.entity'
import type { Hospitalizacion } from '@/domain/entities/hospitalizacion.entity'

export const vacunasUseCase = new CrudUseCase<Vacuna>(
  new AxiosCrudRepository<Vacuna>('/vacunas/'),
)

export const recetasUseCase = new CrudUseCase<Receta>(
  new AxiosCrudRepository<Receta>('/recetas/'),
)

export const hospitalizacionesUseCase = new CrudUseCase<Hospitalizacion>(
  new AxiosCrudRepository<Hospitalizacion>('/hospitalizaciones/'),
)

// src/infrastructure/factories/mongo.factory.ts
import { AxiosArrayRepository } from '@/infrastructure/adapters/axios-array.repository'
import { ArrayListUseCase } from '@/application/use-cases/array-list.use-case'
import type {
  GaleriaMascota,
  ConsultaMongo,
  MonitoreoMongo,
  NotaVozMongo,
  TrackingMongo,
} from '@/domain/entities/mongo.entity'

export const galeriaUseCase = new ArrayListUseCase<GaleriaMascota>(
  new AxiosArrayRepository<GaleriaMascota>('/mongo/galeria-mascota/'),
)
export const consultasMongoUseCase = new ArrayListUseCase<ConsultaMongo>(
  new AxiosArrayRepository<ConsultaMongo>('/mongo/consultas/'),
)
export const monitoreoUseCase = new ArrayListUseCase<MonitoreoMongo>(
  new AxiosArrayRepository<MonitoreoMongo>('/mongo/monitoreo/'),
)
export const notasVozUseCase = new ArrayListUseCase<NotaVozMongo>(
  new AxiosArrayRepository<NotaVozMongo>('/mongo/notas-voz/'),
)
export const trackingUseCase = new ArrayListUseCase<TrackingMongo>(
  new AxiosArrayRepository<TrackingMongo>('/mongo/tracking/'),
)

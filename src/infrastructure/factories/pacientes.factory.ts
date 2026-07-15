// src/infrastructure/factories/pacientes.factory.ts
import { AxiosReadRepository } from '@/infrastructure/adapters/axios-read.repository'
import { ListUseCase } from '@/application/use-cases/list.use-case'
import type { Mascota } from '@/domain/entities/mascota.entity'
import type { Cita } from '@/domain/entities/cita.entity'
import type { Cliente } from '@/domain/entities/cliente.entity'
import type { Historial } from '@/domain/entities/historial.entity'

/** Casos de uso de listado del módulo de pacientes (solo lectura). */
export const mascotasUseCase = new ListUseCase<Mascota>(
  new AxiosReadRepository<Mascota>('/mascotas/'),
)
export const citasUseCase = new ListUseCase<Cita>(
  new AxiosReadRepository<Cita>('/citas/'),
)
export const clientesUseCase = new ListUseCase<Cliente>(
  new AxiosReadRepository<Cliente>('/clientes/'),
)
export const historialesUseCase = new ListUseCase<Historial>(
  new AxiosReadRepository<Historial>('/historiales/'),
)

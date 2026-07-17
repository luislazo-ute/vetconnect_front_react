// src/infrastructure/factories/pacientes.factory.ts
import { AxiosCrudRepository } from '@/infrastructure/adapters/axios-crud.repository'
import { CrudUseCase } from '@/application/use-cases/crud.use-case'
import type { Mascota } from '@/domain/entities/mascota.entity'
import type { Cita } from '@/domain/entities/cita.entity'
import type { Cliente } from '@/domain/entities/cliente.entity'
import type { Historial } from '@/domain/entities/historial.entity'
import type { Veterinario } from '@/domain/entities/veterinario.entity'
import type { Usuario } from '@/domain/entities/usuario.entity'

/**
 * Casos de uso del módulo de pacientes. Usan CrudUseCase (list + create/update/
 * delete): la escritura la ejerce el ADMIN; el backend bloquea con 403 a los demás.
 */
export const mascotasUseCase = new CrudUseCase<Mascota>(
  new AxiosCrudRepository<Mascota>('/mascotas/'),
)
export const citasUseCase = new CrudUseCase<Cita>(
  new AxiosCrudRepository<Cita>('/citas/'),
)
export const clientesUseCase = new CrudUseCase<Cliente>(
  new AxiosCrudRepository<Cliente>('/clientes/'),
)
export const historialesUseCase = new CrudUseCase<Historial>(
  new AxiosCrudRepository<Historial>('/historiales/'),
)
export const veterinariosCrudUseCase = new CrudUseCase<Veterinario>(
  new AxiosCrudRepository<Veterinario>('/veterinarios/'),
)
export const usuariosUseCase = new CrudUseCase<Usuario>(
  new AxiosCrudRepository<Usuario>('/users/'),
)

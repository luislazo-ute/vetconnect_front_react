// src/infrastructure/factories/catalogo.factory.ts
import { AxiosServicioRepository } from '@/infrastructure/adapters/axios-servicio.repository'
import { AxiosVeterinarioRepository } from '@/infrastructure/adapters/axios-veterinario.repository'
import { ServicioUseCase } from '@/application/use-cases/servicio.use-case'
import { VeterinarioUseCase } from '@/application/use-cases/veterinario.use-case'

/** Singletons de los casos de uso públicos, ya cableados con su adapter Axios. */
export const servicioUseCase = new ServicioUseCase(new AxiosServicioRepository())
export const veterinarioUseCase = new VeterinarioUseCase(
  new AxiosVeterinarioRepository(),
)

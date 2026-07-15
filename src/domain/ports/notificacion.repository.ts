import type { Notificacion } from '../entities/notificacion.entity'
import type { Paginated } from '../entities/paginated.entity'

export interface NotificacionRepository {
  list(page: number, search?: string): Promise<Paginated<Notificacion>>
  marcarLeida(id: number): Promise<void>
  marcarTodasLeidas(): Promise<void>
}
import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { NotificacionRepository } from '@/domain/ports/notificacion.repository'
import type { Notificacion } from '@/domain/entities/notificacion.entity'
import type { Paginated } from '@/domain/entities/paginated.entity'

export class AxiosNotificacionRepository implements NotificacionRepository {
  async list(page = 1, search?: string): Promise<Paginated<Notificacion>> {
    try {
      const { data } = await apiClient.get<Paginated<Notificacion>>('/notificaciones/', {
        params: { page, search: search || undefined },
      })
      return data
    } catch (err) { throw parseApiError(err) }
  }

  async marcarLeida(id: number): Promise<void> {
    try {
      await apiClient.patch(`/notificaciones/${id}/marcar_leida/`)
    } catch (err) { throw parseApiError(err) }
  }

  async marcarTodasLeidas(): Promise<void> {
    try {
      await apiClient.patch('/notificaciones/marcar_todas_leidas/')
    } catch (err) { throw parseApiError(err) }
  }
}
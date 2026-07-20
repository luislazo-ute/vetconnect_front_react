// src/domain/entities/notificacion.entity.ts
export interface Notificacion {
  id: number
  cliente: number | null
  cliente_nombre: string | null
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  created_at: string
}

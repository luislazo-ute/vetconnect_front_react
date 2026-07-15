// src/domain/entities/veterinario.entity.ts
/**
 * Veterinario del equipo (endpoint público /veterinarios/).
 * `user` es opcional: un veterinario sin cuenta vinculada es solo un registro
 * del listado, NO un doctor con acceso al sistema.
 */
export interface Veterinario {
  id: number
  user: number | null
  nombre: string
  especialidad: string
  telefono: string
  email: string
  horario_atencion: string
  is_active: boolean
  created_at: string
}

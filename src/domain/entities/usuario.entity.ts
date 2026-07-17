// src/domain/entities/usuario.entity.ts
import type { Rol } from '@/domain/enums/rol.enum'

/**
 * Usuario del sistema (gestión administrativa, /users/).
 * `password` es write-only: solo se envía al crear/actualizar, nunca llega en las
 * respuestas. `rol` es derivado (read-only).
 */
export interface Usuario {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_active: boolean
  date_joined: string
  rol: Rol
  password?: string
}

// src/domain/entities/logged-user.entity.ts
import type { Rol } from '@/domain/enums/rol.enum'

/**
 * Usuario autenticado. Forma que devuelve el login (dentro de `user`) y el
 * perfil (/users/profile/). `is_staff` solo viene en el login; el perfil no
 * lo incluye, por eso es opcional. La autorización se basa en `rol`.
 */
export interface LoggedUser {
  id: number
  username: string
  email: string
  rol: Rol
  is_staff?: boolean
}

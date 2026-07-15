// src/domain/enums/rol.enum.ts
/**
 * Roles derivados de VetConnect. El backend NO los guarda en una tabla:
 * los calcula al vuelo (config/roles.py) y los envía como string en MAYÚSCULAS
 * en la respuesta del login y del perfil.
 *   - ADMIN   → user.is_staff
 *   - DOCTOR  → el usuario tiene un Veterinario vinculado (OneToOne)
 *   - USUARIO → cualquier otro autenticado
 */
export const Rol = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  USUARIO: 'USUARIO',
} as const

export type Rol = (typeof Rol)[keyof typeof Rol]

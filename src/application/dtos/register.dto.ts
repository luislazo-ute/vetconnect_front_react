// src/application/dtos/register.dto.ts
/**
 * El backend (RegisterSerializer) exige `password2` y valida que coincida
 * con `password`. Lo mandamos aunque el front ya valide la coincidencia con Zod,
 * porque la validación de servidor es la fuente de verdad.
 */
export interface RegisterDto {
  username: string
  email: string
  password: string
  password2: string
}

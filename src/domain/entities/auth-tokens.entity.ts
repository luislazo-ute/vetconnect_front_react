// src/domain/entities/auth-tokens.entity.ts
/** Par de tokens JWT devuelto por el login y el registro. */
export interface AuthTokens {
  access: string
  refresh: string
}

// src/domain/ports/auth.repository.ts
import type { LoggedUser } from '../entities/logged-user.entity'
import type { AuthTokens } from '../entities/auth-tokens.entity'

/** Resultado de un login o registro exitoso. */
export interface AuthSession {
  user: LoggedUser
  tokens: AuthTokens
}

/**
 * Contrato de acceso a datos de autenticación.
 * Ni domain ni application saben si detrás hay Axios, GraphQL o un mock.
 * Implementado por infrastructure/adapters/axios-auth.repository.ts
 */
export interface AuthRepository {
  login(username: string, password: string): Promise<AuthSession>
  register(
    username: string,
    email: string,
    password: string,
    password2: string,
  ): Promise<AuthSession>
  /** Invalida el refresh token en el servidor y limpia los tokens locales. */
  logout(): Promise<void>
  /** Valida la sesión actual contra el servidor. Lanza ApiException si expiró. */
  getCurrentUser(): Promise<LoggedUser>
  /** Lee los tokens persistidos localmente, sin llamar al servidor. */
  getStoredTokens(): AuthTokens | null
  /** Limpia los tokens locales sin llamar al servidor (sesión expirada). */
  clearLocalSession(): void
}

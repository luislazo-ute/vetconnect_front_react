// src/infrastructure/adapters/axios-auth.repository.ts
import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import type { AuthRepository, AuthSession } from '@/domain/ports/auth.repository'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'
import { Rol } from '@/domain/enums/rol.enum'

/**
 * Forma real de la respuesta de /auth/login/ en VetConnect: tokens + usuario
 * anidado (a diferencia del tutorial base, cuyo backend la devolvía plana).
 */
interface RawLoginResponse {
  access: string
  refresh: string
  user: {
    id: number
    username: string
    email: string
    is_staff: boolean
    rol: Rol
  }
}

/**
 * Forma de la respuesta de /auth/register/: el usuario recién creado no trae
 * `rol` (siempre es USUARIO al registrarse) ni distingue permisos.
 */
interface RawRegisterResponse {
  access: string
  refresh: string
  user: {
    id: number
    username: string
    email: string
    is_staff: boolean
  }
}

export class AxiosAuthRepository implements AuthRepository {
  /** POST /auth/login/ — persiste los tokens si la respuesta es exitosa. */
  async login(username: string, password: string): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<RawLoginResponse>('/auth/login/', {
        username,
        password,
      })
      const session: AuthSession = {
        user: data.user,
        tokens: { access: data.access, refresh: data.refresh },
      }
      localTokenStorage.setTokens(session.tokens.access, session.tokens.refresh)
      return session
    } catch (err) {
      throw parseApiError(err)
    }
  }

  /** POST /auth/register/ — crea el usuario (rol USUARIO) y lo autentica. */
  async register(
    username: string,
    email: string,
    password: string,
    password2: string,
  ): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<RawRegisterResponse>(
        '/auth/register/',
        { username, email, password, password2 },
      )
      const user: LoggedUser = {
        ...data.user,
        rol: Rol.USUARIO, // un usuario recién registrado nunca es admin ni doctor
      }
      const session: AuthSession = {
        user,
        tokens: { access: data.access, refresh: data.refresh },
      }
      localTokenStorage.setTokens(session.tokens.access, session.tokens.refresh)
      return session
    } catch (err) {
      throw parseApiError(err)
    }
  }

  /** POST /auth/logout/ — invalida el refresh token en el servidor. */
  async logout(): Promise<void> {
    const refresh = localTokenStorage.getRefreshToken()
    if (refresh) {
      try {
        await apiClient.post('/auth/logout/', { refresh })
      } catch {
        // Si el logout falla (token ya inválido), continuar igualmente:
        // lo importante es limpiar el estado local.
      }
    }
    localTokenStorage.clearTokens()
  }

  /** GET /users/profile/ — valida que el access token actual siga siendo válido. */
  async getCurrentUser(): Promise<LoggedUser> {
    try {
      const { data } = await apiClient.get<LoggedUser>('/users/profile/')
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  getStoredTokens(): AuthTokens | null {
    return localTokenStorage.getTokens()
  }

  clearLocalSession(): void {
    localTokenStorage.clearTokens()
  }
}

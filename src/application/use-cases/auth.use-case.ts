// src/application/use-cases/auth.use-case.ts
import type { AuthRepository, AuthSession } from '@/domain/ports/auth.repository'
import type { LoginDto } from '../dtos/login.dto'
import type { RegisterDto } from '../dtos/register.dto'

/**
 * Orquesta el flujo de autenticación. Depende únicamente del port
 * AuthRepository, nunca de un adapter concreto — la implementación real
 * se le inyecta desde la factory.
 */
export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  login(dto: LoginDto): Promise<AuthSession> {
    return this.authRepository.login(dto.username, dto.password)
  }

  register(dto: RegisterDto): Promise<AuthSession> {
    return this.authRepository.register(
      dto.username,
      dto.email,
      dto.password,
      dto.password2,
    )
  }

  logout(): Promise<void> {
    return this.authRepository.logout()
  }

  /**
   * Intenta restaurar la sesión a partir de los tokens guardados localmente.
   * Devuelve null si no hay tokens o si el access token ya no es válido
   * (en ese caso también limpia la sesión local).
   */
  async restoreSession(): Promise<AuthSession | null> {
    const tokens = this.authRepository.getStoredTokens()
    if (!tokens) return null
    try {
      const user = await this.authRepository.getCurrentUser()
      return { user, tokens }
    } catch {
      this.authRepository.clearLocalSession()
      return null
    }
  }

  /** Limpia la sesión local sin llamar al servidor (usado ante authExpired). */
  clearLocalSession(): void {
    this.authRepository.clearLocalSession()
  }
}

// src/presentation/store/auth.store.ts
import { create } from 'zustand'
import { authUseCase } from '@/infrastructure/factories/auth.factory'
import { AUTH_EXPIRED_EVENT } from '@/infrastructure/http/axios-client'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'

// ─── Tipos del store ────────────────────────────────────────────────────────
interface AuthState {
  /** Usuario autenticado, o null si no hay sesión activa. */
  user: LoggedUser | null
  /** Tokens JWT actuales, o null si no hay sesión. */
  tokens: AuthTokens | null
  /** true mientras hay una operación de red en curso. */
  isLoading: boolean
  /** Mensaje de error del último intento fallido, null si no hay. */
  error: string | null
}

interface AuthActions {
  login(username: string, password: string): Promise<void>
  register(
    username: string,
    email: string,
    password: string,
    password2: string,
  ): Promise<void>
  logout(): Promise<void>
  /** Restaura la sesión guardada. Se llama al montar la app. */
  loadSession(): Promise<void>
  clearError(): void
  /** Limpia la sesión sin llamar al servidor (usado por authExpired). */
  _clearSession(): void
}

// ─── Store ──────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState & AuthActions>((set, get) => {
  // Escuchar el evento authExpired que dispara el interceptor de Axios cuando
  // el refresh token ya no es válido. Se registra una sola vez, al crear el store.
  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_EXPIRED_EVENT, () => {
      get()._clearSession()
    })
  }

  return {
    // ── Estado inicial ──
    user: null,
    tokens: null,
    isLoading: false,
    error: null,

    // ── Acciones ──
    async login(username, password) {
      set({ isLoading: true, error: null })
      try {
        const { user, tokens } = await authUseCase.login({ username, password })
        set({ user, tokens, isLoading: false })
      } catch (err: unknown) {
        const apiErr = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: apiErr.detail ?? apiErr.message ?? 'Error al iniciar sesión',
        })
        throw err
      }
    },

    async register(username, email, password, password2) {
      set({ isLoading: true, error: null })
      try {
        const { user, tokens } = await authUseCase.register({
          username,
          email,
          password,
          password2,
        })
        set({ user, tokens, isLoading: false })
      } catch (err: unknown) {
        const apiErr = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: apiErr.detail ?? apiErr.message ?? 'Error al registrarse',
        })
        throw err
      }
    },

    async logout() {
      set({ isLoading: true })
      await authUseCase.logout()
      set({ user: null, tokens: null, isLoading: false, error: null })
    },

    async loadSession() {
      set({ isLoading: true })
      const session = await authUseCase.restoreSession()
      if (session) {
        set({ user: session.user, tokens: session.tokens, isLoading: false })
      } else {
        set({ user: null, tokens: null, isLoading: false })
      }
    },

    clearError() {
      set({ error: null })
    },

    _clearSession() {
      authUseCase.clearLocalSession()
      set({ user: null, tokens: null, isLoading: false, error: null })
    },
  }
})

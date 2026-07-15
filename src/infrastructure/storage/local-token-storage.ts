// src/infrastructure/storage/local-token-storage.ts
/** Forma de los tokens guardados en localStorage. */
export interface LocalTokens {
  access: string
  refresh: string
}

/** Claves usadas para guardar los tokens. */
const KEYS = {
  ACCESS: 'vetconnect_access',
  REFRESH: 'vetconnect_refresh',
} as const

/**
 * Wrapper tipado sobre localStorage para manejar tokens JWT.
 * El dominio no sabe (ni le importa) si los tokens viven en localStorage,
 * sessionStorage o cookies: eso es un detalle de infraestructura.
 * Todos los métodos son sincrónicos — localStorage es síncrono por spec.
 */
export const localTokenStorage = {
  /** Devuelve ambos tokens si existen, null si falta alguno. */
  getTokens(): LocalTokens | null {
    const access = localStorage.getItem(KEYS.ACCESS)
    const refresh = localStorage.getItem(KEYS.REFRESH)
    if (!access || !refresh) return null
    return { access, refresh }
  },

  /** Persiste el access token y el refresh token. */
  setTokens(access: string, refresh: string): void {
    localStorage.setItem(KEYS.ACCESS, access)
    localStorage.setItem(KEYS.REFRESH, refresh)
  },

  /** Elimina ambos tokens (logout o expiración de sesión). */
  clearTokens(): void {
    localStorage.removeItem(KEYS.ACCESS)
    localStorage.removeItem(KEYS.REFRESH)
  },

  /** Devuelve solo el access token, o null si no existe. */
  getAccessToken(): string | null {
    return localStorage.getItem(KEYS.ACCESS)
  },

  /** Devuelve solo el refresh token, o null si no existe. */
  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.REFRESH)
  },
}

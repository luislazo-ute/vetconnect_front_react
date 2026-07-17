// src/presentation/hooks/useTheme.ts
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'vetconnect_theme'

/** Lee el tema guardado o el preferido por el sistema. */
function getInitialTheme(): Theme {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Maneja el modo claro/oscuro añadiendo la clase `dark` al <html>
 * (que activa las variables de color del tema oscuro en index.css)
 * y persistiendo la elección en localStorage.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(KEY, theme)
  }, [theme])

  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  }
}

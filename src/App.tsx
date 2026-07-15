// src/App.tsx
import AppRouter from './presentation/router/AppRouter'
import { Toaster } from '@/presentation/components/ui/sonner'

export default function App() {
  return (
    <>
      <AppRouter />
      {/* Toasts globales (sonner): éxito/error en toda la app. */}
      <Toaster richColors position="top-right" />
    </>
  )
}

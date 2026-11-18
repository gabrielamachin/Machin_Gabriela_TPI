import { useEffect } from 'react'

import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const checkSession = useAuthStore((estado) => estado.checkSession)

  // Única llamada permitida en useEffect: confirma con /auth/me si la cookie de sesión sigue vigente.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}

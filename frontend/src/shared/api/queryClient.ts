import { QueryClient } from '@tanstack/react-query'

// Instancia única de TanStack Query para toda la aplicación.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 s: evita volver a pedir lo mismo al cambiar de pantalla
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

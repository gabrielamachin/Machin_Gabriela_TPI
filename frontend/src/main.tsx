import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'
import { queryClient } from '@/shared/api/queryClient'

import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No se encontró el elemento #root')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

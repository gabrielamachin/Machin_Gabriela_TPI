import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // El CORS del backend admite solo este origen (FRONTEND_ORIGIN): si el puerto
    // estuviera ocupado, Vite no debe pasarse al siguiente en silencio.
    port: 5173,
    strictPort: true,
  },
})

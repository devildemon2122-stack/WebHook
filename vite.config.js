import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Mock backend for save API; change target to your real API later
      '/api/webhooks/save': {
        target: 'http://localhost:3030',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
}) 
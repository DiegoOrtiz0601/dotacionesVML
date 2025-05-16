import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 👈 necesario para usar 'path.resolve'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 aquí defines @ como src/
    },
  },
  plugins: [react()],
})

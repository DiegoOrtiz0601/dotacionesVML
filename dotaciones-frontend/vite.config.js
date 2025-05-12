import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true, // 👈 esto hace que no salte de puerto
  },
  plugins: [react()],
})

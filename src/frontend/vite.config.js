import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration de l'outil qui fait tourner et construit le frontend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})

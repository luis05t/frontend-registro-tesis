import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Habilita escuchar en IP pública/túnel
    allowedHosts: [
        '.app.github.dev', 
        '.github.dev', 
        'localhost'
    ] // Permite los dominios de los túneles de GitHub
  }
})
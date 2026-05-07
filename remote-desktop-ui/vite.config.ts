import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/hubs': {
        target: 'https://localhost:7228',
        ws: true,
        secure: false
      }
    }
  }
})
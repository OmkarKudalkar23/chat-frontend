import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    host: true, // allow access from network
    port: 5173, 
    strictPort: false,
    allowedHosts: ['untailed-savorily-finn.ngrok-free.dev'], // 🚀 add your ngrok URL here
  },
})

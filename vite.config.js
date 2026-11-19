import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { apiServerPlugin } from './server/apiPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    apiServerPlugin()
  ],
  server: {
    host: '0.0.0.0', // Memungkinkan akses dari HP di jaringan yang sama (Wi-Fi / Hotspot)
    port: 5173,
    cors: true,
    allowedHosts: true // Mengizinkan akses dari tunnel publik seperti ngrok, Cloudflare Tunnel, dll.
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
})

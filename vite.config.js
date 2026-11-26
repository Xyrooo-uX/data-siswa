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
    host: '0.0.0.0',  
    port: 5173,
    cors: true,
    allowedHosts: true 
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
})

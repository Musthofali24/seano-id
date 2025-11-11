import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // biar bisa diakses dari luar container/PC
    port: 5173, // port default vite
    strictPort: true // kalau 5173 dipakai jangan auto ganti ke 5174
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js into its own chunk (lazy load)
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          // Separate vendor libraries
          vendor: ['react', 'react-dom']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  }
})

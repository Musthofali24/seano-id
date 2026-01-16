import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    commonjs({
      filter(id) {
        // Transform react-flight-indicators and its dependencies
        if (id.includes('react-flight-indicators')) {
          return true
        }
        return false
      }
    })
  ],
  server: {
    host: '0.0.0.0', // biar bisa diakses dari luar container/PC
    port: 5173, // port default vite
    strictPort: true, // kalau 5173 dipakai jangan auto ganti ke 5174
    allowedHosts: ['seano.cloud']
  },
  optimizeDeps: {
    include: ['react-flight-indicators'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  assetsInclude: ['**/*.svg'],
  build: {
    commonjsOptions: {
      include: [/react-flight-indicators/, /node_modules/],
      transformMixedEsModules: true
    },
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

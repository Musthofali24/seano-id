import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    commonjs({
      filter (id) {
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
        // Optimize chunk size
        manualChunks: undefined,
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimize build - use esbuild (faster & built-in)
    minify: 'esbuild',
    // Better CSS handling
    cssCodeSplit: true,
    cssMinify: true,
    // Reduce chunk size for better mobile performance
    chunkSizeWarningLimit: 400,
    // No sourcemaps for production
    sourcemap: false,
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Enable module preload polyfill
    modulePreload: {
      polyfill: true
    },
    // Aggressive tree shaking
    reportCompressedSize: false
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build Optimization
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animation: ['framer-motion', 'react-type-animation'],
          ui: ['react-icons', 'react-hot-toast', '@hello-pangea/dnd'],
          utils: ['axios']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // Server Configuration
  server: {
    allowedHosts: true,
    host: true,
    port: 3000,
    open: true, // Automatically open browser
    cors: true
  },
  
  // Preview Configuration (Production Preview)
  preview: {
    host: true,
    port: 3000,
    allowedHosts: true
  },
  
  // Environment Variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  
  // CSS Optimization
  css: {
    devSourcemap: false,
    postcss: './postcss.config.js'
  },
  
  // Base Path (if deploying to subdirectory)
  base: './',
  
  // Optimize Dependency Pre-Bundling
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'framer-motion',
      'axios'
    ],
    exclude: ['@hello-pangea/dnd']
  }
})
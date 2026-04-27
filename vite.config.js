import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

const functionsApiTarget =
  process.env.VITE_FUNCTIONS_API_TARGET ||
  'http://127.0.0.1:5001/my-univen-project/us-central1/apiRouter'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('firebase')) {
            return 'firebase'
          }

          if (id.includes('react-router')) {
            return 'router'
          }

          if (id.includes('@fortawesome') || id.includes('react-icons')) {
            return 'icons'
          }

          if (id.includes('react')) {
            return 'react-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: functionsApiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

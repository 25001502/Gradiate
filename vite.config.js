import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const functionsApiTarget =
    env.VITE_FUNCTIONS_API_TARGET ||
    'http://127.0.0.1:5001/my-univen-project/us-central1/apiRouter'

  return {
    plugins: [react(),tailwindcss(),],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined
            }

            if (id.includes('firebase/auth')) {
              return 'firebase-auth'
            }

            if (id.includes('firebase/firestore')) {
              return 'firebase-firestore'
            }

            if (id.includes('firebase')) {
              return 'firebase-core'
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
  }
})

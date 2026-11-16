import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the build works on GitHub Pages
// whatever the repository name is. Routing uses a HashRouter for the same reason.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // In dev, /api is proxied to the Spring backend to avoid CORS issues.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 8080,
    strictPort: false,
    proxy: {
      // Proxy /api/* → PHP backend running under XAMPP
      // e.g. /api/auth/login  →  http://localhost/Backend/auth/login
      // Apache .htaccess then rewrites that to index.php?route=auth/login
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/Backend'),
      },
      // Proxy /uploads/* → backend uploads folder
      // e.g. /uploads/profiles/avatar.png  →  http://localhost/Backend/uploads/profiles/avatar.png
      '/uploads': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uploads/, '/Backend/uploads'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'

export default defineConfig(() => {
  const proxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [react(), dynamicImport()],
    assetsInclude: ['**/*.md'],
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'build',
    },
  }
})

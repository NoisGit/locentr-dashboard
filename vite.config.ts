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
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined

            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) {
              return 'react-vendor'
            }

            if (/[\\/]node_modules[\\/](apexcharts|react-apexcharts)[\\/]/.test(id)) {
              return 'charts-vendor'
            }

            if (/[\\/]node_modules[\\/](gsap|@gsap|framer-motion)[\\/]/.test(id)) {
              return 'motion-vendor'
            }

            if (
              /[\\/]node_modules[\\/](@floating-ui|react-select|react-modal|simplebar-core|simplebar-react)[\\/]/.test(id)
            ) {
              return 'ui-vendor'
            }

            if (/[\\/]node_modules[\\/](@tanstack|react-hook-form|@hookform|zod)[\\/]/.test(id)) {
              return 'forms-vendor'
            }

            if (/[\\/]node_modules[\\/](swr|axios|zustand)[\\/]/.test(id)) {
              return 'data-vendor'
            }

            return undefined
          },
        },
      },
    },
  }
})

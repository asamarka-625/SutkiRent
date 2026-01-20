import { defineConfig } from 'vite'
import { resolve } from 'path';
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  svgr({
    svgrOptions: {
      // Настройки SVGR (опционально)
      icon: true,
      svgo: true,
    },
  }),
  ],
  server: {
    host: '0.0.0.0', // Слушаем на всех интерфейсах (для Docker)
    port: 3000,
    open: false, // Не открываем браузер автоматически в Docker
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'sutki.rent',
      'www.sutki.rent'
    ],
    // Оптимизация для production-like нагрузки
    hmr: {
      port: 3001, // отдельный порт для HMR
    },
    watch: {
      usePolling: false, // отключаем polling для лучшей производительности
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    fs: {
      strict: true
    }
  },
  optimizeDeps: {
    // Добавьте эту библиотеку в список для обязательной пред-оптимизации
    include: ['@tabler/icons-react'],
    // Можно также исключить её из преобразований esbuild, если это вызывает проблемы
    // exclude: ['@tabler/icons-react']
  },
  publicDir: 'public',
  build: {
    rollupOptions: {
    },
    outDir: 'build',
  },
})

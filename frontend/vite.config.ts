import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        svgo: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0', // Слушаем на всех интерфейсах (для Docker)
    port: 3000,
    open: false,
    strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1', 'sutki.rent', 'www.sutki.rent'],
    hmr: {
      port: 3001,
    },
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
    fs: {
      strict: true,
    },
  },
  optimizeDeps: {
    include: ['@tabler/icons-react'],
  },
  publicDir: 'public',
  // В production убираем console.* и debugger из бандла.
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1200,
    // Ручное разбиение по чанкам убрано: разделение React и react-dom по разным
    // чанкам ломало инициализацию в рантайме (React.Children у undefined).
    // Код-сплиттинг безопаснее делать ленивой загрузкой маршрутов (React.lazy) —
    // это отдельная задача.
  },
}))

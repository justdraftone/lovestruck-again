import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Vercel serves brotli, so Rollup's gzip estimate is both misleading and
    // several seconds of build time.
    reportCompressedSize: false,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 250,
    rollupOptions: {
      output: {
        // Only split what is genuinely long-lived and shared. Route chunks come
        // from React.lazy in App.tsx — listing them here would fight Rollup's
        // own splitting. (The previous config also split zustand into its own
        // 646-byte chunk, which cost a request and a preload hint for nothing.)
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
  // Restored: this block was dropped upstream, which silently dropped the test
  // suite to vitest's default node environment. Every test touching the DOM or
  // localStorage has been failing since.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})

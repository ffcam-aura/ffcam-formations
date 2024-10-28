// vitest.config.js
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.ts', 'app/**/*.tsx'],
      exclude: ['app/**/*.test.ts', 'app/**/*.test.tsx']
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')  // Pointe vers la racine au lieu de ./app
    }
  }
})
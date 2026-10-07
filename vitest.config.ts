import { defineConfig } from 'vitest/config'

// Unit tests for plain TypeScript in app/frontend (kept separate from the Rails/Vite config).
export default defineConfig({
  resolve: {
    alias: { '@': new URL('./app/frontend', import.meta.url).pathname },
  },
  test: {
    include: ['app/frontend/**/*.test.ts'],
  },
})

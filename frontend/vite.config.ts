/// <reference types="vitest" />
import { defineConfig } from 'vitest/config' // <--- CAMBIO CLAVE AQUÍ
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
})
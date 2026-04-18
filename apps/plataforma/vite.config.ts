import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { findAvailablePort } from '../../vite.port-range.js'

export default defineConfig(async ({ command }) => {
  const server = command === 'serve'
    ? {
        port: await findAvailablePort(),
        open: true,
      }
    : undefined

  return {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server,
}
})

import { readFileSync } from 'node:fs'
import net from 'node:net'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

type LandingPageManifestEntry = {
  id: string
  slug: string
  entry: string
}

type LandingPageManifest = {
  pages: LandingPageManifestEntry[]
}

const manifest = JSON.parse(
  readFileSync(new URL('../marketing/lps.manifest.json', import.meta.url), 'utf8')
) as LandingPageManifest

async function findAvailablePort(start = 3002, end = 3008, blocked: number[] = [3001]) {
  for (let port = start; port <= end; port++) {
    if (blocked.includes(port)) continue

    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer()

      server.once('error', () => resolve(false))
      server.once('listening', () => {
        server.close(() => resolve(true))
      })

      server.listen(port, '127.0.0.1')
    })

    if (available) return port
  }

  return start
}

const htmlInputs = manifest.pages.reduce<Record<string, string>>((entries, page) => {
  entries[page.slug] = fileURLToPath(new URL(`./${page.slug}/index.html`, import.meta.url))
  return entries
}, {
  index: fileURLToPath(new URL('./index.html', import.meta.url)),
})

export default defineConfig(async ({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: await findAvailablePort(3002, 3008, [3001]),
    open: '/index.html',
    fs: {
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: htmlInputs,
    },
  },
}))
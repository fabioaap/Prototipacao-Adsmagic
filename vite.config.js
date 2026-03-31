import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { findAvailablePort } from './vite.port-range.js'

const pkg = JSON.parse(readFileSync(new URL('./Plataforma/package.json', import.meta.url), 'utf8'))

// Resolve tailwindcss and autoprefixer from Plataforma/node_modules
const requireFO = createRequire(new URL('./Plataforma/src/main.ts', import.meta.url))
const tailwindcss = requireFO('tailwindcss')
const autoprefixer = requireFO('autoprefixer')

function gitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    const sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    return { branch, sha }
  } catch {
    return { branch: 'unknown', sha: '0000000' }
  }
}

const { branch, sha } = gitInfo()

export default defineConfig(async ({ command }) => {
  const server = command === 'serve'
    ? {
        port: await findAvailablePort(),
        open: true,
      }
    : undefined

  return {
  root: './Plataforma',
  base: (command === 'build' && process.env.CI) ? '/Prototipacao-Adsmagic/' : '/',
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: fileURLToPath(new URL('./Plataforma/tailwind.config.js', import.meta.url)) }),
        autoprefixer(),
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./Plataforma/src', import.meta.url))
    }
  },
  define: {
    __GIT_BRANCH__: JSON.stringify(branch),
    __GIT_SHA__: JSON.stringify(sha),
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server,
}
})

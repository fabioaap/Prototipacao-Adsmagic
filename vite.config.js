import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { findAvailablePort } from './vite.port-range.js'

const pkg = JSON.parse(readFileSync(new URL('./apps/plataforma/package.json', import.meta.url), 'utf8'))
const landingPagesManifest = JSON.parse(readFileSync(new URL('./workspace/marketing/lps.manifest.json', import.meta.url), 'utf8'))

// Resolve tailwindcss and autoprefixer from Plataforma/node_modules
const requireFO = createRequire(new URL('./apps/plataforma/src/main.ts', import.meta.url))
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

function normalizeBasePath(pathValue, fallback = '/') {
  const value = pathValue?.trim() || fallback
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const workspaceBasePath = normalizeBasePath(process.env.WORKSPACE_BASE_PATH, '/')

export default defineConfig(async ({ command }) => {
  const server = command === 'serve'
    ? {
        port: await findAvailablePort(),
        open: true,
      }
    : undefined

  return {
    root: './apps/plataforma',
    base: workspaceBasePath,
    build: {
      outDir: '../../dist',
      emptyOutDir: true,
    },
    plugins: [vue()],
    css: {
      postcss: {
        plugins: [
          tailwindcss({ config: fileURLToPath(new URL('./apps/plataforma/tailwind.config.js', import.meta.url)) }),
          autoprefixer(),
        ]
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./apps/plataforma/src', import.meta.url))
      }
    },
    define: {
      __GIT_BRANCH__: JSON.stringify(branch),
      __GIT_SHA__: JSON.stringify(sha),
      __APP_VERSION__: JSON.stringify(pkg.version),
      __LANDING_PAGES_MANIFEST__: JSON.stringify(landingPagesManifest),
    },
    server,
  }
})

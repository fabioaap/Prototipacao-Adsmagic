import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { execSync } from 'node:child_process'

type BuildVersionInfo = {
  appName: string
  appVersion: string
  branch: string
  commit: string
  commitShort: string
  buildTime: string
  source: string
}

function safeExec(command: string): string | null {
  try {
    return execSync(command, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf-8',
    }).trim()
  } catch {
    return null
  }
}

function resolveBuildVersionInfo(): BuildVersionInfo {
  const branch =
    process.env.CF_PAGES_BRANCH ??
    process.env.GITHUB_REF_NAME ??
    safeExec('git rev-parse --abbrev-ref HEAD') ??
    'unknown'

  const commit =
    process.env.CF_PAGES_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    safeExec('git rev-parse HEAD') ??
    'unknown'

  const commitShort = commit === 'unknown' ? 'unknown' : commit.slice(0, 7)

  const source =
    process.env.CF_PAGES === '1'
      ? 'cloudflare-pages'
      : process.env.GITHUB_ACTIONS === 'true'
        ? 'github-actions'
        : 'local'

  return {
    appName: 'adsmagic-frontend',
    appVersion: process.env.npm_package_version ?? '0.0.0',
    branch,
    commit,
    commitShort,
    buildTime: new Date().toISOString(),
    source,
  }
}

function buildVersionPlugin(): Plugin {
  return {
    name: 'build-version-metadata',
    generateBundle() {
      const versionInfo = resolveBuildVersionInfo()

      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: `${JSON.stringify(versionInfo, null, 2)}\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), buildVersionPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Otimizações para produção
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Desabilitar sourcemaps em produção para melhor performance
    minify: 'esbuild', // Usar esbuild para minificação mais rápida
    target: 'esnext',
    cssCodeSplit: true, // Separar CSS para melhor cache
    rollupOptions: {
      output: {
        // Chunking strategy para melhor cache
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['radix-vue', 'lucide-vue-next'],
          'chart-vendor': ['apexcharts', 'vue3-apexcharts'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Limpar diretório de output antes de build
    emptyOutDir: true,
    // Avisar sobre chunks grandes
    chunkSizeWarningLimit: 1000,
  },
  // Configurações para dev
  server: {
    host: true, // true = escuta em todas as interfaces (0.0.0.0), mas aceita conexões locais
    port: 5173,
    strictPort: false, // Permite usar porta alternativa se 5173 em uso
    hmr: {
      host: 'localhost', // HMR usa localhost explicitamente
    },
  },
  // Configurações para preview (produção local)
  preview: {
    port: 4173,
    host: true,
  },
})

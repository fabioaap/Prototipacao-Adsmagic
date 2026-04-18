import { defineConfig, devices } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar .env.sitemap.local manualmente (sem dependência de dotenv)
const envFile = path.join(__dirname, '.env.sitemap.local')
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) process.env[key] = val
  }
}

export default defineConfig({
  testDir: path.join(__dirname, 'scripts'),
  testMatch: 'capture-sitemap.spec.ts',
  timeout: 600_000,
  reporter: [['html', { open: 'never', outputFolder: 'sitemap-report' }]],
  use: {
    baseURL: process.env.SITEMAP_BASE_URL || 'http://localhost:5200',
    viewport: { width: 1440, height: 900 },
    screenshot: 'off',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})

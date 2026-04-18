/**
 * Sitemap Screenshot Capture
 *
 * Captura screenshots de todas as páginas e overlays (drawers/modais) do AdsMagic.
 * As imagens são salvas em: front-end/public/sitemap/screens/
 *
 * Pré-requisitos:
 *   1. Buildar em mock mode: pnpm build:visual
 *   2. Servir a build: pnpm preview -- --port 4173 --strictPort
 *   3. Em outro terminal: pnpm sitemap:capture
 *
 * Obs.: Em mock mode qualquer email/senha válidos funcionam.
 */

import { test, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SCREENS = path.resolve(__dirname, '../public/sitemap/screens')

// ── helpers ────────────────────────────────────────────────────────────────

function ensureDir() {
  fs.mkdirSync(SCREENS, { recursive: true })
}

async function snap(page: Page, name: string) {
  await page.waitForTimeout(500)
  await page.screenshot({
    path: path.join(SCREENS, `${name}.jpg`),
    type: 'jpeg',
    quality: 82,
    fullPage: false,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  })
  console.log(`  📸  ${name}`)
}

async function trySnap(page: Page, label: string, action: () => Promise<void>) {
  try {
    await action()
    console.log(`  ✅  ${label}`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message.split('\n')[0] : String(e)
    console.log(`  ⚠️   ${label}: ${msg}`)
  }
}

async function goto(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 }).catch(() =>
    page.goto(url, { waitUntil: 'commit', timeout: 10_000 })
  )
  // Aguarda Vue + router estabilizarem (mock API calls completam rápido)
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
  await page.waitForTimeout(500)
}

async function closeOverlay(page: Page) {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
}

// ── test ───────────────────────────────────────────────────────────────────

test('Capturar screenshots do sitemap', async ({ page }) => {
  ensureDir()

  const BASE     = process.env.SITEMAP_BASE_URL || 'http://localhost:5200'
  const EMAIL    = process.env.SITEMAP_EMAIL    || ''
  const PASSWORD = process.env.SITEMAP_PASSWORD || ''

  if (!EMAIL || !PASSWORD) {
    throw new Error('SITEMAP_EMAIL e SITEMAP_PASSWORD devem estar definidos em .env.sitemap.local')
  }

  page.setDefaultTimeout(5_000)
  await page.setViewportSize({ width: 1440, height: 900 })

  // ── 1. Páginas públicas ──────────────────────────────────────────────────

  console.log('\n🌐 Páginas públicas:')
  const publicPages: Array<{ name: string; path: string }> = [
    { name: 'login',                path: '/pt/login' },
    { name: 'register',             path: '/pt/register' },
    { name: 'email-confirmation',   path: '/pt/email-confirmation' },
    { name: 'forgot-password',      path: '/pt/forgot-password' },
    { name: 'reset-password',       path: '/pt/reset-password' },
    // verify-otp e oauth-callback requerem token na URL — capturar manualmente se necessário
  ]

  for (const r of publicPages) {
    await trySnap(page, r.name, async () => {
      await goto(page, `${BASE}${r.path}`)
      await snap(page, r.name)
    })
  }

  // ── 2. Auth via localStorage (bypass UI em mock mode) ────────────────────

  console.log('\n🔐 Auth (localStorage bypass):')
  // Navega para qualquer página do domínio para poder acessar o localStorage
  await page.goto(`${BASE}/pt/login`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    const mockUser = {
      id: 'mock-user-id',
      email: 'mock@adsmagic.dev',
      name: 'Mock User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem('adsmagic_auth_token', 'mock-jwt-token')
    localStorage.setItem('adsmagic_user_data', JSON.stringify(mockUser))
    localStorage.setItem('adsmagic_onboarding_status', JSON.stringify({ isCompleted: true }))
    localStorage.setItem('current_project_id', 'mock-project-001')
  })
  console.log('  ✅  localStorage configurado')

  // ── 3. ProjectId (mock fixo) ──────────────────────────────────────────────

  const projectId = 'mock-project-001'
  console.log(`\n🎯 projectId: ${projectId}`)

  // ── 4. Páginas de projecto ───────────────────────────────────────────────

  const p = (suffix: string) => `/pt/projects/${projectId}${suffix}`
  const projectPages: Array<{ name: string; path: string }> = [
    { name: 'projects',             path: '/pt/projects' },
    { name: 'pricing',              path: '/pt/pricing' },
    { name: 'onboarding',           path: '/pt/onboarding' },
    { name: 'project-wizard',       path: '/pt/project/new' },
    { name: 'project-completion',   path: '/pt/project/completion' },
    { name: 'dashboard-v2',         path: p('/dashboard-v2') },
    { name: 'contacts',             path: p('/contacts') },
    { name: 'sales',                path: p('/sales') },
    { name: 'messages',             path: p('/messages') },
    { name: 'tracking',             path: p('/tracking') },
    { name: 'events',               path: p('/events') },
    { name: 'integrations',         path: p('/integrations') },
    { name: 'campaigns-google-ads', path: p('/campaigns/google-ads') },
    { name: 'campaigns-meta-ads',   path: p('/campaigns/meta-ads') },
    { name: 'settings-general',     path: p('/settings/general') },
    { name: 'settings-funnel',      path: p('/settings/funnel') },
    { name: 'settings-origins',     path: p('/settings/origins') },
  ]

  console.log('\n📁 Páginas autenticadas:')
  for (const r of projectPages) {
    await trySnap(page, r.name, async () => {
      await goto(page, `${BASE}${r.path}`)
      await snap(page, r.name)
    })
  }

  // ── 5. Overlays — Contacts ────────────────────────────────────────────────

  console.log('\n📐 Overlays — Contacts:')

  await trySnap(page, 'contacts-kanban', async () => {
    await goto(page, `${BASE}${p('/contacts')}`)
    const url = page.url()
    const allButtons = await page.locator('button').count()
    const kanbanAria = await page.locator('[aria-label*="kanban" i]').count()
    const ariaAll = await page.$$eval('[aria-label]', els => els.map(e => e.getAttribute('aria-label')))
    console.log(`    DEBUG → url=${url}, buttons=${allButtons}, kanbanAria=${kanbanAria}`)
    console.log(`    DEBUG → ariaAll=${JSON.stringify(ariaAll.slice(0,10))}`)
    // Clicar no toggle Kanban (aria-label via i18n)
    await page.locator('[aria-label*="kanban" i]').first().click()
    await page.waitForTimeout(700)
    await snap(page, 'contacts-kanban')
  })

  await trySnap(page, 'contact-form-modal', async () => {
    await goto(page, `${BASE}${p('/contacts')}`)
    await page.getByRole('button', { name: /adicionar contato/i }).first().click()
    await page.waitForTimeout(700)
    await snap(page, 'contact-form-modal')
    await closeOverlay(page)
  })

  await trySnap(page, 'contact-details-drawer', async () => {
    await goto(page, `${BASE}${p('/contacts')}`)
    await page.locator('table tbody tr').first().click()
    await page.waitForTimeout(800)
    await snap(page, 'contact-details-drawer')
    await closeOverlay(page)
  })

  // contact-import-modal: isImportModalOpen não tem botão wired na UI — skip
  // await trySnap(page, 'contact-import-modal', ...)

  await trySnap(page, 'stages-mgmt-drawer', async () => {
    await goto(page, `${BASE}${p('/contacts')}`)
    // Busca botão de gerenciar etapas (ícone engrenagem no header kanban)
    await page.getByRole('button', { name: /etapa|funil|gerenciar/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'stages-mgmt-drawer')
    await closeOverlay(page)
  })

  // ── 6. Overlays — Sales ───────────────────────────────────────────────────

  console.log('\n📐 Overlays — Sales:')

  await trySnap(page, 'sale-details-drawer', async () => {
    await goto(page, `${BASE}${p('/sales')}`)
    await page.locator('table tbody tr').first().click()
    await page.waitForTimeout(700)
    await snap(page, 'sale-details-drawer')
    await closeOverlay(page)
  })

  await trySnap(page, 'sale-form-modal', async () => {
    await goto(page, `${BASE}${p('/sales')}`)
    // Abrir modal via botão editar na primeira linha da tabela
    await page.locator('table tbody tr').first().locator('button[title="Editar"]').click()
    await page.waitForTimeout(700)
    await snap(page, 'sale-form-modal')
    await closeOverlay(page)
  })

  // ── 7. Overlays — Tracking ────────────────────────────────────────────────

  console.log('\n📐 Overlays — Tracking:')

  await trySnap(page, 'link-form-modal', async () => {
    await goto(page, `${BASE}${p('/tracking')}`)
    await page.getByRole('button', { name: /criar link/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'link-form-modal')
    await closeOverlay(page)
  })

  await trySnap(page, 'link-stats-drawer', async () => {
    await goto(page, `${BASE}${p('/tracking')}`)
    // Botão de estatísticas tem title="Ver estatísticas" (sem aria-label)
    await page.locator('button[title="Ver estatísticas"]').first().click()
    await page.waitForTimeout(600)
    await snap(page, 'link-stats-drawer')
    await closeOverlay(page)
  })

  // ── 8. Overlays — Messages ────────────────────────────────────────────────

  console.log('\n📐 Overlays — Messages:')

  await trySnap(page, 'message-form-modal', async () => {
    await goto(page, `${BASE}${p('/messages')}`)
    await page.getByRole('button', { name: /criar mensagem|nova mensagem/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'message-form-modal')
    await closeOverlay(page)
  })

  // ── 9. Overlays — Events ──────────────────────────────────────────────────

  console.log('\n📐 Overlays — Events:')

  await trySnap(page, 'event-details-drawer', async () => {
    await goto(page, `${BASE}${p('/events')}`)
    await page.locator('table tbody tr').first().click()
    await page.waitForTimeout(700)
    await snap(page, 'event-details-drawer')
    await closeOverlay(page)
  })

  // ── 10. Overlays — Integrations ───────────────────────────────────────────

  console.log('\n📐 Overlays — Integrations:')

  await trySnap(page, 'meta-pixel-modal', async () => {
    await goto(page, `${BASE}${p('/integrations')}`)
    // Meta está conectado — abrir ConnectionInfo via "Ver detalhes"
    await page.getByRole('tab', { name: /canais/i }).click()
    await page.waitForTimeout(500)
    const metaArticle = page.locator('article').filter({ hasText: /meta ads/i })
    await metaArticle.getByRole('button', { name: /ver detalhes/i }).click()
    await page.waitForTimeout(700)
    await snap(page, 'meta-pixel-modal')
    await closeOverlay(page)
  })

  await trySnap(page, 'google-account-modal', async () => {
    await goto(page, `${BASE}${p('/integrations')}`)
    // Google está desconectado — aparece em "Disponíveis para conectar"
    await page.getByRole('tab', { name: /canais/i }).click()
    await page.waitForTimeout(500)
    const googleArticle = page.locator('article').filter({ hasText: /google ads/i })
    await googleArticle.getByRole('button', { name: /conectar/i }).click()
    await page.waitForTimeout(700)
    await snap(page, 'google-account-modal')
    await closeOverlay(page)
  })

  await trySnap(page, 'integrations-tab-canais', async () => {
    await goto(page, `${BASE}${p('/integrations')}`)
    await page.getByRole('tab', { name: /canais/i }).click()
    await page.waitForTimeout(500)
    await snap(page, 'integrations-tab-canais')
  })

  await trySnap(page, 'integrations-tab-ads', async () => {
    await goto(page, `${BASE}${p('/integrations')}`)
    await page.getByRole('tab', { name: /anúncios/i }).click()
    await page.waitForTimeout(500)
    await snap(page, 'integrations-tab-ads')
  })

  // google-conv-drawer: requer Google conectado → View Details → Gerenciar conversões
  // Google está disconnected no mock — capturar manualmente quando conectado
  // await trySnap(page, 'google-conv-drawer', ...)

  // ── Analytics page ──────────────────────────────────────────────────────

  await trySnap(page, 'analytics', async () => {
    await goto(page, `${BASE}${p('/analytics')}`)
    await snap(page, 'analytics')
  })

  // ── Company Settings page ─────────────────────────────────────────────────

  await trySnap(page, 'company-settings', async () => {
    await goto(page, `${BASE}/pt/company/settings`)
    await snap(page, 'company-settings')
  })

  // ── 11. Overlays — Campaigns ──────────────────────────────────────────────

  console.log('\n📐 Overlays — Campaigns:')

  await trySnap(page, 'ads-indicators-meta', async () => {
    await goto(page, `${BASE}${p('/campaigns/meta-ads')}`)
    await page.getByRole('button', { name: /indicador/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'ads-indicators-meta')
    await closeOverlay(page)
  })

  await trySnap(page, 'ads-indicators-google', async () => {
    await goto(page, `${BASE}${p('/campaigns/google-ads')}`)
    await page.getByRole('button', { name: /indicador/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'ads-indicators-google')
    await closeOverlay(page)
  })

  // ── 12. Overlays — Settings ───────────────────────────────────────────────

  console.log('\n📐 Overlays — Settings:')

  await trySnap(page, 'stage-form-drawer', async () => {
    await goto(page, `${BASE}${p('/settings/funnel')}`)
    await page.getByRole('button', { name: /nova etapa/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'stage-form-drawer')
    await closeOverlay(page)
  })

  await trySnap(page, 'origin-form-modal', async () => {
    await goto(page, `${BASE}${p('/settings/origins')}`)
    await page.getByRole('button', { name: /nova origem/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'origin-form-modal')
    await closeOverlay(page)
  })

  // ── Dashboard overlays ────────────────────────────────────────────────────

  console.log('\n📐 Overlays — Dashboard:')

  await trySnap(page, 'ns-config-drawer', async () => {
    await goto(page, `${BASE}${p('/dashboard-v2')}`)
    await page.getByRole('button', { name: /configurar|north star|config/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'ns-config-drawer')
    await closeOverlay(page)
  })

  // ── Projects ──────────────────────────────────────────────────────────────

  console.log('\n📐 Overlays — Projects:')

  await trySnap(page, 'new-project-modal', async () => {
    await goto(page, `${BASE}/pt/projects`)
    await page.getByRole('button', { name: /novo projeto|criar projeto/i }).first().click()
    await page.waitForTimeout(600)
    await snap(page, 'new-project-modal')
    await closeOverlay(page)
  })

  console.log(`\n✅ Captura concluída! ${fs.readdirSync(SCREENS).length} screenshots em: public/sitemap/screens/\n`)
})

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mockLandingPages,
  mockLandingCatalogQuickAccess,
  mockLandingCatalogStats,
  type LandingPageTone,
  type LandingPageLink,
  type LandingPageVersionStatus,
} from '@/data/landingPages'

const router = useRouter()
const route = useRoute()
const landingPages = mockLandingPages
const quickAccess = mockLandingCatalogQuickAccess
const stats = mockLandingCatalogStats
const docsPortalBaseUrl = (import.meta.env.VITE_DOCS_PORTAL_URL || `${import.meta.env.BASE_URL}wiki`).replace(/\/$/, '')

const selectedLandingId = computed(() =>
  typeof route.query.lp === 'string' ? route.query.lp : null
)

const selectedLanding = computed(() =>
  selectedLandingId.value ? landingPages.find((landing) => landing.id === selectedLandingId.value) ?? null : null
)

const toneColor: Record<LandingPageTone, string> = {
  primary: '#6366f1',
  cyan: '#22d3ee',
  emerald: '#28c76f',
  amber: '#ff9f43',
  rose: '#ea5455',
  violet: '#818cf8',
}

const versionStatusStyles: Record<LandingPageVersionStatus, { background: string; color: string }> = {
  building: { background: 'rgba(99,102,241,0.14)', color: '#818cf8' },
  review: { background: 'rgba(34,211,238,0.14)', color: '#22d3ee' },
  canary: { background: 'rgba(255,159,67,0.14)', color: '#ff9f43' },
  published: { background: 'rgba(40,199,111,0.14)', color: '#28c76f' },
  archived: { background: 'rgba(255,255,255,0.08)', color: '#888' },
}

function hexAlpha(hex: string, alpha: number) {
  const red = parseInt(hex.slice(1, 3), 16)
  const green = parseInt(hex.slice(3, 5), 16)
  const blue = parseInt(hex.slice(5, 7), 16)
  return `rgba(${red},${green},${blue},${alpha})`
}

function completionPct(completed: number, total: number) {
  return total ? Math.round((completed / total) * 100) : 0
}

function openLandingDetail(id: string) {
  router.push({ path: '/lps', query: { ...route.query, lp: id } })
}

function closeLandingDetail() {
  const nextQuery = { ...route.query }
  delete nextQuery.lp
  router.push({ path: '/lps', query: nextQuery })
}

function normalizeDocsPath(path: string) {
  return path.replace(/^\/+/, '').replace(/^wiki\//, '')
}

function resolveLinkUrl(link: LandingPageLink) {
  if (link.kind === 'docs') {
    return `${docsPortalBaseUrl}/${normalizeDocsPath(link.to)}`
  }

  return link.to
}

function openLink(link: LandingPageLink) {
  const target = resolveLinkUrl(link)

  if (link.kind === 'docs') {
    window.open(target, '_blank', 'noopener,noreferrer')
    return
  }

  router.push(target)
}
</script>

<template>
  <div v-if="selectedLanding" class="landing-catalog" :key="`detail-${selectedLanding.id}`">
    <header class="detail-header">
      <button type="button" class="detail-back" aria-label="Voltar ao catalogo de LPs" @click="closeLandingDetail()">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </button>
      <div
        class="detail-icon"
        :style="{ background: hexAlpha(toneColor[selectedLanding.tone], 0.13), color: toneColor[selectedLanding.tone] }"
      >
        <span class="material-symbols-outlined" aria-hidden="true">{{ selectedLanding.icon }}</span>
      </div>
      <div>
        <div class="detail-meta-row">
          <span class="detail-version">{{ selectedLanding.version }}</span>
          <span class="detail-status" :class="selectedLanding.status === 'active' ? 'detail-status--active' : 'detail-status--planned'">
            {{ selectedLanding.statusLabel }}
          </span>
        </div>
        <h2 class="detail-name">{{ selectedLanding.name }}</h2>
        <p class="detail-desc">{{ selectedLanding.summary }}</p>
      </div>
    </header>

    <div class="detail-stats">
      <div class="detail-stat">
        <span class="detail-stat-value" :style="{ color: toneColor[selectedLanding.tone] }">{{ selectedLanding.version }}</span>
        <span class="detail-stat-label">versao atual</span>
      </div>
      <div class="detail-stat">
        <span class="detail-stat-value" :style="{ color: toneColor[selectedLanding.tone] }">{{ selectedLanding.versions.length }}</span>
        <span class="detail-stat-label">versoes catalogadas</span>
      </div>
      <div class="detail-stat">
        <span class="detail-stat-value">{{ selectedLanding.context.primaryCta }}</span>
        <span class="detail-stat-label">cta principal</span>
      </div>
    </div>

    <section class="catalog-section">
      <span class="catalog-section-label">Contexto da superficie</span>
      <div class="context-card-grid">
        <article class="context-card">
          <span class="context-card-label">ICP</span>
          <p class="context-card-copy">{{ selectedLanding.context.icp }}</p>
        </article>
        <article class="context-card">
          <span class="context-card-label">Owner</span>
          <p class="context-card-copy">{{ selectedLanding.context.owner }}</p>
        </article>
        <article class="context-card">
          <span class="context-card-label">Proximo passo</span>
          <p class="context-card-copy">{{ selectedLanding.context.nextStep }}</p>
        </article>
      </div>
      <div class="chip-group">
        <span class="chip-label">Publicos</span>
        <span v-for="audience in selectedLanding.audiences" :key="audience" class="detail-pill" :style="{ borderColor: hexAlpha(toneColor[selectedLanding.tone], 0.22) }">{{ audience }}</span>
      </div>
      <div class="chip-group">
        <span class="chip-label">Canais</span>
        <span v-for="channel in selectedLanding.channels" :key="channel" class="detail-pill" :style="{ borderColor: hexAlpha(toneColor[selectedLanding.tone], 0.22) }">{{ channel }}</span>
      </div>
    </section>

    <section class="catalog-section">
      <span class="catalog-section-label">Resultados esperados</span>
      <div class="detail-outcomes">
        <span v-for="outcome in selectedLanding.outcomes" :key="outcome" class="detail-pill" :style="{ borderColor: hexAlpha(toneColor[selectedLanding.tone], 0.22) }">{{ outcome }}</span>
      </div>
    </section>

    <section class="catalog-section">
      <span class="catalog-section-label">Versoes catalogadas</span>
      <div class="version-grid">
        <article v-for="version in selectedLanding.versions" :key="version.id" class="version-card">
          <div class="version-card-top">
            <div>
              <div class="detail-meta-row">
                <span class="detail-version">{{ version.label }}</span>
                <span class="version-status" :style="{ background: versionStatusStyles[version.status].background, color: versionStatusStyles[version.status].color }">
                  {{ version.statusLabel }}
                </span>
              </div>
              <p class="version-focus">{{ version.focus }}</p>
            </div>
            <span class="version-experiment">{{ version.experimentId }}</span>
          </div>

          <p class="version-summary">{{ version.summary }}</p>

          <div class="version-meta-list">
            <div class="version-meta-row">
              <span class="version-meta-label">Branch</span>
              <span class="version-meta-value version-meta-value--mono">{{ version.branch }}</span>
            </div>
            <div class="version-meta-row">
              <span class="version-meta-label">Atualizado em</span>
              <span class="version-meta-value">{{ version.lastUpdate }}</span>
            </div>
          </div>

          <div class="version-metrics">
            <div v-for="metric in version.metrics" :key="metric.label" class="version-metric-card">
              <span class="version-metric-value">{{ metric.value }}</span>
              <span class="version-metric-label">{{ metric.label }}</span>
              <span class="version-metric-helper">{{ metric.helper }}</span>
            </div>
          </div>

          <div class="version-notes">
            <div v-for="note in version.notes" :key="note" class="version-note">
              <span class="material-symbols-outlined" aria-hidden="true">subdirectory_arrow_right</span>
              <span>{{ note }}</span>
            </div>
          </div>

          <div class="version-links">
            <button v-for="link in version.links" :key="`${version.id}-${link.label}`" type="button" class="version-link" @click="openLink(link)">
              <span>{{ link.label }}</span>
              <span class="version-link-helper">{{ link.helper }}</span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="catalog-section">
      <span class="catalog-section-label">Destinos conectados</span>
      <div class="quick-grid">
        <button
          v-for="destination in selectedLanding.destinations"
          :key="`${selectedLanding.id}-${destination.label}`"
          type="button"
          class="qcard"
          :style="{ '--qc': toneColor[selectedLanding.tone] }"
          @click="openLink(destination)"
        >
          <span class="material-symbols-outlined qcard-icon" :style="{ color: toneColor[selectedLanding.tone] }" aria-hidden="true">open_in_new</span>
          <div class="qcard-text">
            <span class="qcard-title">{{ destination.label }}</span>
            <span class="qcard-area">{{ destination.helper }}</span>
          </div>
          <span class="material-symbols-outlined qcard-arrow" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </section>
  </div>

  <div v-else class="landing-catalog">
    <header class="hero">
      <div class="hero-left">
        <p class="hero-kicker">Marketing e aquisicao</p>
        <h1 class="hero-title">Catalogo de LPs</h1>
        <p class="hero-desc">Leitura operacional das landing pages do workspace, com status da superficie, versoes catalogadas e destinos ligados a cada oferta.</p>
      </div>
      <div class="hero-stats">
        <div v-for="stat in stats" :key="stat.label" class="hero-stat">
          <span class="hero-stat-value">{{ stat.value }}</span>
          <span class="hero-stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </header>

    <section class="catalog-section">
      <span class="catalog-section-label">Panorama das LPs</span>
      <div class="progress-grid">
        <button
          v-for="landing in landingPages"
          :key="landing.id"
          type="button"
          class="pcard"
          :style="{ '--pc': toneColor[landing.tone] }"
          @click="openLandingDetail(landing.id)"
        >
          <div class="pcard-top">
            <div class="pcard-icon" :style="{ background: hexAlpha(toneColor[landing.tone], 0.13), color: toneColor[landing.tone] }">
              <span class="material-symbols-outlined" aria-hidden="true">{{ landing.icon }}</span>
            </div>
            <span class="pcard-name">{{ landing.name }}</span>
            <span v-if="landing.version" class="pcard-version">{{ landing.version }}</span>
            <span class="pcard-badge" :class="landing.status === 'active' ? 'pcard-badge--active' : 'pcard-badge--planned'">
              {{ landing.statusLabel }}
            </span>
          </div>
          <p class="pcard-summary">{{ landing.focus }}</p>
          <div class="pcard-bottom">
            <div class="pcard-bar-track">
              <div class="pcard-bar-fill" :style="{ width: `${completionPct(landing.completed, landing.total)}%` }"></div>
            </div>
            <span class="pcard-count">{{ landing.completed }}/{{ landing.total }}</span>
          </div>
        </button>
      </div>
    </section>

    <section class="catalog-section">
      <span class="catalog-section-label">Acesso rapido</span>
      <div class="quick-grid">
        <button
          v-for="qa in quickAccess"
          :key="qa.title"
          type="button"
          class="qcard"
          :style="{ '--qc': toneColor[qa.tone] }"
          @click="openLink({ label: qa.title, to: qa.to, kind: qa.kind })"
        >
          <span class="material-symbols-outlined qcard-icon" :style="{ color: toneColor[qa.tone] }" aria-hidden="true">{{ qa.icon }}</span>
          <div class="qcard-text">
            <span class="qcard-title">{{ qa.title }}</span>
            <span class="qcard-area">{{ qa.area }}</span>
          </div>
          <span class="material-symbols-outlined qcard-arrow" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
  font-size: inherit;
  line-height: 1;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  user-select: none;
  flex-shrink: 0;
}

.landing-catalog {
  --surface: #111111;
  --surface-2: #151515;
  --surface-3: #0f0f10;
  --border: rgba(255,255,255,0.08);
  --text: #ededed;
  --text-muted: #888;
  --text-dim: #555;
  --radius: 10px;
  --transition: 150ms ease;

  padding: 28px 32px 40px;
  max-width: 1100px;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}

.hero-kicker {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--text-dim);
}

.hero-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.03em;
  margin: 10px 0 0;
}

.hero-desc {
  margin-top: 10px;
  max-width: 560px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.55;
}

.hero-stats,
.detail-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 12px;
  flex-shrink: 0;
}

.hero-stat,
.detail-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  min-width: 110px;
}

.hero-stat-value,
.detail-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.hero-stat-label,
.detail-stat-label,
.context-card-label,
.catalog-section-label,
.chip-label,
.version-meta-label,
.version-metric-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}

.catalog-section {
  margin-bottom: 28px;
}

.catalog-section-label {
  display: block;
  margin-bottom: 12px;
}

.progress-grid,
.quick-grid,
.context-card-grid,
.version-grid,
.version-metrics {
  display: grid;
  gap: 12px;
}

.progress-grid,
.quick-grid,
.context-card-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.version-grid {
  grid-template-columns: minmax(0, 1fr);
}

.version-metrics {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pcard,
.qcard,
.context-card,
.version-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.pcard,
.qcard {
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition: border-color var(--transition), background var(--transition), transform var(--transition);
}

.pcard {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}

.pcard:hover,
.qcard:hover,
.version-link:hover {
  transform: translateY(-1px);
  background: var(--surface-2);
}

.pcard:hover {
  border-color: color-mix(in srgb, var(--pc) 40%, var(--border));
}

.pcard-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pcard-icon,
.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.pcard-icon {
  width: 34px;
  height: 34px;
  font-size: 18px;
}

.pcard-name,
.detail-name,
.qcard-title {
  color: var(--text);
}

.pcard-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.pcard-version,
.detail-version,
.version-experiment {
  font-size: 10px;
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  color: rgba(255,255,255,0.42);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  padding: 2px 6px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.pcard-badge,
.detail-status,
.version-status {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pcard-badge--active,
.detail-status--active {
  background: rgba(40,199,111,0.15);
  color: #28c76f;
}

.pcard-badge--planned,
.detail-status--planned {
  background: rgba(255,255,255,0.06);
  color: var(--text-dim);
}

.pcard-summary,
.detail-desc,
.context-card-copy,
.version-summary,
.version-focus,
.version-note,
.qcard-area,
.version-link-helper {
  color: var(--text-muted);
}

.pcard-summary {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
}

.pcard-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pcard-bar-track {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}

.pcard-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--pc);
}

.pcard-count,
.version-metric-value {
  font-variant-numeric: tabular-nums;
}

.pcard-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--pc);
  flex-shrink: 0;
}

.qcard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
}

.qcard:hover {
  border-color: color-mix(in srgb, var(--qc) 40%, var(--border));
}

.qcard-icon,
.qcard-arrow {
  flex-shrink: 0;
}

.qcard-icon {
  font-size: 20px;
}

.qcard-text {
  flex: 1;
  min-width: 0;
}

.qcard-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
}

.qcard-area,
.version-link-helper {
  display: block;
  font-size: 11px;
  line-height: 1.45;
}

.qcard-arrow {
  font-size: 16px;
  color: var(--text-dim);
}

.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
}

.detail-back {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition), background var(--transition);
}

.detail-back:hover {
  border-color: rgba(255,255,255,0.18);
  color: var(--text);
  background: var(--surface-2);
}

.detail-icon {
  width: 44px;
  height: 44px;
  font-size: 22px;
}

.detail-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.detail-desc {
  margin: 8px 0 0;
  max-width: 720px;
  font-size: 14px;
  line-height: 1.6;
}

.context-card,
.version-card {
  padding: 16px;
}

.context-card-copy {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.chip-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.detail-outcomes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-pill {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.02);
  color: var(--text);
  font-size: 12px;
}

.version-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
}

.version-card-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.version-focus {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.version-summary {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.6;
}

.version-meta-list {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.version-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.version-meta-value {
  color: var(--text);
  font-size: 12px;
}

.version-meta-value--mono {
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.58);
}

.version-metrics {
  margin-top: 16px;
}

.version-metric-card {
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  background: var(--surface-3);
  padding: 12px;
}

.version-metric-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.version-metric-helper {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-dim);
}

.version-notes {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.version-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.55;
}

.version-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.version-link {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  background: var(--surface-3);
  padding: 12px;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition), transform var(--transition);
}

.version-link span:first-child {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

@media (max-width: 1080px) {
  .landing-catalog {
    padding: 24px 20px 32px;
  }

  .hero,
  .detail-header {
    flex-direction: column;
  }

  .hero-stats,
  .detail-stats,
  .progress-grid,
  .quick-grid,
  .context-card-grid,
  .version-links,
  .version-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .hero-stats,
  .detail-stats,
  .progress-grid,
  .quick-grid,
  .context-card-grid,
  .version-links,
  .version-metrics {
    grid-template-columns: minmax(0, 1fr);
  }

  .version-card-top,
  .version-meta-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
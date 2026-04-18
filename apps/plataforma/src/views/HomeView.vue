<script setup lang="ts">
import { computed } from 'vue'
import { mockHomeJourneys, mockHomeQuickAccess, mockHomeStats, type HomeTone } from '@/data/home'
import JourneyExperienceDrawer from '@/components/journeys/JourneyExperienceDrawer.vue'
import { useJourneyExperienceDrawer } from '@/composables/useJourneyExperienceDrawer'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  selectedJourneyId?: string | null
}>()

const emit = defineEmits<{
  (e: 'clear-selection'): void
}>()

const journeys = mockHomeJourneys
const quickAccess = mockHomeQuickAccess
const stats = mockHomeStats

const {
  isOpen: isJourneyDrawerOpen,
  activeJourney,
  triggerEl: drawerTriggerEl,
  validationResult: drawerValidationResult,
  iframeSrc: drawerIframeSrc,
  openJourneyDrawer,
  closeJourneyDrawer,
  openFullPage,
} = useJourneyExperienceDrawer({ router })

const toneColor: Record<HomeTone, string> = {
  primary: '#6366f1',
  cyan: '#22d3ee',
  emerald: '#28c76f',
  amber: '#ff9f43',
  rose: '#ea5455',
  violet: '#818cf8',
}

const journeyIcons: Record<string, string> = {
  network: 'hub',
  compass: 'explore',
  briefcaseBusiness: 'work',
  bookMarked: 'menu_book',
  calendarDays: 'calendar_today',
  shieldCheck: 'verified_user',
  userCog: 'manage_accounts',
}

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

const selectedJourney = computed(() =>
  props.selectedJourneyId ? journeys.find(j => j.id === props.selectedJourneyId) : null
)

function quickAccessRoute(to: string) {
  if (to.startsWith('/#')) {
    return { path: '/', hash: to.slice(1) }
  }

  return to
}

function completionPct(c: number, t: number) {
  return t ? Math.round((c / t) * 100) : 0
}

function handleOpenJourneyDrawer(journey: (typeof journeys)[number], event: MouseEvent) {
  openJourneyDrawer({ journey, triggerElement: event.currentTarget })
}

function handleDrawerModelValue(isOpen: boolean) {
  if (!isOpen) closeJourneyDrawer()
}
</script>

<template>
  <!-- ── Journey Detail (when selected from sidebar) ── -->
  <div v-if="selectedJourney" class="home" :key="'detail-' + selectedJourney.id">
    <header class="detail-header">
      <button type="button" class="detail-back" aria-label="Voltar ao painel" @click="emit('clear-selection')">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </button>
      <div
        class="detail-icon"
        :style="{ background: hexAlpha(toneColor[selectedJourney.tone], 0.13), color: toneColor[selectedJourney.tone] }"
      >
        <span class="material-symbols-outlined" aria-hidden="true">{{ journeyIcons[selectedJourney.iconKey] || 'circle' }}</span>
      </div>
      <div>
        <h2 class="detail-name">{{ selectedJourney.name }}</h2>
        <p class="detail-desc">{{ selectedJourney.summary }}</p>
      </div>
    </header>

    <div class="detail-stats">
      <div class="detail-stat">
        <span class="detail-stat-value" :style="{ color: toneColor[selectedJourney.tone] }">{{ selectedJourney.completed }}/{{ selectedJourney.total }}</span>
        <span class="detail-stat-label">etapas</span>
      </div>
      <div class="detail-stat">
        <span class="detail-stat-value" :style="{ color: toneColor[selectedJourney.tone] }">{{ completionPct(selectedJourney.completed, selectedJourney.total) }}%</span>
        <span class="detail-stat-label">progresso</span>
      </div>
      <div class="detail-stat">
        <span class="detail-stat-value">{{ selectedJourney.statusLabel }}</span>
        <span class="detail-stat-label">status</span>
      </div>
    </div>

    <!-- Journey outcomes -->
    <section class="home-section">
      <span class="home-section-label">Resultados esperados</span>
      <div class="detail-outcomes">
        <span v-for="o in selectedJourney.outcomes" :key="o" class="detail-pill" :style="{ borderColor: hexAlpha(toneColor[selectedJourney.tone], 0.22) }">{{ o }}</span>
      </div>
    </section>

    <!-- Journey screens / experience -->
    <section v-if="selectedJourney.experience" class="home-section">
      <span class="home-section-label">Telas da jornada</span>
      <div class="journey-cards-grid">
        <button
          v-for="screen in selectedJourney.experience.screens"
          :key="screen.id"
          type="button"
          class="journey-card"
          :class="{ 'journey-card--planned': selectedJourney.status === 'planned' }"
          :style="{ '--jc': toneColor[selectedJourney.tone] }"
          @click="handleOpenJourneyDrawer(selectedJourney!, $event)"
        >
          <div class="journey-card-head">
            <div class="journey-card-icon-box" :style="{ background: hexAlpha(toneColor[selectedJourney.tone], 0.13), color: toneColor[selectedJourney.tone] }">
              <span class="material-symbols-outlined" aria-hidden="true">{{ journeyIcons[selectedJourney.iconKey] || 'circle' }}</span>
            </div>
            <span
              class="journey-card-badge"
              :class="selectedJourney.status === 'active' ? 'journey-card-badge--active' : 'journey-card-badge--planned'"
            >{{ selectedJourney.statusLabel }}</span>
          </div>
          <span class="journey-card-title">{{ screen.title }}</span>
          <span class="journey-card-code" :style="{ color: toneColor[selectedJourney.tone] }">{{ screen.id.toUpperCase() }}</span>
        </button>
      </div>
    </section>

    <!-- Open drawer CTA -->
    <button
      v-if="selectedJourney.experience"
      type="button"
      class="detail-open-btn"
      :style="{ background: hexAlpha(toneColor[selectedJourney.tone], 0.12), borderColor: hexAlpha(toneColor[selectedJourney.tone], 0.28), color: toneColor[selectedJourney.tone] }"
      @click="handleOpenJourneyDrawer(selectedJourney!, $event)"
    >
      <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>
      Abrir jornada hospedada
    </button>
  </div>

  <!-- ── Home Dashboard (default) ── -->
  <div v-else class="home">
    <!-- Hero strip -->
    <header class="hero">
      <div class="hero-left">
        <h1 class="hero-title">Ambiente de Prototipação</h1>
        <p class="hero-desc">Hub para leitura AS-IS, documentação viva e protótipos hospedados do Adsmagic.</p>
      </div>
      <div class="hero-stats">
        <div v-for="s in stats" :key="s.label" class="hero-stat">
          <span class="hero-stat-value">{{ s.value }}</span>
          <span class="hero-stat-label">{{ s.label }}</span>
        </div>
      </div>
    </header>

    <!-- Progress grid -->
    <section class="home-section">
      <span class="home-section-label">Progresso por Jornada</span>
      <div class="progress-grid">
        <button
          v-for="j in journeys"
          :key="j.id"
          type="button"
          class="pcard"
          :style="{ '--pc': toneColor[j.tone] }"
          @click="handleOpenJourneyDrawer(j, $event)"
        >
          <div class="pcard-top">
            <div class="pcard-icon" :style="{ background: hexAlpha(toneColor[j.tone], 0.13), color: toneColor[j.tone] }">
              <span class="material-symbols-outlined" aria-hidden="true">{{ journeyIcons[j.iconKey] || 'circle' }}</span>
            </div>
            <span class="pcard-name">{{ j.name }}</span>
            <span v-if="j.version" class="pcard-version">{{ j.version }}</span>
            <span
              class="pcard-badge"
              :class="j.status === 'active' ? 'pcard-badge--active' : 'pcard-badge--planned'"
            >{{ j.statusLabel }}</span>
          </div>
          <div class="pcard-bottom">
            <div class="pcard-bar-track">
              <div class="pcard-bar-fill" :style="{ width: completionPct(j.completed, j.total) + '%' }"></div>
            </div>
            <span class="pcard-count">{{ j.completed }}/{{ j.total }}</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Quick access -->
    <section class="home-section">
      <span class="home-section-label">Acesso rápido</span>
      <div class="quick-grid">
        <RouterLink
          v-for="qa in quickAccess"
          :key="qa.title"
          class="qcard"
          :to="quickAccessRoute(qa.to)"
          :style="{ '--qc': toneColor[qa.tone] }"
        >
          <span class="material-symbols-outlined qcard-icon" :style="{ color: toneColor[qa.tone] }" aria-hidden="true">{{ journeyIcons[qa.iconKey] || 'circle' }}</span>
          <div class="qcard-text">
            <span class="qcard-title">{{ qa.title }}</span>
            <span class="qcard-area">{{ qa.area }}</span>
          </div>
          <span class="material-symbols-outlined qcard-arrow" aria-hidden="true">arrow_forward</span>
        </RouterLink>
      </div>
    </section>
  </div>

  <!-- Drawer -->
  <JourneyExperienceDrawer
    :model-value="isJourneyDrawerOpen"
    :journey="activeJourney"
    :validation-result="drawerValidationResult"
    :iframe-src="drawerIframeSrc"
    :trigger-el="drawerTriggerEl"
    @update:model-value="handleDrawerModelValue"
    @open-full-page="openFullPage"
  />
</template>

<style scoped>
/* ── Material Symbols ── */
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

/* ── Tokens ── */
.home {
  --bg: #0a0a0a;
  --surface: #111111;
  --surface-2: #1a1a1a;
  --border: rgba(255,255,255,0.08);
  --text: #ededed;
  --text-muted: #888;
  --text-dim: #555;
  --accent: #6366f1;
  --r: 10px;
  --t: 150ms ease;

  padding: 28px 32px 40px;
  max-width: 1100px;
}

/* ── Hero Strip ── */
.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}

.hero-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 0;
}

.hero-desc {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.45;
}

.hero-stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 16px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  background: var(--surface);
  min-width: 80px;
}

.hero-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.hero-stat-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
}

/* ── Section ── */
.home-section {
  margin-bottom: 28px;
}

.home-section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  margin-bottom: 12px;
}

/* ── Progress Cards ── */
.progress-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.pcard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition: border-color var(--t), background var(--t);
}

.pcard:hover {
  border-color: color-mix(in srgb, var(--pc) 40%, var(--border));
  background: var(--surface-2);
}

.pcard-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pcard-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.pcard-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
  flex: 1;
}

.pcard-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.pcard-badge--active {
  background: rgba(40,199,111,0.15);
  color: #28c76f;
}

.pcard-badge--planned {
  background: rgba(255,255,255,0.06);
  color: var(--text-dim);
}

.pcard-version {
  font-size: 10px;
  font-weight: 500;
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  color: rgba(255,255,255,0.28);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  padding: 1px 5px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.pcard-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
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
  transition: width 400ms ease;
}

.pcard-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--pc);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* ── Quick Access ── */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.qcard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition: border-color var(--t), background var(--t);
}

.qcard:hover {
  border-color: color-mix(in srgb, var(--qc) 40%, var(--border));
  background: var(--surface-2);
}

.qcard-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.qcard-text {
  flex: 1;
  min-width: 0;
}

.qcard-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.qcard-area {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}

.qcard-arrow {
  font-size: 16px;
  color: var(--text-dim);
  transition: color var(--t);
  flex-shrink: 0;
}

.qcard:hover .qcard-arrow {
  color: var(--qc);
}

/* ── Detail view ── */
.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.detail-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--t), color var(--t), border-color var(--t);
}

.detail-back:hover {
  background: var(--surface-2);
  color: var(--text);
  border-color: rgba(255,255,255,0.15);
}

.detail-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.detail-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.detail-desc {
  margin-top: 2px;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.45;
}

.detail-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 18px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  background: var(--surface);
  min-width: 80px;
}

.detail-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.detail-stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
}

.detail-outcomes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-pill {
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 12px;
  color: var(--text-muted);
}

/* Journey cards grid (detail — Educacross style) */
.journey-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.journey-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  width: 100%;
  min-height: 130px;
  transition: border-color var(--t), background var(--t);
}

.journey-card:hover {
  border-color: color-mix(in srgb, var(--jc) 40%, var(--border));
  background: var(--surface-2);
}

.journey-card--planned {
  border-style: dashed;
}

.journey-card--planned .journey-card-icon-box {
  opacity: 0.45;
}

.journey-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.journey-card-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.journey-card-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.journey-card-badge--active {
  background: rgba(40,199,111,0.15);
  color: #28c76f;
}

.journey-card-badge--planned {
  background: rgba(255,255,255,0.06);
  color: var(--text-dim);
}

.journey-card-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.35;
}

.journey-card-code {
  font-size: 11px;
  font-weight: 500;
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 0.04em;
  margin-top: auto;
}

.detail-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  font-family: inherit;
  transition: opacity var(--t);
  margin-top: 4px;
}

.detail-open-btn:hover { opacity: 0.85; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero { flex-direction: column; gap: 16px; }
  .progress-grid, .quick-grid, .journey-cards-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .home { padding: 20px 16px 32px; }
  .progress-grid, .quick-grid, .journey-cards-grid { grid-template-columns: 1fr; }
  .hero-stats { flex-wrap: wrap; }
}
</style>

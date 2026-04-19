<script setup lang="ts">
import { computed } from 'vue'
import { PanelLeft } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { mockHomeJourneys, type HomeTone } from '@/data/home'

const route = useRoute()
const router = useRouter()

const isHome = () => route.path === '/'
const isJourneyContext = () => route.path === '/'
const isRouteActive = (path: string) => route.path === path

const journeys = mockHomeJourneys

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

const emit = defineEmits<{
  (e: 'select-journey', id: string): void
  (e: 'toggle-sidebar'): void
}>()

const props = defineProps<{
  selectedJourneyId?: string | null
  collapsed?: boolean
}>()

const showCompactMode = computed(() => Boolean(props.collapsed))

function clearJourneySelection() {
  emit('select-journey', '')
}

function handleHomeNavigation() {
  clearJourneySelection()
  if (!isHome()) router.push('/')
}

function handleJourneySelection(id: string) {
  emit('select-journey', id)
  if (!isHome()) router.push('/')
}

function toggleSidebar() {
  emit('toggle-sidebar')
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': showCompactMode }">
    <!-- Brand -->
    <div class="sidebar-brand" :class="{ 'sidebar-brand--collapsed': showCompactMode }">
      <button
        v-if="showCompactMode"
        class="brand-toggle"
        title="Expandir sidebar"
        type="button"
        @click="toggleSidebar"
      >
        <PanelLeft class="h-[18px] w-[18px]" />
      </button>

      <template v-if="!showCompactMode">
        <div class="brand-icon">
          <span class="material-symbols-outlined">auto_awesome</span>
        </div>
        <span class="brand-name">adsmagic</span>

        <button
          class="sidebar-toggle"
          title="Recolher sidebar"
          type="button"
          @click="toggleSidebar"
        >
          <PanelLeft class="h-[18px] w-[18px]" />
        </button>
      </template>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <!-- NAVEGAÇÃO -->
      <span v-if="!showCompactMode" class="nav-label">Navegação</span>
      <button
        class="nav-link"
        :class="[{ 'nav-link--compact': showCompactMode }, { active: isHome() && !props.selectedJourneyId }]"
        :title="showCompactMode ? 'Início' : undefined"
        type="button"
        @click="handleHomeNavigation"
      >
        <span class="material-symbols-outlined">home</span>
        <span v-if="!showCompactMode">Início</span>
      </button>

      <!-- JORNADAS -->
      <span v-if="!showCompactMode" class="nav-label nav-label--jornadas">Jornadas</span>
      <button
        v-for="j in journeys"
        :key="j.id"
        type="button"
        class="nav-persona"
        :class="{ 'nav-persona--compact': showCompactMode, 'nav-persona--active': isJourneyContext() && props.selectedJourneyId === j.id }"
        :style="{ '--p-color': toneColor[j.tone] }"
        :aria-label="'Ver jornada ' + j.name"
        :aria-current="isJourneyContext() && props.selectedJourneyId === j.id ? 'page' : undefined"
        :title="showCompactMode ? j.name : undefined"
        @click="handleJourneySelection(j.id)"
      >
        <span class="material-symbols-outlined nav-persona-icon" aria-hidden="true">{{ journeyIcons[j.iconKey] || 'circle' }}</span>
        <span v-if="!showCompactMode" class="nav-persona-name">{{ j.name }}</span>
        <span v-if="!showCompactMode" class="material-symbols-outlined nav-persona-arrow" aria-hidden="true">chevron_right</span>
      </button>

      <!-- RECURSOS -->
      <span v-if="!showCompactMode" class="nav-label">Recursos</span>
      <RouterLink class="nav-link" :class="[{ active: isRouteActive('/rotas') }, { 'nav-link--compact': showCompactMode }]" :title="showCompactMode ? 'Rotas' : undefined" to="/rotas" @click="clearJourneySelection">
        <span class="material-symbols-outlined">route</span>
        <span v-if="!showCompactMode">Rotas</span>
      </RouterLink>
      <RouterLink class="nav-link" :class="[{ active: isRouteActive('/wiki') }, { 'nav-link--compact': showCompactMode }]" :title="showCompactMode ? 'Wiki' : undefined" to="/wiki" @click="clearJourneySelection">
        <span class="material-symbols-outlined">menu_book</span>
        <span v-if="!showCompactMode">Wiki</span>
      </RouterLink>
      <RouterLink
        class="nav-link"
        :class="[{ active: $route.path.startsWith('/styleguide') }, { 'nav-link--compact': showCompactMode }]"
        :title="showCompactMode ? 'BrandOS' : undefined"
        to="/styleguide"
        @click="clearJourneySelection"
      >
        <span class="material-symbols-outlined">design_services</span>
        <span v-if="!showCompactMode">BrandOS</span>
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="env-badge">
        <span class="env-dot"></span>
        <span v-if="!showCompactMode">workspace-produto</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* ── Material Symbols base ── */
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
.sidebar {
  --bg: #0a0a0a;
  --surface: #111111;
  --surface-2: #1a1a1a;
  --border: rgba(255,255,255,0.08);
  --text: #ededed;
  --text-muted: #888;
  --text-dim: #555;
  --accent: #6366f1;
  --accent-glow: rgba(99,102,241,0.18);
  --r: 8px;
  --t: 150ms ease;

  border-right: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  position: sticky;
  top: 0;
  height: 100vh;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: padding var(--t);
}

/* ── Brand ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 18px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 14px;
}

.sidebar-brand--collapsed {
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding-inline: 0;
}

.brand-toggle,
.sidebar-toggle {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color var(--t), background var(--t);
}

.brand-toggle {
  border-radius: 12px;
}

.brand-toggle:hover,
.sidebar-toggle:hover {
  color: var(--text);
}

.brand-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
}

.sidebar-toggle {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border-radius: 8px;
}

/* ── Nav ── */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 8px 6px;
}

.nav-label--jornadas {
  margin-top: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--r);
  text-decoration: none;
  color: var(--text-muted);
  font-size: 13.5px;
  transition: background var(--t), color var(--t);
}

.nav-link--compact {
  justify-content: center;
  padding-inline: 0;
  width: 100%;
}

.nav-link:hover { background: var(--surface-2); color: var(--text); }
.nav-link.active { background: var(--accent-glow); color: var(--accent); }
.nav-link--disabled { opacity: 0.38; cursor: default; pointer-events: none; }

.nav-soon {
  margin-left: auto;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-dim);
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 1px 6px;
  border-radius: 20px;
}

.nav-external { margin-left: auto; font-size: 13px; opacity: 0.4; }

/* ── Persona/Journey buttons ── */
.nav-persona {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--r);
  border: none;
  background: none;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  width: 100%;
  cursor: pointer;
  transition: background var(--t), color var(--t);
}

.nav-persona--compact {
  justify-content: center;
  padding-inline: 0;
}

.nav-persona:hover { background: var(--surface-2); color: var(--text); }
.nav-persona:hover .nav-persona-icon { color: var(--p-color); }

.nav-persona-icon {
  font-size: 15px;
  color: var(--text-dim);
  transition: color var(--t);
  flex-shrink: 0;
}

.nav-persona-name { flex: 1; }

.nav-persona-arrow {
  font-size: 13px;
  color: var(--text-dim);
  opacity: 0;
  transition: opacity var(--t);
}

.nav-persona:hover .nav-persona-arrow { opacity: 1; }

.nav-persona--active {
  background: color-mix(in srgb, var(--p-color) 18%, transparent);
  color: var(--text);
  border-left: 3px solid var(--p-color);
  padding-left: 7px;
}

.nav-persona--active .nav-persona-icon { color: var(--p-color); }
.nav-persona--active .nav-persona-arrow { opacity: 1; color: var(--p-color); }

/* ── Footer ── */
.sidebar-footer {
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.env-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--text-dim);
  padding: 4px 8px;
}

.sidebar--collapsed {
  padding-inline: 10px;
}

.sidebar--collapsed .sidebar-nav {
  align-items: center;
}

.sidebar--collapsed .sidebar-footer {
  display: flex;
  justify-content: center;
}

.sidebar--collapsed .env-badge {
  justify-content: center;
  padding-inline: 0;
}

.sidebar--collapsed .nav-persona--active {
  border-left: 0;
  padding-left: 0;
}

.env-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #28C76F;
  flex-shrink: 0;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--border);
    flex-direction: row;
    align-items: center;
    padding: 10px 14px;
    width: 100%;
    overflow: visible;
    gap: 12px;
  }

  .sidebar-nav { flex-direction: row; align-items: center; flex: 1; flex-wrap: wrap; }
  .nav-label, .sidebar-footer, .nav-persona { display: none; }
}
</style>

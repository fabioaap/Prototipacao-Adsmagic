<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useExperimentsStore } from '@/stores/experiments'
import {
  experimentStages,
  priorityConfig,
  type Experiment,
  type ExperimentStage,
  type ExperimentPriority,
  type ExperimentHorizon,
} from '@/data/experiments'

const store = useExperimentsStore()
const docsPortalBaseUrl = (import.meta.env.VITE_DOCS_PORTAL_URL || `${import.meta.env.BASE_URL}wiki`).replace(/\/$/, '')
const kanbanAgentsGuideUrl = `${docsPortalBaseUrl}/workflow/agentes-na-ide`
const agentsPreflightStorageKey = 'adsmagic.kanban.agents-preflight.completed'
const agentsPreflightCompleted = ref(false)

// ── View toggle ───────────────────────────────────────────────────────────────
const activeView = ref<'board' | 'roadmap'>('board')
const boardPanelId = 'kanban-board-panel'
const roadmapPanelId = 'kanban-roadmap-panel'

// ── Detail panel ──────────────────────────────────────────────────────────────
const selectedExp = ref<Experiment | null>(null)
const detailPanelRef = ref<HTMLElement | null>(null)
const detailTriggerRef = ref<HTMLElement | null>(null)
const showDeleteConfirm = ref(false)

// Editable draft — synced from selectedExp
const draft = reactive({ title: '', hypothesis: '', result: '', owner: '', branch: '' })

watch(selectedExp, (exp) => {
  showDeleteConfirm.value = false
  if (exp) {
    draft.title = exp.title
    draft.hypothesis = exp.hypothesis
    draft.result = exp.result ?? ''
    draft.owner = exp.owner
    draft.branch = exp.branch
    showStageDropdown.value = false
    showPriorityDropdown.value = false
    showHorizonDropdown.value = false
  }
})

// Dropdowns inside the panel
const showStageDropdown = ref(false)
const showPriorityDropdown = ref(false)
const showHorizonDropdown = ref(false)

function rememberFocusedElement() {
  return document.activeElement instanceof HTMLElement ? document.activeElement : null
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return []

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden') && !!element.getClientRects().length)
}

function trapFocusWithin(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== 'Tab') return false

  const focusable = getFocusableElements(container)
  if (!container || focusable.length === 0) {
    event.preventDefault()
    container?.focus()
    return true
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const activeElement = document.activeElement as HTMLElement | null

  if (event.shiftKey) {
    if (!activeElement || activeElement === first || activeElement === container) {
      event.preventDefault()
      last.focus()
      return true
    }
    return false
  }

  if (!activeElement || activeElement === last) {
    event.preventDefault()
    first.focus()
    return true
  }

  return false
}

function setWorkspaceShellInert(isInert: boolean) {
  const shell = document.querySelector('#app > .shell, #app > .embedded-shell') as HTMLElement | null
  if (!shell) return

  if (isInert) {
    shell.setAttribute('inert', '')
    shell.setAttribute('aria-hidden', 'true')
    return
  }

  shell.removeAttribute('inert')
  shell.removeAttribute('aria-hidden')
}

function restoreFocus(target: HTMLElement | null) {
  nextTick(() => {
    if (target?.isConnected) {
      target.focus()
      return
    }

    const fallback = document.querySelector('[aria-label="Criar novo experimento"]') as HTMLElement | null
    fallback?.focus()
  })
}

function openDetail(exp: Experiment, trigger = rememberFocusedElement()) {
  detailTriggerRef.value = trigger
  // Reference the reactive store object directly so edits auto-reflect
  selectedExp.value = store.experiments.find((e) => e.id === exp.id) ?? exp
  nextTick(() => detailPanelRef.value?.focus())
}

function closeDetail(restoreTrigger = true) {
  showDeleteConfirm.value = false
  selectedExp.value = null
  if (restoreTrigger) restoreFocus(detailTriggerRef.value)
}

function deleteSelectedExperiment() {
  if (!selectedExp.value) return

  const deleted = store.deleteExperiment(selectedExp.value.id)
  if (!deleted) return

  closeDetail()
}

function saveField(field: 'title' | 'hypothesis' | 'result' | 'owner' | 'branch') {
  if (!selectedExp.value) return
  store.updateExperiment(selectedExp.value.id, { [field]: draft[field] } as Partial<Experiment>)
}

function changeStage(stage: ExperimentStage) {
  if (!selectedExp.value) return
  store.updateExperiment(selectedExp.value.id, { stage })
  showStageDropdown.value = false
}

function changePriority(priority: ExperimentPriority) {
  if (!selectedExp.value) return
  store.updateExperiment(selectedExp.value.id, { priority })
  showPriorityDropdown.value = false
}

function changeHorizon(horizon: ExperimentHorizon) {
  if (!selectedExp.value) return
  store.updateExperiment(selectedExp.value.id, { horizon })
  showHorizonDropdown.value = false
}

function setAgentsPreflightCompleted(completed: boolean) {
  agentsPreflightCompleted.value = completed

  try {
    window.localStorage.setItem(agentsPreflightStorageKey, completed ? 'true' : 'false')
  } catch {
    // Ignore local persistence failures and keep the in-memory state.
  }
}

// ── Create modal ──────────────────────────────────────────────────────────────
const showCreateModal = ref(false)
const createModalRef = ref<HTMLElement | null>(null)
const createTitleInputRef = ref<HTMLInputElement | null>(null)
const modalTriggerRef = ref<HTMLElement | null>(null)
const newExp = reactive({
  title: '',
  hypothesis: '',
  priority: 'medium' as ExperimentPriority,
  stage: 'backlog' as ExperimentStage,
  horizon: 'later' as ExperimentHorizon,
})

function closeCreateModal(restoreTrigger = true) {
  showCreateModal.value = false
  if (restoreTrigger) restoreFocus(modalTriggerRef.value)
}

function openCreateModal(stage: ExperimentStage = 'backlog', trigger = rememberFocusedElement()) {
  modalTriggerRef.value = trigger
  newExp.title = ''
  newExp.hypothesis = ''
  newExp.priority = 'medium'
  newExp.stage = stage
  newExp.horizon = 'later'
  showCreateModal.value = true
  nextTick(() => {
    createTitleInputRef.value?.focus()
  })
}

function submitCreate() {
  if (!newExp.title.trim()) return
  const id = store.createExperiment({
    title: newExp.title.trim(),
    hypothesis: newExp.hypothesis.trim(),
    priority: newExp.priority,
    stage: newExp.stage,
    horizon: newExp.horizon,
    owner: '@dev',
    branch: '',
    attachments: [],
    issues: [],
  })
  closeCreateModal(false)
  nextTick(() => {
    const created = store.experiments.find((e) => e.id === id)
    if (created) openDetail(created, modalTriggerRef.value)
  })
}

const overlayIsOpen = computed(() => showCreateModal.value || Boolean(selectedExp.value))

watch(overlayIsOpen, (isOpen) => {
  setWorkspaceShellInert(isOpen)
})

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
function openDetailFromKeyboard(exp: Experiment, event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  openDetail(exp, event.currentTarget instanceof HTMLElement ? event.currentTarget : rememberFocusedElement())
}

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement).tagName
  const isInput =
    tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable

  const activeOverlay = showCreateModal.value ? createModalRef.value : selectedExp.value ? detailPanelRef.value : null
  if (activeOverlay && trapFocusWithin(e, activeOverlay)) return

  if (e.key === 'Escape') {
    if (showStageDropdown.value || showPriorityDropdown.value || showHorizonDropdown.value) {
      showStageDropdown.value = false
      showPriorityDropdown.value = false
      showHorizonDropdown.value = false
      return
    }
    if (showCreateModal.value) { closeCreateModal(); return }
    closeDetail()
    return
  }

  if ((e.key === 'c' || e.key === 'C') && !isInput && !e.ctrlKey && !e.metaKey) {
    if (!selectedExp.value && !showCreateModal.value) openCreateModal()
  }
}

onMounted(() => {
  try {
    agentsPreflightCompleted.value = window.localStorage.getItem(agentsPreflightStorageKey) === 'true'
  } catch {
    agentsPreflightCompleted.value = false
  }

  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  setWorkspaceShellInert(false)
})

// ── Stage helpers ─────────────────────────────────────────────────────────────
const stageMap = Object.fromEntries(experimentStages.map((s) => [s.id, s]))

// ── Roadmap ───────────────────────────────────────────────────────────────────
const horizons = [
  { id: 'now',   label: '🟢 Now',  desc: 'Em execução neste ciclo' },
  { id: 'next',  label: '🟡 Next', desc: 'Priorizado para o próximo ciclo' },
  { id: 'later', label: '⚪ Later', desc: 'No radar, sem prazo definido' },
] as const

const roadmapColumns = computed(() =>
  horizons.map((h) => ({
    ...h,
    experiments: store.filtered.filter((e) => e.horizon === h.id),
  }))
)

const totalActive = computed(() =>
  store.experiments.filter((e) => !['done', 'archived'].includes(e.stage)).length
)

// ── Horizon config (for dropdowns) ────────────────────────────────────────────
const horizonConfig: Record<ExperimentHorizon, { label: string; color: string }> = {
  now:   { label: '🟢 Now',  color: '#22c55e' },
  next:  { label: '🟡 Next', color: '#eab308' },
  later: { label: '⚪ Later', color: '#6b7280' },
}

const showAgentsSetupBanner = computed(() => !agentsPreflightCompleted.value)
</script>

<template>
  <div class="experiments-view space-y-6">

    <!-- ── Page header ──────────────────────────────────────────────────── -->
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#555]">Prototipação</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[#ededed]">Kanban de Experimentos</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-[#888]">
          Acompanhe cada hipótese — do backlog ao canary — e registre o que foi aprendido.
        </p>
      </div>
      <div class="shrink-0 rounded-[10px] border border-white/[0.08] bg-[#111111] px-4 py-3 text-sm text-[#888] flex items-center gap-3">
        <span class="text-[#888]">
          <span class="font-semibold text-[#ededed]">{{ totalActive }}</span> ativos
        </span>
        <span class="text-[#333]">·</span>
        <span class="text-[#888]">
          <span class="font-semibold text-[#ededed]">{{ store.experiments.length }}</span> total
        </span>
        <span
          v-if="store.filterPriority || store.filterHorizon || store.searchQuery"
          class="rounded-full border border-primary-500/20 bg-primary-500/12 px-2 py-0.5 text-xs text-primary-300"
        >
          filtrado
        </span>
      </div>
    </section>

    <section v-if="showAgentsSetupBanner" class="overflow-hidden rounded-[14px] border border-sky-500/12 bg-[linear-gradient(135deg,rgba(8,15,22,0.96),rgba(11,18,28,0.92))] shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
      <div class="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-3xl">
          <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/70">Uso com agentes</p>
          <h3 class="mt-2 text-sm font-semibold text-[#ededed]">Antes de usar cards como origem de prompts, sincronize os agentes da sua IDE.</h3>
          <p class="mt-1.5 text-sm leading-6 text-slate-300/72">
            Os agentes já estão versionados no repo, mas o primeiro acesso do dev ainda exige sync e validação do ambiente.
            Sem isso, <span class="text-sky-200">@dev</span>, <span class="text-sky-200">@architect</span> e afins continuam sendo apenas metadados no card.
          </p>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2.5">
          <a
            :href="kanbanAgentsGuideUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir documentação de onboarding de agentes na IDE"
            class="inline-flex items-center gap-2 rounded-[10px] border border-sky-400/20 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/16"
          >
            Ler onboarding na wiki
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14 5h5m0 0v5m0-5L10 14" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 14v5H5V5h5" />
            </svg>
          </a>
          <button
            type="button"
            @click="setAgentsPreflightCompleted(true)"
            class="inline-flex items-center gap-2 rounded-[10px] border border-white/[0.12] bg-black/20 px-3.5 py-2 text-xs font-medium text-[#ededed] transition-colors hover:bg-white/[0.06]"
          >
            Já sincronizei minha IDE
          </button>
          <span class="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-1 text-[11px] text-slate-300/65">
            Primeiro acesso: sync + validate
          </span>
        </div>
      </div>
    </section>

    <!-- ── Toolbar ──────────────────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-[#111111] p-4">

      <!-- View toggle -->
      <div class="flex rounded-[10px] border border-white/[0.08] bg-[#0a0a0a] p-1" role="tablist" aria-label="Visualização do quadro de experimentos">
        <button
          @click="activeView = 'board'"
          role="tab"
          :aria-selected="activeView === 'board'"
          :aria-controls="boardPanelId"
          :class="[
            'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
            activeView === 'board'
              ? 'bg-[#2a2a2a] text-[#ededed] shadow-sm'
              : 'text-[#555] hover:text-[#ededed]',
          ]"
        >
          Board
        </button>
        <button
          @click="activeView = 'roadmap'"
          role="tab"
          :aria-selected="activeView === 'roadmap'"
          :aria-controls="roadmapPanelId"
          :class="[
            'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
            activeView === 'roadmap'
              ? 'bg-[#2a2a2a] text-[#ededed] shadow-sm'
              : 'text-[#555] hover:text-[#ededed]',
          ]"
        >
          Roadmap
        </button>
      </div>

      <div class="h-4 w-px bg-white/[0.08]" />

      <!-- Search -->
      <div class="relative">
        <svg
          class="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555]"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          :value="store.searchQuery"
          @input="store.setSearchQuery(($event.target as HTMLInputElement).value)"
          type="text"
          aria-label="Buscar experimento"
          placeholder="Buscar experimento..."
          class="w-52 rounded-[10px] border border-white/[0.12] bg-[#0a0a0a] py-2.5 pl-9 pr-4 text-sm text-[#ededed] placeholder:text-[#444] focus:border-primary-500/50 focus:outline-none"
        />
      </div>

      <!-- Priority filter -->
      <div class="flex items-center gap-1.5">
        <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#555]">Prioridade</span>
        <button
          v-for="p in (['critical', 'high', 'medium', 'low'] as const)"
          :key="p"
          @click="store.setFilterPriority(store.filterPriority === p ? null : p)"
          :class="[
            'flex h-8 items-center gap-1.5 rounded-2xl border px-3 text-xs font-medium transition-all',
            store.filterPriority === p
              ? 'border-white/[0.2] bg-[#2a2a2a] text-[#ededed]'
              : 'border-white/[0.08] bg-[#0a0a0a] text-[#888] hover:border-white/[0.15] hover:text-[#ededed]',
          ]"
        >
          <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: priorityConfig[p].color }" />
          {{ priorityConfig[p].label }}
        </button>
      </div>

      <!-- Clear filters -->
      <button
        v-if="store.filterPriority || store.searchQuery || store.filterHorizon"
        @click="store.clearFilters()"
        class="text-xs text-[#555] transition-colors hover:text-[#ededed]"
      >
        Limpar ×
      </button>

      <!-- New experiment -->
      <button
        @click="openCreateModal()"
        aria-label="Criar novo experimento"
        class="ml-auto flex items-center gap-1.5 rounded-[10px] border border-primary-500/20 bg-primary-500/12 px-3.5 py-2 text-xs font-semibold text-primary-200 transition-colors hover:bg-primary-500/18"
      >
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Novo
        <kbd class="rounded border border-white/10 bg-black/20 px-1 py-0 font-mono text-[9px] text-primary-200/80">C</kbd>
      </button>
    </div>

    <!-- ── BOARD VIEW ────────────────────────────────────────────────────── -->
    <div v-if="activeView === 'board'" :id="boardPanelId" role="tabpanel" class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="col in store.columns"
        :key="col.id"
        class="board-column flex-none"
      >
        <!-- Column header -->
        <div class="mb-3 flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <div class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: col.color }" />
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-[#888]">{{ col.label }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="rounded-full border border-white/[0.08] bg-[#111111] px-2 py-1 text-xs text-[#555]">
              {{ col.count }}
            </span>
            <button
              @click="openCreateModal(col.id)"
              class="rounded-full p-1.5 text-[#444] transition-colors hover:bg-[#1a1a1a] hover:text-[#ededed]"
              title="Novo experimento nesta coluna"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Cards area -->
        <div class="min-h-48 space-y-3 rounded-xl border border-white/[0.08] bg-[#111111] p-3">

          <!-- Empty state -->
          <div v-if="col.count === 0" class="py-8 text-center text-xs text-[#444]">
            Sem experimentos
          </div>

          <!-- Card -->
          <div
            v-for="exp in col.experiments"
            :key="exp.id"
            @click="openDetail(exp)"
            @keydown="openDetailFromKeyboard(exp, $event)"
            tabindex="0"
            role="button"
            :aria-label="`Abrir experimento ${exp.id}: ${exp.title}`"
            class="group relative cursor-pointer overflow-hidden rounded-[10px] border border-white/[0.08] bg-[#0a0a0a] p-4 transition-all hover:border-white/[0.15] hover:bg-[#111111]"
          >
            <!-- Colored left accent -->
            <div
              class="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl"
              :style="{ backgroundColor: col.color }"
            />

            <!-- Header row -->
            <div class="flex items-center gap-2 pl-2">
              <span class="flex-1 font-mono text-[10px] font-bold tracking-wider text-[#444]">{{ exp.id }}</span>
              <span
                class="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold"
                :style="{
                  borderColor: priorityConfig[exp.priority].color + '38',
                  color: priorityConfig[exp.priority].color,
                  backgroundColor: priorityConfig[exp.priority].color + '10',
                }"
              >{{ priorityConfig[exp.priority].label }}</span>
            </div>

            <!-- Title -->
            <p class="mt-2 pl-2 text-sm font-semibold leading-snug text-[#ededed] line-clamp-2">
              {{ exp.title }}
            </p>

            <!-- Hypothesis snippet -->
            <p class="mt-1.5 pl-2 text-xs leading-relaxed text-[#555] line-clamp-2">
              "{{ exp.hypothesis }}"
            </p>

            <!-- Footer -->
            <div class="mt-3 flex items-center gap-2 pl-2">
              <span class="flex-1 truncate font-mono text-[10px] text-[#444]">{{ exp.branch }}</span>
              <span class="shrink-0 rounded-full border border-white/[0.08] bg-[#111111] px-2 py-1 text-[10px] text-[#888]">
                {{ exp.owner.split('+')[0].trim() }}
              </span>
            </div>

            <!-- Issues indicator -->
            <div v-if="exp.issues && exp.issues.length > 0" class="mt-2.5 pl-2">
              <span class="inline-flex items-center gap-1 rounded-full border border-amber-900/40 bg-amber-950/20 px-2 py-0.5 text-[10px] text-amber-500">
                ⚠ {{ exp.issues.length }} issue{{ exp.issues.length > 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ROADMAP VIEW ──────────────────────────────────────────────────── -->
    <div v-else :id="roadmapPanelId" role="tabpanel" class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="horizon in roadmapColumns"
        :key="horizon.id"
        class="min-w-[320px] flex-1"
      >
        <!-- Horizon header -->
        <div class="mb-3 flex items-center justify-between px-1">
          <h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-[#888]">{{ horizon.label }}</h3>
          <span class="text-xs text-[#444]">{{ horizon.desc }}</span>
        </div>

        <!-- Experiments area -->
        <div class="min-h-48 space-y-3 rounded-xl border border-white/[0.08] bg-[#111111] p-3">
          <div v-if="horizon.experiments.length === 0"
            class="py-8 text-center text-xs text-[#444]"
          >
            Sem experimentos
          </div>

          <div
            v-for="exp in horizon.experiments"
            :key="exp.id"
            @click="openDetail(exp)"
            @keydown="openDetailFromKeyboard(exp, $event)"
            tabindex="0"
            role="button"
            :aria-label="`Abrir experimento ${exp.id}: ${exp.title}`"
            class="cursor-pointer rounded-[10px] border border-white/[0.08] bg-[#0a0a0a] p-4 transition-all hover:border-white/[0.15] hover:bg-[#111111]"
          >
            <div class="flex items-start gap-2.5">
              <div
                class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                :style="{ backgroundColor: stageMap[exp.stage]?.color }"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10px] text-[#444]">{{ exp.id }}</span>
                  <span class="text-[10px]" :style="{ color: stageMap[exp.stage]?.color }">
                    {{ stageMap[exp.stage]?.emoji }} {{ stageMap[exp.stage]?.label }}
                  </span>
                </div>
                <p class="mt-1.5 text-sm font-semibold text-[#ededed]">{{ exp.title }}</p>
                <p class="mt-1 text-xs text-[#555] line-clamp-1">"{{ exp.hypothesis }}"</p>
                <div class="mt-2.5 flex items-center gap-2">
                  <span
                    class="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                    :style="{
                      borderColor: priorityConfig[exp.priority].color + '38',
                      color: priorityConfig[exp.priority].color,
                    }"
                  >{{ priorityConfig[exp.priority].label }}</span>
                  <span class="text-[10px] text-[#555]">{{ exp.owner }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── DETAIL PANEL (Linear-style) ──────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="panel">
        <div v-if="selectedExp" class="fixed inset-0 z-50 flex justify-end">
          <!-- Backdrop -->
          <div class="panel-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDetail()" />

          <!-- Panel -->
          <div ref="detailPanelRef" class="panel-content relative z-10 flex h-full w-[520px] max-w-[95vw] flex-col border-l border-white/[0.08] bg-[#111111] shadow-[0_32px_80px_rgba(0,0,0,0.45)]" role="dialog" aria-modal="true" aria-labelledby="detail-dialog-title" tabindex="-1">
            <h2 id="detail-dialog-title" class="sr-only">Detalhes do experimento {{ selectedExp.id }}</h2>

            <!-- ── Header: ID + close ──────────────────────────────────── -->
            <div class="flex flex-none items-center gap-3 border-b border-white/[0.08] px-5 py-3.5">
              <span class="flex-1 font-mono text-xs font-bold tracking-wider text-[#555]">
                {{ selectedExp.id }}
              </span>
              <button
                @click="closeDetail()"
                aria-label="Fechar detalhes do experimento"
                class="rounded-lg p-1.5 text-[#555] transition-colors hover:bg-[#1a1a1a] hover:text-[#ededed]"
                title="Fechar  Esc"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- ── Properties bar: Stage · Priority · Horizon ─────────── -->
            <div class="flex flex-none flex-wrap items-center gap-1.5 border-b border-white/[0.06] px-5 py-3">

              <!-- Stage dropdown -->
              <div class="relative">
                <button
                  @click="showStageDropdown = !showStageDropdown; showPriorityDropdown = false; showHorizonDropdown = false"
                  aria-label="Alterar estágio do experimento"
                  aria-haspopup="listbox"
                  :aria-expanded="showStageDropdown"
                  aria-controls="experiment-stage-options"
                  class="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all"
                  :style="{
                    color: stageMap[selectedExp.stage]?.color,
                    borderColor: stageMap[selectedExp.stage]?.color + '40',
                    backgroundColor: stageMap[selectedExp.stage]?.color + '14',
                  }"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: stageMap[selectedExp.stage]?.color }" />
                  {{ stageMap[selectedExp.stage]?.emoji }} {{ stageMap[selectedExp.stage]?.label }}
                  <svg class="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Transition name="dropdown">
                  <div v-if="showStageDropdown" id="experiment-stage-options" role="listbox" aria-label="Estágios disponíveis" class="absolute left-0 top-full z-30 mt-1.5 min-w-[220px] overflow-hidden rounded-[10px] border border-white/[0.08] bg-[#111111] shadow-[0_24px_64px_rgba(0,0,0,0.42)]">
                    <div class="p-1.5">
                      <button
                        v-for="s in experimentStages"
                        :key="s.id"
                        @click="changeStage(s.id)"
                        role="option"
                        :aria-selected="selectedExp.stage === s.id"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[#1a1a1a]"
                        :class="selectedExp.stage === s.id ? 'bg-[#1a1a1a] text-[#ededed]' : 'text-[#888]'"
                      >
                        <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: s.color }" />
                        {{ s.emoji }} {{ s.label }}
                        <svg v-if="selectedExp.stage === s.id" class="ml-auto h-3.5 w-3.5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Priority dropdown -->
              <div class="relative">
                <button
                  @click="showPriorityDropdown = !showPriorityDropdown; showStageDropdown = false; showHorizonDropdown = false"
                  aria-label="Alterar prioridade do experimento"
                  aria-haspopup="listbox"
                  :aria-expanded="showPriorityDropdown"
                  aria-controls="experiment-priority-options"
                  class="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all"
                  :style="{
                    color: priorityConfig[selectedExp.priority].color,
                    borderColor: priorityConfig[selectedExp.priority].color + '40',
                    backgroundColor: priorityConfig[selectedExp.priority].color + '14',
                  }"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: priorityConfig[selectedExp.priority].color }" />
                  {{ priorityConfig[selectedExp.priority].label }}
                  <svg class="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Transition name="dropdown">
                  <div v-if="showPriorityDropdown" id="experiment-priority-options" role="listbox" aria-label="Prioridades disponíveis" class="absolute left-0 top-full z-30 mt-1.5 min-w-[160px] overflow-hidden rounded-[10px] border border-white/[0.08] bg-[#111111] shadow-[0_24px_64px_rgba(0,0,0,0.42)]">
                    <div class="p-1.5">
                      <button
                        v-for="[pid, pc] in Object.entries(priorityConfig)"
                        :key="pid"
                        @click="changePriority(pid as ExperimentPriority)"
                        role="option"
                        :aria-selected="selectedExp.priority === pid"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[#1a1a1a]"
                        :class="selectedExp.priority === pid ? 'bg-[#1a1a1a] text-[#ededed]' : 'text-[#888]'"
                      >
                        <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: pc.color }" />
                        {{ pc.label }}
                        <svg v-if="selectedExp.priority === pid" class="ml-auto h-3.5 w-3.5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Horizon dropdown -->
              <div class="relative">
                <button
                  @click="showHorizonDropdown = !showHorizonDropdown; showStageDropdown = false; showPriorityDropdown = false"
                  aria-label="Alterar horizonte do experimento"
                  aria-haspopup="listbox"
                  :aria-expanded="showHorizonDropdown"
                  aria-controls="experiment-horizon-options"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#0a0a0a] px-2.5 py-1.5 text-xs font-medium text-[#888] transition-all hover:bg-[#1a1a1a]"
                >
                  {{ horizonConfig[selectedExp.horizon].label }}
                  <svg class="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Transition name="dropdown">
                  <div v-if="showHorizonDropdown" id="experiment-horizon-options" role="listbox" aria-label="Horizontes disponíveis" class="absolute left-0 top-full z-30 mt-1.5 min-w-[160px] overflow-hidden rounded-[10px] border border-white/[0.08] bg-[#111111] shadow-[0_24px_64px_rgba(0,0,0,0.42)]">
                    <div class="p-1.5">
                      <button
                        v-for="[hid, hc] in Object.entries(horizonConfig)"
                        :key="hid"
                        @click="changeHorizon(hid as ExperimentHorizon)"
                        role="option"
                        :aria-selected="selectedExp.horizon === hid"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[#1a1a1a]"
                        :class="selectedExp.horizon === hid ? 'bg-[#1a1a1a] text-[#ededed]' : 'text-[#888]'"
                      >
                        {{ hc.label }}
                        <svg v-if="selectedExp.horizon === hid" class="ml-auto h-3.5 w-3.5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- ── Scrollable body ─────────────────────────────────────── -->
            <div class="flex-1 overflow-y-auto">

              <!-- Title — inline editable -->
              <div class="px-5 pt-5 pb-2">
                <textarea
                  v-model="draft.title"
                  @blur="saveField('title')"
                  rows="2"
                  aria-label="Título do experimento"
                  class="w-full resize-none bg-transparent text-lg font-semibold leading-snug text-[#ededed] placeholder:text-[#444] focus:outline-none"
                  placeholder="Título do experimento..."
                />
              </div>

              <div class="mx-5 border-t border-white/[0.06]" />

              <!-- Hypothesis — inline editable textarea -->
              <div class="px-5 py-4">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">Hipótese</p>
                <textarea
                  v-model="draft.hypothesis"
                  @blur="saveField('hypothesis')"
                  rows="3"
                  aria-label="Hipótese do experimento"
                  class="w-full resize-none rounded-[10px] bg-[#0a0a0a] px-3 py-2.5 text-sm italic leading-relaxed text-[#888] placeholder:text-[#444] focus:bg-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-white/[0.08]"
                  placeholder='"Se fizermos X, então Y acontecerá, medido por Z."'
                />
              </div>

              <!-- Properties rows — Linear-style ──────────────────────── -->
              <div class="border-y border-white/[0.06] px-5 py-1">

                <!-- Branch -->
                <div class="flex items-center gap-3 py-2.5">
                  <svg class="h-3.5 w-3.5 shrink-0 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span class="w-28 shrink-0 text-xs text-[#555]">Branch</span>
                  <input
                    v-model="draft.branch"
                    @blur="saveField('branch')"
                    aria-label="Branch do experimento"
                    class="min-w-0 flex-1 bg-transparent font-mono text-xs text-[#888] placeholder:text-[#444] focus:outline-none"
                    placeholder="prototypes/feature/..."
                  />
                </div>

                <!-- Owner -->
                <div class="flex items-center gap-3 py-2.5">
                  <svg class="h-3.5 w-3.5 shrink-0 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="w-28 shrink-0 text-xs text-[#555]">Responsável</span>
                  <input
                    v-model="draft.owner"
                    @blur="saveField('owner')"
                    aria-label="Responsável pelo experimento"
                    class="min-w-0 flex-1 bg-transparent text-xs text-[#888] placeholder:text-[#444] focus:outline-none"
                    placeholder="@dev"
                  />
                </div>

                <!-- Created at -->
                <div class="flex items-center gap-3 py-2.5">
                  <svg class="h-3.5 w-3.5 shrink-0 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="w-28 shrink-0 text-xs text-[#555]">Criado em</span>
                  <span class="tabular-nums text-xs text-[#888]">{{ selectedExp.createdAt }}</span>
                </div>

                <!-- Updated at -->
                <div class="flex items-center gap-3 py-2.5">
                  <svg class="h-3.5 w-3.5 shrink-0 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="w-28 shrink-0 text-xs text-[#555]">Atualizado em</span>
                  <span class="tabular-nums text-xs text-[#888]">{{ selectedExp.updatedAt }}</span>
                </div>
              </div>

              <!-- Result / Aprendizado — editable ─────────────────────── -->
              <div class="px-5 py-4">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">
                  Resultado / Aprendizado
                </p>
                <textarea
                  v-model="draft.result"
                  @blur="saveField('result')"
                  rows="3"
                  aria-label="Resultado ou aprendizado do experimento"
                  class="w-full resize-none rounded-[10px] border border-[rgba(16,185,129,0.18)] bg-[rgba(6,17,13,0.96)] px-3 py-2.5 text-sm leading-relaxed text-[#8ee6ba] placeholder:text-[#4f4f4f] focus:bg-[rgba(8,24,18,0.98)] focus:outline-none focus:ring-1 focus:ring-[rgba(16,185,129,0.22)]"
                  placeholder="O que foi aprendido? Qual foi o resultado?"
                />
              </div>

              <!-- Issues ──────────────────────────────────────────────── -->
              <div v-if="selectedExp.issues && selectedExp.issues.length > 0" class="border-t border-white/[0.06] px-5 py-4">
                <p class="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">Issues</p>
                <div class="space-y-2">
                  <div
                    v-for="(issue, i) in selectedExp.issues"
                    :key="i"
                    class="rounded-2xl border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-400"
                  >
                    ⚠ {{ issue }}
                  </div>
                </div>
              </div>

              <!-- Attachments ─────────────────────────────────────────── -->
              <div v-if="selectedExp.attachments && selectedExp.attachments.length > 0" class="border-t border-white/[0.06] px-5 py-4">
                <p class="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">Anexos</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(att, i) in selectedExp.attachments"
                    :key="i"
                    class="rounded-full border border-white/[0.08] bg-[#0a0a0a] px-2.5 py-1.5 text-xs text-[#888]"
                  >
                    📎 {{ att }}
                  </span>
                </div>
              </div>

              <div class="h-8" />
            </div>

            <div v-if="showDeleteConfirm" class="border-t border-red-500/15 bg-red-500/6 px-5 py-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-xs font-semibold text-red-300">Excluir card</p>
                  <p class="mt-1 text-xs leading-5 text-red-200/80">
                    Esta ação remove o experimento do quadro atual do protótipo.
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="showDeleteConfirm = false"
                    class="rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-[#ededed]"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="deleteSelectedExperiment"
                    class="rounded-xl border border-red-500/20 bg-red-500/12 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/18"
                  >
                    Confirmar exclusão
                  </button>
                </div>
              </div>
            </div>

            <!-- ── Footer: autosave hint ──────────────────────────────── -->
            <div class="flex flex-none items-center justify-between border-t border-white/[0.08] px-5 py-3">
              <div class="flex items-center gap-3">
                <button
                  @click="showDeleteConfirm = !showDeleteConfirm"
                  class="rounded-xl border border-red-500/12 px-3 py-1.5 text-[11px] font-medium text-red-300 transition-colors hover:bg-red-500/10"
                >
                  Excluir card
                </button>
                <span class="text-[10px] text-[#444]">Campos salvam automaticamente ao perder foco</span>
              </div>
              <kbd class="rounded border border-white/[0.08] bg-[#0a0a0a] px-1.5 py-0.5 text-[10px] text-[#555]">Esc</kbd>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- ── CREATE MODAL (atalho C) ───────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="fixed inset-0 z-60 flex items-start justify-center pt-16">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeCreateModal()" />

          <!-- Dialog -->
          <div ref="createModalRef" class="relative z-10 w-[580px] max-w-[95vw] overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111] shadow-[0_32px_80px_rgba(0,0,0,0.5)]" role="dialog" aria-modal="true" aria-labelledby="create-dialog-title" tabindex="-1">
            <h2 id="create-dialog-title" class="sr-only">Novo experimento</h2>

            <!-- Dialog header -->
            <div class="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3.5">
              <button
                @click="closeCreateModal()"
                aria-label="Fechar criação de experimento"
                class="rounded-lg p-1 text-[#555] transition-colors hover:bg-[#1a1a1a] hover:text-[#ededed]"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#555]">Novo Experimento</span>
              <span class="ml-auto font-mono text-[10px] text-[#444]">PROTO-###</span>
            </div>

            <!-- Title input -->
            <div class="px-5 pt-5 pb-3">
              <input
                id="new-exp-title"
                ref="createTitleInputRef"
                v-model="newExp.title"
                @keydown.enter.prevent="submitCreate"
                type="text"
                aria-label="Título do novo experimento"
                placeholder="O que será testado?"
                class="w-full bg-transparent text-[17px] font-semibold text-[#ededed] placeholder:text-[#444] focus:outline-none"
              />
            </div>

            <!-- Stage selector -->
            <div class="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-5 py-3">
              <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#555]">Estágio</span>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="s in experimentStages.slice(0, 5)"
                  :key="s.id"
                  @click="newExp.stage = s.id"
                  :aria-pressed="newExp.stage === s.id"
                  class="flex items-center gap-1 rounded-xl border px-2 py-1 text-[10px] font-medium transition-all"
                  :class="newExp.stage === s.id ? '' : 'border-white/[0.08] text-[#555] hover:border-white/[0.15] hover:text-[#ededed]'"
                  :style="newExp.stage === s.id
                    ? { borderColor: s.color + '50', color: s.color, backgroundColor: s.color + '16' }
                    : {}"
                >
                  {{ s.emoji }} {{ s.label }}
                </button>
              </div>
            </div>

            <!-- Priority + Horizon -->
            <div class="flex flex-wrap items-center gap-4 border-t border-white/[0.06] px-5 py-3">
              <!-- Priority -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#555]">Prioridade</span>
                <div class="flex gap-1">
                  <button
                    v-for="[pid, pc] in Object.entries(priorityConfig)"
                    :key="pid"
                    @click="newExp.priority = pid as ExperimentPriority"
                    :aria-pressed="newExp.priority === pid"
                    class="flex items-center gap-1 rounded-xl border px-2 py-1 text-[10px] font-medium transition-all"
                    :class="newExp.priority === pid ? '' : 'border-white/[0.08] text-[#555] hover:border-white/[0.15] hover:text-[#ededed]'"
                    :style="newExp.priority === pid
                      ? { borderColor: pc.color + '50', color: pc.color, backgroundColor: pc.color + '16' }
                      : {}"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: newExp.priority === pid ? pc.color : '#4b5563' }" />
                    {{ pc.label }}
                  </button>
                </div>
              </div>

              <!-- Horizon -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#555]">Horizon</span>
                <div class="flex gap-1">
                  <button
                    v-for="[hid, hc] in Object.entries(horizonConfig)"
                    :key="hid"
                    @click="newExp.horizon = hid as ExperimentHorizon"
                    :aria-pressed="newExp.horizon === hid"
                    class="rounded-xl border px-2 py-1 text-[10px] font-medium transition-all"
                    :class="newExp.horizon === hid
                      ? 'border-white/[0.2] bg-[#1a1a1a] text-[#ededed]'
                      : 'border-white/[0.08] text-[#555] hover:border-white/[0.15] hover:text-[#ededed]'"
                  >
                    {{ hc.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Hypothesis (optional) -->
            <div class="border-t border-white/[0.06] px-5 py-3">
              <textarea
                v-model="newExp.hypothesis"
                rows="2"
                aria-label="Hipótese do novo experimento"
                placeholder='"Se fizermos X, então Y acontecerá..." (opcional)'
                class="w-full resize-none bg-transparent text-sm italic text-[#888] placeholder:text-[#444] focus:outline-none"
              />
            </div>

            <!-- Footer actions -->
            <div class="flex items-center justify-between border-t border-white/[0.08] px-5 py-4">
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-[#555]">Pressione</span>
                <kbd class="rounded border border-white/[0.08] bg-[#0a0a0a] px-1.5 py-0.5 font-mono text-[10px] text-[#555]">Enter</kbd>
                <span class="text-[10px] text-[#555]">para criar</span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="closeCreateModal()"
                  class="rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-[#ededed]"
                >
                  Cancelar
                </button>
                <button
                  @click="submitCreate"
                  :disabled="!newExp.title.trim()"
                  class="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-all disabled:opacity-40 hover:bg-primary-500"
                >
                  Criar Experimento
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.experiments-view {
  padding: 28px 32px 40px;
  width: 100%;
  max-width: none;
  min-width: 0;
}

.board-column {
  width: clamp(18rem, 26vw, 24rem);
}

/* Backdrop fade */
.panel-enter-active .panel-backdrop,
.panel-leave-active .panel-backdrop {
  transition: opacity 0.25s ease;
}
.panel-enter-from .panel-backdrop,
.panel-leave-to .panel-backdrop {
  opacity: 0;
}

/* Panel slide */
.panel-enter-active .panel-content,
.panel-leave-active .panel-content {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.panel-enter-from .panel-content,
.panel-leave-to .panel-content {
  transform: translateX(100%);
  opacity: 0;
}

/* Dropdown fade+scale */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}

/* Modal fade */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.96);
  opacity: 0;
}

/* Line clamp polyfill for older Tailwind builds */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 1024px) {
  .experiments-view {
    padding: 24px 20px 32px;
    max-width: none;
  }
}
</style>

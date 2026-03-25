<script setup lang="ts">
import { mockHomeJourneys, mockHomeQuickAccess, mockHomeStats } from '@/data/home'
import { RouterLink } from 'vue-router'
import {
  ArrowRight,
  BookMarked,
  BriefcaseBusiness,
  CalendarDays,
  Compass,
  Network,
  ShieldCheck,
  UserCog,
} from 'lucide-vue-next'

const journeys = mockHomeJourneys
const quickAccess = mockHomeQuickAccess
const stats = mockHomeStats

const iconMap = {
  bookMarked: BookMarked,
  briefcaseBusiness: BriefcaseBusiness,
  calendarDays: CalendarDays,
  compass: Compass,
  network: Network,
  shieldCheck: ShieldCheck,
  userCog: UserCog,
} as const

const toneClasses = {
  primary: {
    icon: 'bg-primary-500/12 text-primary-300 ring-1 ring-primary-500/20',
    progress: 'bg-primary-400',
    count: 'text-primary-300',
  },
  cyan: {
    icon: 'bg-cyan-500/12 text-cyan-300 ring-1 ring-cyan-500/20',
    progress: 'bg-cyan-400',
    count: 'text-cyan-300',
  },
  emerald: {
    icon: 'bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-500/20',
    progress: 'bg-emerald-400',
    count: 'text-emerald-300',
  },
  amber: {
    icon: 'bg-amber-500/12 text-amber-300 ring-1 ring-amber-500/20',
    progress: 'bg-amber-400',
    count: 'text-amber-300',
  },
  rose: {
    icon: 'bg-rose-500/12 text-rose-300 ring-1 ring-rose-500/20',
    progress: 'bg-rose-400',
    count: 'text-rose-300',
  },
  violet: {
    icon: 'bg-violet-500/12 text-violet-300 ring-1 ring-violet-500/20',
    progress: 'bg-violet-400',
    count: 'text-violet-300',
  },
} as const

function completionWidth(completed: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((completed / total) * 100)}%`
}

function completionPercent(completed: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((completed / total) * 100)}% concluido`
}
</script>

<template>
  <div class="space-y-8 pb-4">
    <section id="overview" class="scroll-mt-24 overflow-hidden rounded-[2rem] border border-zinc-900 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_30%),linear-gradient(180deg,rgba(24,24,27,0.98),rgba(9,9,11,0.98))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] sm:p-8">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-3xl">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">Workspace</p>
          <h2 class="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Jornadas reais para ler o produto sem depender de menus soltos
          </h2>
          <p class="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            A Home deixa de ser um inventario generico e passa a orientar a operacao por fluxos ponta a ponta.
            O que importa aqui e entender como a estrutura nasce em Rotas, ganha cadencia no Kanban e se estabiliza na Wiki.
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink
              to="/rotas"
              class="inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/15 px-4 py-2.5 text-sm font-medium text-primary-100 transition-colors hover:bg-primary-500/20"
            >
              <span>Comecar por Rotas</span>
              <ArrowRight class="h-4 w-4" />
            </RouterLink>
            <RouterLink
              to="/#journeys"
              class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
            >
              <span>Revisar jornadas</span>
              <ArrowRight class="h-4 w-4" />
            </RouterLink>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-3xl border border-zinc-800/80 bg-zinc-950/55 p-4 backdrop-blur"
          >
            <div class="flex items-baseline gap-1 text-zinc-50">
              <span class="text-3xl font-semibold tracking-tight">{{ stat.value }}</span>
              <span class="text-sm text-zinc-500">{{ stat.total }}</span>
            </div>
            <p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{{ stat.label }}</p>
            <p class="mt-3 text-sm leading-6 text-zinc-400">{{ stat.helper }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="journeys" class="scroll-mt-24">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Mapa de Progresso</p>
          <h3 class="mt-1 text-sm font-semibold text-zinc-200">Jornadas Prioritarias</h3>
        </div>
        <p class="hidden max-w-md text-right text-sm leading-6 text-zinc-500 lg:block">
          Cada jornada mostra onde a leitura comeca, qual superficie sustenta a execucao e quais entregaveis ja estao visiveis no prototipo.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article
          v-for="journey in journeys"
          :key="journey.name"
          class="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/72 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div class="flex flex-col gap-6">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" :class="toneClasses[journey.tone].icon">
                  <component :is="iconMap[journey.iconKey]" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{{ journey.stage }}</p>
                  <h4 class="mt-2 text-xl font-semibold tracking-tight text-zinc-50">{{ journey.name }}</h4>
                  <p class="mt-3 max-w-xl text-sm leading-6 text-zinc-400">{{ journey.summary }}</p>
                </div>
              </div>
              <div class="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-right">
                <p class="text-lg font-semibold" :class="toneClasses[journey.tone].count">
                  {{ journey.completed }}<span class="text-zinc-600">/{{ journey.total }}</span>
                </p>
                <p class="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">{{ completionPercent(journey.completed, journey.total) }}</p>
              </div>
            </div>

            <div class="rounded-3xl border border-zinc-800/80 bg-zinc-950/45 p-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Foco desta etapa</p>
              <p class="mt-3 text-sm leading-6 text-zinc-300">{{ journey.focus }}</p>
            </div>

            <div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Entregaveis visiveis</p>
                <p class="text-xs text-zinc-500">{{ journey.completed }} de {{ journey.total }} ativos</p>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="toneClasses[journey.tone].progress"
                  :style="{ width: completionWidth(journey.completed, journey.total) }"
                ></div>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="outcome in journey.outcomes"
                  :key="outcome"
                  class="rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-300"
                >
                  {{ outcome }}
                </span>
              </div>
            </div>

            <div class="flex flex-wrap gap-3 pt-1">
              <RouterLink
                v-for="destination in journey.destinations"
                :key="destination.label"
                :to="destination.to"
                class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-primary-500/30 hover:text-zinc-50"
              >
                <span>{{ destination.label }}</span>
                <ArrowRight class="h-4 w-4" />
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section id="quick-access" class="scroll-mt-24">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Atalhos Prioritários</p>
          <h3 class="mt-1 text-sm font-semibold text-zinc-200">Acesso rápido</h3>
        </div>
        <RouterLink to="/#journeys" class="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-200">
          <span>Ver todas</span>
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <RouterLink
          v-for="item in quickAccess"
          :key="item.title"
          :to="item.to"
          class="group rounded-3xl border border-zinc-800 bg-zinc-900/72 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-zinc-900"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-300 ring-1 ring-primary-500/20 transition-colors group-hover:bg-primary-500/15">
              <component :is="iconMap[item.iconKey]" class="h-4.5 w-4.5" />
            </div>
            <ArrowRight class="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-300" />
          </div>

          <div class="mt-8">
            <h4 class="text-lg font-semibold tracking-tight text-zinc-100">{{ item.title }}</h4>
            <p class="mt-2 text-sm leading-6 text-zinc-400">{{ item.description }}</p>
            <p class="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">{{ item.area }}</p>
            <p class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors group-hover:text-primary-200">
              <span>{{ item.cta }}</span>
              <ArrowRight class="h-4 w-4" />
            </p>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

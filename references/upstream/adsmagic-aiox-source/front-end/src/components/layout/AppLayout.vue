<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { setCurrentProjectId } from '@/composables/useCurrentProjectId'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Link,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  CreditCard,
  LifeBuoy,
  BookOpen,
  Lightbulb
} from 'lucide-vue-next'
import {
  openFeaturebaseMessenger,
  openFeaturebaseSuggestions,
} from '@/lib/featurebase'
import logoUrl from '@/assets/saas-logo.svg'
import GoogleAdsLogoIcon from '@/components/icons/GoogleAdsLogoIcon.vue'
import MetaAdsLogoIcon from '@/components/icons/MetaAdsLogoIcon.vue'
import ProjectSelector from '@/components/ui/ProjectSelector.vue'
import WhatsAppStatus from '@/components/ui/WhatsAppStatus.vue'
import NotificationCenter from '@/components/ui/NotificationCenter.vue'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import type { NavSection } from '@/components/layout/SidebarNav.vue'
import UsageSummary from '@/components/common/UsageSummary.vue'
import FeaturebaseMessenger from '@/components/layout/FeaturebaseMessenger.vue'
import { useSessionKeepAlive } from '@/composables/useSessionKeepAlive'
import { useBillingStore } from '@/stores/billing'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const billingStore = useBillingStore()
const sidebarCollapsed = ref(false)
const isSidebarOpenMobile = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleSidebarMobile = () => {
  isSidebarOpenMobile.value = !isSidebarOpenMobile.value
}

const closeSidebarMobile = () => {
  isSidebarOpenMobile.value = false
}

interface Props {
  navSections?: NavSection[]
  hideHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  navSections: undefined,
  hideHeader: false,
})

// Dados do usuário vindos da auth store
const userName = computed(() => {
  const user = authStore.user
  if (!user) return 'Usuário'
  return user.name || user.email || 'Usuário'
})

const userRole = computed(() => {
  return 'Usuário'
})

const userAvatar = computed(() => {
  const user = authStore.user
  if (!user?.name) return '?'

  const names = user.name.trim().split(' ').filter(n => n.length > 0)
  if (names.length === 0) return '?'

  const firstName = names[0] ?? ''
  const lastName = names[names.length - 1] ?? ''

  if (names.length === 1) {
    return firstName.substring(0, 2).toUpperCase()
  }

  const firstInitial = firstName?.[0] ?? ''
  const lastInitial = lastName?.[0] ?? ''
  return (firstInitial + lastInitial).toUpperCase()
})

const hasProjectContext = computed(() => Boolean(route.params.projectId))
const isSidebarCollapsed = computed(() => sidebarCollapsed.value && !isSidebarOpenMobile.value)

// Nome do projeto atual
const currentProjectName = computed(() => {
  const routeProjectId = route.params.projectId as string | undefined
  const routeProject = routeProjectId
    ? projectsStore.projects.find((p) => p.id === routeProjectId)
    : null

  // Debug logging
  console.log('[AppLayout] currentProjectName computed:', {
    isLoading: projectsStore.isLoading,
    projectId: route.params.projectId,
    currentProject: projectsStore.currentProject,
    projectName: projectsStore.currentProject?.name,
    routeProjectName: routeProject?.name,
  })
  
  // Quando não há projectId na rota, tratamos como contexto de workspace
  if (!route.params.projectId) {
    return 'Meus Projetos'
  }

  // Se está carregando projeto, mostrar loading
  if (projectsStore.isLoading && route.params.projectId) {
    return 'Carregando...'
  }
  
  // Se há projeto atual, mostrar nome
  if (projectsStore.currentProject?.name) {
    return projectsStore.currentProject.name
  }

  // Fallback: usar projeto da rota quando store ainda não sincronizou currentProject
  if (routeProject?.name) {
    return routeProject.name
  }
  
  // Fallback para quando não há projeto selecionado
  return 'Meus Projetos'
})

// Limpar projeto atual ao sair de rotas com projectId (evita header poluído)
watch(
  () => route.params.projectId,
  async (projectId) => {
    const normalizedProjectId = typeof projectId === 'string' ? projectId : null

    if (!normalizedProjectId && projectsStore.currentProject) {
      await projectsStore.setCurrentProject(null)
      return
    }

    if (!normalizedProjectId) {
      return
    }

    // Manter contexto global de projeto sincronizado com a rota para headers/API.
    setCurrentProjectId(normalizedProjectId)

    // Garantir currentProject da store consistente com a rota após F5.
    if (projectsStore.currentProject?.id !== normalizedProjectId) {
      const fromList = projectsStore.projects.find((p) => p.id === normalizedProjectId)
      if (fromList) {
        await projectsStore.setCurrentProject(fromList)
      } else {
        const loaded = await projectsStore.loadProject(normalizedProjectId)
        if (loaded) {
          await projectsStore.setCurrentProject(loaded)
        }
      }
    }
  },
  { immediate: true }
)

// Fechar sidebar mobile ao trocar de rota
watch(
  () => route.fullPath,
  () => {
    if (isSidebarOpenMobile.value) {
      isSidebarOpenMobile.value = false
    }
  }
)

const { start: startSessionKeepAlive, stop: stopSessionKeepAlive } = useSessionKeepAlive()

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      startSessionKeepAlive()
    } else {
      stopSessionKeepAlive()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopSessionKeepAlive()
})

const baseProjectPath = computed(() => {
  const locale = route.params.locale as string | undefined
  const projectId = route.params.projectId as string | undefined
  if (!locale || !projectId) return null
  return `/${locale}/projects/${projectId}`
})

const outrosSection = computed<NavSection>(() => ({
  id: 'outros',
  title: 'OUTROS',
  defaultOpen: true,
  links: [
    {
      label: 'Suporte',
      icon: LifeBuoy,
      onClick: () => openFeaturebaseMessenger(),
    },
    {
      label: 'Central de ajuda',
      icon: BookOpen,
      onClick: () => openFeaturebaseMessenger('help'),
    },
    {
      label: 'Sugestão de melhorias',
      icon: Lightbulb,
      onClick: () => {
        void openFeaturebaseSuggestions()
      },
    },
  ],
}))

const defaultSections = computed<NavSection[]>(() => {
  const base = baseProjectPath.value
  const locale = route.params.locale as string || 'pt'

  // Se não houver projeto selecionado, mostrar menu de nível superior
  if (!base) {
    return [
      {
        id: 'workspace',
        title: 'WORKSPACE',
        defaultOpen: true,
        links: [
          { label: 'Meus Projetos', icon: LayoutGrid, href: `/${locale}/projects` },
          { label: t('pricing.title'), icon: CreditCard, href: `/${locale}/pricing` },
        ],
      },
      outrosSection.value,
    ]
  }

  return [
    {
      id: 'principal',
      title: 'PRINCIPAL',
      defaultOpen: true,
      links: [
        { label: 'Visão geral', icon: LayoutDashboard, href: `${base}/dashboard` },
        { label: 'Contatos', icon: Users, href: `${base}/contacts` },
        { label: 'Vendas', icon: Briefcase, href: `${base}/sales` },
        { label: 'Links', icon: Link, href: `${base}/tracking` },
        { label: 'Eventos', icon: Calendar, href: `${base}/events` },
      ],
    },
    {
      id: 'campanhas',
      title: 'CAMPANHAS',
      defaultOpen: true,
      links: [
        { label: 'Google Ads', icon: GoogleAdsLogoIcon, href: `${base}/campaigns/google-ads` },
        { label: 'Meta Ads', icon: MetaAdsLogoIcon, href: `${base}/campaigns/meta-ads` },
      ],
    },
    {
      id: 'sistema',
      title: 'SISTEMA',
      defaultOpen: true,
      links: [
        { label: 'Integrações', icon: Plug, href: `${base}/integrations` },
        { label: 'Configurações', icon: Settings, href: `${base}/settings` },
        { label: t('pricing.title'), icon: CreditCard, href: `/${locale}/pricing` },
      ],
    },
    outrosSection.value,
  ]
})

const computedSections = computed(() => props.navSections ?? defaultSections.value)

const handleLogout = async () => {
  await authStore.logout()
  const locale = route.params.locale || 'pt'
  router.push(`/${locale}/login`)
}

// Plan badge in header
const planBadgeLabel = computed(() => {
  if (!billingStore.limits) return null
  const { status, planName, daysRemaining } = billingStore.limits.subscription
  if (status === 'trialing') {
    return `${planName} · ${t('usage.trialDays', { days: daysRemaining })}`
  }
  if (status === 'active') return planName
  if (status === 'expired') return t('usage.expired')
  return null
})

const planBadgeVariant = computed(() => {
  const status = billingStore.limits?.subscription.status
  if (status === 'expired') return 'destructive'
  if (status === 'trialing') return 'trial'
  return 'active'
})

const pricingHref = computed(() => {
  const locale = route.params.locale as string || 'pt'
  return `/${locale}/pricing`
})

// Fetch limits once when layout mounts (non-blocking)
if (authStore.isAuthenticated) {
  billingStore.fetchLimits().catch(() => {})
}
</script>

<template>
  <div class="app-shell" :class="{ 'is-sidebar-open': isSidebarOpenMobile }">
    <!-- Sidebar -->
    <aside
      id="app-sidebar"
      class="app-sidebar"
      :class="{
        'app-sidebar-collapsed': isSidebarCollapsed,
        'is-open': isSidebarOpenMobile
      }"
    >
      <div class="app-sidebar-body">
        <!-- Logo Header -->
        <div class="app-sidebar-header">
          <!-- Logo (always visible, hidden via CSS when collapsed) -->
          <a v-if="!isSidebarCollapsed" class="app-brand" href="/">
            <img
              :src="logoUrl"
              alt="Adsmagic logo"
              width="145"
              height="33"
              class="app-brand-logo"
            />
          </a>
          
          <!-- Toggle Button -->
          <button
            type="button"
            class="app-sidebar-toggle hidden lg:inline-flex"
            :class="{ 'app-sidebar-toggle-collapsed': isSidebarCollapsed }"
            @click="toggleSidebar"
            :aria-label="isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'"
            :aria-expanded="!isSidebarCollapsed"
          >
            <ChevronRight v-if="isSidebarCollapsed" :size="16" />
            <ChevronLeft v-else :size="16" />
          </button>

          <button
            type="button"
            class="app-sidebar-toggle inline-flex lg:hidden"
            :aria-label="t('nav.closeMenu')"
            :aria-expanded="isSidebarOpenMobile"
            @click="closeSidebarMobile"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Navigation com Accordion -->
        <SidebarNav 
          :sections="computedSections" 
          :collapsed="isSidebarCollapsed"
        />

        <!-- Usage Summary (workspace context, sidebar expanded) -->
        <div
          v-if="!hasProjectContext && !isSidebarCollapsed"
          class="app-sidebar-usage"
        >
          <UsageSummary />
        </div>

        <!-- Conta Section (sempre visível) -->
        <div class="app-sidebar-footer">
          <button class="app-sidebar-nav-link app-sidebar-logout" @click="handleLogout">
            <LogOut :size="20" />
            <span v-if="!isSidebarCollapsed">Sair</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay para mobile -->
    <transition name="fade">
      <div
        v-if="isSidebarOpenMobile"
        class="app-sidebar-overlay lg:hidden"
        @click="closeSidebarMobile"
        aria-hidden="true"
      />
    </transition>

    <!-- Main Content -->
    <div class="app-content-wrapper">
      <!-- Header -->
      <header
        v-if="!props.hideHeader"
        class="app-header"
        :class="{ 'app-header--workspace': !hasProjectContext }"
      >
        <div
          class="app-header-inner"
          :class="{ 'app-header-inner--workspace': !hasProjectContext }"
        >
          <!-- Lado esquerdo: Toggle + Seletor de projeto (apenas quando há projectId) -->
          <div class="app-header-left">
            <button
              type="button"
              class="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-control border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              :aria-label="isSidebarOpenMobile ? t('nav.closeMenu') : t('nav.openMenu')"
              :aria-expanded="isSidebarOpenMobile"
              aria-controls="app-sidebar"
              @click="toggleSidebarMobile"
            >
              <Menu v-if="!isSidebarOpenMobile" :size="18" />
              <X v-else :size="18" />
            </button>

            <ProjectSelector
              v-if="hasProjectContext"
              :project-name="currentProjectName"
              compact-on-mobile
            />
          </div>
          
          <!-- Lado direito: Status WhatsApp, Seletor de idioma, Notificações e Menu do usuário -->
          <div
            class="app-header-right"
            :class="{
              'ml-auto': !hasProjectContext,
              'app-header-right--workspace': !hasProjectContext,
            }"
          >
            <WhatsAppStatus v-if="hasProjectContext" compact-on-mobile />
            <LanguageSelector />
            <NotificationCenter />

            <!-- Plan badge -->
            <router-link
              v-if="planBadgeLabel"
              :to="pricingHref"
              class="plan-badge"
              :class="`plan-badge--${planBadgeVariant}`"
            >
              <CreditCard :size="14" />
              <span class="hidden sm:inline">{{ planBadgeLabel }}</span>
            </router-link>

            <!-- Menu do usuário (mantido do original) -->
            <div class="app-user-card">
              <div class="app-user-info">
                <div class="app-user-name">{{ userName }}</div>
                <div class="app-user-role">{{ userRole }}</div>
              </div>
              <div class="app-user-avatar">{{ userAvatar }}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="app-main">
        <slot />
      </main>
    </div>

    <FeaturebaseMessenger />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.plan-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  transition: opacity 0.15s;
}

.plan-badge:hover {
  opacity: 0.85;
}

.plan-badge--active {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.plan-badge--trial {
  background: hsl(var(--warning, 45 93% 47%) / 0.12);
  color: hsl(var(--warning, 45 93% 47%));
}

.plan-badge--destructive {
  background: hsl(var(--destructive) / 0.1);
  color: hsl(var(--destructive));
}

.app-sidebar-usage {
  margin-top: auto;
  padding: 0 1rem;
}

.app-sidebar-usage + .app-sidebar-footer {
  margin-top: 0.75rem;
}
</style>

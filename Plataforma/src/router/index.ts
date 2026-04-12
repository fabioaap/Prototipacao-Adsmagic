import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const landingPagesManifest = __LANDING_PAGES_MANIFEST__
const landingPagesPreviewBaseUrl = (import.meta.env.VITE_LANDING_PAGES_PREVIEW_URL || '').replace(/\/$/, '')

function getManifestPage(manifestId: string) {
  return landingPagesManifest.pages.find((page) => page.id === manifestId) ?? null
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function buildLegacyLandingTarget(manifestId: string, fallbackPath: string, to: RouteLocationNormalized) {
  const manifestPage = getManifestPage(manifestId)
  const previewPath = normalizePath(manifestPage?.previewPath || fallbackPath)
  const baseTarget = landingPagesPreviewBaseUrl
    ? `${landingPagesPreviewBaseUrl}${previewPath}`
    : manifestPage?.canonicalUrl || previewPath

  const currentUrl = new URL(to.fullPath, window.location.origin)
  const targetUrl = new URL(baseTarget, window.location.origin)
  targetUrl.search = currentUrl.search
  targetUrl.hash = currentUrl.hash

  return targetUrl.toString()
}

function redirectLegacyLanding(manifestId: string, fallbackPath: string, to: RouteLocationNormalized) {
  window.location.replace(buildLegacyLandingTarget(manifestId, fallbackPath, to))
  return false
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('@/views/auth/CadastroView.vue'),
      meta: { title: 'Criar conta — Adsmagic' }
    },
    {
      path: '/lp/agencias',
      name: 'lp-agencias',
      beforeEnter: (to) => redirectLegacyLanding('lp-para-agencias', '/para-agencias/', to),
      component: () => import('@/views/landing/AgenciasLandingView.vue'),
      meta: { title: 'Adsmagic para Agências' }
    },
    {
      path: '/lp/home',
      name: 'lp-home',
      beforeEnter: (to) => redirectLegacyLanding('lp-vendas-whatsapp', '/vendas-whatsapp/', to),
      component: () => import('@/views/landing/home/HomeLandingView.vue'),
      meta: { title: 'Adsmagic | Rastrear Leads e Vendas no WhatsApp' }
    },
    {
      path: '/deck/agencias',
      name: 'deck-agencias',
      component: () => import('@/views/deck/DeckAgenciasView.vue'),
      meta: { title: 'Adsmagic — One-Pager Comercial' }
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: 'Início' }
        },
        {
          path: 'dashboard',
          redirect: { name: 'home' }
        },
        {
          path: 'rotas',
          name: 'rotas',
          component: () => import('@/views/tracking/TrackingView.vue'),
          meta: { title: 'Rotas' }
        },
        {
          path: 'kanban',
          name: 'kanban',
          component: () => import('@/views/experiments/ExperimentsKanbanView.vue'),
          meta: { title: 'Kanban de Experimentos' }
        },
        {
          path: 'lps',
          name: 'landing-pages',
          component: () => import('@/views/lps/LandingPagesCatalogView.vue'),
          meta: { title: 'Catalogo de LPs' }
        },
        {
          path: 'sales',
          redirect: { name: 'kanban' }
        },
        {
          path: 'contacts',
          name: 'contacts',
          component: () => import('@/views/contacts/ContactsView.vue'),
          meta: { title: 'Contatos' }
        },
        {
          path: 'campaigns',
          name: 'campaigns',
          component: () => import('@/views/campaigns/CampaignsView.vue'),
          meta: { title: 'Campanhas' }
        },
        {
          path: 'tracking',
          redirect: { name: 'rotas' }
        },
        {
          path: 'integrations',
          name: 'integrations',
          component: () => import('@/views/integrations/IntegrationsView.vue'),
          meta: { title: 'Integrações' }
        },
        {
          path: 'journeys/:journeyId',
          name: 'journey-experience',
          component: () => import('@/views/journeys/JourneyExperienceView.vue'),
          meta: { title: 'Jornada' }
        },
        {
          path: 'messages',
          redirect: { name: 'home' }
        },
        {
          path: 'wiki',
          name: 'wiki',
          component: () => import('@/views/wiki/WikiRedirectView.vue'),
          meta: { title: 'Wiki' }
        },
        {
          path: 'settings',
          redirect: { name: 'home' }
        },
        ...(import.meta.env.DEV ? [{
          path: 'styleguide',
          component: () => import('@/views/styleguide/DesignSystemLayout.vue'),
          meta: { title: 'Design System' },
          children: [
            {
              path: '',
              name: 'ds-hub',
              component: { render: () => null },
            },
            {
              path: ':slug+',
              name: 'ds-page',
              component: () => import('@/views/styleguide/DsPageResolver.vue'),
              meta: { title: 'Design System' },
            },
          ],
        }] : []),
      ]
    }
  ]
})

router.afterEach((to) => {
  const title = to.meta?.title as string
  document.title = title ? `${title} — Adsmagic Workspace` : 'Adsmagic Workspace'
})

export default router

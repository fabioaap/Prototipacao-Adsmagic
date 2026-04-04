import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

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
      component: () => import('@/views/landing/AgenciasLandingView.vue'),
      meta: { title: 'Adsmagic para Agências' }
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

import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
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
          component: () => import('@/views/sales/SalesView.vue'),
          meta: { title: 'Kanban' }
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
          path: 'messages',
          redirect: { name: 'home' }
        },
        {
          path: 'wiki',
          name: 'wiki',
          component: () => import('@/views/wiki/WikiView.vue'),
          meta: { title: 'Wiki' }
        },
        {
          path: 'settings',
          redirect: { name: 'home' }
        },
      ]
    }
  ]
})

router.afterEach((to) => {
  const title = to.meta?.title as string
  document.title = title ? `${title} — Adsmagic Proto` : 'Adsmagic Proto'
})

export default router

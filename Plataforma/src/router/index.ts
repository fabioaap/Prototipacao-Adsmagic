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
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          meta: { title: 'Dashboard' }
        },
        {
          path: 'contacts',
          name: 'contacts',
          component: () => import('@/views/contacts/ContactsView.vue'),
          meta: { title: 'Contatos' }
        },
        {
          path: 'sales',
          name: 'sales',
          component: () => import('@/views/sales/SalesView.vue'),
          meta: { title: 'Vendas' }
        },
        {
          path: 'campaigns',
          name: 'campaigns',
          component: () => import('@/views/campaigns/CampaignsView.vue'),
          meta: { title: 'Campanhas' }
        },
        {
          path: 'tracking',
          name: 'tracking',
          component: () => import('@/views/tracking/TrackingView.vue'),
          meta: { title: 'Links Rastreáveis' }
        },
        {
          path: 'integrations',
          name: 'integrations',
          component: () => import('@/views/integrations/IntegrationsView.vue'),
          meta: { title: 'Integrações' }
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('@/views/messages/MessagesView.vue'),
          meta: { title: 'Mensagens' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/SettingsView.vue'),
          meta: { title: 'Configurações' }
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

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, Handle, Position } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import dagre from '@dagrejs/dagre'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

const BASE = 'http://localhost:5200'

const ROUTES = [
  // --- Auth ---
  { group: 'Auth', name: 'login',                path: '/pt/login',                     auth: false, link: true,  view: 'views/auth/LoginView.vue' },
  { group: 'Auth', name: 'register',             path: '/pt/register',                  auth: false, link: true,  view: 'views/auth/RegisterView.vue' },
  { group: 'Auth', name: 'email-confirmation',   path: '/pt/email-confirmation',         auth: false, link: true,  view: 'views/auth/EmailConfirmationView.vue' },
  { group: 'Auth', name: 'forgot-password',      path: '/pt/forgot-password',            auth: false, link: true,  view: 'views/auth/ForgotPasswordView.vue' },
  { group: 'Auth', name: 'reset-password',       path: '/pt/reset-password',             auth: false, link: true,  view: 'views/auth/ResetPasswordView.vue' },
  { group: 'Auth', name: 'verify-otp',           path: '/pt/verify-otp',                auth: false, link: true,  view: 'views/auth/VerifyOtpView.vue' },
  { group: 'Auth', name: 'oauth-callback',       path: '/pt/auth/oauth/callback',        auth: false, link: true,  view: 'views/auth/OAuthCallback.vue' },
  // --- Onboarding ---
  { group: 'Onboarding', name: 'onboarding',         path: '/pt/onboarding',             auth: true, link: true,  view: 'views/onboarding/OnboardingView.vue' },
  { group: 'Onboarding', name: 'project-wizard',     path: '/pt/project/new',            auth: true, link: true,  view: 'views/project-wizard/ProjectWizardView.vue' },
  { group: 'Onboarding', name: 'project-completion', path: '/pt/project/completion',     auth: true, link: true,  view: 'views/project-wizard/CompletionView.vue' },
  // --- Top Level ---
  { group: 'Top Level', name: 'projects',         path: '/pt/projects',         auth: true, link: true, view: 'views/projects/ProjectsView.vue' },
  { group: 'Top Level', name: 'pricing',           path: '/pt/pricing',          auth: true, link: true, view: 'views/pricing/PricingView.vue' },
  { group: 'Top Level', name: 'company-settings',  path: '/pt/company/settings', auth: true, link: true, view: 'views/companies/CompanySettingsView.vue' },
  // --- Escopo de Projeto ---
  { group: 'Projeto', name: 'dashboard-v2',           path: '/pt/projects/:projectId/dashboard-v2',              auth: true, link: false, view: 'views/dashboard/DashboardV2ViewNew.vue' },
  { group: 'Projeto', name: 'contacts',               path: '/pt/projects/:projectId/contacts',                  auth: true, link: false, view: 'views/contacts/ContactsView.vue' },
  { group: 'Projeto', name: 'sales',                  path: '/pt/projects/:projectId/sales',                     auth: true, link: false, view: 'views/sales/SalesView.vue' },
  { group: 'Projeto', name: 'sales-edit',             path: '/pt/projects/:projectId/sales/:saleId/edit',        auth: true, link: false, view: 'views/sales/SalesView.vue' },
  { group: 'Projeto', name: 'messages',               path: '/pt/projects/:projectId/messages',                  auth: true, link: false, view: 'views/messages/IndexView.vue' },
  { group: 'Projeto', name: 'tracking',               path: '/pt/projects/:projectId/tracking',                  auth: true, link: false, view: 'views/tracking/TrackingView.vue' },
  { group: 'Projeto', name: 'events',                 path: '/pt/projects/:projectId/events',                    auth: true, link: false, view: 'views/events/EventsView.vue' },
  { group: 'Projeto', name: 'integrations',           path: '/pt/projects/:projectId/integrations',              auth: true, link: false, view: 'views/integrations/IntegrationsView.vue' },
  { group: 'Projeto', name: 'analytics',              path: '/pt/projects/:projectId/analytics',                 auth: true, link: false, view: 'views/analytics/AnalyticsView.vue' },
  { group: 'Projeto', name: 'campaigns-google-ads',   path: '/pt/projects/:projectId/campaigns/google-ads',      auth: true, link: false, view: 'views/campaigns/GoogleAdsView.vue' },
  { group: 'Projeto', name: 'campaigns-meta-ads',     path: '/pt/projects/:projectId/campaigns/meta-ads',        auth: true, link: false, view: 'views/campaigns/MetaAdsView.vue' },
  // --- Settings ---
  { group: 'Settings', name: 'settings-general', path: '/pt/projects/:projectId/settings/general', auth: true, link: false, view: 'views/settings/SettingsView.vue' },
  { group: 'Settings', name: 'settings-funnel',  path: '/pt/projects/:projectId/settings/funnel',  auth: true, link: false, view: 'views/settings/FunnelView.vue' },
  { group: 'Settings', name: 'settings-origins', path: '/pt/projects/:projectId/settings/origins', auth: true, link: false, view: 'views/settings/OriginsView.vue' },
  // --- OAuth Callbacks ---
  { group: 'Callbacks', name: 'integrations-meta-callback',   path: '/pt/projects/:projectId/integrations/meta/callback',   auth: true, link: false, view: 'views/integrations/callbacks/MetaCallbackView.vue' },
  { group: 'Callbacks', name: 'integrations-google-callback', path: '/pt/projects/:projectId/integrations/google/callback', auth: true, link: false, view: 'views/integrations/callbacks/GoogleCallbackView.vue' },
  { group: 'Callbacks', name: 'integrations-tiktok-callback', path: '/pt/projects/:projectId/integrations/tiktok/callback', auth: true, link: false, view: 'views/integrations/callbacks/TikTokCallbackView.vue' },
  // --- Dev Only ---
  { group: 'Dev Only', name: 'catalog',                path: '/pt/catalog',               auth: false, link: true, view: 'views/catalog/ComponentsCatalog.vue' },
  { group: 'Dev Only', name: 'dashboard-legacy',       path: '/pt/dashboard-legacy',      auth: false, link: true, view: 'components/features/DashboardLegacy.vue' },
  { group: 'Dev Only', name: 'test-service',           path: '/pt/test-service',          auth: false, link: true, view: 'views/TestServiceView.vue' },
  { group: 'Dev Only', name: 'test-components',        path: '/pt/test-components',       auth: false, link: true, view: 'views/TestComponentsView.vue' },
  { group: 'Dev Only', name: 'test-common-components', path: '/pt/test-common-components',auth: false, link: true, view: 'views/TestCommonComponentsView.vue' },
  { group: 'Dev Only', name: 'test-layouts',           path: '/pt/test-layouts',          auth: false, link: true, view: 'views/TestLayoutsView.vue' },
  { group: 'Dev Only', name: 'test-dashboard',         path: '/pt/test-dashboard',        auth: false, link: true, view: 'views/TestDashboardView.vue' },
  { group: 'Dev Only', name: 'test-contacts',          path: '/pt/test-contacts',         auth: false, link: true, view: 'views/TestContactsView.vue' },
  { group: 'Dev Only', name: 'test-radix',             path: '/pt/test/radix',            auth: false, link: true, view: 'views/test/TestRadixComponents.vue' },
  { group: 'Dev Only', name: 'test-tokens',            path: '/pt/test/tokens',           auth: false, link: true, view: 'views/test/TestRadixComponents.vue' },
]
const GROUPS = [...new Set(ROUTES.map(r => r.group))]

interface GroupMeta {
  icon: string
  accent: string
  text: string
  nodeBg: string
  nodeBorder: string
  badgeBg: string
  badgeText: string
  twBadge: string
}

const GROUP_META: Record<string, GroupMeta> = {
  'Auth':       { icon: '🔐', accent: '#2563eb', text: '#fff', nodeBg: '#eff6ff', nodeBorder: '#bfdbfe', badgeBg: '#dbeafe', badgeText: '#1e40af', twBadge: 'bg-blue-100 text-blue-800' },
  'Onboarding': { icon: '🚀', accent: '#7c3aed', text: '#fff', nodeBg: '#f5f3ff', nodeBorder: '#ddd6fe', badgeBg: '#ede9fe', badgeText: '#5b21b6', twBadge: 'bg-violet-100 text-violet-800' },
  'Top Level':  { icon: '🏠', accent: '#059669', text: '#fff', nodeBg: '#ecfdf5', nodeBorder: '#a7f3d0', badgeBg: '#d1fae5', badgeText: '#065f46', twBadge: 'bg-emerald-100 text-emerald-800' },
  'Projeto':    { icon: '📁', accent: '#d97706', text: '#fff', nodeBg: '#fffbeb', nodeBorder: '#fde68a', badgeBg: '#fef3c7', badgeText: '#92400e', twBadge: 'bg-amber-100 text-amber-800' },
  'Settings':   { icon: '⚙️', accent: '#4f46e5', text: '#fff', nodeBg: '#eef2ff', nodeBorder: '#c7d2fe', badgeBg: '#e0e7ff', badgeText: '#3730a3', twBadge: 'bg-indigo-100 text-indigo-800' },
  'Callbacks':  { icon: '🔑', accent: '#dc2626', text: '#fff', nodeBg: '#fef2f2', nodeBorder: '#fecaca', badgeBg: '#fee2e2', badgeText: '#7f1d1d', twBadge: 'bg-red-100 text-red-800' },
  'Dev Only':   { icon: '🛠️', accent: '#4b5563', text: '#fff', nodeBg: '#f9fafb', nodeBorder: '#d1d5db', badgeBg: '#f3f4f6', badgeText: '#374151', twBadge: 'bg-gray-100 text-gray-700' },
}

const EDGE_DEFS: Edge[] = [
  { id: 'e-root-login',   source: 'root',   target: 'login',   type: 'smoothstep', animated: true,  style: { stroke: '#2563eb', strokeWidth: 2.5 } },
  { id: 'e-root-catalog', source: 'root',   target: 'catalog', type: 'smoothstep', animated: false, label: 'dev', style: { stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5,5' } },
  { id: 'e-login-register', source: 'login',           target: 'register',           type: 'smoothstep', style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-reg-email',      source: 'register',        target: 'email-confirmation', type: 'smoothstep', style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-login-forgot',   source: 'login',           target: 'forgot-password',    type: 'smoothstep', style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-forgot-reset',   source: 'forgot-password', target: 'reset-password',     type: 'smoothstep', style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-reset-verify',   source: 'reset-password',  target: 'verify-otp',         type: 'smoothstep', style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-login-oauth',    source: 'login',           target: 'oauth-callback',     type: 'smoothstep', label: 'OAuth', style: { stroke: '#60a5fa', strokeWidth: 1.5 } },
  { id: 'e-login-onboard',  source: 'login', target: 'onboarding', type: 'smoothstep', animated: true, label: 'sem empresa', style: { stroke: '#7c3aed', strokeWidth: 2 } },
  { id: 'e-login-projects', source: 'login', target: 'projects',   type: 'smoothstep', animated: true, label: 'com empresa',  style: { stroke: '#059669', strokeWidth: 2 } },
  { id: 'e-projects-pricing', source: 'projects', target: 'pricing', type: 'smoothstep', style: { stroke: '#34d399', strokeWidth: 1.5 } },
  { id: 'e-onboard-wizard',      source: 'onboarding',         target: 'project-wizard',     type: 'smoothstep', style: { stroke: '#a78bfa', strokeWidth: 1.5 } },
  { id: 'e-wizard-completion',   source: 'project-wizard',     target: 'project-completion', type: 'smoothstep', style: { stroke: '#a78bfa', strokeWidth: 1.5 } },
  { id: 'e-completion-projects', source: 'project-completion', target: 'projects',           type: 'smoothstep', animated: true, style: { stroke: '#059669', strokeWidth: 2 } },
  { id: 'e-projects-dashboard', source: 'projects', target: 'dashboard-v2', type: 'smoothstep', animated: true, label: 'seleciona projeto', style: { stroke: '#d97706', strokeWidth: 2 } },
  { id: 'e-dash-contacts',    source: 'dashboard-v2', target: 'contacts',     type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 1.5 } },
  { id: 'e-dash-sales',       source: 'dashboard-v2', target: 'sales',        type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 1.5 } },
  { id: 'e-dash-messages',    source: 'dashboard-v2', target: 'messages',     type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 1.5 } },
  { id: 'e-dash-tracking',    source: 'dashboard-v2', target: 'tracking',     type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 1.5 } },
  { id: 'e-dash-events',      source: 'dashboard-v2', target: 'events',       type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 1.5 } },
  { id: 'e-dash-integrations',source: 'dashboard-v2', target: 'integrations', type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 1.5 } },
  { id: 'e-sales-edit',       source: 'sales',        target: 'sales-edit',   type: 'smoothstep', label: 'editar', style: { stroke: '#fcd34d', strokeWidth: 1.5 } },
  { id: 'e-integ-gads',   source: 'integrations', target: 'campaigns-google-ads', type: 'smoothstep', style: { stroke: '#fb923c', strokeWidth: 1.5 } },
  { id: 'e-integ-mads',   source: 'integrations', target: 'campaigns-meta-ads',   type: 'smoothstep', style: { stroke: '#fb923c', strokeWidth: 1.5 } },
  { id: 'e-dash-analytics',    source: 'dashboard-v2', target: 'analytics',        type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 1.5 } },
  { id: 'e-projects-company',  source: 'projects',     target: 'company-settings', type: 'smoothstep', style: { stroke: '#34d399', strokeWidth: 1.5 } },
  { id: 'e-dash-settings',     source: 'dashboard-v2',   target: 'settings-general', type: 'smoothstep', style: { stroke: '#818cf8', strokeWidth: 1.5 } },
  { id: 'e-settings-funnel',   source: 'settings-general', target: 'settings-funnel',  type: 'smoothstep', style: { stroke: '#a5b4fc', strokeWidth: 1.5 } },
  { id: 'e-settings-origins',  source: 'settings-general', target: 'settings-origins', type: 'smoothstep', style: { stroke: '#a5b4fc', strokeWidth: 1.5 } },
  { id: 'e-integ-meta',   source: 'integrations', target: 'integrations-meta-callback',   type: 'smoothstep', style: { stroke: '#fca5a5', strokeWidth: 1.5 } },
  { id: 'e-integ-google', source: 'integrations', target: 'integrations-google-callback', type: 'smoothstep', style: { stroke: '#fca5a5', strokeWidth: 1.5 } },
  { id: 'e-integ-tiktok', source: 'integrations', target: 'integrations-tiktok-callback', type: 'smoothstep', style: { stroke: '#fca5a5', strokeWidth: 1.5 } },
  { id: 'e-cat-legacy',   source: 'catalog', target: 'dashboard-legacy',       type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
  { id: 'e-cat-svc',      source: 'catalog', target: 'test-service',           type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
  { id: 'e-cat-comp',     source: 'catalog', target: 'test-components',        type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
  { id: 'e-cat-common',   source: 'catalog', target: 'test-common-components', type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
  { id: 'e-cat-layouts',  source: 'catalog', target: 'test-layouts',           type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
  { id: 'e-cat-dash',     source: 'catalog', target: 'test-dashboard',         type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
  { id: 'e-cat-contacts', source: 'catalog', target: 'test-contacts',          type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
  { id: 'e-cat-radix',    source: 'catalog', target: 'test-radix',             type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
  { id: 'e-cat-tokens',   source: 'catalog', target: 'test-tokens',            type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4,4' } },
]
const ROOT_WIDTH = 220
const ROOT_HEIGHT = 64

// ── Sitemap / Screenshot tab ────────────────────────────────────────────────

const SS_PAGE_W = 300
const SS_PAGE_H = 200   // 160px screenshot + 40px footer

interface OverlayDef { id: string; page: string; label: string; type: 'drawer' | 'modal' | 'view'; group: string }
const OVERLAYS: OverlayDef[] = [
  // Dashboard
  { id: 'ns-config-drawer',       page: 'dashboard-v2',        label: 'Config. North Star',      type: 'drawer', group: 'Projeto'   },
  { id: 'entity-list-drawer',     page: 'dashboard-v2',        label: 'Drill-down Entidades',     type: 'drawer', group: 'Projeto'   },
  // Contacts
  { id: 'contacts-kanban',         page: 'contacts',            label: 'Visão Kanban',              type: 'view',   group: 'Projeto'   },
  { id: 'contact-form-modal',      page: 'contacts',            label: 'Formulário Contato',       type: 'modal',  group: 'Projeto'   },
  { id: 'contact-details-drawer',  page: 'contacts',            label: 'Detalhes Contato',         type: 'drawer', group: 'Projeto'   },
  { id: 'stages-mgmt-drawer',      page: 'contacts',            label: 'Gerenciar Etapas',         type: 'drawer', group: 'Projeto'   },
  // Sales
  { id: 'sale-details-drawer',    page: 'sales',               label: 'Detalhes Venda',           type: 'drawer', group: 'Projeto'   },
  { id: 'sale-form-modal',        page: 'sales',               label: 'Formulário Venda',         type: 'modal',  group: 'Projeto'   },
  // Tracking
  { id: 'link-form-modal',        page: 'tracking',            label: 'Formulário Link',          type: 'modal',  group: 'Projeto'   },
  { id: 'link-stats-drawer',      page: 'tracking',            label: 'Estatísticas Link',        type: 'drawer', group: 'Projeto'   },
  // Messages
  { id: 'message-form-modal',     page: 'messages',            label: 'Formulário Mensagem',      type: 'modal',  group: 'Projeto'   },
  // Events
  { id: 'event-details-drawer',   page: 'events',              label: 'Detalhes Evento',          type: 'drawer', group: 'Projeto'   },
  // Integrations
  { id: 'integrations-tab-canais', page: 'integrations',        label: 'Aba Canais',               type: 'view',   group: 'Projeto'   },
  { id: 'integrations-tab-ads',    page: 'integrations',        label: 'Aba Anúncios',             type: 'view',   group: 'Projeto'   },
  { id: 'meta-pixel-modal',        page: 'integrations',        label: 'Conectar Meta',            type: 'modal',  group: 'Projeto'   },
  { id: 'google-account-modal',    page: 'integrations',        label: 'Conectar Google',          type: 'modal',  group: 'Projeto'   },
  { id: 'whatsapp-qr-modal',       page: 'integrations',        label: 'QR WhatsApp',              type: 'modal',  group: 'Projeto'   },
  { id: 'google-conv-drawer',      page: 'integrations',        label: 'Ações de Conversão',       type: 'drawer', group: 'Projeto'   },
  // Campaigns
  { id: 'ads-indicators-meta',    page: 'campaigns-meta-ads',  label: 'Indicadores Meta Ads',     type: 'drawer', group: 'Projeto'   },
  { id: 'ads-indicators-google',  page: 'campaigns-google-ads',label: 'Indicadores Google Ads',   type: 'drawer', group: 'Projeto'   },
  // Settings
  { id: 'stage-form-drawer',      page: 'settings-funnel',     label: 'Formulário Etapa',         type: 'drawer', group: 'Settings'  },
  { id: 'origin-form-modal',      page: 'settings-origins',    label: 'Formulário Origem',        type: 'modal',  group: 'Settings'  },
  // Projects
  { id: 'new-project-modal',      page: 'projects',            label: 'Novo Projeto',             type: 'modal',  group: 'Top Level' },
]

function buildSitemapLayout(): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 90, marginx: 32, marginy: 32, align: 'UL' })
  g.setDefaultEdgeLabel(() => ({}))
  g.setNode('root', { width: ROOT_WIDTH, height: ROOT_HEIGHT })
  for (const route of ROUTES) g.setNode(route.name, { width: SS_PAGE_W, height: SS_PAGE_H })
  for (const edge of EDGE_DEFS) g.setEdge(edge.source, edge.target)
  dagre.layout(g)
  const nodes: Node[] = []
  const rootPos = g.node('root')
  nodes.push({
    id: 'root', type: 'root',
    position: { x: rootPos.x - ROOT_WIDTH / 2, y: rootPos.y - ROOT_HEIGHT / 2 },
    data: { label: '/ (raiz)', sub: 'Entrada da aplicação' },
  })
  for (const route of ROUTES) {
    const pos = g.node(route.name)
    nodes.push({
      id: route.name, type: 'ssPageNode',
      position: { x: pos.x - SS_PAGE_W / 2, y: pos.y - SS_PAGE_H / 2 },
      data: { route, overlayCount: OVERLAYS.filter(o => o.page === route.name).length },
    })
  }
  return { nodes, edges: [...EDGE_DEFS] }
}

const { nodes: ssLayoutNodes, edges: ssLayoutEdges } = buildSitemapLayout()
const sitemapSsNodes = ref<Node[]>(ssLayoutNodes)
const sitemapSsEdges = ref<Edge[]>(ssLayoutEdges)

const activeTab   = ref<'rotas' | 'sitemap'>('rotas')
const activeGroup = ref<string | null>(null)
const copiedRoute = ref<string | null>(null)
function openRoute(route: typeof ROUTES[number]) {
  const resolved = route.path
    .replace(':projectId', 'demo-project')
    .replace(':saleId', '1')
  if (route.auth) {
    const ok = window.confirm(
      `⚠️ Rota protegida\n\n"${route.name}" requer autenticação.\n\nSe você não estiver logado nesta aba, será redirecionado para /login.\n\nDeseja abrir mesmo assim?`
    )
    if (!ok) return
  }
  window.open(`${BASE}${resolved}`, '_blank')
}
function onNodeClick(route: typeof ROUTES[number], event: MouseEvent) {
  if (event.shiftKey) {
    navigator.clipboard.writeText(route.view).then(() => {
      copiedRoute.value = route.name
      setTimeout(() => { copiedRoute.value = null }, 2000)
    })
    return
  }
  openRoute(route)
}
function filteredRoutes() {
  return activeGroup.value ? ROUTES.filter(r => r.group === activeGroup.value) : ROUTES
}
function minimapNodeColor(node: Node): string {
  if (node.type === 'root') return '#2563eb'
  if (node.type === 'groupFrame') return GROUP_META[node.data?.group]?.accent ?? '#94a3b8'
  return GROUP_META[node.data?.route?.group]?.accent ?? '#94a3b8'
}
</script>
<template>
  <div class="h-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">
    <header class="bg-card border-b border-border px-6 py-3 flex items-center gap-3 shrink-0">
      <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <span class="text-primary-foreground text-sm font-bold leading-none">R</span>
      </div>
      <div>
        <h1 class="text-sm font-semibold text-foreground leading-tight">Mapa de Rotas — AdsMagic</h1>
        <p class="text-xs text-muted-foreground">Desenvolvimento · <code class="bg-muted px-1 rounded text-[11px]">http://localhost:5200</code></p>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <span class="text-xs font-medium text-foreground bg-muted border border-border rounded px-2 py-1">{{ ROUTES.length }} rotas</span>
        <span class="text-xs font-medium text-warning bg-warning/10 border border-warning/30 rounded px-2 py-1">DEV ONLY · gitignored</span>
      </div>
    </header>

    <nav class="bg-card border-b border-border px-6 flex gap-0 shrink-0">
      <button v-for="tab in [{id:'rotas',label:'Rotas',icon:'☰'},{id:'sitemap',label:'Sitemap',icon:'🖼️'}]" :key="tab.id"
        class="px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
        :class="activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'"
        @click="activeTab = (tab.id as 'rotas' | 'sitemap')">
        <span class="mr-1.5 text-base">{{ tab.icon }}</span>{{ tab.label }}
      </button>
    </nav>
    <div v-show="activeTab === 'rotas'" class="flex-1 overflow-auto">
      <div class="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button v-for="g in GROUPS" :key="g"
            class="rounded-lg border p-3 text-left transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            :style="{ background: GROUP_META[g].nodeBg, borderColor: activeGroup === g ? GROUP_META[g].accent : GROUP_META[g].nodeBorder, boxShadow: activeGroup === g ? `0 0 0 2px ${GROUP_META[g].accent}33` : undefined }"
            @click="activeGroup = activeGroup === g ? null : g">
            <div class="text-lg leading-none mb-1">{{ GROUP_META[g].icon }}</div>
            <div class="text-xl font-bold" :style="{ color: GROUP_META[g].accent }">{{ ROUTES.filter(r => r.group === g).length }}</div>
            <div class="text-[11px] font-medium mt-0.5 leading-tight" :style="{ color: GROUP_META[g].accent }">{{ g }}</div>
          </button>
          <div class="rounded-lg border border-border bg-muted p-3">
            <div class="text-lg leading-none mb-1">🗺️</div>
            <div class="text-xl font-bold text-foreground">{{ ROUTES.length }}</div>
            <div class="text-[11px] font-medium text-muted-foreground mt-0.5">Total</div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="h-8 px-4 rounded-md text-xs font-medium border transition-colors"
            :class="activeGroup === null ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-foreground/30'"
            @click="activeGroup = null">Todas ({{ ROUTES.length }})</button>
          <button v-for="g in GROUPS" :key="g" class="h-8 px-4 rounded-md text-xs font-medium border transition-colors"
            :class="activeGroup === g ? 'text-white border-transparent' : 'bg-card text-muted-foreground border-border hover:border-foreground/30'"
            :style="activeGroup === g ? { background: GROUP_META[g].accent, borderColor: GROUP_META[g].accent } : {}"
            @click="activeGroup = activeGroup === g ? null : g">{{ GROUP_META[g].icon }} {{ g }} ({{ ROUTES.filter(r => r.group === g).length }})</button>
        </div>
        <div class="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-muted border-b border-border">
                <th class="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-28">Grupo</th>
                <th class="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Nome</th>
                <th class="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Path</th>
                <th class="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-14">Auth</th>
                <th class="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">View</th>
                <th class="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Abrir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="route in filteredRoutes()" :key="route.name" class="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td class="px-4 py-2.5"><span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium" :class="GROUP_META[route.group].twBadge">{{ route.group }}</span></td>
                <td class="px-4 py-2.5 font-mono text-xs text-foreground">{{ route.name }}</td>
                <td class="px-4 py-2.5 font-mono text-xs max-w-xs truncate" :title="route.path" :style="{ color: GROUP_META[route.group].accent }">{{ route.path }}</td>
                <td class="px-4 py-2.5"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium" :class="route.auth ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'" :title="route.auth ? 'Requer autenticação' : 'Público'">{{ route.auth ? '✓' : '○' }}</span></td>
                <td class="px-4 py-2.5 font-mono text-[11px] text-muted-foreground max-w-xs truncate hidden lg:table-cell" :title="route.view">{{ route.view }}</td>
                <td class="px-4 py-2.5 text-center">
                  <button class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors" @click="openRoute(route)">↗ Abrir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- ═══ SITEMAP TAB ══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'sitemap'" class="flex-1 flex flex-col min-h-0">
      <div class="bg-card border-b border-border px-6 py-2 flex items-center gap-4 shrink-0 overflow-x-auto">
        <span class="text-xs text-muted-foreground font-medium whitespace-nowrap">Sitemap com screenshots:</span>
        <span class="text-xs text-muted-foreground">👁 clique num nó para abrir a rota</span>
        <div class="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <code class="bg-muted px-1.5 py-0.5 rounded font-mono" style="font-size:11px">pnpm sitemap:capture</code>
          <span>para gerar os prints</span>
        </div>
      </div>
      <div class="flex-1 relative" style="min-height: 600px;">
        <VueFlow :nodes="sitemapSsNodes" :edges="sitemapSsEdges" :fit-view-on-init="true" :default-zoom="0.4" :min-zoom="0.1" :max-zoom="2" :nodes-draggable="true" :nodes-connectable="false" :elements-selectable="true" :fit-view-options="{ padding: 0.2 }" class="sitemap-flow">
          <template #node-root="{ data }">
            <div class="root-node">
              <Handle type="source" :position="Position.Bottom" />
              <div class="px-5 py-3 text-center">
                <div class="text-base font-bold text-foreground">{{ data.label }}</div>
                <div class="text-muted-foreground mt-0.5" style="font-size:11px">{{ data.sub }}</div>
              </div>
            </div>
          </template>
          <template #node-ssPageNode="{ data }">
            <div class="ss-page-node"
              :style="{ '--accent': GROUP_META[data.route.group]?.accent ?? '#94a3b8' }"
              :title="data.route.path"
              @click.stop="onNodeClick(data.route, $event)">
              <Handle type="target" :position="Position.Top" />
              <div class="ss-screenshot-wrap">
                <img
                  :src="`/sitemap/screens/${data.route.name}.jpg`"
                  class="ss-screenshot-img"
                  alt=""
                  loading="eager"
                  @error="(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; const next = img.nextElementSibling as HTMLElement | null; if (next) next.hidden = false }"
                />
                <div class="ss-no-screenshot" hidden>
                  <span class="ss-no-icon">📸</span>
                  <span class="ss-no-label">{{ data.route.name }}</span>
                  <span class="ss-no-hint">pnpm sitemap:capture</span>
                </div>
              </div>
              <div class="ss-footer">
                <div class="ss-name" :style="{ color: GROUP_META[data.route.group]?.accent ?? '#94a3b8' }">{{ data.route.name }}</div>
                <div class="ss-badges">
                  <span class="route-tag" :class="data.route.auth ? 'tag-auth' : 'tag-public'">{{ data.route.auth ? '🔒' : '🌐' }}</span>
                  <span v-if="data.overlayCount > 0" class="route-tag tag-overlay">📐 {{ data.overlayCount }}</span>
                </div>
              </div>
              <Handle type="source" :position="Position.Bottom" />
            </div>
          </template>
          <MiniMap :node-color="minimapNodeColor" :mask-color="'rgba(240,240,240,0.6)'" :width="180" :height="120" class="minimap-custom" />
          <Controls class="controls-custom" />
        </VueFlow>
      </div>
    </div>
  </div>
</template>


<style scoped>
.sitemap-flow {
  width: 100%;
  height: 100%;
  background-color: hsl(var(--muted));
  background-image: radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px);
  background-size: 24px 24px;
}
.root-node {
  background: hsl(var(--card));
  border: 2px solid hsl(var(--primary));
  border-radius: 10px;
  min-width: 200px;
  box-shadow: 0 2px 12px hsl(var(--primary) / 0.15);
}
.group-frame-node {
  width: 100%;
  height: 100%;
  border: 1.5px dashed;
  border-radius: 10px;
  background: var(--frame-bg, hsl(var(--card) / 0.35));
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  pointer-events: none;
  position: relative;
}
.group-frame-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  border-radius: 9px 9px 0 0;
}
.flow-route-node {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-left: 3px solid;
  border-radius: 6px;
  min-width: 215px;
  padding: 7px 10px 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  transition: box-shadow 0.15s, border-color 0.15s;
}
.flow-route-node--open { cursor: pointer; }
.flow-route-node--copy { cursor: copy; }
.flow-route-node:hover {
  box-shadow: 0 2px 10px rgba(0,0,0,0.13);
  border-color: var(--accent, #94a3b8);
}
.flow-route-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
.flow-route-path {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9.5px;
  color: #94a3b8;
  margin-top: 2px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.flow-route-footer {
  display: flex;
  align-items: center;
  margin-top: 5px;
  gap: 4px;
}
.flow-action { font-size: 11px; color: #94a3b8; }
.route-tag {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 500;
  white-space: nowrap;
}
.tag-auth { background: #fee2e2; color: #7f1d1d; }
.tag-public { background: #d1fae5; color: #065f46; }
.tag-dynamic { background: #fef3c7; color: #92400e; font-family: ui-monospace, monospace; font-size: 9px; }
.copied-badge { color: #22c55e; font-size: 10px; font-weight: 700; }
.minimap-custom {
  border-radius: 8px !important;
  border: 1px solid hsl(var(--border)) !important;
  background: hsl(var(--card)) !important;
}
.controls-custom {
  border-radius: 8px !important;
  border: 1px solid hsl(var(--border)) !important;
  background: hsl(var(--card)) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
}
:deep(.vue-flow__controls-button) {
  background: hsl(var(--card)) !important;
  border: 1px solid hsl(var(--border)) !important;
  border-radius: 4px !important;
  fill: hsl(var(--foreground)) !important;
}
:deep(.vue-flow__controls-button:hover) { background: hsl(var(--muted)) !important; }
:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid hsl(var(--border));
  background: hsl(var(--card));
}
:deep(.vue-flow__edge-label) { font-size: 11px; font-family: ui-sans-serif, system-ui, sans-serif; }
:deep(.vue-flow__attribution) { display: none; }
:deep(.vue-flow__pane) { cursor: default; }
:deep(.vue-flow__pane.dragging) { cursor: grabbing; }
:deep(.vue-flow__node.draggable) { cursor: grab; }
:deep(.vue-flow__node.dragging) { cursor: grabbing; }
.root-node { cursor: default; }
.flow-route-node { cursor: pointer; }

/* ═══ Sitemap Screenshot Nodes ════════════════════════════════════════════ */
.ss-page-node {
  background: hsl(var(--card));
  border: 1.5px solid hsl(var(--border));
  border-top: 3px solid var(--accent, #94a3b8);
  border-radius: 8px;
  width: 300px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}
.ss-page-node:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  transform: translateY(-1px);
}
.ss-screenshot-wrap {
  width: 100%;
  height: 160px;
  background: hsl(var(--muted));
  overflow: hidden;
  position: relative;
}
.ss-screenshot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}
.ss-img-hidden { display: none !important; }
.ss-no-screenshot[hidden] { display: none !important; }
.ss-no-screenshot {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: hsl(var(--muted));
}
.ss-no-icon { font-size: 24px; }
.ss-no-label {
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  font-family: ui-monospace, monospace;
}
.ss-no-hint { font-size: 9px; color: hsl(var(--muted-foreground) / 0.6); font-style: italic; }
.ss-footer {
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-height: 38px;
}
.ss-name {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px;
  font-weight: 700;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ss-badges { display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
.tag-overlay { background: #ede9fe; color: #5b21b6; }
</style>
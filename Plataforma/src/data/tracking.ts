export type RouteGroup = 'Auth' | 'Onboarding' | 'Top Level' | 'Projeto' | 'Settings' | 'Callbacks' | 'Dev Only'

export interface RouteMapEntry {
  id: string
  group: RouteGroup
  name: string
  path: string
  requiresAuth: boolean
}

export interface RouteGroupMeta {
  group: RouteGroup
  label: string
  icon: string
  tone: 'blue' | 'violet' | 'emerald' | 'amber' | 'slate' | 'rose'
}

export const routeGroupMeta: RouteGroupMeta[] = [
  { group: 'Auth', label: 'Auth', icon: '🔐', tone: 'blue' },
  { group: 'Onboarding', label: 'Onboarding', icon: '🚀', tone: 'violet' },
  { group: 'Top Level', label: 'Top Level', icon: '🏠', tone: 'emerald' },
  { group: 'Projeto', label: 'Projeto', icon: '📁', tone: 'amber' },
  { group: 'Settings', label: 'Settings', icon: '⚙️', tone: 'slate' },
  { group: 'Callbacks', label: 'Callbacks', icon: '🔑', tone: 'rose' },
  { group: 'Dev Only', label: 'Dev Only', icon: '🛠️', tone: 'slate' },
]

export const mockRoutes: RouteMapEntry[] = [
  { id: 'auth-login', group: 'Auth', name: 'login', path: '/pt/login', requiresAuth: false },
  { id: 'auth-register', group: 'Auth', name: 'register', path: '/pt/register', requiresAuth: false },
  { id: 'auth-email-confirmation', group: 'Auth', name: 'email-confirmation', path: '/pt/email-confirmation', requiresAuth: false },
  { id: 'auth-forgot-password', group: 'Auth', name: 'forgot-password', path: '/pt/forgot-password', requiresAuth: false },
  { id: 'auth-reset-password', group: 'Auth', name: 'reset-password', path: '/pt/reset-password', requiresAuth: false },
  { id: 'auth-magic-link', group: 'Auth', name: 'magic-link', path: '/pt/magic-link', requiresAuth: false },
  { id: 'auth-invite', group: 'Auth', name: 'invite', path: '/pt/invite', requiresAuth: false },

  { id: 'onboarding-welcome', group: 'Onboarding', name: 'welcome', path: '/pt/onboarding', requiresAuth: true },
  { id: 'onboarding-workspace', group: 'Onboarding', name: 'workspace-setup', path: '/pt/onboarding/workspace', requiresAuth: true },
  { id: 'onboarding-integrations', group: 'Onboarding', name: 'integrations', path: '/pt/onboarding/integrations', requiresAuth: true },

  { id: 'top-home', group: 'Top Level', name: 'home', path: '/pt', requiresAuth: false },
  { id: 'top-routes', group: 'Top Level', name: 'rotas', path: '/pt/rotas', requiresAuth: false },
  { id: 'top-sitemap', group: 'Top Level', name: 'sitemap', path: '/pt/sitemap', requiresAuth: false },

  { id: 'project-dashboard', group: 'Projeto', name: 'dashboard', path: '/pt/projeto/dashboard', requiresAuth: true },
  { id: 'project-kanban', group: 'Projeto', name: 'kanban', path: '/pt/projeto/kanban', requiresAuth: true },
  { id: 'project-rotas', group: 'Projeto', name: 'rotas', path: '/pt/projeto/rotas', requiresAuth: true },
  { id: 'project-wiki', group: 'Projeto', name: 'wiki', path: '/pt/projeto/wiki', requiresAuth: true },
  { id: 'project-campaigns', group: 'Projeto', name: 'campaigns', path: '/pt/projeto/campaigns', requiresAuth: true },
  { id: 'project-contacts', group: 'Projeto', name: 'contacts', path: '/pt/projeto/contacts', requiresAuth: true },
  { id: 'project-attribution', group: 'Projeto', name: 'attribution', path: '/pt/projeto/attribution', requiresAuth: true },
  { id: 'project-integrations', group: 'Projeto', name: 'integrations', path: '/pt/projeto/integrations', requiresAuth: true },
  { id: 'project-messages', group: 'Projeto', name: 'messages', path: '/pt/projeto/messages', requiresAuth: true },
  { id: 'project-reports', group: 'Projeto', name: 'reports', path: '/pt/projeto/reports', requiresAuth: true },
  { id: 'project-billing', group: 'Projeto', name: 'billing', path: '/pt/projeto/billing', requiresAuth: true },
  { id: 'project-team', group: 'Projeto', name: 'team', path: '/pt/projeto/team', requiresAuth: true },

  { id: 'settings-profile', group: 'Settings', name: 'profile', path: '/pt/settings/profile', requiresAuth: true },
  { id: 'settings-notifications', group: 'Settings', name: 'notifications', path: '/pt/settings/notifications', requiresAuth: true },
  { id: 'settings-security', group: 'Settings', name: 'security', path: '/pt/settings/security', requiresAuth: true },

  { id: 'callback-meta', group: 'Callbacks', name: 'meta', path: '/pt/callbacks/meta', requiresAuth: false },
  { id: 'callback-google', group: 'Callbacks', name: 'google', path: '/pt/callbacks/google', requiresAuth: false },
  { id: 'callback-stripe', group: 'Callbacks', name: 'stripe', path: '/pt/callbacks/stripe', requiresAuth: false },

  { id: 'dev-storybook', group: 'Dev Only', name: 'storybook', path: '/pt/dev/storybook', requiresAuth: false },
  { id: 'dev-components', group: 'Dev Only', name: 'components', path: '/pt/dev/components', requiresAuth: false },
  { id: 'dev-icons', group: 'Dev Only', name: 'icons', path: '/pt/dev/icons', requiresAuth: false },
  { id: 'dev-typography', group: 'Dev Only', name: 'typography', path: '/pt/dev/typography', requiresAuth: false },
  { id: 'dev-colors', group: 'Dev Only', name: 'colors', path: '/pt/dev/colors', requiresAuth: false },
  { id: 'dev-grid', group: 'Dev Only', name: 'grid', path: '/pt/dev/grid', requiresAuth: false },
  { id: 'dev-mocks', group: 'Dev Only', name: 'mocks', path: '/pt/dev/mocks', requiresAuth: false },
  { id: 'dev-flags', group: 'Dev Only', name: 'feature-flags', path: '/pt/dev/feature-flags', requiresAuth: false },
  { id: 'dev-playground', group: 'Dev Only', name: 'playground', path: '/pt/dev/playground', requiresAuth: false },
  { id: 'dev-debug', group: 'Dev Only', name: 'debug-tools', path: '/pt/dev/debug-tools', requiresAuth: false },
]

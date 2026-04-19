import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationRaw } from 'vue-router'
import { localeGuard, detectUserLocale } from './guards/locale'
import { projectGuard } from './guards/project'
import {
  recordSessionValidation,
  resetSessionValidation,
  shouldValidateSession,
} from '@/services/sessionValidation'
import { useNavigationStore } from '@/stores/navigation'

/**
 * Rotas da aplicação com prefix de locale
 * Estrutura: /:locale/route-name
 */
const routes: RouteRecordRaw[] = [
  // Redirect raiz para login
  {
    path: '/',
    redirect: () => `/${detectUserLocale()}/login`
  },
  // Rota pública de compartilhamento de QR Code do WhatsApp (sem locale, sem auth)
  {
    path: '/share/whatsapp/:token',
    name: 'whatsapp-share',
    component: () => import('@/views/share/WhatsAppShareView.vue'),
    meta: {
      requiresAuth: false,
      skipGuards: true,
      layout: 'blank',
    },
  },
  // Rotas com prefix de locale
  {
    path: '/:locale',
    children: [
      // Auth routes
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: {
          requiresAuth: false,
          layout: 'blank',
        },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: {
          requiresAuth: false,
          layout: 'blank',
        },
      },
      {
        path: 'email-confirmation',
        name: 'email-confirmation',
        component: () => import('@/views/auth/EmailConfirmationView.vue'),
        meta: {
          requiresAuth: false,
          layout: 'blank',
        },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/auth/ForgotPasswordView.vue'),
        meta: {
          requiresAuth: false,
          layout: 'blank',
        },
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('@/views/auth/ResetPasswordView.vue'),
        meta: {
          requiresAuth: false,
          layout: 'blank',
        },
      },
      {
        path: 'verify-otp',
        name: 'verify-otp',
        component: () => import('@/views/auth/VerifyOtpView.vue'),
        meta: {
          requiresAuth: false,
          layout: 'blank',
        },
      },
      {
        path: 'auth/oauth/callback',
        name: 'oauth-callback',
        component: () => import('@/views/auth/OAuthCallback.vue'),
        meta: {
          requiresAuth: false,
          layout: 'blank',
        },
      },
      // Onboarding
      {
        path: 'onboarding',
        name: 'onboarding',
        component: () => import('@/views/onboarding/OnboardingView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: false,
          layout: 'blank',
        },
      },
      // Protected routes
      // Dashboard V2 (nova versão - refatorado seguindo HTML mock)
      {
        path: 'projects/:projectId/dashboard-v2',
        name: 'dashboard-v2',
        component: () => import('@/views/dashboard/DashboardV2ViewNew.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      // Redirecionar rota legada /dashboard para /dashboard-v2
      {
        path: 'projects/:projectId/dashboard',
        redirect: to => ({
          name: 'dashboard-v2',
          params: { ...to.params, locale: to.params.locale || 'pt' }
        })
      },
      {
        path: 'projects/:projectId/contacts',
        name: 'contacts',
        component: () => import('@/views/contacts/ContactsView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/sales',
        name: 'sales',
        component: () => import('@/views/sales/SalesView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/sales/:saleId/edit',
        name: 'sales-edit',
        component: () => import('@/views/sales/SalesView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/messages',
        name: 'messages',
        component: () => import('@/views/messages/IndexView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/tracking',
        name: 'tracking',
        component: () => import('@/views/tracking/TrackingView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/events',
        name: 'events',
        component: () => import('@/views/events/EventsView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/integrations',
        name: 'integrations',
        component: () => import('@/views/integrations/IntegrationsView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/campaigns/google-ads',
        name: 'campaigns-google-ads',
        component: () => import('@/views/campaigns/GoogleAdsView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/campaigns/meta-ads',
        name: 'campaigns-meta-ads',
        component: () => import('@/views/campaigns/MetaAdsView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/integrations/meta/callback',
        name: 'integrations-meta-callback',
        component: () => import('@/views/integrations/callbacks/MetaCallbackView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'blank',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/integrations/google/callback',
        name: 'integrations-google-callback',
        component: () => import('@/views/integrations/callbacks/GoogleCallbackView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'blank',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/integrations/tiktok/callback',
        name: 'integrations-tiktok-callback',
        component: () => import('@/views/integrations/callbacks/TikTokCallbackView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'blank',
        },
        beforeEnter: projectGuard,
      },
      {
        path: 'projects/:projectId/settings',
        name: 'settings',
        component: () => import('@/views/settings/SettingsLayout.vue'),
        redirect: (to) => {
          return {
            name: 'settings-general',
            params: to.params
          }
        },
        beforeEnter: projectGuard,
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
        children: [
          {
            path: 'funnel',
            name: 'settings-funnel',
            component: () => import('@/views/settings/FunnelView.vue'),
            meta: {
              requiresAuth: true,
              requiresOnboarding: true,
              layout: 'default',
            },
          },
          {
            path: 'origins',
            name: 'settings-origins',
            component: () => import('@/views/settings/OriginsView.vue'),
            meta: {
              requiresAuth: true,
              requiresOnboarding: true,
              layout: 'default',
            },
          },
          {
            path: 'general',
            name: 'settings-general',
            component: () => import('@/views/settings/SettingsView.vue'),
            meta: {
              requiresAuth: true,
              requiresOnboarding: true,
              layout: 'default',
            },
          },
        ],
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/projects/ProjectsView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
      },
      // Pricing
      {
        path: 'pricing',
        name: 'pricing',
        component: () => import('@/views/pricing/PricingView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'default',
        },
      },
      // Project Wizard
      {
        path: 'project/new',
        name: 'project-wizard',
        component: () => import('@/views/project-wizard/ProjectWizardView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'blank',
        },
      },
      {
        path: 'project/completion',
        name: 'project-completion',
        component: () => import('@/views/project-wizard/CompletionView.vue'),
        meta: {
          requiresAuth: true,
          requiresOnboarding: true,
          layout: 'blank',
        },
      },
      // Dev-only routes (tree-shaken in production builds)
      ...(import.meta.env.DEV ? [
        {
          path: 'catalog',
          name: 'catalog',
          component: () => import('@/views/catalog/ComponentsCatalog.vue'),
          meta: { requiresAuth: false, layout: 'default' },
        },
        {
          path: 'test-service',
          name: 'test-service',
          component: () => import('@/views/TestServiceView.vue'),
          meta: { requiresAuth: false, layout: 'default' },
        },
        {
          path: 'test-components',
          name: 'test-components',
          component: () => import('@/views/TestComponentsView.vue'),
          meta: { requiresAuth: false, layout: 'default' },
        },
        {
          path: 'test-common-components',
          name: 'test-common-components',
          component: () => import('@/views/TestCommonComponentsView.vue'),
          meta: { requiresAuth: false, layout: 'blank' },
        },
        {
          path: 'test-layouts',
          name: 'test-layouts',
          component: () => import('@/views/TestLayoutsView.vue'),
          meta: { requiresAuth: false, layout: undefined },
        },
        {
          path: 'test-dashboard',
          name: 'test-dashboard',
          component: () => import('@/views/TestDashboardView.vue'),
          meta: { requiresAuth: false, layout: 'default' },
        },
        {
          path: 'test-contacts',
          name: 'test-contacts',
          component: () => import('@/views/TestContactsView.vue'),
          meta: { requiresAuth: false, layout: undefined },
        },
        {
          path: 'test/radix',
          name: 'test-radix',
          component: () => import('@/views/test/TestRadixComponents.vue'),
          meta: { requiresAuth: false, layout: 'blank' },
        },
        {
          path: 'test/tokens',
          name: 'test-tokens',
          component: () => import('@/views/test/TestRadixComponents.vue'),
          meta: { requiresAuth: false, layout: 'blank' },
        },
      ] as RouteRecordRaw[] : []),
      // 404 catch-all (must be last)
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: {
          requiresAuth: false,
          layout: 'blank',
        },
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

let companyGateResolvedForUserId: string | null = null
let onboardingSyncAttemptedForUserId: string | null = null
const GUARD_SESSION_CHECK_TIMEOUT_MS = 3500
const GUARD_COMPANIES_FETCH_TIMEOUT_MS = 4000
const ROUTER_VERBOSE_LOGS = import.meta.env.DEV && import.meta.env.VITE_VERBOSE_ROUTER_LOGS === 'true'
type SessionCheckStatus = 'active' | 'inactive' | 'timeout' | 'error'
type CompaniesGateStatus = 'completed' | 'timeout' | 'error'

const startNavigationFeedback = (toPath: string) => {
  try {
    useNavigationStore().startNavigation(toPath)
  } catch (error) {
    if (ROUTER_VERBOSE_LOGS) {
      console.warn('[Router] Failed to start navigation feedback:', error)
    }
  }
}

const finishNavigationFeedback = () => {
  try {
    useNavigationStore().finishNavigation()
  } catch (error) {
    if (ROUTER_VERBOSE_LOGS) {
      console.warn('[Router] Failed to finish navigation feedback:', error)
    }
  }
}

const ensureSessionWithGuardTimeout = async (): Promise<SessionCheckStatus> => {
  const { ensureSession } = await import('@/services/api/client')
  let settled = false
  const sessionPromise = ensureSession({
    waitForRestore: false,
    skipInFlight: true,
    skipRestoreFallback: true,
    baseTimeoutMs: Math.max(1000, GUARD_SESSION_CHECK_TIMEOUT_MS - 500),
    skipRetries: true,
    throwOnTimeout: true,
    suppressTimeoutWarning: true,
  })
    .then((session) => {
      settled = true
      if (session?.access_token) {
        return 'active' as const
      }
      return 'error' as const
    })
    .catch((error) => {
      settled = true
      if (error instanceof Error && error.message === 'SESSION_TIMEOUT') {
        return 'timeout' as const
      }
      return 'error' as const
    })

  const timeoutPromise = new Promise<SessionCheckStatus>((resolve) =>
    setTimeout(() => {
      if (!settled) {
        resolve('timeout')
      }
    }, GUARD_SESSION_CHECK_TIMEOUT_MS)
  )

  return await Promise.race([sessionPromise, timeoutPromise])
}

const resolveCompaniesGateWithTimeout = async (
  companiesStore: { fetchCompanies: (options: { force: boolean; reason: 'guard' }) => Promise<void> }
): Promise<CompaniesGateStatus> => {
  return await Promise.race([
    companiesStore.fetchCompanies({ force: true, reason: 'guard' }).then(() => 'completed' as const),
    new Promise<CompaniesGateStatus>((resolve) =>
      setTimeout(() => resolve('timeout'), GUARD_COMPANIES_FETCH_TIMEOUT_MS)
    )
  ]).catch(() => 'error')
}

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const guardStartedAt = performance.now()
  startNavigationFeedback(to.fullPath)

  const finish = (target?: string | RouteLocationRaw | Parameters<typeof next>[0]) => {
    if (ROUTER_VERBOSE_LOGS) {
      const elapsedMs = Math.round((performance.now() - guardStartedAt) * 100) / 100
      console.info('[Router] Guard resolved', {
        to: to.fullPath,
        redirect: target ?? null,
        elapsedMs,
      })
    }
    next(target as never)
  }

  // 0. Rotas públicas fora do /:locale (ex: /share/whatsapp/:token) — bypass all guards
  if (to.meta.skipGuards) {
    return finish()
  }

  // 1. Locale Guard - SEMPRE PRIMEIRO
  const localeRedirect = localeGuard(to)
  if (localeRedirect) {
    return finish(localeRedirect)
  }

  // 2. Auth Guard
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    authStore.initialize()
  }

  const requiresAuth = Boolean(to.meta.requiresAuth)
  const requiresOnboarding = Boolean(to.meta.requiresOnboarding)
  const hasProjectContext = typeof to.params.projectId === 'string' && to.params.projectId.length > 0
  const locale = to.params.locale as string || 'en'

  if (!authStore.token || !authStore.user) {
    resetSessionValidation()
    companyGateResolvedForUserId = null
    onboardingSyncAttemptedForUserId = null

    if (requiresAuth) {
      return finish(`/${locale}/login`)
    }
    return finish()
  }

  const currentUserId = authStore.user.id
  const routeNeedsSessionCheck =
    requiresAuth ||
    to.name === 'login' ||
    to.name === 'register' ||
    to.name === 'onboarding'
  const needsSessionValidation = routeNeedsSessionCheck && shouldValidateSession(currentUserId)

  if (needsSessionValidation) {
    const shouldBlockSessionValidation =
      to.name === 'login' ||
      to.name === 'register' ||
      to.name === 'onboarding'

    if (shouldBlockSessionValidation) {
      let sessionCheckStatus: SessionCheckStatus = 'error'
      try {
        sessionCheckStatus = await ensureSessionWithGuardTimeout()
      } catch {
        sessionCheckStatus = 'error'
      }

      if (sessionCheckStatus === 'active') {
        recordSessionValidation(currentUserId)
      } else if (sessionCheckStatus === 'inactive') {
        authStore.clearAuthData()
        resetSessionValidation()
        companyGateResolvedForUserId = null
        onboardingSyncAttemptedForUserId = null
        return finish(`/${locale}/login`)
      } else if (ROUTER_VERBOSE_LOGS) {
        console.warn(`[Router] Session check ${sessionCheckStatus}; preserving auth state`)
      }
    } else {
      const targetPath = to.fullPath
      void ensureSessionWithGuardTimeout()
        .then((status) => {
          const currentAuthUserId = authStore.user?.id ?? null
          if (currentAuthUserId !== currentUserId) {
            if (ROUTER_VERBOSE_LOGS) {
              console.warn('[Router] Ignoring stale background session check result:', {
                expectedUserId: currentUserId,
                currentAuthUserId,
                status,
              })
            }
            return
          }

          if (status === 'active') {
            recordSessionValidation(currentUserId)
            return
          }

          if (status === 'inactive') {
            authStore.clearAuthData()
            resetSessionValidation()
            companyGateResolvedForUserId = null
            onboardingSyncAttemptedForUserId = null

            if (requiresAuth && router.currentRoute.value.fullPath === targetPath) {
              void router.replace(`/${locale}/login`)
            }
          } else if (ROUTER_VERBOSE_LOGS) {
            console.warn(`[Router] Background session check ${status}; keeping current route`)
          }
        })
        .catch((error) => {
          if (ROUTER_VERBOSE_LOGS) {
            console.warn('[Router] Background session check failed:', error)
          }
        })
    }
  }

  const isAuthenticated = authStore.isAuthenticated
  let hasCompanies = false
  let hasCompaniesResolved = false
  let companyGateStatus: CompaniesGateStatus | 'skipped' = 'skipped'

  if (!isAuthenticated) {
    companyGateResolvedForUserId = null
    onboardingSyncAttemptedForUserId = null

    if (requiresAuth) {
      return finish(`/${locale}/login`)
    }
    return finish()
  }

  const shouldResolveCompanyGate =
    requiresOnboarding ||
    to.name === 'login' ||
    to.name === 'register' ||
    to.name === 'onboarding'

  if (shouldResolveCompanyGate) {
    const { useCompaniesStore } = await import('@/stores/companies')
    const companiesStore = useCompaniesStore()
    const isUserSwitch = companyGateResolvedForUserId !== currentUserId
    const isAuthDecisionRoute = to.name === 'login' || to.name === 'register' || to.name === 'onboarding'

    if (isUserSwitch) {
      if (isAuthDecisionRoute) {
        companyGateStatus = await resolveCompaniesGateWithTimeout(companiesStore)

        if (companyGateStatus === 'completed') {
          companyGateResolvedForUserId = currentUserId
          hasCompaniesResolved = true
        } else if (ROUTER_VERBOSE_LOGS) {
          console.warn('[Router] Companies gate unresolved on auth decision route:', { gateStatus: companyGateStatus })
        }
      } else {
        const gateUserId = currentUserId
        void companiesStore.fetchCompanies({ force: true, reason: 'guard' })
          .then(() => {
            if (authStore.user?.id === gateUserId) {
              companyGateResolvedForUserId = gateUserId
            }

            if (companiesStore.hasCompanies && !authStore.onboardingCompleted && onboardingSyncAttemptedForUserId !== gateUserId) {
              onboardingSyncAttemptedForUserId = gateUserId
              void authStore.markOnboardingCompleted().catch((error) => {
                console.warn('[Router] Failed to sync onboarding status from async companies gate:', error)
              })
            }
          })
          .catch((error) => {
            if (ROUTER_VERBOSE_LOGS) {
              console.warn('[Router] Async companies gate failed:', error)
            }
          })
      }
    } else {
      hasCompaniesResolved = true
      companyGateStatus = 'completed'
    }

    hasCompanies = companiesStore.hasCompanies

    if (
      hasCompanies &&
      !authStore.onboardingCompleted &&
      onboardingSyncAttemptedForUserId !== currentUserId
    ) {
      onboardingSyncAttemptedForUserId = currentUserId
      void authStore.markOnboardingCompleted().catch((error) => {
        console.warn('[Router] Failed to sync onboarding status from companies gate:', error)
      })
    }
  }

  // Se usuário está autenticado mas tenta acessar login/register
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    if (!hasCompaniesResolved) {
      if (ROUTER_VERBOSE_LOGS) {
        console.warn('[Router] Company gate unresolved on auth route, failing closed to onboarding:', {
          gateStatus: companyGateStatus
        })
      }
      return finish(`/${locale}/onboarding`)
    }

    if (!hasCompanies) {
      return finish(`/${locale}/onboarding`)
    }
    return finish(`/${locale}/projects`)
  }

  // Se a rota requer onboarding/company e já sabemos que não há empresa
  if (requiresOnboarding && isAuthenticated) {
    if (hasCompaniesResolved && !hasCompanies) {
      return finish(`/${locale}/onboarding`)
    }

    // Em rotas com contexto de projeto não bloquear navegação por gate de companies.
    if (!hasProjectContext && !hasCompaniesResolved && ROUTER_VERBOSE_LOGS) {
      console.warn('[Router] Company gate unresolved on onboarding-protected route; allowing optimistic navigation')
    }
  }

  if (
    to.name === 'onboarding' &&
    isAuthenticated &&
    hasCompaniesResolved &&
    hasCompanies &&
    import.meta.env.PROD
  ) {
    return finish(`/${locale}/projects`)
  }

  // Subscription gate — redirect expired subscriptions to pricing
  const SUBSCRIPTION_EXEMPT_ROUTES = ['pricing', 'login', 'register', 'onboarding', 'projects']
  if (
    requiresOnboarding &&
    isAuthenticated &&
    hasCompaniesResolved &&
    hasCompanies &&
    !SUBSCRIPTION_EXEMPT_ROUTES.includes(to.name as string)
  ) {
    try {
      const { useBillingStore } = await import('@/stores/billing')
      const billing = useBillingStore()

      if (!billing.limits) {
        await billing.fetchLimits()
      }

      if (billing.isExpired && to.name !== 'pricing') {
        return finish({ name: 'pricing', params: { locale }, query: { expired: 'true' } })
      }
    } catch (err) {
      if (ROUTER_VERBOSE_LOGS) {
        console.warn('[Router] Subscription check failed (non-blocking):', err)
      }
    }
  }

  return finish()
})

router.afterEach(() => {
  finishNavigationFeedback()
})

router.onError(() => {
  finishNavigationFeedback()
})

export default router

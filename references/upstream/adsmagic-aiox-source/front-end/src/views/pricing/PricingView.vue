<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { Check, Zap, Crown, Rocket, Loader2, Minus, Plus } from '@/composables/useIcons'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import { useToast } from '@/components/ui/toast/use-toast'
import { useBillingStore } from '@/stores/billing'
import { analytics } from '@/services/analytics'
import type { Plan } from '@/services/api/adapters/billingAdapter'

const { t } = useI18n()
const { toast } = useToast()
const router = useRouter()
const route = useRoute()
const billingStore = useBillingStore()

const billingCycle = ref<'monthly' | 'yearly'>('monthly')
const extraProjects = ref<Record<string, number>>({})

const PLAN_ICONS: Record<string, typeof Zap> = {
  starter: Zap,
  growth: Crown,
  pro: Rocket,
}

const HIGHLIGHTED_SLUG = 'growth'

function getExtraProjects(slug: string): number {
  return extraProjects.value[slug] ?? 0
}

function getTotalProjects(plan: Plan): number {
  return plan.projectsIncluded + getExtraProjects(plan.slug)
}

function getExtraProjectPrice(plan: Plan): number {
  return plan.addons.find(a => a.addonType === 'extra_project')?.price ?? 7900
}

function incrementProjects(slug: string) {
  extraProjects.value[slug] = getExtraProjects(slug) + 1
}

function decrementProjects(slug: string) {
  const current = getExtraProjects(slug)
  if (current > 0) extraProjects.value[slug] = current - 1
}

onMounted(async () => {
  await Promise.allSettled([
    billingStore.fetchPlans(),
    billingStore.fetchSubscription(),
    billingStore.fetchLimits(),
  ])

  if (route.query.checkout === 'success') {
    analytics.track('payment_succeeded', { plan: billingStore.currentPlanSlug ?? '' })
  }
})

/** True only when user has NEVER had a subscription (no trial used) */
const canStartTrial = computed(() => {
  if (!billingStore.limits) return true
  return !billingStore.subscription
})

function getPlanIcon(slug: string) {
  return PLAN_ICONS[slug] ?? Zap
}

function isHighlighted(slug: string): boolean {
  return slug === HIGHLIGHTED_SLUG
}

/**
 * Format price from cents to display value (e.g. 9700 → "97")
 */
function formatPrice(plan: Plan): string {
  const extraCents = getExtraProjects(plan.slug) * getExtraProjectPrice(plan)
  if (billingCycle.value === 'yearly') {
    // extraCents is monthly — add it after converting the annual base to monthly
    return Math.round((plan.priceYearly / 12 + extraCents) / 100).toString()
  }
  return Math.round((plan.priceMonthly + extraCents) / 100).toString()
}

function getPriceSuffix(): string {
  return t('pricing.perMonth')
}

/** Feature keys per plan slug — must match the i18n locale structure */
const PLAN_FEATURE_KEYS: Record<string, string[]> = {
  starter: ['projects', 'users', 'contacts', 'dashboard', 'whatsapp', 'support'],
  growth: ['projects', 'users', 'contacts', 'dashboard', 'whatsapp', 'origins', 'export', 'support'],
  pro: ['projects', 'users', 'contacts', 'dashboard', 'whatsapp', 'origins', 'export', 'support'],
}

function getFeatures(plan: Plan): { key: string; label: string }[] {
  const keys = PLAN_FEATURE_KEYS[plan.slug] ?? []
  return keys.map(key => ({
    key,
    label: t(`pricing.${plan.slug}.features.${key}`),
  }))
}

function isCurrentPlan(slug: string): boolean {
  return billingStore.currentPlanSlug === slug
}

const isCheckingOut = ref(false)

async function handleSubscribe(plan: Plan) {
  if (isCurrentPlan(plan.slug) && !billingStore.isTrialing) return

  if (billingStore.isSubscribed) {
    // Already subscribed — open portal to manage/upgrade
    try {
      await billingStore.openPortal()
    } catch {
      toast({
        title: t('pricing.errorLoading'),
        variant: 'destructive',
      })
    }
    return
  }

  // First-time subscription — start trial on chosen plan
  if (canStartTrial.value) {
    isCheckingOut.value = true
    try {
      const result = await billingStore.startTrialForPlan(plan.slug)
      analytics.track('trial_started', { plan: result.planName, trialDays: result.trialDays })
      toast({
        title: t('trial.banner.active', { plan: result.planName, days: result.trialDays }),
      })
      const locale = (route.params.locale as string) || 'pt'
      await router.push(`/${locale}/projects`)
    } catch {
      toast({
        title: t('pricing.errorLoading'),
        variant: 'destructive',
      })
    } finally {
      isCheckingOut.value = false
    }
    return
  }

  // Trialing or expired user — go to checkout to pay
  isCheckingOut.value = true
  try {
    analytics.track('subscription_started', { plan: plan.slug, billingCycle: billingCycle.value })
    await billingStore.startCheckout(plan.slug, billingCycle.value, getExtraProjects(plan.slug))
  } catch {
    toast({
      title: t('pricing.errorLoading'),
      variant: 'destructive',
    })
    isCheckingOut.value = false
  }
}

function getButtonLabel(plan: Plan): string {
  if (isCurrentPlan(plan.slug) && !billingStore.isTrialing) return t('pricing.currentPlan')
  if (billingStore.isSubscribed) return t('pricing.manage')
  if (canStartTrial.value) return t('pricing.startTrial')
  return t('pricing.subscribe')
}

const annualSavingsText = computed(() => {
  if (billingCycle.value === 'yearly') return t('pricing.annualDiscount')
  return null
})
</script>

<template>
  <AppLayout>
    <div class="page-shell">
      <div class="mx-auto w-full max-w-6xl section-stack-lg">
        <!-- Header -->
        <div class="text-center space-y-2">
          <PageHeader
            :title="t('pricing.title')"
            :description="t('pricing.description')"
          />
        </div>

        <!-- Trial / Expired banner -->
        <div
          v-if="billingStore.isTrialing && !billingStore.isExpired"
          class="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 px-5 py-4"
        >
          <p class="text-sm text-amber-800 dark:text-amber-200">
            {{ t('trial.banner.active', { plan: billingStore.trialPlanName, days: billingStore.trialDaysRemaining }) }}
          </p>
          <span class="text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            {{ t('trial.banner.upgrade') }}
          </span>
        </div>

        <div
          v-else-if="billingStore.isExpired && billingStore.subscription"
          class="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-4"
        >
          <p class="text-sm text-destructive">
            {{ t('trial.banner.expired') }}
          </p>
          <span class="text-xs font-semibold text-destructive whitespace-nowrap">
            {{ t('trial.banner.choosePlan') }}
          </span>
        </div>

        <!-- Billing toggle -->
        <div class="flex items-center justify-center gap-3">
          <button
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="billingCycle === 'monthly'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'"
            @click="billingCycle = 'monthly'"
          >
            {{ t('pricing.monthly') }}
          </button>
          <button
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="billingCycle === 'yearly'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'"
            @click="billingCycle = 'yearly'"
          >
            {{ t('pricing.annual') }}
            <span
              v-if="billingCycle !== 'yearly'"
              class="ml-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"
            >
              {{ t('pricing.annualDiscount') }}
            </span>
          </button>
        </div>

        <!-- Loading state -->
        <div
          v-if="billingStore.isLoading && !billingStore.hasPlans"
          class="flex flex-col items-center justify-center py-20 gap-3"
        >
          <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
          <p class="text-sm text-muted-foreground">{{ t('pricing.loading') }}</p>
        </div>

        <!-- Error state -->
        <div
          v-else-if="billingStore.error && !billingStore.hasPlans"
          class="flex flex-col items-center justify-center py-20 gap-3"
        >
          <p class="text-sm text-destructive">{{ t('pricing.errorLoading') }}</p>
          <Button variant="outline" @click="billingStore.fetchPlans(true)">
            {{ t('pricing.retry') }}
          </Button>
        </div>

        <!-- Plans grid -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div
            v-for="plan in billingStore.plans"
            :key="plan.id"
            class="relative flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
            :class="{
              'border-primary shadow-md ring-2 ring-primary/20': isHighlighted(plan.slug),
              'border-border': !isHighlighted(plan.slug),
            }"
          >
            <!-- Recommended badge -->
            <div
              v-if="isHighlighted(plan.slug)"
              class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full"
            >
              {{ t('pricing.recommended') }}
            </div>

            <!-- Plan header -->
            <div class="flex items-center gap-3 mb-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg"
                :class="isHighlighted(plan.slug) ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
              >
                <component :is="getPlanIcon(plan.slug)" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="section-title-sm">{{ t(`pricing.${plan.slug}.name`) }}</h3>
                <p class="text-xs text-muted-foreground">{{ t(`pricing.${plan.slug}.description`) }}</p>
              </div>
            </div>

            <!-- Project quantity selector -->
            <div class="flex items-center gap-3 mb-4">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
                :class="getExtraProjects(plan.slug) > 0
                  ? 'border-border hover:bg-muted text-foreground'
                  : 'border-muted text-muted-foreground cursor-not-allowed'"
                :disabled="getExtraProjects(plan.slug) === 0"
                @click="decrementProjects(plan.slug)"
              >
                <Minus class="h-4 w-4" />
              </button>
              <span class="text-lg font-bold min-w-[3ch] text-center">
                {{ getTotalProjects(plan) }}
              </span>
              <span class="text-sm text-muted-foreground">{{ t('pricing.projects') }}</span>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted text-foreground transition-colors"
                @click="incrementProjects(plan.slug)"
              >
                <Plus class="h-4 w-4" />
              </button>
            </div>

            <!-- Price -->
            <div class="mb-6">
              <div class="flex items-baseline gap-1">
                <span class="text-sm text-muted-foreground">R$</span>
                <span class="text-4xl font-bold tracking-tight">{{ formatPrice(plan) }}</span>
                <span class="text-sm text-muted-foreground">{{ getPriceSuffix() }}</span>
              </div>
              <p
                v-if="annualSavingsText"
                class="text-xs text-emerald-600 mt-1"
              >
                {{ annualSavingsText }}
              </p>
            </div>

            <!-- Features -->
            <ul class="space-y-3 mb-8 flex-1">
              <li
                v-for="feature in getFeatures(plan)"
                :key="feature.key"
                class="flex items-start gap-2 text-sm"
              >
                <Check
                  class="h-4 w-4 mt-0.5 shrink-0"
                  :class="isHighlighted(plan.slug) ? 'text-primary' : 'text-emerald-500'"
                />
                <span>{{ feature.label }}</span>
              </li>
            </ul>

            <!-- Extra contacts price -->
            <p class="text-xs text-muted-foreground mb-4">
              {{ t(`pricing.${plan.slug}.extraContactsPrice`) }}
            </p>

            <!-- CTA -->
            <Button
              class="w-full"
              :variant="(isCurrentPlan(plan.slug) && !billingStore.isTrialing) ? 'secondary' : (isHighlighted(plan.slug) ? 'default' : 'outline')"
              :disabled="(isCurrentPlan(plan.slug) && !billingStore.isTrialing) || isCheckingOut"
              @click="handleSubscribe(plan)"
            >
              <Loader2 v-if="isCheckingOut && !isCurrentPlan(plan.slug)" class="h-4 w-4 mr-2 animate-spin" />
              {{ getButtonLabel(plan) }}
            </Button>
          </div>
        </div>

        <!-- Add-ons section -->
        <div
          v-if="billingStore.hasPlans"
          class="mt-8 rounded-xl border bg-card p-6"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="section-title-sm">{{ t('pricing.addons') }}</h3>
            <Button
              v-if="billingStore.isSubscribed"
              variant="outline"
              size="sm"
              @click="billingStore.openPortal()"
            >
              {{ t('pricing.manageSubscription') }}
            </Button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="flex flex-col gap-1">
              <span class="font-medium">{{ t('pricing.extraProject') }}</span>
              <span class="text-muted-foreground">{{ t('pricing.extraProjectPrice') }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-medium">{{ t('pricing.extraContacts') }}</span>
              <span class="text-muted-foreground">
                {{ t('pricing.starter.extraContactsPrice') }} (Starter) ·
                {{ t('pricing.growth.extraContactsPrice') }} (Growth) ·
                {{ t('pricing.pro.extraContactsPrice') }} (Pro)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Zap, Crown, Rocket } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import { useToast } from '@/components/ui/toast/use-toast'

const { t } = useI18n()
const { toast } = useToast()

const billingCycle = ref<'monthly' | 'annual'>('monthly')

interface PlanFeature {
  key: string
  label: string
}

interface Plan {
  id: string
  nameKey: string
  descriptionKey: string
  monthlyPrice: string
  annualPrice: string
  features: PlanFeature[]
  highlighted: boolean
  icon: any
  cta: 'subscribe' | 'contactSales'
}

const plans = computed<Plan[]>(() => [
  {
    id: 'starter',
    nameKey: 'pricing.starter.name',
    descriptionKey: 'pricing.starter.description',
    monthlyPrice: t('pricing.starter.price'),
    annualPrice: t('pricing.starter.annualPrice'),
    features: Object.entries({
      projects: t('pricing.starter.features.projects'),
      contacts: t('pricing.starter.features.contacts'),
      dashboard: t('pricing.starter.features.dashboard'),
      whatsapp: t('pricing.starter.features.whatsapp'),
      support: t('pricing.starter.features.support'),
    }).map(([key, label]) => ({ key, label })),
    highlighted: false,
    icon: Zap,
    cta: 'subscribe',
  },
  {
    id: 'pro',
    nameKey: 'pricing.pro.name',
    descriptionKey: 'pricing.pro.description',
    monthlyPrice: t('pricing.pro.price'),
    annualPrice: t('pricing.pro.annualPrice'),
    features: Object.entries({
      projects: t('pricing.pro.features.projects'),
      contacts: t('pricing.pro.features.contacts'),
      dashboard: t('pricing.pro.features.dashboard'),
      whatsapp: t('pricing.pro.features.whatsapp'),
      origins: t('pricing.pro.features.origins'),
      export: t('pricing.pro.features.export'),
      support: t('pricing.pro.features.support'),
    }).map(([key, label]) => ({ key, label })),
    highlighted: true,
    icon: Crown,
    cta: 'subscribe',
  },
  {
    id: 'premium',
    nameKey: 'pricing.premium.name',
    descriptionKey: 'pricing.premium.description',
    monthlyPrice: t('pricing.premium.price'),
    annualPrice: t('pricing.premium.annualPrice'),
    features: Object.entries({
      projects: t('pricing.premium.features.projects'),
      contacts: t('pricing.premium.features.contacts'),
      dashboard: t('pricing.premium.features.dashboard'),
      whatsapp: t('pricing.premium.features.whatsapp'),
      origins: t('pricing.premium.features.origins'),
      export: t('pricing.premium.features.export'),
      whiteLabel: t('pricing.premium.features.whiteLabel'),
      support: t('pricing.premium.features.support'),
    }).map(([key, label]) => ({ key, label })),
    highlighted: false,
    icon: Rocket,
    cta: 'contactSales',
  },
])

function getPrice(plan: Plan): string {
  return billingCycle.value === 'annual' ? plan.annualPrice : plan.monthlyPrice
}

function getPriceSuffix(): string {
  return billingCycle.value === 'annual' ? t('pricing.perMonth') : t('pricing.perMonth')
}

function handleSubscribe(planId: string) {
  toast({
    title: t(`pricing.${planId}.name`),
    description: 'Checkout em breve!',
  })
}
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
            :class="billingCycle === 'annual'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'"
            @click="billingCycle = 'annual'"
          >
            {{ t('pricing.annual') }}
            <span
              v-if="billingCycle !== 'annual'"
              class="ml-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"
            >
              {{ t('pricing.annualDiscount') }}
            </span>
          </button>
        </div>

        <!-- Plans grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="relative flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
            :class="{
              'border-primary shadow-md ring-2 ring-primary/20': plan.highlighted,
              'border-border': !plan.highlighted,
            }"
          >
            <!-- Recommended badge -->
            <div
              v-if="plan.highlighted"
              class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full"
            >
              {{ t('pricing.recommended') }}
            </div>

            <!-- Plan header -->
            <div class="flex items-center gap-3 mb-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg"
                :class="plan.highlighted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
              >
                <component :is="plan.icon" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="section-title-sm">{{ t(plan.nameKey) }}</h3>
                <p class="text-xs text-muted-foreground">{{ t(plan.descriptionKey) }}</p>
              </div>
            </div>

            <!-- Price -->
            <div class="mb-6">
              <div class="flex items-baseline gap-1">
                <span class="text-sm text-muted-foreground">R$</span>
                <span class="text-4xl font-bold tracking-tight">{{ getPrice(plan) }}</span>
                <span class="text-sm text-muted-foreground">{{ getPriceSuffix() }}</span>
              </div>
              <p
                v-if="billingCycle === 'annual'"
                class="text-xs text-emerald-600 mt-1"
              >
                {{ t('pricing.annualDiscount') }}
              </p>
            </div>

            <!-- Features -->
            <ul class="space-y-3 mb-8 flex-1">
              <li
                v-for="feature in plan.features"
                :key="feature.key"
                class="flex items-start gap-2 text-sm"
              >
                <Check
                  class="h-4 w-4 mt-0.5 shrink-0"
                  :class="plan.highlighted ? 'text-primary' : 'text-emerald-500'"
                />
                <span>{{ feature.label }}</span>
              </li>
            </ul>

            <!-- CTA -->
            <Button
              class="w-full"
              :variant="plan.highlighted ? 'default' : 'outline'"
              @click="handleSubscribe(plan.id)"
            >
              {{ plan.cta === 'contactSales' ? t('pricing.contactSales') : t('pricing.subscribe') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

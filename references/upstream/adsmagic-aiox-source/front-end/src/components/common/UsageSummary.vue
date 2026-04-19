<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBillingStore } from '@/stores/billing'
import { Folder, Users, Mail } from '@/composables/useIcons'

const { t } = useI18n()
const billingStore = useBillingStore()

onMounted(async () => {
  if (!billingStore.limits) {
    await billingStore.fetchLimits()
  }
})

const projectsUsage = computed(() => {
  if (!billingStore.limits) return null
  const { current, max } = billingStore.limits.limits.projects
  return { current, max, percentage: max > 0 ? Math.round((current / max) * 100) : 0 }
})

const usersUsage = computed(() => {
  if (!billingStore.limits) return null
  const { current, max } = billingStore.limits.limits.users
  return { current, max, percentage: max > 0 ? Math.round((current / max) * 100) : 0 }
})

const contactsPerProject = computed(() => {
  return billingStore.limits?.limits.contactsPerProject ?? 0
})

const planName = computed(() => billingStore.trialPlanName ?? '—')

function getBarColor(percentage: number): string {
  if (percentage >= 90) return 'bg-destructive'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-primary'
}
</script>

<template>
  <div v-if="billingStore.limits" class="usage-summary">
    <div class="usage-summary__header">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {{ t('usage.title') }}
      </span>
      <span class="text-xs text-muted-foreground">
        {{ t('usage.plan', { plan: planName }) }}
      </span>
    </div>

    <div class="usage-summary__items">
      <!-- Projects -->
      <div v-if="projectsUsage" class="usage-item">
        <div class="usage-item__label">
          <Folder class="h-3.5 w-3.5 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">{{ t('usage.projects') }}</span>
          <span class="text-xs font-medium ml-auto">{{ projectsUsage.current }}/{{ projectsUsage.max }}</span>
        </div>
        <div class="usage-bar">
          <div
            class="usage-bar__fill"
            :class="getBarColor(projectsUsage.percentage)"
            :style="{ width: `${Math.min(projectsUsage.percentage, 100)}%` }"
          />
        </div>
      </div>

      <!-- Users -->
      <div v-if="usersUsage" class="usage-item">
        <div class="usage-item__label">
          <Users class="h-3.5 w-3.5 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">{{ t('usage.users') }}</span>
          <span class="text-xs font-medium ml-auto">{{ usersUsage.current }}/{{ usersUsage.max }}</span>
        </div>
        <div class="usage-bar">
          <div
            class="usage-bar__fill"
            :class="getBarColor(usersUsage.percentage)"
            :style="{ width: `${Math.min(usersUsage.percentage, 100)}%` }"
          />
        </div>
      </div>

      <!-- Contacts per project -->
      <div class="usage-item">
        <div class="usage-item__label">
          <Mail class="h-3.5 w-3.5 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">{{ t('usage.contactsPerProject') }}</span>
          <span class="text-xs font-medium ml-auto">{{ contactsPerProject }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.usage-summary {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  background: hsl(var(--card));
}

.usage-summary__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.usage-summary__items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.usage-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.usage-item__label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.usage-bar {
  height: 4px;
  border-radius: 2px;
  background: hsl(var(--muted));
  overflow: hidden;
}

.usage-bar__fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>

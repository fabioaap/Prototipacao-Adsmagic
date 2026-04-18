<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Button from './Button.vue'

interface Props {
  daysRemaining: number
  onChoosePlan?: () => void
  onDismiss?: () => void
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: false,
})

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

const message = computed(() => {
  if (props.daysRemaining === 0) {
    return t('ui.trialBanner.expiredToday')
  }
  if (props.daysRemaining === 1) {
    return t('ui.trialBanner.oneDay', { days: props.daysRemaining })
  }
  return t('ui.trialBanner.multipleDays', { days: props.daysRemaining })
})

const urgencyLevel = computed(() => {
  if (props.daysRemaining <= 1) return 'critical'
  if (props.daysRemaining <= 3) return 'high'
  if (props.daysRemaining <= 7) return 'medium'
  return 'low'
})

const bannerClass = computed(() => {
  const baseClass =
    'relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-lg border p-4 sm:px-4 sm:py-3 text-sm shadow-sm'

  const urgencyClasses = {
    critical: 'border-destructive/50 bg-destructive/10 text-destructive',
    high: 'border-warning/50 bg-warning/10 text-warning',
    medium: 'border-info/50 bg-info/10 text-info',
    low: 'border-border bg-muted text-muted-foreground',
  }

  return `${baseClass} ${urgencyClasses[urgencyLevel.value]}`
})
</script>

<template>
  <div :class="bannerClass">
    <div class="flex items-start sm:items-center gap-3 flex-1 pr-6 sm:pr-0">
      <AlertCircle class="h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
      <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
        <span class="font-medium">{{ message }}</span>
        <span class="text-muted-foreground">{{ t('ui.trialBanner.continueMessage') }}</span>
      </div>
    </div>

    <div class="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
      <Button
        variant="default"
        size="sm"
        @click="onChoosePlan"
        class="w-full sm:w-auto whitespace-nowrap bg-success hover:bg-success/90"
      >
        {{ t('ui.trialBanner.choosePlan') }}
      </Button>

      <button
        v-if="dismissible"
        @click="onDismiss"
        class="absolute top-3 right-3 sm:static sm:top-auto sm:right-auto rounded-control p-1 hover:bg-muted/80 transition-colors"
        :aria-label="t('ui.trialBanner.closeWarning')"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

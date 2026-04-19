<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { X, Sparkles, Rocket } from '@/composables/useIcons'
import { Button } from '@/components/ui/button'
import Progress from '@/components/ui/Progress.vue'
import SetupChecklistItem from '@/components/dashboard/SetupChecklistItem.vue'
import { useSetupChecklistStore } from '@/stores/setupChecklist'
import type { SetupStepWithStatus } from '@/types/setupChecklist'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = useSetupChecklistStore()

function handleStepClick(step: SetupStepWithStatus): void {
  store.trackStepClicked(step.id)

  const locale = route.params.locale as string
  const projectId = route.params.projectId as string

  router.push({
    name: step.routeName,
    params: { locale, projectId },
    query: step.routeQuery,
  })
}

onMounted(() => {
  store.trackViewed()
})
</script>

<template>
  <section
    class="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    aria-labelledby="setup-checklist-title"
  >
    <!-- Header -->
    <div class="px-5 pt-5 pb-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2">
          <Rocket :size="20" class="text-primary shrink-0" />
          <h2
            id="setup-checklist-title"
            class="text-base font-semibold text-foreground"
          >
            {{ t('setupChecklist.title') }}
          </h2>
        </div>
        <button
          type="button"
          class="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          :aria-label="t('setupChecklist.dismiss')"
          @click="store.dismiss()"
        >
          <X :size="16" />
        </button>
      </div>

      <p class="mt-1 text-sm text-muted-foreground">
        {{ t('setupChecklist.subtitle', { completed: store.completedCount, total: store.totalSteps }) }}
      </p>

      <div class="mt-3">
        <Progress
          :value="store.progressPercent"
          :max="100"
          :variant="store.isAllComplete ? 'success' : 'default'"
          size="sm"
        />
      </div>
    </div>

    <!-- Steps -->
    <div class="px-5 pb-2">
      <SetupChecklistItem
        v-for="step in store.stepsWithStatus"
        :key="step.id"
        :step="step"
        @click="handleStepClick(step)"
      />
    </div>

    <!-- Celebratory footer -->
    <div
      v-if="store.isAllComplete"
      class="px-5 py-4 bg-success/5 border-t border-success/20"
    >
      <div class="flex items-center gap-2">
        <Sparkles :size="18" class="text-success" />
        <div>
          <p class="text-sm font-medium text-foreground">
            {{ t('setupChecklist.allCompleteTitle') }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t('setupChecklist.allCompleteMessage') }}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          class="ml-auto shrink-0"
          @click="store.dismiss()"
        >
          {{ t('setupChecklist.dismiss') }}
        </Button>
      </div>
    </div>
  </section>
</template>

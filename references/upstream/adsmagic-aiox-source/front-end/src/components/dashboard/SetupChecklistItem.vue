<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CheckCircle2,
  Circle,
  Phone,
  Target,
  Layers,
  UserPlus,
} from '@/composables/useIcons'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/Badge.vue'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
import type { SetupStepWithStatus } from '@/types/setupChecklist'

const props = defineProps<{
  step: SetupStepWithStatus
}>()

defineEmits<{
  click: []
}>()

const { t } = useI18n()

const iconComponents: Record<string, typeof Phone> = {
  Phone,
  Target,
  Layers,
  UserPlus,
}

const stepIcon = computed(() => iconComponents[props.step.iconName] ?? Circle)
</script>

<template>
  <div
    class="flex items-center gap-3 py-3 border-b border-border/50 last:border-0 transition-colors"
    :class="{
      'opacity-60': step.status === 'pending',
    }"
  >
    <!-- Status indicator -->
    <div class="shrink-0">
      <CheckCircle2
        v-if="step.completed"
        :size="20"
        class="text-success"
      />
      <Circle
        v-else-if="step.status === 'active'"
        :size="20"
        class="text-primary animate-pulse"
      />
      <Circle
        v-else
        :size="20"
        class="text-muted-foreground/40"
      />
    </div>

    <!-- Step icon -->
    <component
      :is="stepIcon"
      :size="18"
      class="shrink-0"
      :class="{
        'text-muted-foreground': !step.completed,
        'text-success': step.completed,
      }"
    />

    <!-- Title + Tooltip -->
    <span
      class="text-sm flex-1"
      :class="{
        'line-through text-muted-foreground': step.completed,
        'font-medium text-foreground': step.status === 'active',
        'text-muted-foreground': step.status === 'pending',
      }"
    >
      {{ t(step.titleKey) }}
    </span>

    <InfoTooltip
      :message="t(step.tooltipKey)"
      :icon-size="14"
      side="top"
    />

    <!-- CTA or Badge -->
    <Button
      v-if="!step.completed"
      variant="outline"
      size="sm"
      class="ml-auto shrink-0"
      :class="{ 'pointer-events-none opacity-50': step.id === 'receive_lead' }"
      @click="$emit('click')"
    >
      {{ t(step.ctaKey) }}
    </Button>
    <Badge
      v-else
      variant="soft"
      color="success"
      class="ml-auto shrink-0"
    >
      {{ t('setupChecklist.completed') }}
    </Badge>
  </div>
</template>

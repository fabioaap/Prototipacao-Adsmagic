<template>
  <Tooltip :delay-duration="delayDuration" :side="side" :side-offset="sideOffset" :contentClass="contentClass">
    <template #trigger>
      <button
        type="button"
        class="info-icon-wrapper"
        :aria-label="ariaLabel"
        @click.stop
      >
        <Info :size="iconSize" class="info-icon" />
      </button>
    </template>
    <span class="text-xs">{{ message }}</span>
  </Tooltip>
</template>

<script setup lang="ts">
import Tooltip from '@/components/ui/Tooltip.vue'
import { Info } from 'lucide-vue-next'

interface Props {
  message: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  delayDuration?: number
  iconSize?: number
  ariaLabel?: string
  contentClass?: string
}

withDefaults(defineProps<Props>(), {
  side: 'top',
  sideOffset: 5,
  delayDuration: 200,
  iconSize: 14,
  ariaLabel: 'Informações',
  contentClass: 'tooltip-content'
})
</script>

<style scoped>
.info-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  cursor: help;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.info-icon-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.info-icon {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.info-icon-wrapper:hover .info-icon {
  opacity: 1;
}
</style>

<!--
  Tooltip Component (Radix Vue Wrapper)
  
  Provides tooltip functionality with hover delay, positioning,
  and ARIA compliance for accessible tooltips.
  
  Based on TDD tests: Tooltip.spec.ts (26 tests)
  
  Features:
  - Delay duration configurable
  - Side positioning (top, bottom, left, right)
  - Alignment (start, center, end) 
  - ARIA compliance
  - Portal rendering
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow
} from 'radix-vue'

interface TooltipProps {
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
  content?: string
  open?: boolean
  // Portal configuration
  disablePortal?: boolean
  portalTarget?: string | HTMLElement
}

interface TooltipEmits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<TooltipProps>(), {
  delayDuration: 700,
  skipDelayDuration: 300,
  side: 'top',
  align: 'center',
  sideOffset: 4,
  alignOffset: 0,
  disableHoverableContent: false,
  open: false,
  disablePortal: false,
  portalTarget: 'body'
})

const emit = defineEmits<TooltipEmits>()

// Internal state management for testing
const isOpen = ref(props.open)

// Computed for v-model
const computedOpen = computed({
  get: () => isOpen.value,
  set: (value) => {
    isOpen.value = value
    emit('update:open', value)
  }
})

const updateOpen = (value: boolean) => {
  isOpen.value = value
  emit('update:open', value)
}

// Expose for testing
defineExpose({
  isOpen
})
</script>

<template>
  <TooltipProvider>
    <TooltipRoot 
      :open="computedOpen" 
      :delay-duration="delayDuration"
      :skip-delay-duration="skipDelayDuration"
      :disable-hoverable-content="disableHoverableContent"
      @update:open="updateOpen"
    >
      <!-- Trigger slot -->
      <TooltipTrigger 
        as-child 
        data-testid="tooltip-trigger"
        :aria-describedby="isOpen ? 'tooltip-content' : undefined"
      >
        <slot name="trigger">
          <button type="button">
            Hover me
          </button>
        </slot>
      </TooltipTrigger>

      <!-- Content portal with configuration -->
      <TooltipPortal 
        v-if="!disablePortal"
        :to="portalTarget"
      >
        <TooltipContent
          :side="side"
          :align="align"
          :side-offset="sideOffset"
          :align-offset="alignOffset"
          data-testid="tooltip-content"
          role="tooltip"
          :data-side="side"
          :data-align="align"
          id="tooltip-content"
        >
          <!-- Content slot -->
          <slot name="content">
            {{ content }}
          </slot>
          
          <TooltipArrow />
        </TooltipContent>
      </TooltipPortal>

      <!-- Direct rendering for tests (when portal disabled) -->
      <TooltipContent
        v-else
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        :align-offset="alignOffset"
        data-testid="tooltip-content"
        role="tooltip"
        :data-side="side"
        :data-align="align"
        id="tooltip-content"
      >
        <!-- Content slot -->
        <slot name="content">
          {{ content }}
        </slot>
        
        <TooltipArrow />
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
</template>
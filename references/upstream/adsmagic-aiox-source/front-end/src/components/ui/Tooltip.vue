<template>
  <TooltipProvider :delay-duration="delayDuration" :skip-delay-duration="skipDelayDuration" :disable-hoverable-content="disableHoverableContent">
    <TooltipRoot v-model:open="isOpenValue" :delay-duration="delayDuration" :disable-hoverable-content="disableHoverableContent">
      <TooltipTrigger as-child data-testid="tooltip-trigger">
        <slot name="trigger" />
      </TooltipTrigger>
      <TooltipPortal v-if="!disablePortal" :to="portalTarget">
        <TooltipContent
          :class="cn('z-[9999] pointer-events-auto bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-control shadow-md animate-in fade-in-0 zoom-in-95', contentClass)"
          :side="side"
          :side-offset="sideOffset"
          :align="align"
          :align-offset="alignOffset"
          :collision-padding="collisionPadding"
          :avoid-collisions="avoidCollisions"
          :sticky="sticky"
          :hide-when-detached="hideWhenDetached"
          data-testid="tooltip-content"
          id="tooltip-content"
          role="tooltip"
          v-bind="$attrs"
        >
          <slot />
        </TooltipContent>
      </TooltipPortal>
      <div v-else>
        <TooltipContent
          :class="cn('z-[9999] pointer-events-auto bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-control shadow-md animate-in fade-in-0 zoom-in-95', contentClass)"
          :side="side"
          :side-offset="sideOffset"
          :align="align"
          :align-offset="alignOffset"
          :collision-padding="collisionPadding"
          :avoid-collisions="avoidCollisions"
          :sticky="sticky"
          :hide-when-detached="hideWhenDetached"
          data-testid="tooltip-content"
          id="tooltip-content"
          role="tooltip"
          v-bind="$attrs"
        >
          <slot />
        </TooltipContent>
      </div>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  open?: boolean
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
  alignOffset?: number
  collisionPadding?: number
  avoidCollisions?: boolean
  sticky?: 'partial' | 'always'
  hideWhenDetached?: boolean
  contentClass?: string
  disablePortal?: boolean
  portalTarget?: string | HTMLElement
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  delayDuration: 200,
  skipDelayDuration: 150,
  disableHoverableContent: false,
  side: 'top',
  sideOffset: 6,
  align: 'center',
  alignOffset: 0,
  collisionPadding: 8,
  avoidCollisions: true,
  sticky: 'partial',
  hideWhenDetached: false,
  contentClass: '',
  disablePortal: false,
  portalTarget: 'body'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpenValue = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})
</script>

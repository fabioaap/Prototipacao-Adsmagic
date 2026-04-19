<template>
  <PopoverRoot v-model:open="isOpenValue" :modal="modal">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal v-if="!disablePortal" :to="portalTarget">
      <PopoverContent
        :class="cn('popover-content', contentClass)"
        :side="side"
        :side-offset="sideOffset"
        :align="align"
        :align-offset="alignOffset"
        :collision-padding="collisionPadding"
        :avoid-collisions="avoidCollisions"
        :sticky="sticky"
        :hide-when-detached="hideWhenDetached"
        data-testid="popover-content"
        v-bind="$attrs"
      >
        <slot />
        <PopoverArrow v-if="showArrow" data-testid="arrow" />
        <PopoverClose as-child>
          <Button
            v-if="showClose"
            variant="ghost"
            size="sm"
            data-testid="close-button"
            class="absolute right-2 top-2"
          >
            ×
          </Button>
        </PopoverClose>
      </PopoverContent>
    </PopoverPortal>
    <div v-else>
      <PopoverContent
        :class="cn('popover-content', contentClass)"
        :side="side"
        :side-offset="sideOffset"
        :align="align"
        :align-offset="alignOffset"
        :collision-padding="collisionPadding"
        :avoid-collisions="avoidCollisions"
        :sticky="sticky"
        :hide-when-detached="hideWhenDetached"
        data-testid="popover-content"
        v-bind="$attrs"
      >
        <slot />
        <PopoverArrow v-if="showArrow" data-testid="arrow" />
        <PopoverClose as-child>
          <Button
            v-if="showClose"
            variant="ghost"
            size="sm"
            data-testid="close-button"
            class="absolute right-2 top-2"
          >
            ×
          </Button>
        </PopoverClose>
      </PopoverContent>
    </div>
  </PopoverRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverArrow, PopoverClose } from 'radix-vue'
import Button from './Button.vue'
import { cn } from '@/lib/utils'

interface Props {
  open?: boolean
  modal?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
  alignOffset?: number
  collisionPadding?: number
  avoidCollisions?: boolean
  sticky?: 'partial' | 'always'
  hideWhenDetached?: boolean
  showArrow?: boolean
  showClose?: boolean
  contentClass?: string
  disablePortal?: boolean
  portalTarget?: string | HTMLElement
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  modal: true,
  side: 'bottom',
  sideOffset: 4,
  align: 'center',
  alignOffset: 0,
  collisionPadding: 8,
  avoidCollisions: true,
  sticky: 'partial',
  hideWhenDetached: false,
  showArrow: false,
  showClose: false,
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
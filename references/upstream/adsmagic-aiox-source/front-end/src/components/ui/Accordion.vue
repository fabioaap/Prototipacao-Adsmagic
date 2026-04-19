<template>
  <AccordionRoot 
    v-model="openValue"
    :type="type"
    :collapsible="collapsible"
    :disabled="disabled"
    :orientation="orientation"
    :dir="dir"
    :as="as"
    :as-child="asChild"
    data-testid="accordion"
    role="region"
  >
    <slot />
  </AccordionRoot>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { AccordionRoot } from 'radix-vue'

interface AccordionProps {
  /**
   * The controlled open state of the accordion
   */
  modelValue?: string | string[]
  /**
   * The type of accordion - single allows one item open at a time, multiple allows multiple
   */
  type?: 'single' | 'multiple'
  /**
   * When type is "single", allows the item to be closed (not just opened)
   */
  collapsible?: boolean
  /**
   * When true, prevents the user from interacting with the accordion
   */
  disabled?: boolean
  /**
   * The orientation of the accordion
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * The reading direction of the accordion when applicable
   */
  dir?: 'ltr' | 'rtl'
  /**
   * Change the default rendered element for the one passed as a child
   */
  asChild?: boolean
  /**
   * The element or component this component should render as
   */
  as?: string | Component
  /**
   * Default open item(s) when uncontrolled
   */
  defaultValue?: string | string[]
}

const props = withDefaults(defineProps<AccordionProps>(), {
  type: 'single',
  collapsible: false,
  disabled: false,
  orientation: 'vertical',
  dir: 'ltr',
  asChild: false,
  as: 'div',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const openValue = computed({
  get() {
    return props.modelValue ?? props.defaultValue ?? (props.type === 'single' ? '' : [])
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<script lang="ts">
// Export Radix components for easier usage
export {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger
} from 'radix-vue'
</script>
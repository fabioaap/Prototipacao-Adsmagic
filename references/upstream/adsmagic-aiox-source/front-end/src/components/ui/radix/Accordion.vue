<template>
  <div class="accordion-root" :data-type="type">
    <div
      v-for="item in items"
      :key="item.id"
      class="accordion-item"
      :class="{ 
        'is-open': isItemOpen(item.value),
        'is-disabled': item.disabled 
      }"
      :data-testid="`item-${item.id}`"
    >
      <!-- Header with trigger -->
      <div class="accordion-header">
        <button
          :data-testid="`trigger-${item.id}`"
          class="accordion-trigger"
          :disabled="item.disabled"
          :aria-expanded="isItemOpen(item.value) ? 'true' : 'false'"
          :aria-disabled="item.disabled ? 'true' : undefined"
          :aria-controls="`content-${item.id}`"
          :id="`trigger-${item.id}`"
          @click="toggleItem(item.value)"
          @keydown="onTriggerKeydown($event, item)"
          role="button"
          type="button"
        >
          <span>{{ item.title }}</span>
          <svg
            class="accordion-chevron"
            :class="{ 'is-rotated': isItemOpen(item.value) }"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m4.5 6 3 3 3-3"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- Content panel -->
      <div
        v-if="isItemOpen(item.value)"
        :data-testid="`content-${item.id}`"
        class="accordion-content"
        :id="`content-${item.id}`"
        :aria-labelledby="`trigger-${item.id}`"
        role="region"
      >
        <div class="accordion-content-inner">
          <slot name="content" :item="item" :isOpen="isItemOpen(item.value)">
            {{ item.content }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface AccordionItem {
  id: string | number
  value: string
  title: string
  content?: string
  disabled?: boolean
}

interface AccordionProps {
  items?: AccordionItem[]
  type?: 'single' | 'multiple'
  collapsible?: boolean
  defaultValue?: string | string[]
  modelValue?: string | string[]
}

interface AccordionEmits {
  'update:modelValue': [value: string | string[]]
  'value-change': [value: string | string[]]
}

const props = withDefaults(defineProps<AccordionProps>(), {
  items: () => [],
  type: 'single',
  collapsible: true,
  defaultValue: undefined
})

const emit = defineEmits<AccordionEmits>()

// Internal state for open items
const openItems = ref<string | string[]>(
  props.type === 'multiple' 
    ? (Array.isArray(props.defaultValue) ? props.defaultValue : []) 
    : (props.defaultValue || '')
)

// CRITICAL: Block disabled values from external modelValue updates
watch(() => props.modelValue, (newValue) => {
  if (newValue === undefined) return
  
  if (props.type === 'multiple' && Array.isArray(newValue)) {
    // Filter out disabled items
    const validValues = newValue.filter(value => {
      const item = props.items.find(i => i.value === value)
      return item && !item.disabled
    })
    openItems.value = validValues
  } else if (typeof newValue === 'string') {
    // Check if single value is disabled
    const item = props.items.find(i => i.value === newValue)
    if (item && !item.disabled) {
      openItems.value = newValue
    } else {
      openItems.value = ''
    }
  }
}, { immediate: true })

// Check if item is open
function isItemOpen(value: string): boolean {
  if (props.type === 'multiple') {
    return Array.isArray(openItems.value) && openItems.value.includes(value)
  }
  return openItems.value === value
}

// Toggle item open/closed state
function toggleItem(value: string): void {
  // CRITICAL: Block disabled items like perfect components
  const targetItem = props.items.find(item => item.value === value)
  if (targetItem?.disabled) {
    return
  }
  
  if (props.type === 'multiple') {
    const currentItems = Array.isArray(openItems.value) ? openItems.value : []
    
    if (currentItems.includes(value)) {
      // Remove item (close)
      openItems.value = currentItems.filter(item => item !== value)
    } else {
      // Add item (open)
      openItems.value = [...currentItems, value]
    }
  } else {
    // Single mode
    if (openItems.value === value && props.collapsible) {
      // Close if already open and collapsible
      openItems.value = ''
    } else {
      // Open item
      openItems.value = value
    }
  }

  emit('update:modelValue', openItems.value)
  emit('value-change', openItems.value)
}

// Keyboard navigation
function onTriggerKeydown(event: KeyboardEvent, item: AccordionItem): void {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!item.disabled) {
        toggleItem(item.value)
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      focusNextTrigger(item.value)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPreviousTrigger(item.value)
      break
    case 'Home':
      event.preventDefault()
      focusFirstTrigger()
      break
    case 'End':
      event.preventDefault()
      focusLastTrigger()
      break
  }
}

// Focus management
function focusNextTrigger(currentValue: string): void {
  const currentIndex = props.items.findIndex(item => item.value === currentValue)
  const nextIndex = (currentIndex + 1) % props.items.length
  const nextItem = props.items[nextIndex]
  
  if (nextItem && !nextItem.disabled) {
    const nextTrigger = document.querySelector(`[data-testid="trigger-${nextItem.id}"]`) as HTMLElement
    nextTrigger?.focus()
  }
}

function focusPreviousTrigger(currentValue: string): void {
  const currentIndex = props.items.findIndex(item => item.value === currentValue)
  const prevIndex = currentIndex === 0 ? props.items.length - 1 : currentIndex - 1
  const prevItem = props.items[prevIndex]
  
  if (prevItem && !prevItem.disabled) {
    const prevTrigger = document.querySelector(`[data-testid="trigger-${prevItem.id}"]`) as HTMLElement
    prevTrigger?.focus()
  }
}

function focusFirstTrigger(): void {
  const firstEnabled = props.items.find(item => !item.disabled)
  if (firstEnabled) {
    const firstTrigger = document.querySelector(`[data-testid="trigger-${firstEnabled.id}"]`) as HTMLElement
    firstTrigger?.focus()
  }
}

function focusLastTrigger(): void {
  const lastEnabled = [...props.items].reverse().find(item => !item.disabled)
  if (lastEnabled) {
    const lastTrigger = document.querySelector(`[data-testid="trigger-${lastEnabled.id}"]`) as HTMLElement
    lastTrigger?.focus()
  }
}

// Expose for testing
defineExpose({
  openItems,
  isItemOpen,
  toggleItem,
  items: computed(() => props.items),
  type: computed(() => props.type)
})
</script>

<style scoped>
.accordion-root {
  width: 100%;
}

.accordion-item {
  border-bottom: 1px solid hsl(var(--border));
}

.accordion-item:first-child {
  border-top: 1px solid hsl(var(--border));
}

.accordion-header {
  margin: 0;
}

.accordion-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  text-align: left;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.accordion-trigger:hover {
  background-color: hsl(var(--accent));
}

.accordion-trigger:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.accordion-trigger[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.accordion-trigger[disabled]:hover {
  background: transparent;
}

.accordion-chevron {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.accordion-chevron.is-rotated {
  transform: rotate(180deg);
}

.accordion-content {
  overflow: hidden;
  font-size: 0.875rem;
  background-color: hsl(var(--card));
}

.accordion-content-inner {
  padding: 1rem;
  padding-top: 0;
}

.accordion-item.is-disabled {
  opacity: 0.5;
}
</style>
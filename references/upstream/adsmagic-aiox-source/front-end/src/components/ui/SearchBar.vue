<script setup lang="ts">
/**
 * @deprecated Prefer SearchInput.vue for business list/table search.
 * SearchBar remains for header-level/global search usage.
 */
import { Search, X } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'clear'): void
  (e: 'search', value: string): void
}

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
})

const emit = defineEmits<Emits>()

const hasValue = computed(() => props.modelValue.length > 0)

const effectivePlaceholder = computed(() => props.placeholder || t('ui.search.placeholder'))

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('search', props.modelValue)
  }
}
</script>

<template>
  <div class="relative w-full">
    <Search
      class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
    />

    <input
      type="text"
      :value="modelValue"
      :placeholder="effectivePlaceholder"
      :disabled="disabled"
      @input="handleInput"
      @keydown="handleKeydown"
      class="w-full h-10 pl-9 pr-9 rounded-control border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    />

    <button
      v-if="hasValue"
      @click="handleClear"
      :disabled="disabled"
      class="absolute right-3 top-1/2 -translate-y-1/2 rounded-control opacity-70 hover:opacity-100 disabled:pointer-events-none transition-opacity"
      :aria-label="t('ui.search.clearSearch')"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

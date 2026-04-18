<script setup lang="ts">
import { computed } from 'vue'
import { Search, X } from '@/composables/useIcons'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'
import { inputVariants } from '@/components/ui/input.variants'

interface SearchInputProps {
  modelValue?: string
  placeholder?: string
  placeholderKey?: string
  disabled?: boolean
  showClear?: boolean
  emitOnEnter?: boolean
  inputClass?: string
  variant?: 'default' | 'toolbar'
}

const props = withDefaults(defineProps<SearchInputProps>(), {
  placeholderKey: '',
  disabled: false,
  showClear: true,
  emitOnEnter: true,
  variant: 'default',
})

const { t } = useI18n()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  clear: []
  search: [value: string]
}>()

const hasValue = computed(() => (props.modelValue || '').length > 0)
const effectivePlaceholder = computed(() => {
  if (props.placeholder?.trim()) return props.placeholder
  if (props.placeholderKey.trim()) return t(props.placeholderKey)
  return t('ui.search.placeholder')
})

const inputClass = computed(() =>
  cn(
    inputVariants({ size: 'md' }),
    props.variant === 'toolbar' && 'border-[#e2e8f0] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]',
    'pl-9 pr-9 text-sm font-medium',
    props.inputClass
  )
)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleClear = () => {
  if (props.disabled) return
  emit('update:modelValue', '')
  emit('clear')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && props.emitOnEnter) {
    emit('search', props.modelValue || '')
  }
}
</script>

<template>
  <div class="relative w-full">
    <Search
      class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
    />
    <input
      :value="props.modelValue"
      type="text"
      :placeholder="effectivePlaceholder"
      :disabled="props.disabled"
      :class="inputClass"
      @input="handleInput"
      @keydown="handleKeydown"
    />
    <button
      v-if="props.showClear && hasValue"
      type="button"
      class="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-control p-0.5 text-muted-foreground opacity-70 transition-colors transition-opacity hover:bg-muted hover:text-foreground hover:opacity-100 disabled:pointer-events-none"
      :disabled="props.disabled"
      :aria-label="t('ui.search.clearSearch')"
      @click="handleClear"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

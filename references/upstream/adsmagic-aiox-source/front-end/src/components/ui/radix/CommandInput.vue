// @ts-nocheck
<script setup lang="ts">
// @ts-nocheck
import { ref, inject, computed, onMounted, watch } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  placeholder?: string
  value?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Type a command or search...'
})

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const inputRef = ref<HTMLInputElement>()
const commandContext = inject<any>('command-context', {})

const inputValue = computed({
  get: () => props.value || commandContext.searchTerm?.value || '',
  set: (value: string) => {
    emit('update:value', value)
    if (commandContext.updateSearch) {
      commandContext.updateSearch(value)
    }
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    inputValue.value = ''
    event.preventDefault()
  }
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<template>
  <div class="flex items-center border-b px-3" cmdk-input-wrapper="">
    <input
      ref="inputRef"
      :value="inputValue"
      :placeholder="placeholder"
      :class="cn(
        'flex h-11 w-full rounded-control bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
      )"
      role="combobox"
      aria-expanded="true"
      aria-autocomplete="list"
      data-testid="input"
      @input="handleInput"
      @keydown="handleKeydown"
    />
  </div>
</template>
// @ts-nocheck
<!--
  Select Component (Radix Vue Wrapper)
  
  Implements foundation select functionality with:
  - Typeahead search/filtering
  - Arrow Up/Down navigation
  - Enter selection
  - ARIA compliance (role="combobox", aria-expanded)
  - Portal-based dropdown
  
  Based on TDD tests: Select.spec.ts (25 tests)
  Supports: keyboard navigation, accessibility, search
-->

<script setup lang="ts">
// @ts-nocheck
import { computed } from 'vue'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from 'radix-vue'

interface SelectProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  name?: string
  multiple?: boolean
}

interface SelectEmits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: '',
  placeholder: 'Select an option...',
  disabled: false,
  required: false,
  multiple: false,
})

const emit = defineEmits<SelectEmits>()

// Computed
const computedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleValueChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <SelectRoot 
    :model-value="computedValue"
    :disabled="disabled"
    :required="required"
    :name="name"
    @update:model-value="handleValueChange"
  >
    <SelectTrigger 
      class="flex h-[var(--sym-control-height-md)] w-full items-center justify-between rounded-control border border-input bg-background px-[var(--sym-space-5)] text-[var(--sym-font-size-3)] font-medium text-foreground ring-offset-background transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      data-testid="select-trigger"
    >
      <SelectValue 
        :placeholder="placeholder"
        class="text-left truncate"
      />
      <SelectIcon class="h-4 w-4 text-slate-500 transition-transform duration-200 opacity-100 group-data-[state=open]:rotate-180">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent 
        class="relative z-50 max-h-96 overflow-hidden rounded-[calc(var(--radius-control)+2px)] border border-slate-200/90 bg-popover/95 text-popover-foreground shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        position="popper"
        align="start"
        side-offset="0"
        data-testid="select-content"
        :style="{
          width: 'var(--radix-select-trigger-width)',
          minWidth: 'var(--radix-select-trigger-width)',
          maxWidth: 'var(--radix-select-trigger-width)',
          boxSizing: 'border-box'
        }"
      >
        <SelectScrollUpButton class="flex h-8 cursor-default items-center justify-center bg-white/70 text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </SelectScrollUpButton>

        <SelectViewport class="w-full py-[var(--sym-space-2)]">
          <slot />
        </SelectViewport>

        <SelectScrollDownButton class="flex h-8 cursor-default items-center justify-center bg-white/70 text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style>
[data-testid='select-content'] [role='option'] {
  position: relative;
  display: flex;
  align-items: center;
  width: calc(100% - 0.75rem);
  min-height: var(--sym-control-height-md);
  margin: 0 0.375rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.75rem;
  font-size: var(--sym-font-size-3);
  font-weight: 500;
  line-height: 1.25rem;
  color: #1e293b;
  cursor: pointer;
  outline: none;
  user-select: none;
  transition: background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
}

[data-testid='select-content'] [role='option']:hover,
[data-testid='select-content'] [role='option'][data-highlighted] {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  color: #0f172a;
}

[data-testid='select-content'] [role='option'][data-state='checked'] {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.10) 0%, rgba(99, 102, 241, 0.06) 100%);
  color: rgb(49 46 129);
}

[data-testid='select-content'] [role='option'][data-state='checked']:hover,
[data-testid='select-content'] [role='option'][data-highlighted][data-state='checked'] {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0.10) 100%);
}

[data-testid='select-content'] [role='option']:focus-visible,
[data-testid='select-content'] [role='option'][data-highlighted] {
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.55);
}

[data-testid='select-content'] [role='option'][data-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>

<!--
  Usage:
  
  <Select v-model="selected" placeholder="Choose an option">
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </Select>
-->
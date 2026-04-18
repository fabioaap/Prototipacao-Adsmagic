<script setup lang="ts">
import { computed } from 'vue'
import { Check, ChevronDown } from '@/composables/useIcons'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectGroup,
  SelectLabel,
} from 'radix-vue'

interface SelectOption {
  value: string
  label: string
}

interface SelectOptionGroup {
  label: string
  options: SelectOption[]
}

interface Props {
  modelValue: string
  options?: SelectOption[]
  groups?: SelectOptionGroup[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  size?: 'default' | 'sm' | 'lg'
  disablePortal?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

interface NormalizedOption extends SelectOption {
  internalValue: string
}

interface NormalizedGroup {
  label: string
  options: NormalizedOption[]
}

const EMPTY_VALUE_SENTINEL = '__sym-empty-option__'

const props = withDefaults(defineProps<Props>(), {
  options: undefined,
  groups: undefined,
  placeholder: 'Selecione...',
  disabled: false,
  invalid: false,
  size: 'default',
  disablePortal: false,
})

const emit = defineEmits<Emits>()

const sizeClasses = computed(() => {
  const sizes = {
    default: 'shared-select-trigger-size-default',
    sm: 'shared-select-trigger-size-sm',
    lg: 'shared-select-trigger-size-lg',
  }
  return sizes[props.size]
})

const itemSizeClasses = computed(() => {
  const sizes = {
    default: 'shared-select-item-size-default',
    sm: 'shared-select-item-size-sm',
    lg: 'shared-select-item-size-lg',
  }
  return sizes[props.size]
})

const normalizedOptions = computed<NormalizedOption[]>(() => {
  return (props.options ?? []).map((option, index) => ({
    ...option,
    internalValue: option.value === '' ? `${EMPTY_VALUE_SENTINEL}-flat-${index}` : option.value,
  }))
})

const normalizedGroups = computed<NormalizedGroup[]>(() => {
  return (props.groups ?? []).map((group, groupIndex) => ({
    label: group.label,
    options: group.options.map((option, optionIndex) => ({
      ...option,
      internalValue: option.value === ''
        ? `${EMPTY_VALUE_SENTINEL}-group-${groupIndex}-${optionIndex}`
        : option.value,
    })),
  }))
})

const hasAnyOption = computed(() => {
  return normalizedOptions.value.length > 0 || normalizedGroups.value.some((group) => group.options.length > 0)
})

const internalValue = computed(() => {
  if (!props.modelValue) return undefined
  return props.modelValue
})

function decodeValue(value: string) {
  return value.startsWith(EMPTY_VALUE_SENTINEL) ? '' : value
}

function handleValueChange(value: string) {
  emit('update:modelValue', decodeValue(value))
}
</script>

<template>
  <SelectRoot
    :model-value="internalValue"
    :disabled="disabled"
    @update:model-value="handleValueChange"
  >
    <SelectTrigger
      :class="[
        'flex w-full items-center justify-between rounded-control border border-input bg-background pr-3 ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer',
        'text-foreground hover:border-slate-300',
        props.invalid ? 'border-destructive focus-visible:ring-destructive/20' : '',
        sizeClasses,
      ]"
      data-testid="shared-select-trigger"
    >
      <SelectValue :placeholder="placeholder" class="truncate text-left" />
      <SelectIcon as-child>
        <ChevronDown class="h-4 w-4 shrink-0 text-muted-foreground" />
      </SelectIcon>
    </SelectTrigger>

    <template v-if="!disablePortal">
      <SelectPortal>
        <SelectContent
          class="relative z-50 max-h-96 overflow-hidden rounded-control border border-border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          position="popper"
          align="start"
          :side-offset="4"
          update-position-strategy="always"
          data-testid="shared-select-content"
          :style="{
            width: 'var(--radix-select-trigger-width)',
            minWidth: 'var(--radix-select-trigger-width)',
            maxWidth: 'var(--radix-select-trigger-width)',
            boxSizing: 'border-box'
          }"
        >
          <SelectViewport class="w-full py-[var(--sym-space-2)]">
            <template v-if="normalizedOptions.length">
              <SelectItem
                v-for="option in normalizedOptions"
                :key="option.internalValue"
                :value="option.internalValue"
                :class="['shared-select-item', itemSizeClasses]"
              >
                <SelectItemIndicator class="shared-select-item-indicator">
                  <Check class="h-3.5 w-3.5" />
                </SelectItemIndicator>
                <SelectItemText class="shared-select-item-text">{{ option.label }}</SelectItemText>
              </SelectItem>
            </template>

            <template v-if="normalizedGroups.length">
              <SelectGroup v-for="group in normalizedGroups" :key="group.label">
                <SelectLabel class="shared-select-group-label">{{ group.label }}</SelectLabel>
                <SelectItem
                  v-for="option in group.options"
                  :key="option.internalValue"
                  :value="option.internalValue"
                  :class="['shared-select-item', itemSizeClasses]"
                >
                  <SelectItemIndicator class="shared-select-item-indicator">
                    <Check class="h-3.5 w-3.5" />
                  </SelectItemIndicator>
                  <SelectItemText class="shared-select-item-text">{{ option.label }}</SelectItemText>
                </SelectItem>
              </SelectGroup>
            </template>

            <div v-if="!hasAnyOption" class="shared-select-empty-state">
              Nenhuma opcao disponivel
            </div>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </template>

    <template v-else>
        <SelectContent
          class="relative z-50 max-h-96 overflow-hidden rounded-control border border-border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        position="popper"
        align="start"
        :side-offset="4"
        update-position-strategy="always"
        data-testid="shared-select-content"
        :style="{
          width: 'var(--radix-select-trigger-width)',
          minWidth: 'var(--radix-select-trigger-width)',
          maxWidth: 'var(--radix-select-trigger-width)',
          boxSizing: 'border-box'
        }"
      >
        <SelectViewport class="w-full py-[var(--sym-space-2)]">
          <template v-if="normalizedOptions.length">
            <SelectItem
              v-for="option in normalizedOptions"
              :key="option.internalValue"
              :value="option.internalValue"
              :class="['shared-select-item', itemSizeClasses]"
            >
              <SelectItemIndicator class="shared-select-item-indicator">
                <Check class="h-3.5 w-3.5" />
              </SelectItemIndicator>
              <SelectItemText class="shared-select-item-text">{{ option.label }}</SelectItemText>
            </SelectItem>
          </template>

          <template v-if="normalizedGroups.length">
            <SelectGroup v-for="group in normalizedGroups" :key="group.label">
              <SelectLabel class="shared-select-group-label">{{ group.label }}</SelectLabel>
              <SelectItem
                v-for="option in group.options"
                :key="option.internalValue"
                :value="option.internalValue"
                :class="['shared-select-item', itemSizeClasses]"
              >
                <SelectItemIndicator class="shared-select-item-indicator">
                  <Check class="h-3.5 w-3.5" />
                </SelectItemIndicator>
                <SelectItemText class="shared-select-item-text">{{ option.label }}</SelectItemText>
              </SelectItem>
            </SelectGroup>
          </template>

          <div v-if="!hasAnyOption" class="shared-select-empty-state">
            Nenhuma opcao disponivel
          </div>
        </SelectViewport>
      </SelectContent>
    </template>
  </SelectRoot>
</template>

<style>
.shared-select-item {
  position: relative;
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  align-items: center;
  column-gap: var(--sym-space-4);
  width: 100%;
  margin: 0;
  padding: 0.625rem 0.75rem;
  border-radius: 0;
  font-weight: 400;
  color: hsl(var(--foreground));
  cursor: pointer;
  outline: none;
  user-select: none;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.shared-select-item:hover,
.shared-select-item[data-highlighted] {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.shared-select-item[data-state='checked'] {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  font-weight: 500;
}

.shared-select-item[data-state='checked']:hover,
.shared-select-item[data-highlighted][data-state='checked'] {
  background-color: hsl(var(--accent));
}

.shared-select-item[data-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.shared-select-item-indicator {
  grid-column: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: hsl(var(--primary));
}

.shared-select-item-text {
  grid-column: 2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-select-group-label {
  padding: 0.5rem 0.75rem 0.25rem;
  font-size: var(--sym-font-size-2);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}

.shared-select-trigger-size-default {
  height: var(--sym-control-height-md);
  padding-left: var(--sym-space-5);
  padding-right: var(--sym-space-5);
  font-size: var(--sym-font-size-3);
  line-height: 1.5;
  font-weight: 400;
}

.shared-select-trigger-size-sm {
  height: var(--sym-control-height-sm);
  padding-left: var(--sym-space-4);
  padding-right: var(--sym-space-4);
  font-size: var(--sym-font-size-2);
  line-height: 1.3334;
  font-weight: 400;
}

.shared-select-trigger-size-lg {
  height: var(--sym-control-height-lg);
  padding-left: var(--sym-space-6);
  padding-right: var(--sym-space-6);
  font-size: var(--sym-font-size-4);
  line-height: 1.5;
  font-weight: 400;
}

.shared-select-item-size-default {
  min-height: var(--sym-control-height-md);
  font-size: var(--sym-font-size-3);
  line-height: 1.5;
}

.shared-select-item-size-sm {
  min-height: var(--sym-control-height-sm);
  font-size: var(--sym-font-size-2);
  line-height: 1.3334;
}

.shared-select-item-size-lg {
  min-height: var(--sym-control-height-lg);
  font-size: var(--sym-font-size-4);
  line-height: 1.5;
}

.shared-select-empty-state {
  padding: 0.75rem;
  font-size: var(--sym-font-size-3);
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

[data-testid='shared-select-content'][data-side='bottom'] {
  margin-top: calc((var(--radix-select-trigger-height, 0px) * -1) + 0.25rem);
}

[data-testid='shared-select-content'][data-side='top'] {
  margin-bottom: calc((var(--radix-select-trigger-height, 0px) * -1) + 0.25rem);
}
</style>

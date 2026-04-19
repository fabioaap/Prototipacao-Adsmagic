<!--
  Card com checkbox para seleção de opções
-->

<script setup lang="ts">
import { computed } from 'vue'

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  modelValue?: boolean
  title: string
  description?: string
  icon?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

// ============================================================================
// EMITS
// ============================================================================

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// ============================================================================
// COMPUTED
// ============================================================================

const isChecked = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// ============================================================================
// MÉTODOS
// ============================================================================

const handleClick = () => {
  if (!props.disabled) {
    isChecked.value = !isChecked.value
  }
}
</script>

<template>
  <div
    :class="[
      'checkbox-card',
      'relative p-4 sm:p-6 border-2 rounded-lg cursor-pointer transition-all duration-200',
      isChecked
        ? 'border-primary bg-primary/5'
        : 'border-border bg-card hover:border-primary/50',
      disabled && 'opacity-50 cursor-not-allowed',
    ]"
    @click="handleClick"
    role="checkbox"
    :aria-checked="isChecked"
    :aria-disabled="disabled"
    tabindex="0"
    @keydown.space.prevent="handleClick"
    @keydown.enter.prevent="handleClick"
  >
    <!-- Checkbox no canto superior direito -->
    <div class="absolute top-4 right-4">
      <div
        :class="[
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
          isChecked
            ? 'border-primary bg-primary'
            : 'border-muted-foreground bg-background',
        ]"
      >
        <svg
          v-if="isChecked"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-primary-foreground"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="pr-8">
      <!-- Ícone (opcional) -->
      <div v-if="icon" class="mb-3">
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span class="text-2xl">{{ icon }}</span>
        </div>
      </div>

      <!-- Título -->
      <h3 class="text-base sm:text-lg font-semibold mb-1">
        {{ title }}
      </h3>

      <!-- Descrição -->
      <p v-if="description" class="text-sm text-muted-foreground">
        {{ description }}
      </p>

      <!-- Slot para conteúdo adicional -->
      <div v-if="$slots.default" class="mt-3">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkbox-card:focus {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

.checkbox-card:not([aria-disabled="true"]):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.checkbox-card:not([aria-disabled="true"]):active {
  transform: translateY(0);
}
</style>

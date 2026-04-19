<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import Label from './Label.vue'

interface FormFieldProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  id?: string
  htmlFor?: string
}

const props = defineProps<FormFieldProps>()

const fieldId = computed(() => props.id || props.htmlFor || `field-${Math.random().toString(36).substr(2, 9)}`)

const labelClass = cn('mb-2 block')

const helperClass = cn('mt-2 text-sm text-muted-foreground')

const errorClass = cn('mt-2 text-sm text-destructive')
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <Label
      v-if="label"
      :for="fieldId"
      :class="labelClass"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-destructive ml-1"
        aria-label="required"
      >
        *
      </span>
    </Label>

    <!-- Field (slot) -->
    <div>
      <slot :id="fieldId" :aria-describedby="error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined" :aria-invalid="!!error" />
    </div>

    <!-- Helper Text -->
    <p
      v-if="helperText && !error"
      :id="`${fieldId}-helper`"
      :class="helperClass"
    >
      {{ helperText }}
    </p>

    <!-- Error Message -->
    <p
      v-if="error"
      :id="`${fieldId}-error`"
      :class="errorClass"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>

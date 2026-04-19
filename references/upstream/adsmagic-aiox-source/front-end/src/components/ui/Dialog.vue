<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'

interface DialogProps {
  modelValue?: boolean
  open?: boolean
  title?: string
  description?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  persistent?: boolean
  showClose?: boolean
  disablePortal?: boolean
  portalTarget?: string
  noPadding?: boolean
}

const props = withDefaults(defineProps<DialogProps>(), {
  modelValue: false,
  open: undefined,
  size: 'md',
  persistent: false,
  showClose: true,
  disablePortal: false,
  portalTarget: 'body',
  noPadding: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:open': [value: boolean]
  close: []
}>()

const isOpen = computed(() => Boolean(props.open !== undefined ? props.open : props.modelValue))

const close = () => {
  if (props.persistent) return
  emit('update:modelValue', false)
  emit('update:open', false)
  emit('close')
}

defineExpose({ isOpen, close })
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    :open="props.open"
    :title="props.title"
    :description="props.description"
    :size="props.size"
    :persistent="props.persistent"
    :show-close-button="props.showClose"
    :disable-portal="props.disablePortal"
    :portal-target="props.portalTarget"
    :no-padding="props.noPadding"
    @update:model-value="emit('update:modelValue', $event)"
    @update:open="emit('update:open', $event)"
    @close="emit('close')"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <template #content>
      <slot name="content">
        <slot />
      </slot>
    </template>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Modal>
</template>

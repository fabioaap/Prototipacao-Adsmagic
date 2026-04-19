<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

interface Props {
  open: boolean
  isLoading?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'submit', name: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<Emits>()

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

const projectName = ref('')
const errorMessage = ref('')

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      projectName.value = ''
      errorMessage.value = ''
    }
  }
)

function handleClose() {
  emit('update:open', false)
}

function handleSubmit() {
  errorMessage.value = ''

  if (!projectName.value.trim()) {
    errorMessage.value = t('projects.modal.validation.nameRequired')
    return
  }

  if (projectName.value.trim().length < 2) {
    errorMessage.value = t('projects.modal.validation.nameMinLength')
    return
  }

  if (projectName.value.trim().length > 100) {
    errorMessage.value = t('projects.modal.validation.nameMaxLength')
    return
  }

  emit('submit', projectName.value.trim())
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSubmit()
  }
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      @click="handleClose"
    />
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div
      v-if="open"
      class="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title-md">{{ t('projects.modal.createTitle') }}</h2>
        <button
          @click="handleClose"
          class="rounded-control opacity-70 hover:opacity-100 transition-opacity"
          :disabled="isLoading"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="project-name">{{ t('projects.modal.nameLabel') }}</Label>
          <Input
            id="project-name"
            v-model="projectName"
            :placeholder="t('projects.modal.namePlaceholder')"
            :disabled="isLoading"
            @keydown="handleKeydown"
            autofocus
          />
          <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
          <p class="text-xs text-muted-foreground">
            {{ t('projects.modal.validation.helperText') }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 mt-6">
        <Button variant="outline" @click="handleClose" :disabled="isLoading">{{ t('projects.modal.cancel') }}</Button>
        <Button @click="handleSubmit" :disabled="isLoading">
          {{ isLoading ? t('projects.modal.creating') : t('projects.modal.create') }}
        </Button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}
</style>

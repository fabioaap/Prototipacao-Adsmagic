<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Save, Globe } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Alert from '@/components/ui/Alert.vue'
import FormField from '@/components/ui/FormField.vue'
import { useOriginsStore } from '@/stores/origins'
import { createOriginSchema } from '@/schemas'
import type { Origin } from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'
import { cn } from '@/lib/utils'
import { z } from 'zod'

interface Props {
  /**
   * Controla a abertura do modal
   */
  open: boolean
  /**
   * Origem a ser editada (opcional)
   */
  origin?: Origin | null
}

const props = withDefaults(defineProps<Props>(), {
  origin: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [origin: Origin]
}>()

const originsStore = useOriginsStore()
const { toast } = useToast()

// Estado local
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const colorInputRef = ref<HTMLInputElement | null>(null)

// Form data
interface FormData {
  name: string
  description: string
  color: string
  utmSourceMatchMode: '' | 'exact' | 'contains'
  utmSourceMatchValue: string
}

const formData = ref<FormData>({
  name: '',
  description: '',
  color: '#3b82f6',
  utmSourceMatchMode: '',
  utmSourceMatchValue: '',
})

const utmSourceModeOptions = [
  { value: '', label: 'Sem regra' },
  { value: 'contains', label: 'Contém' },
  { value: 'exact', label: 'Exato' },
]

// Reset form quando abrir
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.origin) {
      // Edição - preencher com dados da origem
      formData.value = {
        name: props.origin.name,
        description: props.origin.description || '',
        color: props.origin.color || '#3b82f6',
        utmSourceMatchMode: props.origin.utmSourceMatchMode || '',
        utmSourceMatchValue: props.origin.utmSourceMatchValue || '',
      }
    } else {
      // Criação - resetar
      formData.value = {
        name: '',
        description: '',
        color: '#3b82f6',
        utmSourceMatchMode: '',
        utmSourceMatchValue: '',
      }
    }
    errors.value = {}
  }
})

// Computed
const isEditing = computed(() => !!props.origin)
const modalTitle = computed(() => isEditing.value ? 'Editar Origem' : 'Criar Origem')

// Color presets
const colorPresets = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#6366f1', // Indigo
]

// Handlers
const handleClose = () => {
  emit('update:open', false)
}

const handleSelectUtmMode = (value: '' | 'exact' | 'contains') => {
  formData.value.utmSourceMatchMode = value

  if (!value) {
    formData.value.utmSourceMatchValue = ''
    delete errors.value.utmSourceMatchMode
    delete errors.value.utmSourceMatchValue
  }
}

const openColorPicker = () => {
  if (!loading.value) {
    colorInputRef.value?.click()
  }
}

const validateForm = (): boolean => {
  try {
    const payload = {
      ...formData.value,
      utmSourceMatchMode: formData.value.utmSourceMatchMode || undefined,
      utmSourceMatchValue: formData.value.utmSourceMatchValue.trim() || undefined,
    }
    createOriginSchema.parse(payload)
    errors.value = {}
    return true
  } catch (err) {
    if (err instanceof z.ZodError) {
      errors.value = {}
      err.issues.forEach((issue) => {
        const field = issue.path[0]?.toString()
        if (field) {
          errors.value[field] = issue.message
        }
      })
    }
    return false
  }
}

const handleSave = async () => {
  if (!validateForm()) {
    toast({
      title: 'Erro de validação',
      description: 'Por favor, corrija os erros no formulário.',
      variant: 'destructive',
    })
    return
  }

  loading.value = true

  try {
    const normalizedUtmMode = formData.value.utmSourceMatchMode || null
    const normalizedUtmValue = formData.value.utmSourceMatchValue.trim().toLowerCase() || null

    const payload = {
      ...formData.value,
      utmSourceMatchMode: normalizedUtmMode,
      utmSourceMatchValue: normalizedUtmValue,
    }

    let savedOrigin: Origin

    if (isEditing.value && props.origin) {
      // Update
      savedOrigin = await originsStore.updateOrigin(props.origin.id, payload)
    } else {
      // Create
      savedOrigin = await originsStore.createOrigin(payload)
    }

    toast({
      title: 'Sucesso!',
      description: `Origem ${isEditing.value ? 'atualizada' : 'criada'} com sucesso.`,
    })

    emit('success', savedOrigin)
    handleClose()
  } catch (error) {
    console.error('Erro ao salvar origem:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível salvar a origem. Tente novamente.',
      variant: 'destructive',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Modal
    :model-value="props.open"
    :persistent="loading"
    size="md"
    @update:model-value="(value: boolean) => !loading && emit('update:open', value)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <Globe class="h-5 w-5 text-primary" />
        <div>
          <h2 class="section-title-sm">{{ modalTitle }}</h2>
        </div>
      </div>
    </template>

    <div class="max-h-[70vh] overflow-y-auto">
      <form id="origin-form" class="space-y-6" @submit.prevent="handleSave">
          <FormField label="Nome da Origem" :error="errors.name" required>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex: Google Ads, Facebook, Instagram..."
              :disabled="loading"
              :error="!!errors.name"
            />
          </FormField>

          <FormField label="Descrição">
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Descreva esta origem de contatos..."
              :rows="3"
              :disabled="loading"
            />
          </FormField>

          <FormField
            label="Regra de UTM Source (opcional)"
            :error="errors.utmSourceMatchValue || errors.utmSourceMatchMode"
            helper-text="Exemplo: contém = chatgpt casa com chatgpt.com. Exemplo: exato = chatgpt.com só casa com chatgpt.com."
          >
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="option in utmSourceModeOptions"
                  :key="option.label"
                  type="button"
                  :variant="formData.utmSourceMatchMode === option.value ? 'default' : 'outline'"
                  size="sm"
                  :disabled="loading"
                  @click="handleSelectUtmMode(option.value as '' | 'exact' | 'contains')"
                >
                  {{ option.label }}
                </Button>
              </div>
              <Input
                id="utm-source-value"
                v-model="formData.utmSourceMatchValue"
                placeholder="Ex: chatgpt.com"
                :disabled="loading || !formData.utmSourceMatchMode"
                :error="!!errors.utmSourceMatchValue || !!errors.utmSourceMatchMode"
              />
            </div>
          </FormField>

          <FormField label="Cor" required>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <input
                  ref="colorInputRef"
                  id="color"
                  v-model="formData.color"
                  type="color"
                  class="sr-only"
                  :disabled="loading"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  :disabled="loading"
                  @click="openColorPicker"
                >
                  <span
                    class="h-5 w-5 rounded-control border border-border"
                    :style="{ backgroundColor: formData.color }"
                  />
                  <span class="sr-only">Selecionar cor</span>
                </Button>
                <input
                  v-model="formData.color"
                  placeholder="#3b82f6"
                  class="flex-1"
                  :disabled="loading"
                />
              </div>

              <div class="space-y-2">
                <p class="text-xs text-muted-foreground">Cores sugeridas:</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="color in colorPresets"
                    :key="color"
                    type="button"
                    :class="cn(
                      'h-8 w-8 rounded-control border-2 border-border transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      formData.color === color ? 'border-primary ring-2 ring-primary/20' : ''
                    )"
                    :style="{ backgroundColor: color }"
                    :disabled="loading"
                    @click="formData.color = color"
                  />
                </div>
              </div>
            </div>
          </FormField>

          <FormField label="Preview">
            <div class="p-3 border border-border rounded-lg bg-muted/20">
              <div class="flex items-center gap-3">
                <div
                  class="h-8 w-8 rounded-full flex items-center justify-center"
                  :style="{ backgroundColor: formData.color + '20', color: formData.color }"
                >
                  <Globe class="h-4 w-4" />
                </div>
                <div>
                  <p class="section-kicker">{{ formData.name || 'Nome da origem' }}</p>
                  <p class="text-xs text-muted-foreground">{{ formData.description || 'Descrição da origem' }}</p>
                </div>
              </div>
            </div>
          </FormField>

          <Alert variant="info">
            <p class="text-sm">
              Esta origem será usada para categorizar e analisar seus contatos.
              Você pode criar até 20 origens customizadas.
            </p>
          </Alert>

        </form>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          :disabled="loading"
          @click="handleClose"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="origin-form"
          :disabled="loading"
        >
          <Save class="h-4 w-4" />
          {{ isEditing ? 'Atualizar' : 'Criar' }} Origem
        </Button>
      </div>
    </template>
  </Modal>
</template>

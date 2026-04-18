<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Save } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Alert from '@/components/ui/Alert.vue'
import { useSalesStore } from '@/stores/sales'
import { useContactsStore } from '@/stores/contacts'
import { createSaleSchema } from '@/schemas'
import type { Sale } from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'
import { z } from 'zod'

interface Props {
  /**
   * Controla a abertura do modal
   */
  open: boolean
  /**
   * Venda a ser editada (opcional)
   */
  sale?: Sale | null
  /**
   * ID do contato (pré-preenchido)
   */
  contactId?: string
}

const props = withDefaults(defineProps<Props>(), {
  sale: null,
  contactId: undefined,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [sale: Sale]
}>()

const salesStore = useSalesStore()
const contactsStore = useContactsStore()
const { toast } = useToast()

// Estado local
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// ============================================================================
// SELECT OPTIONS
// ============================================================================

/**
 * Opções de moeda
 * TODO: Quando API real estiver pronta, buscar de GET /api/currencies
 */
const currencyOptions = [
  { value: 'BRL', label: 'R$ - Real Brasileiro' },
  { value: 'USD', label: '$ - Dólar Americano' },
  { value: 'EUR', label: '€ - Euro' },
  { value: 'GBP', label: '£ - Libra Esterlina' },
]

/**
 * Opções de contatos (baseado no store)
 * Em produção, virá filtrado da API
 */
const contactOptions = computed(() => {
  return contactsStore.contacts.map(contact => ({
    value: contact.id,
    label: `${contact.name}${contact.email ? ' - ' + contact.email : ''}`
  }))
})

// Form data
interface FormData {
  contactId: string
  value: number
  currency: string
  date: string
  notes?: string
}

const formData = ref<FormData>({
  contactId: props.contactId ?? '',
  value: 0,
  currency: 'BRL',
  date: new Date().toISOString().split('T')[0] as string,
  notes: '',
})

// Reset form quando abrir
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.sale) {
      // Edição - preencher com dados da venda
      const sale = props.sale
      formData.value = {
        contactId: sale.contactId ?? '',
        value: sale.value ?? 0,
        currency: (sale.currency ?? 'BRL') as string,
        date: (sale.date ? sale.date.split('T')[0] : new Date().toISOString().split('T')[0]) as string,
        notes: sale.notes || '',
      }
    } else {
      // Criação - resetar
      formData.value = {
        contactId: props.contactId ?? '',
        value: 0,
        currency: 'BRL',
        date: new Date().toISOString().split('T')[0] as string,
        notes: '',
      }
    }
    errors.value = {}
  }
})

// Computed
const isEditing = computed(() => !!props.sale)
const modalTitle = computed(() => isEditing.value ? 'Editar Venda' : 'Registrar Venda')

// Handlers
const handleClose = () => {
  emit('update:open', false)
}

const validateForm = (): boolean => {
  try {
    createSaleSchema.parse(formData.value)
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
    let savedSale: Sale

    if (isEditing.value && props.sale) {
      // Update
      savedSale = await salesStore.updateSale(props.sale.id, {
        ...formData.value,
        date: new Date(formData.value.date).toISOString(),
      })
    } else {
      // Create
      savedSale = await salesStore.createSale({
        ...formData.value,
        date: new Date(formData.value.date).toISOString(),
      })
    }

    toast({
      title: 'Sucesso!',
      description: `Venda ${isEditing.value ? 'atualizada' : 'registrada'} com sucesso.`,
    })

    emit('success', savedSale)
    handleClose()
  } catch (error) {
    console.error('Erro ao salvar venda:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível salvar a venda. Tente novamente.',
      variant: 'destructive',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Modal
    :open="props.open"
    :show-close-button="false"
    @update:open="emit('update:open', $event)"
    size="md"
    :no-padding="true"
  >
    <div class="flex flex-col max-h-[70vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b shrink-0">
          <h2 class="section-title-sm">{{ modalTitle }}</h2>
          <Button
            variant="ghost"
            size="sm"
            :disabled="loading"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>

        <!-- Form (scrollable area) -->
        <div class="overflow-y-auto flex-1 px-6 py-4">
          <form class="space-y-4" @submit.prevent="handleSave">
          <!-- Contato -->
          <div class="space-y-2">
            <Label for="contactId" required>Contato</Label>
            <Select
              id="contactId"
              v-model="formData.contactId"
              :options="contactOptions"
              placeholder="Selecione um contato"
              :disabled="loading"
            />
            <p v-if="errors.contactId" class="text-xs text-destructive flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ errors.contactId }}
            </p>
          </div>

          <!-- Valor e Moeda -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="value" required>Valor</Label>
              <Input
                id="value"
                v-model.number="formData.value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                :disabled="loading"
                :error="!!errors.value"
              />
              <p v-if="errors.value" class="text-xs text-destructive flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ errors.value }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="currency" required>Moeda</Label>
              <Select
                id="currency"
                v-model="formData.currency"
                :options="currencyOptions"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Data -->
          <div class="space-y-2">
            <Label for="date" required>Data da Venda</Label>
            <Input
              id="date"
              v-model="formData.date"
              type="date"
              :disabled="loading"
              :error="!!errors.date"
            />
            <p v-if="errors.date" class="text-xs text-destructive flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ errors.date }}
            </p>
          </div>

          <!-- Observações -->
          <div class="space-y-2">
            <Label for="notes">Observações</Label>
            <Textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Adicione observações sobre a venda..."
              :rows="3"
              :disabled="loading"
            />
          </div>

          <!-- Info Alert -->
          <Alert variant="info">
            <p class="text-sm">
              Esta venda será vinculada ao contato selecionado e marcada como "Realizada".
            </p>
          </Alert>
          </form>
        </div>

        <!-- Actions (sticky footer) -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0 bg-card">
          <Button
            type="button"
            variant="outline"
            :disabled="loading"
            @click="handleClose"
          >
            Cancelar
          </Button>
          <Button
            :disabled="loading"
            @click="handleSave"
          >
            <Save class="h-4 w-4 mr-2" />
            {{ isEditing ? 'Atualizar' : 'Registrar' }} Venda
          </Button>
        </div>
      </div>
  </Modal>
</template>

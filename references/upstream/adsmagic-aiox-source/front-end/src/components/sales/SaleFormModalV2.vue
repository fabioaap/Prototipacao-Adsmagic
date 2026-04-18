<script setup lang="ts">
/**
 * SaleFormModalV2.vue
 * 
 * Modal padronizado para criação e edição de vendas
 * Migrado para usar Modal e useFormModal
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Save, DollarSign } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Textarea from '@/components/ui/Textarea.vue'
import FormField from '@/components/ui/FormField.vue'
import Modal from '@/components/ui/Modal.vue'
import { useSalesStore } from '@/stores/sales'
import { useContactsStore } from '@/stores/contacts'
import { createSaleSchema } from '@/schemas'
import type { Sale } from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'
import { useFormModal } from '@/composables/useModal'
import { z } from 'zod'

interface Props {
  /**
   * Controla abertura do modal
   */
  open?: boolean
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
  open: false,
  sale: null,
  contactId: undefined,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [sale: Sale]
}>()

// Stores
const salesStore = useSalesStore()
const contactsStore = useContactsStore()
const { toast } = useToast()

// Modal state
const modalState = useFormModal<Sale>({
  onOpen: async (sale) => {
    // Garantir que contatos estão carregados
    if (contactsStore.contacts.length === 0) {
      await contactsStore.fetchContacts()
    }
    
    // Preencher formulário
    if (sale) {
      formData.value = {
        contactId: sale.contactId ?? '',
        value: sale.value ?? 0,
        currency: (sale.currency ?? 'BRL') as string,
        date: (sale.date ? sale.date.split('T')[0] : new Date().toISOString().split('T')[0]) as string,
        notes: sale.notes || '',
      }
    } else {
      resetForm()
    }
    
    errors.value = {}
  },
  onSaveSuccess: (sale: Sale) => {
    emit('success', sale)
    toast({
      title: isEditMode.value ? 'Venda atualizada' : 'Venda registrada',
      description: `Venda de ${formatCurrency(sale.value, sale.currency)} foi ${isEditMode.value ? 'atualizada' : 'registrada'} com sucesso.`,
    })
  },
  onSaveError: (error: any) => {
    console.error('Erro ao salvar venda:', error)
    toast({
      title: 'Erro ao salvar',
      description: 'Não foi possível salvar a venda. Tente novamente.',
      variant: 'destructive',
    })
  },
  resetOnClose: true,
})

// Form state
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

const errors = ref<Record<string, string>>({})

// Computed
const isEditMode = computed(() => !!modalState.data.value)
const modalTitle = computed(() => 
  isEditMode.value ? 'Editar Venda' : 'Registrar Venda'
)

const modalDescription = computed(() =>
  isEditMode.value 
    ? 'Edite as informações da venda'
    : 'Registre uma nova venda no sistema'
)

const currencyOptions = [
  { value: 'BRL', label: 'R$ - Real Brasileiro' },
  { value: 'USD', label: '$ - Dólar Americano' },
  { value: 'EUR', label: '€ - Euro' },
  { value: 'GBP', label: '£ - Libra Esterlina' },
]

const contactOptions = computed(() => {
  return contactsStore.contacts.map(contact => ({
    value: contact.id,
    label: `${contact.name}${contact.email ? ' - ' + contact.email : ''}`
  }))
})

// Methods
const resetForm = () => {
  formData.value = {
    contactId: props.contactId ?? '',
    value: 0,
    currency: 'BRL',
    date: new Date().toISOString().split('T')[0] as string,
    notes: '',
  }
  errors.value = {}
}

const formatCurrency = (value: number, currency: string): string => {
  const formatters = {
    BRL: (val: number) => new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(val),
    USD: (val: number) => new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(val),
    EUR: (val: number) => new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(val),
    GBP: (val: number) => new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP' 
    }).format(val),
  }
  
  return formatters[currency as keyof typeof formatters]?.(value) ?? `${value} ${currency}`
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

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  modalState.startSaving()

  try {
    let savedSale: Sale

    if (isEditMode.value) {
      // Atualizar venda existente
      savedSale = await salesStore.updateSale(
        modalState.data.value!.id,
        formData.value
      )
    } else {
      // Criar nova venda
      savedSale = await salesStore.createSale(formData.value)
    }

    await modalState.saveAndClose(savedSale)
  } catch (error) {
    console.error('Erro ao salvar venda:', error)
    errors.value.submit = 'Erro ao salvar venda. Tente novamente.'
    modalState.stopSaving()
  }
}

// Sync com props externas
watch(() => props.open, (open) => {
  if (open && !modalState.isOpen.value) {
    modalState.open(props.sale ?? undefined)
  } else if (!open && modalState.isOpen.value) {
    modalState.close()
  }
})

watch(() => modalState.isOpen.value, (open) => {
  emit('update:open', open)
})

// Inicializar na montagem
onMounted(() => {
  if (props.open) {
    modalState.open(props.sale ?? undefined)
  }
})
</script>

<template>
  <Modal
    v-model="modalState.isOpen.value"
    :title="modalTitle"
    :description="modalDescription"
    :persistent="modalState.isLoading.value"
    size="lg"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Contato -->
      <FormField 
        label="Contato" 
        required 
        :error="errors.contactId"
        description="Selecione o contato para esta venda"
      >
        <Select
          v-model="formData.contactId"
          :options="contactOptions"
          placeholder="Selecione um contato..."
          :disabled="modalState.isLoading.value"
          :error="!!errors.contactId"
          required
        />
      </FormField>

      <!-- Valor e Moeda -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Valor" 
          required
          :error="errors.value"
          class="sm:col-span-2"
        >
          <Input
            v-model.number="formData.value"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            :disabled="modalState.isLoading.value"
            :error="!!errors.value"
            required
          />
        </FormField>

        <FormField 
          label="Moeda" 
          :error="errors.currency"
          class="sm:col-span-1"
        >
          <Select
            v-model="formData.currency"
            :options="currencyOptions"
            :disabled="modalState.isLoading.value"
            :error="!!errors.currency"
          />
        </FormField>
      </div>

      <!-- Data -->
      <FormField 
        label="Data da Venda" 
        required
        :error="errors.date"
        description="Data em que a venda foi realizada"
      >
        <Input
          v-model="formData.date"
          type="date"
          :disabled="modalState.isLoading.value"
          :error="!!errors.date"
          required
        />
      </FormField>

      <!-- Observações -->
      <FormField 
        label="Observações" 
        :error="errors.notes"
        description="Informações adicionais sobre a venda"
      >
        <Textarea
          v-model="formData.notes"
          placeholder="Detalhes da venda, forma de pagamento, etc..."
          :rows="4"
          :disabled="modalState.isLoading.value"
          :error="!!errors.notes"
        />
      </FormField>

      <!-- Erro de submissão -->
      <div v-if="errors.submit" class="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
        {{ errors.submit }}
      </div>

      <!-- Preview do valor formatado -->
      <div v-if="formData.value > 0" class="bg-muted p-4 rounded-lg">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign class="h-4 w-4" />
          <span>Valor formatado:</span>
          <span class="font-semibold text-foreground">
            {{ formatCurrency(formData.value, formData.currency) }}
          </span>
        </div>
      </div>
    </form>

    <!-- Footer com ações -->
    <template #footer>
      <Button
        type="button"
        variant="outline"
        :disabled="modalState.isLoading.value"
        @click="modalState.close()"
      >
        Cancelar
      </Button>
      <Button
        type="button"
        :disabled="modalState.isLoading.value"
        :loading="modalState.isSaving.value"
        @click="handleSubmit"
      >
        <Save class="h-4 w-4 mr-2" />
        {{ isEditMode ? 'Atualizar' : 'Registrar' }} Venda
      </Button>
    </template>
  </Modal>
</template>

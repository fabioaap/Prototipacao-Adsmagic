<script setup lang="ts">
/**
 * ContactFormModal.vue
 * 
 * Modal padronizado para criação e edição de contatos
 * Agora usando Modal e composable useFormModal
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Save } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Textarea from '@/components/ui/Textarea.vue'
import FormField from '@/components/ui/FormField.vue'
import Modal from '@/components/ui/Modal.vue'
import type { Contact } from '@/types/models'
import { useContactsStore } from '@/stores/contacts'
import { useStagesStore } from '@/stores/stages'
import { useOriginsStore } from '@/stores/origins'
import { createContactSchema, updateContactSchema } from '@/schemas/contact'
import { useFormModal } from '@/composables/useModal'
import { useToast } from '@/components/ui/toast/use-toast'
import type { ZodError } from 'zod'

interface Props {
  /**
   * Controla abertura do modal
   */
  open?: boolean
  /**
   * Contato para edição (se não fornecido, cria novo)
   */
  contact?: Contact | null
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  contact: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [contact: Contact]
}>()

// Stores
const contactsStore = useContactsStore()
const stagesStore = useStagesStore()
const originsStore = useOriginsStore()
const { toast } = useToast()

// Modal state
const modalState = useFormModal<Contact>({
  onOpen: async (contact) => {
    // Inicializar stores se necessário
    await initializeStores()
    
    // Preencher formulário
    if (contact) {
      formData.value = {
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        countryCode: contact.countryCode || '55',
        company: contact.company || '',
        location: contact.location || '',
        origin: contact.origin,
        stage: contact.stage,
        notes: contact.notes || '',
      }
    } else {
      resetForm()
    }
    
    // Limpar erros
    errors.value = {}
  },
  onSaveSuccess: (contact: Contact) => {
    emit('success', contact)
    toast({
      title: isEditMode.value ? 'Contato atualizado' : 'Contato criado',
      description: `${contact.name} foi ${isEditMode.value ? 'atualizado' : 'criado'} com sucesso.`,
    })
  },
  onSaveError: (error: any) => {
    console.error('Erro ao salvar contato:', error)
    toast({
      title: 'Erro ao salvar',
      description: 'Não foi possível salvar o contato. Tente novamente.',
      variant: 'destructive',
    })
  },
  resetOnClose: true,
})

// Form state
const formData = ref({
  name: '',
  email: '',
  phone: '',
  countryCode: '55',
  company: '',
  location: '',
  origin: '',
  stage: '',
  notes: '',
})

const errors = ref<Record<string, string>>({})

// Computed
const isEditMode = computed(() => !!modalState.data.value)
const modalTitle = computed(() => 
  isEditMode.value ? 'Editar Contato' : 'Novo Contato'
)

const originOptions = computed(() =>
  originsStore.origins.map(origin => ({
    value: origin.id,
    label: origin.name,
  }))
)

const stageOptions = computed(() =>
  stagesStore.stages.map(stage => ({
    value: stage.id,
    label: stage.name,
  }))
)

const countryCodeOptions = [
  { value: '55', label: '+55 (Brasil)' },
  { value: '1', label: '+1 (EUA/Canadá)' },
  { value: '44', label: '+44 (Reino Unido)' },
  { value: '351', label: '+351 (Portugal)' },
  { value: '34', label: '+34 (Espanha)' },
]

// Methods
const initializeStores = async () => {
  try {
    const promises = []
    
    if (stagesStore.stages.length === 0) {
      promises.push(stagesStore.fetchStages())
    }
    if (originsStore.origins.length === 0) {
      promises.push(originsStore.fetchOrigins())
    }
    
    await Promise.all(promises)
  } catch (error) {
    console.error('Erro ao inicializar stores:', error)
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    countryCode: '55',
    company: '',
    location: '',
    origin: '',
    stage: '',
    notes: '',
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}
  
  const schema = isEditMode.value ? updateContactSchema : createContactSchema
  
  try {
    schema.parse(formData.value)
    return true
  } catch (error) {
    const zodError = error as ZodError
    zodError.issues.forEach((err: any) => {
      if (err.path.length > 0) {
        errors.value[err.path[0] as string] = err.message
      }
    })
    return false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  modalState.startSaving()
  
  try {
    let savedContact: Contact
    
    if (isEditMode.value) {
      // Atualizar contato existente
      savedContact = await contactsStore.updateContact(
        modalState.data.value!.id,
        formData.value
      )
    } else {
      // Criar novo contato
      savedContact = await contactsStore.createContact(formData.value)
    }
    
    await modalState.saveAndClose(savedContact)
  } catch (error) {
    console.error('Erro ao salvar contato:', error)
    errors.value.submit = 'Erro ao salvar contato. Tente novamente.'
    modalState.stopSaving()
  }
}

// Sync com props externas
watch(() => props.open, (open) => {
  if (open && !modalState.isOpen.value) {
    modalState.open(props.contact ?? undefined)
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
    modalState.open(props.contact ?? undefined)
  }
})
</script>

<template>
  <Modal
    v-model="modalState.isOpen.value"
    :title="modalTitle"
    :persistent="modalState.isLoading.value"
    size="lg"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Nome -->
      <FormField 
        label="Nome" 
        required 
        :error="errors.name"
        description="Nome completo do contato"
      >
        <Input
          v-model="formData.name"
          placeholder="Ex: João Silva"
          :disabled="modalState.isLoading.value"
          :error="!!errors.name"
          required
        />
      </FormField>

      <!-- Email -->
      <FormField 
        label="Email" 
        :error="errors.email"
        description="Email do contato (opcional)"
      >
        <Input
          v-model="formData.email"
          type="email"
          placeholder="Ex: joao@empresa.com"
          :disabled="modalState.isLoading.value"
          :error="!!errors.email"
        />
      </FormField>

      <!-- Telefone e Código do País -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField 
          label="Código" 
          :error="errors.countryCode"
          class="sm:col-span-1"
        >
          <Select
            v-model="formData.countryCode"
            :options="countryCodeOptions"
            placeholder="Código"
            :disabled="modalState.isLoading.value"
            :error="!!errors.countryCode"
          />
        </FormField>

        <FormField 
          label="Telefone" 
          required
          :error="errors.phone"
          class="sm:col-span-2"
        >
          <Input
            v-model="formData.phone"
            placeholder="Ex: (11) 99999-9999"
            :disabled="modalState.isLoading.value"
            :error="!!errors.phone"
            required
          />
        </FormField>
      </div>

      <!-- Empresa (desativado — será via configuração futura)
      <FormField
        label="Empresa"
        :error="errors.company"
        description="Empresa onde trabalha (opcional)"
      >
        <Input
          v-model="formData.company"
          placeholder="Ex: Empresa XYZ"
          :disabled="modalState.isLoading.value"
          :error="!!errors.company"
        />
      </FormField>
      -->

      <!-- Localização -->
      <FormField 
        label="Localização" 
        :error="errors.location"
        description="Cidade, estado ou país"
      >
        <Input
          v-model="formData.location"
          placeholder="Ex: São Paulo, SP"
          :disabled="modalState.isLoading.value"
          :error="!!errors.location"
        />
      </FormField>

      <!-- Origem e Estágio -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField 
          label="Origem" 
          :error="errors.origin"
          description="Como conheceu sua empresa"
        >
          <Select
            v-model="formData.origin"
            :options="originOptions"
            placeholder="Selecione uma origem..."
            :disabled="modalState.isLoading.value"
            :error="!!errors.origin"
          />
        </FormField>

        <FormField 
          label="Estágio" 
          :error="errors.stage"
          description="Estágio atual no funil"
        >
          <Select
            v-model="formData.stage"
            :options="stageOptions"
            placeholder="Selecione um estágio..."
            :disabled="modalState.isLoading.value"
            :error="!!errors.stage"
          />
        </FormField>
      </div>

      <!-- Notas -->
      <FormField 
        label="Observações" 
        :error="errors.notes"
        description="Informações adicionais sobre o contato"
      >
        <Textarea
          v-model="formData.notes"
          placeholder="Observações sobre o contato..."
          :rows="4"
          :disabled="modalState.isLoading.value"
          :error="!!errors.notes"
        />
      </FormField>

      <!-- Erro de submissão -->
      <div v-if="errors.submit" class="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
        {{ errors.submit }}
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
        {{ isEditMode ? 'Atualizar' : 'Criar' }} Contato
      </Button>
    </template>
  </Modal>
</template>

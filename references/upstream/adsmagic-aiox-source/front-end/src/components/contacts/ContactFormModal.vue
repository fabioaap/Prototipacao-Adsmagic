<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import type { ZodError } from 'zod'

interface Props {
  /**
   * Se true, exibe o modal
   */
  open: boolean
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

const contactsStore = useContactsStore()
const stagesStore = useStagesStore()
const originsStore = useOriginsStore()

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
const isSubmitting = ref(false)

// Reset form
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

// Computed
const isEditMode = computed(() => !!props.contact)

const title = computed(() => {
  return isEditMode.value ? 'Editar Contato' : 'Novo Contato'
})

// Options para selects
const stageOptions = computed(() => {
  return stagesStore.stages.map(stage => ({
    value: stage.id,
    label: stage.name,
  }))
})

const originOptions = computed(() => {
  return originsStore.origins.map(origin => ({
    value: origin.id,
    label: origin.name,
  }))
})

const countryCodeOptions = [
  { value: '55', label: '+55 (Brasil)' },
  { value: '1', label: '+1 (EUA/Canadá)' },
  { value: '44', label: '+44 (Reino Unido)' },
  { value: '351', label: '+351 (Portugal)' },
  { value: '34', label: '+34 (Espanha)' },
]

// Initialize stores function
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

// Watch para preencher form quando contact mudar
watch(() => props.contact, (contact) => {
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
  errors.value = {}
}, { immediate: true })

// Initialize stores on component mount
initializeStores()

// Validate form
const validateForm = () => {
  errors.value = {}

  const schema = isEditMode.value ? updateContactSchema : createContactSchema

  try {
    schema.parse(formData.value)
    return true
  } catch (error) {
    const zodError = error as ZodError
    zodError.issues.forEach((err: any) => {
      const field = err.path[0] as string
      errors.value[field] = err.message
    })
    return false
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    let contact: Contact

    if (isEditMode.value && props.contact) {
      // Update existing contact
      contact = await contactsStore.updateContact(props.contact.id, {
        ...props.contact,
        name: formData.value.name,
        email: formData.value.email || undefined,
        phone: formData.value.phone || undefined,
        countryCode: formData.value.countryCode || undefined,
        company: formData.value.company || undefined,
        location: formData.value.location || undefined,
        origin: formData.value.origin,
        stage: formData.value.stage,
        notes: formData.value.notes || undefined,
      })
    } else {
      // Create new contact
      contact = await contactsStore.createContact({
        name: formData.value.name,
        email: formData.value.email || '',
        phone: formData.value.phone || '',
        countryCode: formData.value.countryCode || '',
        company: formData.value.company || undefined,
        location: formData.value.location || undefined,
        origin: formData.value.origin,
        stage: formData.value.stage,
        notes: formData.value.notes || undefined,
      })
    }

    emit('success', contact)
    handleClose()
  } catch (error) {
    console.error('Erro ao salvar contato:', error)
    errors.value.submit = 'Erro ao salvar contato. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}

// Handle close
const handleClose = () => {
  if (!isSubmitting.value) {
    emit('update:open', false)
    resetForm()
  }
}
</script>

<template>
  <Modal
    :model-value="props.open"
    :title="title"
    size="lg"
    :persistent="isSubmitting"
    @update:model-value="(value: boolean) => !isSubmitting && emit('update:open', value)"
  >
    <div class="max-h-[60vh] overflow-y-auto">
      <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Nome -->
      <FormField
        label="Nome *"
        :error="errors.name"
        required
      >
        <Input
          v-model="formData.name"
          placeholder="Ex: João Silva"
          :disabled="isSubmitting"
          :error="!!errors.name"
        />
      </FormField>

      <!-- Email -->
      <FormField
        label="Email"
        :error="errors.email"
      >
        <Input
          v-model="formData.email"
          type="email"
          placeholder="Ex: joao@example.com"
          :disabled="isSubmitting"
          :error="!!errors.email"
        />
      </FormField>

      <!-- Telefone -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          label="Código País *"
          :error="errors.countryCode"
          required
        >
          <Select
            v-model="formData.countryCode"
            :options="countryCodeOptions"
            :disabled="isSubmitting"
          />
        </FormField>

        <div class="col-span-2">
          <FormField
            label="Telefone *"
            :error="errors.phone"
            required
          >
            <Input
              v-model="formData.phone"
              placeholder="11987654321"
              :disabled="isSubmitting"
              :error="!!errors.phone"
            />
          </FormField>
        </div>
      </div>

      <!-- Empresa -->
      <FormField
        label="Empresa"
        :error="errors.company"
      >
        <Input
          v-model="formData.company"
          placeholder="Ex: Acme Corp"
          :disabled="isSubmitting"
          :error="!!errors.company"
        />
      </FormField>

      <!-- Localização -->
      <FormField
        label="Localização"
        :error="errors.location"
      >
        <Input
          v-model="formData.location"
          placeholder="Ex: São Paulo, SP"
          :disabled="isSubmitting"
          :error="!!errors.location"
        />
      </FormField>

      <!-- Origem e Etapa -->
      <div class="grid grid-cols-2 gap-4">
        <FormField
          label="Origem *"
          :error="errors.origin"
          required
        >
          <Select
            v-model="formData.origin"
            :options="originOptions"
            placeholder="Selecione a origem"
            :disabled="isSubmitting"
          />
        </FormField>

        <FormField
          label="Etapa *"
          :error="errors.stage"
          required
        >
          <Select
            v-model="formData.stage"
            :options="stageOptions"
            placeholder="Selecione a etapa"
            :disabled="isSubmitting"
          />
        </FormField>
      </div>

      <!-- Notas -->
      <FormField
        label="Notas"
        :error="errors.notes"
        helper-text="Máximo 1000 caracteres"
      >
        <Textarea
          v-model="formData.notes"
          placeholder="Observações sobre o contato..."
          :rows="4"
          :disabled="isSubmitting"
          :error="!!errors.notes"
        />
      </FormField>

        <!-- Submit Error -->
        <div v-if="errors.submit" class="text-sm text-destructive">
          {{ errors.submit }}
        </div>
      </form>
    </div>

    <!-- Actions usando slot footer -->
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          Cancelar
        </Button>
        <Button
          :disabled="isSubmitting"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          <Save class="h-4 w-4 mr-2" />
          {{ isEditMode ? 'Atualizar' : 'Criar' }} Contato
        </Button>
      </div>
    </template>
  </Modal>
</template>

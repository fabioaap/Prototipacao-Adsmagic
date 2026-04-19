# Padrões de Desenvolvimento

Este documento descreve os padrões de desenvolvimento específicos utilizados no projeto Adsmagic First AI, incluindo arquitetura, design patterns e boas práticas implementadas.

## 🏗️ Arquitetura de Componentes

### Estrutura de Componentes Vue

#### Componentes Base (UI)

##### Button Component
```vue
<!-- components/ui/Button.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <Icon v-if="loading" name="spinner" class="animate-spin" />
    <Icon v-else-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  {
    'btn--disabled': props.disabled,
    'btn--loading': props.loading
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
```

##### Select Components
```vue
<!-- components/ui/SelectTrigger.vue -->
<template>
  <button
    :id="id"
    type="button"
    :disabled="disabled"
    :class="cn(
      'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      sizeClasses,
      props.class
    )"
  >
    <slot />
    <ChevronDown class="h-4 w-4 opacity-50" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  id?: string
  disabled?: boolean
  size?: 'default' | 'sm' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'default',
})

const sizeClasses = computed(() => {
  const sizes = {
    default: 'h-10 px-3 py-2 text-sm',
    sm: 'h-8 px-2 py-1 text-xs',
    lg: 'h-12 px-4 py-3 text-base',
  }
  return sizes[props.size]
})
</script>
```

##### RadioGroup Components
```vue
<!-- components/ui/RadioGroupItem.vue -->
<template>
  <div class="flex items-center space-x-2">
    <input
      :id="id"
      type="radio"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      :class="cn(
        'h-4 w-4 border border-primary text-primary ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )"
      @change="handleChange"
    />
    <label
      v-if="$slots.default"
      :for="id"
      :class="cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        disabled && 'cursor-not-allowed opacity-70'
      )"
    >
      <slot />
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  value: string | number | boolean
  id?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// Inject radio group context
const radioGroup = inject('radioGroup', null)

const isChecked = computed(() => {
  return radioGroup?.modelValue.value === props.value
})

const handleChange = () => {
  if (!props.disabled && radioGroup) {
    radioGroup.updateValue(props.value)
  }
}
</script>
```

#### Componentes de Notificações
```vue
<!-- components/ui/Toast.vue -->
<template>
  <div :class="toastClass">
    <!-- Icon -->
    <div class="flex items-center gap-3">
      <div :class="cn('flex h-5 w-5 items-center justify-center', iconClasses)">
        <component :is="getIcon" class="h-4 w-4" />
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold">
          {{ toast.title }}
        </div>
        <div v-if="toast.description" class="text-sm opacity-90 mt-1">
          {{ toast.description }}
        </div>
      </div>
    </div>

    <!-- Close Button -->
    <Button
      variant="ghost"
      size="sm"
      class="absolute right-2 top-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="handleRemove"
    >
      <X class="h-4 w-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, Check, AlertTriangle, Info } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from './Button.vue'
import type { Toast } from '@/stores/toast'

interface Props {
  toast: Toast
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [id: string]
}>()

// Computed para variantes visuais
const variantClasses = computed(() => {
  const variants = {
    default: 'bg-background border-border text-foreground',
    success: 'bg-success/10 border-success/20 text-success',
    destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
    warning: 'bg-warning/10 border-warning/20 text-warning'
  }
  return variants[props.toast.variant]
})

const getIcon = computed(() => {
  const icons = {
    default: Info,
    success: Check,
    destructive: X,
    warning: AlertTriangle
  }
  return icons[props.toast.variant]
})

const handleRemove = () => {
  emit('remove', props.toast.id)
}

const toastClass = cn(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  variantClasses.value
)
</script>
```

#### Componentes de Integrações
```vue
<!-- components/integrations/IntegrationCard.vue -->
<template>
  <div class="integration-card">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div :class="iconClasses">
          <component :is="getIcon" class="h-6 w-6" />
        </div>
        <div>
          <h3 class="font-semibold">{{ integration.name }}</h3>
          <p class="text-sm text-gray-600">{{ integration.description }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <IntegrationStatusBadge :status="integration.status" />
        <Button
          v-if="integration.status === 'disconnected'"
          @click="handleConnect"
          :loading="isConnecting"
        >
          Conectar
        </Button>
        <Button
          v-else-if="integration.status === 'connected'"
          variant="outline"
          @click="handleDisconnect"
        >
          Desconectar
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIntegrationsStore } from '@/stores/integrations'
import { Facebook, Instagram, MessageCircle, Search } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import IntegrationStatusBadge from './IntegrationStatusBadge.vue'
import type { Integration } from '@/types/models'

interface Props {
  integration: Integration
}

const props = defineProps<Props>()
const integrationsStore = useIntegrationsStore()

const isConnecting = computed(() => 
  integrationsStore.isLoading && integrationsStore.whatsappConnecting
)

const getIcon = computed(() => {
  const icons = {
    whatsapp: MessageCircle,
    meta: Facebook,
    google: Search,
    tiktok: Instagram
  }
  return icons[props.integration.platform as keyof typeof icons] || Search
})

const iconClasses = computed(() => [
  'flex h-10 w-10 items-center justify-center rounded-lg',
  {
    'bg-green-100 text-green-600': props.integration.platform === 'whatsapp',
    'bg-blue-100 text-blue-600': props.integration.platform === 'meta',
    'bg-red-100 text-red-600': props.integration.platform === 'google',
    'bg-pink-100 text-pink-600': props.integration.platform === 'tiktok'
  }
])

const handleConnect = async () => {
  try {
    if (props.integration.platform === 'whatsapp') {
      await integrationsStore.generateWhatsAppQR()
    } else {
      const authUrl = await integrationsStore.initiateOAuth(props.integration.platform)
      window.open(authUrl, '_blank')
    }
  } catch (error) {
    console.error('Erro ao conectar:', error)
  }
}

const handleDisconnect = async () => {
  try {
    await integrationsStore.disconnectPlatform(props.integration.platform)
  } catch (error) {
    console.error('Erro ao desconectar:', error)
  }
}
</script>
```

#### Componentes de Configurações
```vue
<!-- components/settings/SettingsGeneralTab.vue -->
<template>
  <div class="space-y-6">
    <!-- Project Information -->
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold mb-2">Informações do Projeto</h3>
        <p class="text-sm text-muted-foreground">
          Configure as informações básicas do seu projeto
        </p>
      </div>

      <div class="grid gap-4">
        <!-- Project Name -->
        <div class="space-y-2">
          <Label for="projectName">Nome do Projeto</Label>
          <Input
            id="projectName"
            v-model="formData.projectName"
            placeholder="Digite o nome do projeto"
            :disabled="loading"
          />
        </div>

        <!-- Project Description -->
        <div class="space-y-2">
          <Label for="projectDescription">Descrição (Opcional)</Label>
          <Textarea
            id="projectDescription"
            v-model="formData.projectDescription"
            placeholder="Descreva brevemente o projeto"
            :disabled="loading"
            :rows="3"
          />
        </div>
      </div>
    </div>

    <!-- Attribution Model -->
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold mb-2">Modelo de Atribuição</h3>
        <p class="text-sm text-muted-foreground">
          Escolha como as conversões serão atribuídas às origens
        </p>
      </div>

      <ModelAttributionSelector
        v-model="formData.attributionModel"
        :disabled="loading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Copy, Archive, Trash2, Save } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Label from '@/components/ui/Label.vue'
import ModelAttributionSelector from '@/components/settings/ModelAttributionSelector.vue'
import type { GeneralSettings } from '@/types/models'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/components/ui/toast/use-toast'

interface Props {
  projectId: string
  loading?: boolean
  settings?: GeneralSettings
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  save: [data: GeneralSettings]
  archive: []
  delete: []
}>()

const formData = ref<GeneralSettings>({
  projectId: props.projectId,
  projectName: props.settings?.projectName || '',
  projectDescription: props.settings?.projectDescription || '',
  attributionModel: props.settings?.attributionModel || 'first_touch',
  createdAt: props.settings?.createdAt || new Date().toISOString()
})

const { formatDate } = useFormat()
const { toast } = useToast()

const hasChanges = computed(() => {
  if (!props.settings) return true
  
  return (
    formData.value.projectName !== props.settings.projectName ||
    formData.value.projectDescription !== props.settings.projectDescription ||
    formData.value.attributionModel !== props.settings.attributionModel
  )
})

const handleSave = () => {
  emit('save', { ...formData.value })
}

const handleArchiveProject = () => {
  emit('archive')
}

const handleDeleteProject = () => {
  emit('delete')
}
</script>
```

#### Componentes de Contatos
```vue
<!-- components/contacts/ContactsKanban.vue -->
<template>
  <div class="contacts-kanban">
    <div class="kanban-header">
      <h2 class="text-xl font-semibold">Contatos</h2>
      <div class="flex gap-2">
        <Button @click="handleAddContact" variant="primary">
          <Plus class="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
        <Button @click="toggleView" variant="outline">
          <Grid3X3 v-if="view === 'list'" class="h-4 w-4" />
          <List v-else class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div v-if="view === 'kanban'" class="kanban-board">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="kanban-column"
        @drop="handleDrop($event, stage.id)"
        @dragover.prevent
        @dragenter.prevent
      >
        <div class="column-header">
          <h3 class="font-medium">{{ stage.name }}</h3>
          <span class="badge">{{ getContactsByStage(stage.id).length }}</span>
        </div>
        
        <div class="column-content">
          <div
            v-for="contact in getContactsByStage(stage.id)"
            :key="contact.id"
            class="contact-card"
            draggable="true"
            @dragstart="handleDragStart($event, contact)"
            @click="handleEditContact(contact)"
          >
            <div class="contact-header">
              <h4 class="font-medium">{{ contact.name }}</h4>
              <span class="text-xs text-gray-500">{{ contact.origin }}</span>
            </div>
            <div class="contact-body">
              <p class="text-sm text-gray-600">{{ contact.email }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(contact.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="contacts-list">
      <ContactsList
        :contacts="contacts"
        :loading="loading"
        @edit="handleEditContact"
        @delete="handleDeleteContact"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Grid3X3, List } from 'lucide-vue-next'
import { useContactsStore } from '@/stores/contacts'
import { useStagesStore } from '@/stores/stages'
import Button from '@/components/ui/Button.vue'
import ContactsList from './ContactsList.vue'
import ContactFormModal from './ContactFormModal.vue'
import type { Contact, Stage } from '@/types/models'

const contactsStore = useContactsStore()
const stagesStore = useStagesStore()

const view = ref<'kanban' | 'list'>('kanban')
const selectedContact = ref<Contact | null>(null)
const showModal = ref(false)

const contacts = computed(() => contactsStore.contacts)
const stages = computed(() => stagesStore.stages)
const loading = computed(() => contactsStore.isLoading)

const getContactsByStage = (stageId: string) => {
  return contacts.value.filter(contact => contact.stageId === stageId)
}

const handleAddContact = () => {
  selectedContact.value = null
  showModal.value = true
}

const handleEditContact = (contact: Contact) => {
  selectedContact.value = contact
  showModal.value = true
}

const handleDeleteContact = async (contact: Contact) => {
  if (confirm('Tem certeza que deseja excluir este contato?')) {
    await contactsStore.deleteContact(contact.id)
  }
}

const toggleView = () => {
  view.value = view.value === 'kanban' ? 'list' : 'kanban'
}

const handleDragStart = (event: DragEvent, contact: Contact) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', contact.id)
  }
}

const handleDrop = async (event: DragEvent, stageId: string) => {
  event.preventDefault()
  const contactId = event.dataTransfer?.getData('text/plain')
  
  if (contactId) {
    const contact = contacts.value.find(c => c.id === contactId)
    if (contact && contact.stageId !== stageId) {
      await contactsStore.updateContact(contactId, { stageId })
    }
  }
}

onMounted(async () => {
  await Promise.all([
    contactsStore.fetchContacts(),
    stagesStore.fetchStages()
  ])
})
</script>
```

#### Componentes de Modal de Contatos
```vue
<!-- components/contacts/ContactFormModal.vue -->
<template>
  <Modal
    :open="open"
    :title="isEditing ? 'Editar Contato' : 'Novo Contato'"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Nome -->
      <div class="space-y-2">
        <Label for="name">Nome *</Label>
        <Input
          id="name"
          v-model="formData.name"
          placeholder="Digite o nome do contato"
          :disabled="loading"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
      </div>

      <!-- Email -->
      <div class="space-y-2">
        <Label for="email">Email *</Label>
        <Input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="contato@exemplo.com"
          :disabled="loading"
          :class="{ 'border-red-500': errors.email }"
        />
        <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
      </div>

      <!-- Telefone -->
      <div class="space-y-2">
        <Label for="phone">Telefone</Label>
        <Input
          id="phone"
          v-model="formData.phone"
          placeholder="+55 11 99999-9999"
          :disabled="loading"
          :class="{ 'border-red-500': errors.phone }"
        />
        <p v-if="errors.phone" class="text-sm text-red-500">{{ errors.phone }}</p>
      </div>

      <!-- Origem -->
      <div class="space-y-2">
        <Label for="originId">Origem *</Label>
        <Select v-model="formData.originId" :disabled="loading">
          <SelectTrigger>
            <SelectValue placeholder="Selecione a origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="origin in origins"
              :key="origin.id"
              :value="origin.id"
            >
              {{ origin.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.originId" class="text-sm text-red-500">{{ errors.originId }}</p>
      </div>

      <!-- Estágio -->
      <div class="space-y-2">
        <Label for="stageId">Estágio *</Label>
        <Select v-model="formData.stageId" :disabled="loading">
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estágio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="stage in stages"
              :key="stage.id"
              :value="stage.id"
            >
              {{ stage.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.stageId" class="text-sm text-red-500">{{ errors.stageId }}</p>
      </div>

      <!-- Observações -->
      <div class="space-y-2">
        <Label for="notes">Observações</Label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          placeholder="Observações sobre o contato..."
          :disabled="loading"
          :rows="3"
        />
      </div>

      <!-- Botões -->
      <div class="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          @click="handleClose"
          :disabled="loading"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          :loading="loading"
          :disabled="!isFormValid"
        >
          {{ isEditing ? 'Salvar' : 'Criar' }}
        </Button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useContactsStore } from '@/stores/contacts'
import { useOriginsStore } from '@/stores/origins'
import { useStagesStore } from '@/stores/stages'
import { useToast } from '@/composables/useToast'
import { contactSchema } from '@/schemas/contact'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import SelectTrigger from '@/components/ui/SelectTrigger.vue'
import SelectValue from '@/components/ui/SelectValue.vue'
import type { Contact, CreateContactDTO } from '@/types/models'

interface Props {
  open: boolean
  contact?: Contact | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [contact: Contact]
}>()

const contactsStore = useContactsStore()
const originsStore = useOriginsStore()
const stagesStore = useStagesStore()
const { success, error } = useToast()

const formData = ref<CreateContactDTO>({
  name: '',
  email: '',
  phone: '',
  originId: '',
  stageId: '',
  notes: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)

const isEditing = computed(() => !!props.contact)
const origins = computed(() => originsStore.origins)
const stages = computed(() => stagesStore.stages)

const isFormValid = computed(() => {
  try {
    contactSchema.parse(formData.value)
    return true
  } catch {
    return false
  }
})

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    originId: '',
    stageId: '',
    notes: ''
  }
  errors.value = {}
}

const validateForm = () => {
  try {
    contactSchema.parse(formData.value)
    errors.value = {}
    return true
  } catch (err) {
    if (err instanceof Error) {
      errors.value = { general: err.message }
    }
    return false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  
  try {
    let contact: Contact
    
    if (isEditing.value && props.contact) {
      contact = await contactsStore.updateContact(props.contact.id, formData.value)
    } else {
      contact = await contactsStore.createContact(formData.value)
    }
    
    success(
      isEditing.value ? 'Contato atualizado com sucesso!' : 'Contato criado com sucesso!'
    )
    
    emit('success', contact)
    handleClose()
  } catch (err) {
    error(
      isEditing.value ? 'Erro ao atualizar contato' : 'Erro ao criar contato',
      err instanceof Error ? err.message : 'Erro desconhecido'
    )
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
}

// Watch para preencher formulário quando editando
watch(() => props.contact, (contact) => {
  if (contact) {
    formData.value = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      originId: contact.originId,
      stageId: contact.stageId,
      notes: contact.notes || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

onMounted(async () => {
  await Promise.all([
    originsStore.fetchOrigins(),
    stagesStore.fetchStages()
})
</script>
```

#### Componentes de Features
```vue
<!-- components/features/onboarding/CompanyTypeSelector.vue -->
<template>
  <div class="company-type-selector">
    <h3>{{ $t('onboarding.companyType.title') }}</h3>
    <div class="options-grid">
      <CheckboxCard
        v-for="type in companyTypes"
        :key="type.value"
        :value="type.value"
        :label="type.label"
        :description="type.description"
        :icon="type.icon"
        :checked="selectedType === type.value"
        @change="handleTypeChange"
      />
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOnboardingStore } from '@/stores/onboarding'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const onboardingStore = useOnboardingStore()

const selectedType = computed(() => onboardingStore.companyType)
const error = computed(() => onboardingStore.errors.companyType)

const companyTypes = computed(() => [
  {
    value: 'franchise',
    label: t('onboarding.companyType.franchise'),
    description: t('onboarding.companyType.franchiseDescription'),
    icon: 'building'
  },
  {
    value: 'corporate',
    label: t('onboarding.companyType.corporate'),
    description: t('onboarding.companyType.corporateDescription'),
    icon: 'office'
  },
  {
    value: 'individual',
    label: t('onboarding.companyType.individual'),
    description: t('onboarding.companyType.individualDescription'),
    icon: 'user'
  }
])

const handleTypeChange = (value: string) => {
  onboardingStore.setCompanyType(value)
}
</script>
```

## 🎯 Padrões de Estado (Pinia)

### Store de Contatos
```typescript
// stores/contacts.ts
export const useContactsStore = defineStore('contacts', () => {
  // Estado
  const contacts = ref<Contact[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ContactFilters>({
    search: '',
    stageId: '',
    originId: '',
    dateRange: null
  })

  // Getters
  const filteredContacts = computed(() => {
    let result = contacts.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(contact => 
        contact.name.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.phone?.toLowerCase().includes(search)
      )
    }

    if (filters.value.stageId) {
      result = result.filter(contact => contact.stageId === filters.value.stageId)
    }

    if (filters.value.originId) {
      result = result.filter(contact => contact.originId === filters.value.originId)
    }

    return result
  })

  const contactsByStage = computed(() => {
    const grouped: Record<string, Contact[]> = {}
    filteredContacts.value.forEach(contact => {
      if (!grouped[contact.stageId]) {
        grouped[contact.stageId] = []
      }
      grouped[contact.stageId].push(contact)
    })
    return grouped
  })

  // Actions
  const fetchContacts = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await contactsService.getAll()
      contacts.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar contatos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createContact = async (contactData: CreateContactDTO): Promise<Contact> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await contactsService.create(contactData)
      contacts.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar contato'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await contactsService.update(id, updates)
      const index = contacts.value.findIndex(c => c.id === id)
      if (index !== -1) {
        contacts.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar contato'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteContact = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      await contactsService.delete(id)
      contacts.value = contacts.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao excluir contato'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = (newFilters: Partial<ContactFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      stageId: '',
      originId: '',
      dateRange: null
    }
  }

  return {
    // Estado
    contacts: readonly(contacts),
    isLoading: readonly(isLoading),
    error: readonly(error),
    filters: readonly(filters),
    
    // Getters
    filteredContacts,
    contactsByStage,
    
    // Actions
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    setFilters,
    clearFilters
  }
})
```

### Store de Integrações
```typescript
// stores/integrations.ts
export const useIntegrationsStore = defineStore('integrations', () => {
  // Estado
  const integrations = ref<Integration[]>([])
  const tagInstallation = ref<TagInstallation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const whatsappQR = ref<string | null>(null)

  // Getters
  const connectedIntegrations = computed(() => 
    integrations.value.filter(integration => integration.status === 'connected')
  )

  const errorIntegrations = computed(() => 
    integrations.value.filter(integration => integration.status === 'error')
  )

  // Actions
  const fetchIntegrations = async (): Promise<void> => {
    // Implementação da busca de integrações
  }

  const connectPlatform = async (platform: string, data: any): Promise<void> => {
    // Implementação da conexão com plataforma
  }

  const generateWhatsAppQR = async (): Promise<string> => {
    // Implementação da geração de QR Code
  }

  return {
    // Estado
    integrations: readonly(integrations),
    tagInstallation: readonly(tagInstallation),
    isLoading: readonly(isLoading),
    error: readonly(error),
    whatsappQR: readonly(whatsappQR),
    
    // Getters
    connectedIntegrations,
    errorIntegrations,
    
    // Actions
    fetchIntegrations,
    connectPlatform,
    generateWhatsAppQR
  }
})
```

### Store de Onboarding
```typescript
// stores/onboarding.ts
export const useOnboardingStore = defineStore('onboarding', () => {
  // Estado
  const currentStep = ref(1)
  const companyType = ref<string>('')
  const franchiseCount = ref<number>(0)
  const franchiseName = ref<string>('')
  const errors = ref<Record<string, string>>({})
  const isLoading = ref(false)

  // Getters
  const isStepValid = computed(() => {
    switch (currentStep.value) {
      case 1:
        return !!companyType.value
      case 2:
        return franchiseCount.value > 0
      case 3:
        return franchiseName.value.trim().length >= 2
      default:
        return false
    }
  })

  const canProceed = computed(() => isStepValid.value && !isLoading.value)

  // Actions
  const setCompanyType = (type: string) => {
    companyType.value = type
    delete errors.value.companyType
  }

  const setFranchiseCount = (count: number) => {
    franchiseCount.value = count
    delete errors.value.franchiseCount
  }

  const setFranchiseName = (name: string) => {
    franchiseName.value = name
    delete errors.value.franchiseName
  }

  const nextStep = () => {
    if (canProceed.value && currentStep.value < 3) {
      currentStep.value++
    }
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const validateCurrentStep = () => {
    const stepErrors: Record<string, string> = {}

    switch (currentStep.value) {
      case 1:
        if (!companyType.value) {
          stepErrors.companyType = 'Tipo de empresa é obrigatório'
        }
        break
      case 2:
        if (franchiseCount.value <= 0) {
          stepErrors.franchiseCount = 'Número de franquias deve ser maior que zero'
        }
        break
      case 3:
        if (franchiseName.value.trim().length < 2) {
          stepErrors.franchiseName = 'Nome deve ter pelo menos 2 caracteres'
        }
        break
    }

    errors.value = stepErrors
    return Object.keys(stepErrors).length === 0
  }

  const completeOnboarding = async () => {
    isLoading.value = true
    try {
      const result = await onboardingService.complete({
        companyType: companyType.value,
        franchiseCount: franchiseCount.value,
        franchiseName: franchiseName.value
      })
      
      // Limpar estado
      reset()
      return result
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    currentStep.value = 1
    companyType.value = ''
    franchiseCount.value = 0
    franchiseName.value = ''
    errors.value = {}
    isLoading.value = false
  }

  return {
    // Estado
    currentStep: readonly(currentStep),
    companyType: readonly(companyType),
    franchiseCount: readonly(franchiseCount),
    franchiseName: readonly(franchiseName),
    errors: readonly(errors),
    isLoading: readonly(isLoading),
    
    // Getters
    isStepValid,
    canProceed,
    
    // Actions
    setCompanyType,
    setFranchiseCount,
    setFranchiseName,
    nextStep,
    previousStep,
    validateCurrentStep,
    completeOnboarding,
    reset
  }
})
```

## 🔧 Padrões de Composables

### Composable de Toast Notifications
```typescript
// components/ui/toast/use-toast.ts
export function useToast() {
  const toastStore = useToastStore()

  /**
   * Exibe um toast com as opções especificadas
   */
  const toast = (options: ToastOptions): string => {
    return toastStore.addToast({
      title: options.title,
      description: options.description,
      variant: options.variant ?? 'default',
      duration: options.duration
    })
  }

  /**
   * Helpers específicos para cada variante
   */
  const success = (title: string, description?: string): string => {
    return toast({ title, description, variant: 'success' })
  }

  const error = (title: string, description?: string): string => {
    return toast({ title, description, variant: 'destructive' })
  }

  const warning = (title: string, description?: string): string => {
    return toast({ title, description, variant: 'warning' })
  }

  const info = (title: string, description?: string): string => {
    return toast({ title, description, variant: 'default' })
  }

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss: toastStore.removeToast,
    dismissAll: toastStore.clearAll
  }
}
```

### Store de Toast Notifications
```typescript
// stores/toast.ts
export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id' | 'createdAt'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const duration = toast.duration ?? 3000

    const newToast: Toast = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant,
      duration,
      createdAt: Date.now()
    }

    toasts.value.push(newToast)

    // Auto-remove após duração especificada
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAll = (): void => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAll
  }
})
```

### Composable de Validação
```typescript
// composables/useValidation.ts
export function useValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: T
) {
  const data = ref<T>({ ...initialData })
  const errors = ref<Record<keyof T, string>>({} as Record<keyof T, string>)
  const touched = ref<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const isDirty = computed(() => Object.values(touched.value).some(Boolean))

  const validate = (field?: keyof T) => {
    try {
      if (field) {
        // Validação de campo específico
        const fieldSchema = schema.pick({ [field]: true })
        fieldSchema.parse({ [field]: data.value[field] })
        delete errors.value[field]
      } else {
        // Validação completa
        schema.parse(data.value)
        errors.value = {}
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors
        Object.keys(fieldErrors).forEach(key => {
          errors.value[key as keyof T] = fieldErrors[key]?.[0] || 'Campo inválido'
        })
      }
      return false
    }
  }

  const validateField = (field: keyof T) => {
    touched.value[field] = true
    return validate(field)
  }

  const setFieldValue = (field: keyof T, value: any) => {
    data.value[field] = value
    touched.value[field] = true
    validateField(field)
  }

  const reset = () => {
    data.value = { ...initialData }
    errors.value = {} as Record<keyof T, string>
    touched.value = {} as Record<keyof T, boolean>
  }

  const getFieldError = (field: keyof T) => {
    return touched.value[field] ? errors.value[field] : undefined
  }

  return {
    data: readonly(data),
    errors: readonly(errors),
    touched: readonly(touched),
    isValid,
    isDirty,
    validate,
    validateField,
    setFieldValue,
    reset,
    getFieldError
  }
}
```

### Composable de API
```typescript
// composables/useApi.ts
export function useApi<T>() {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (apiCall: () => Promise<T>) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiCall()
      data.value = result
      return { success: true, data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    execute,
    reset
  }
}
```

## 🎨 Padrões de Estilização

### Sistema de Design Tokens
```css
/* assets/styles/tokens.css */
:root {
  /* Cores */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  --color-gray-50: #f9fafb;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  
  /* Espaçamentos */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  
  /* Tipografia */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Bordas */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Dark mode */
[data-theme="dark"] {
  --color-primary-50: #1e3a8a;
  --color-primary-500: #60a5fa;
  --color-primary-900: #dbeafe;
  
  --color-gray-50: #111827;
  --color-gray-500: #9ca3af;
  --color-gray-900: #f9fafb;
}
```

### Componentes com Variantes
```vue
<style scoped>
.btn {
  @apply inline-flex items-center justify-center rounded-md font-medium transition-colors;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
  @apply disabled:pointer-events-none disabled:opacity-50;
}

.btn--primary {
  @apply bg-primary-500 text-white hover:bg-primary-600;
  @apply focus-visible:ring-primary-500;
}

.btn--secondary {
  @apply bg-gray-100 text-gray-900 hover:bg-gray-200;
  @apply focus-visible:ring-gray-500;
}

.btn--danger {
  @apply bg-red-500 text-white hover:bg-red-600;
  @apply focus-visible:ring-red-500;
}

.btn--sm {
  @apply h-8 px-3 text-sm;
}

.btn--md {
  @apply h-10 px-4 text-base;
}

.btn--lg {
  @apply h-12 px-6 text-lg;
}

.btn--loading {
  @apply cursor-wait;
}
</style>
```

## 🧪 Padrões de Testes

### Testes de Componentes
```typescript
// tests/components/Button.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Button from '@/components/ui/Button.vue'

describe('Button', () => {
  it('renders with default props', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn--primary')
    expect(wrapper.classes()).toContain('btn--md')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Click me' }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('shows loading state', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Loading...' }
    })
    
    expect(wrapper.find('[data-testid="spinner"]').exists()).toBe(true)
    expect(wrapper.classes()).toContain('btn--loading')
  })
})
```

### Testes de Stores
```typescript
// tests/stores/onboarding.test.ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboardingStore } from '@/stores/onboarding'

describe('Onboarding Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = useOnboardingStore()
    
    expect(store.currentStep).toBe(1)
    expect(store.companyType).toBe('')
    expect(store.franchiseCount).toBe(0)
    expect(store.franchiseName).toBe('')
  })

  it('validates company type step', () => {
    const store = useOnboardingStore()
    
    expect(store.isStepValid).toBe(false)
    
    store.setCompanyType('franchise')
    expect(store.isStepValid).toBe(true)
  })

  it('navigates between steps correctly', () => {
    const store = useOnboardingStore()
    
    store.setCompanyType('franchise')
    store.nextStep()
    expect(store.currentStep).toBe(2)
    
    store.previousStep()
    expect(store.currentStep).toBe(1)
  })
})
```

## 📋 Checklist de Implementação

### Antes de Criar um Componente
- [ ] Definiu a responsabilidade única do componente?
- [ ] Identificou as props e eventos necessários?
- [ ] Considerou acessibilidade (ARIA, keyboard navigation)?
- [ ] Planejou os estados visuais (loading, error, success)?
- [ ] Definiu as variantes e tamanhos necessários?

### Antes de Criar um Store
- [ ] Identificou o estado que precisa ser compartilhado?
- [ ] Definiu as actions e getters necessários?
- [ ] Considerou a persistência de dados?
- [ ] Planejou o tratamento de erros?
- [ ] Definiu a validação de dados?

### Antes de Criar um Composable
- [ ] Identificou a lógica reutilizável?
- [ ] Definiu a interface pública (retorno)?
- [ ] Considerou a reatividade necessária?
- [ ] Planejou o cleanup de recursos?
- [ ] Definiu os parâmetros de configuração?

### Antes de Implementar Validação
- [ ] Escolheu a biblioteca de validação (Zod)?
- [ ] Definiu os schemas de validação?
- [ ] Planejou a validação em tempo real?
- [ ] Considerou as mensagens de erro traduzidas?
- [ ] Definiu o feedback visual para erros?

### Antes de Implementar Notificações
- [ ] Identificou o tipo de feedback necessário (sucesso, erro, aviso)?
- [ ] Definiu a duração da notificação (auto-remoção)?
- [ ] Considerou o posicionamento (canto superior direito)?
- [ ] Planejou as variantes visuais (success, error, warning, info)?
- [ ] Definiu a acessibilidade (foco, navegação por teclado)?
- [ ] Considerou o empilhamento de múltiplas notificações?

## 🔄 Padrões de Refatoração

### Extração de Lógica
```typescript
// ❌ ANTES - Lógica misturada no componente
export default defineComponent({
  setup() {
    const users = ref([])
    const loading = ref(false)
    const error = ref(null)
    
    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await api.get('/users')
        users.value = response.data
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }
    
    return { users, loading, error, loadUsers }
  }
})

// ✅ DEPOIS - Lógica extraída para composable
export default defineComponent({
  setup() {
    const { data: users, loading, error, execute } = useApi<User[]>()
    
    const loadUsers = () => execute(() => api.get('/users').then(r => r.data))
    
    return { users, loading, error, loadUsers }
  }
})
```

### Simplificação de Estado
```typescript
// ❌ ANTES - Estado complexo
const formState = ref({
  name: '',
  email: '',
  phone: '',
  nameError: '',
  emailError: '',
  phoneError: '',
  nameTouched: false,
  emailTouched: false,
  phoneTouched: false
})

// ✅ DEPOIS - Estado simplificado com composable
const { data: form, errors, touched, setFieldValue } = useValidation(
  userSchema,
  { name: '', email: '', phone: '' }
)
```

### Padrão de Feedback com Toast
```typescript
// ❌ ANTES - Feedback inconsistente
const handleSave = async () => {
  try {
    await saveUser(userData)
    alert('Usuário salvo com sucesso!') // Inconsistente
  } catch (error) {
    console.error('Erro:', error) // Sem feedback visual
  }
}

// ✅ DEPOIS - Feedback consistente com toast
const { success, error } = useToast()

const handleSave = async () => {
  try {
    await saveUser(userData)
    success('Usuário salvo com sucesso!')
  } catch (err) {
    error('Erro ao salvar usuário', err.message)
  }
}
```

## 📚 Recursos e Referências

### Documentação Oficial
- [Vue 3 Composition API](https://vuejs.org/guide/composition-api/)
- [Pinia Store](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Vue i18n](https://vue-i18n.intlify.dev/)

### Bibliotecas Utilizadas
- [Zod](https://zod.dev/) - Validação de schemas
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Vite](https://vitejs.dev/) - Build tool
- [Vitest](https://vitest.dev/) - Framework de testes

### Ferramentas de Desenvolvimento
- [Vue DevTools](https://devtools.vuejs.org/) - Debugging
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [ESLint](https://eslint.org/) - Linting
- [Prettier](https://prettier.io/) - Formatação de código

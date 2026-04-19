<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Copy, MessageSquare } from '@/composables/useIcons'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Textarea from '@/components/ui/Textarea.vue'
import { useTrackingStore } from '@/stores/tracking'
import type { Link } from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'

interface Props {
  /**
   * Controla a abertura do modal
   */
  open: boolean
  /**
   * Link a ser editado (opcional)
   */
  link?: Link | null
}

const props = withDefaults(defineProps<Props>(), {
  link: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [link: Link]
}>()

const trackingStore = useTrackingStore()
const { toast } = useToast()

// Estado local
const loading = ref(false)
const confirmMessage = ref('')
const isVerified = ref(false)

// Form data (simplificado)
interface FormData {
  name: string
  initialMessage: string
  whatsappNumber: string
}

const formData = ref<FormData>({
  name: '',
  initialMessage: '',
  whatsappNumber: '',
})

// Reset form quando abrir
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.link) {
      // Edição - preencher com dados do link
      formData.value = {
        name: props.link.name,
        initialMessage: props.link.initialMessage || '',
        whatsappNumber: props.link.whatsappNumber || '',
      }
      confirmMessage.value = ''
      isVerified.value = false
    } else {
      // Criação - resetar
      formData.value = {
        name: '',
        initialMessage: '',
        whatsappNumber: '',
      }
      confirmMessage.value = ''
      isVerified.value = false
    }
  }
})

// Computed
const isEditing = computed(() => !!props.link)

// Handlers
const handleClose = () => {
  emit('update:open', false)
}

const handleCopyMessage = async () => {
  if (!formData.value.initialMessage) {
    toast({
      title: 'Atenção',
      description: 'Nenhuma mensagem para copiar.',
      variant: 'destructive',
    })
    return
  }

  try {
    await navigator.clipboard.writeText(formData.value.initialMessage)
    toast({
      title: 'Copiado!',
      description: 'Mensagem copiada para a área de transferência.',
    })
  } catch (error) {
    console.error('Erro ao copiar mensagem:', error)
  }
}

const handleVerifyMessage = () => {
  if (!confirmMessage.value || !formData.value.initialMessage) {
    toast({
      title: 'Atenção',
      description: 'Preencha ambas as mensagens para verificar.',
      variant: 'destructive',
    })
    return
  }

  const isMatch = confirmMessage.value.trim() === formData.value.initialMessage.trim()
  
  if (isMatch) {
    isVerified.value = true
    toast({
      title: 'Verificado!',
      description: 'As mensagens são idênticas.',
    })
  } else {
    isVerified.value = false
    toast({
      title: 'Atenção',
      description: 'As mensagens não são idênticas. Verifique novamente.',
      variant: 'destructive',
    })
  }
}

const validateForm = (): boolean => {
  // Validação básica
  if (!formData.value.name.trim()) {
    toast({
      title: 'Erro de validação',
      description: 'O nome da mensagem é obrigatório.',
      variant: 'destructive',
    })
    return false
  }

  const cleanPhone = formData.value.whatsappNumber.replace(/\D/g, '')
  if (!isEditing.value && !cleanPhone) {
    toast({
      title: 'Erro de validação',
      description: 'O número do WhatsApp é obrigatório.',
      variant: 'destructive',
    })
    return false
  }

  if (cleanPhone && !/^[0-9]{10,15}$/.test(cleanPhone)) {
    toast({
      title: 'Erro de validação',
      description: 'Informe um número de WhatsApp válido (10-15 dígitos).',
      variant: 'destructive',
    })
    return false
  }

  formData.value.whatsappNumber = cleanPhone
  return true
}

const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  console.log('[LinkFormModal] Saving with data:', formData.value)

  loading.value = true

  try {
    let savedLink: Link

    if (isEditing.value && props.link) {
      // Update
      console.log('[LinkFormModal] Updating link:', props.link.id)
      savedLink = await trackingStore.updateLink(props.link.id, {
        name: formData.value.name,
        initialMessage: formData.value.initialMessage,
        whatsappNumber: formData.value.whatsappNumber || undefined,
      })
    } else {
      // Create
      console.log('[LinkFormModal] Creating new link')
      savedLink = await trackingStore.createLink({
        name: formData.value.name,
        initialMessage: formData.value.initialMessage,
        whatsappNumber: formData.value.whatsappNumber,
      })
    }

    console.log('[LinkFormModal] Saved successfully:', savedLink)

    toast({
      title: 'Sucesso!',
      description: `Mensagem ${isEditing.value ? 'atualizada' : 'criada'} com sucesso.`,
    })

    emit('success', savedLink)
    handleClose()
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível salvar a mensagem. Tente novamente.',
      variant: 'destructive',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Modal 
    :open="open" 
    :size="isEditing ? 'md' : 'md'" 
    :show-close="true"
    @update:open="(value) => emit('update:open', value)"
  >
    <!-- MODO CRIAÇÃO -->
    <template v-if="!isEditing" #header>
      <div class="flex items-center gap-2">
        <MessageSquare class="h-5 w-5 text-primary" />
        <div>
          <h2 class="section-title-sm">Criar link rastreável</h2>
        </div>
      </div>
    </template>

    <form v-if="!isEditing" id="message-form" class="space-y-6" @submit.prevent="handleSave">
      <!-- Nome -->
      <div class="space-y-2">
        <Label for="name" required>Nome</Label>
        <Input
          id="name"
          v-model="formData.name"
          placeholder="Insira o nome do link de rastreamento"
          :disabled="loading"
        />
      </div>

      <!-- Número WhatsApp -->
      <div class="space-y-2">
        <Label for="whatsappNumber" required>Número do WhatsApp</Label>
        <Input
          id="whatsappNumber"
          v-model="formData.whatsappNumber"
          placeholder="Ex: 5511999999999"
          :disabled="loading"
        />
      </div>

      <!-- Mensagem inicial -->
      <div class="space-y-2">
        <Label for="initialMessage">Mensagem inicial (opcional)</Label>
        <Textarea
          id="initialMessage"
          v-model="formData.initialMessage"
          placeholder="Insira a mensagem inicial (se vazio, uma saudação padrão será usada)"
          :rows="4"
          :disabled="loading"
        />
      </div>
    </form>

    <template v-if="!isEditing" #footer>
      <div class="flex items-center justify-end gap-3 w-full">
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
          form="message-form"
          :disabled="loading"
        >
          Criar
        </Button>
      </div>
    </template>

    <!-- MODO EDIÇÃO -->
    <template v-if="isEditing" #header>
      <div>
        <h2 class="section-title-sm">Links rastreáveis</h2>
        <p class="text-sm text-muted-foreground mt-1">{{ formData.name }}</p>
      </div>
    </template>

    <form v-if="isEditing" id="message-edit-form" class="space-y-6" @submit.prevent="handleSave">
      <!-- Número WhatsApp -->
      <div class="space-y-2">
        <Label for="whatsappNumberEdit">Número do WhatsApp</Label>
        <Input
          id="whatsappNumberEdit"
          v-model="formData.whatsappNumber"
          placeholder="Ex: 5511999999999"
          :disabled="loading"
        />
      </div>

      <!-- Mensagem rastreável para WhatsApp -->
      <div class="space-y-2">
        <Label for="message">Mensagem rastreável para WhatsApp (opcional)</Label>
        <Textarea
          id="message"
          v-model="formData.initialMessage"
          placeholder="Digite a mensagem aqui (opcional)"
          :rows="4"
          :disabled="loading"
        />
        <Button
          type="button"
          variant="outline"
          class="w-full"
          :disabled="loading || !formData.initialMessage"
          @click="handleCopyMessage"
        >
          <Copy class="h-4 w-4 mr-2" />
          Copiar
        </Button>
      </div>

      <!-- Confirme se a mensagem está correta -->
      <div class="space-y-2">
        <Label for="confirmMessage">Confirme se a mensagem está correta</Label>
        <Textarea
          id="confirmMessage"
          v-model="confirmMessage"
          placeholder="Cole a mensagem aqui"
          :rows="4"
          :disabled="loading"
          :class="[
            isVerified && 'border-green-500 bg-green-50'
          ]"
        />
        <Button
          type="button"
          variant="outline"
          class="w-full"
          :disabled="loading || !confirmMessage"
          @click="handleVerifyMessage"
        >
          Verificar mensagem
        </Button>
      </div>
    </form>

    <template v-if="isEditing" #footer>
      <div class="flex items-center justify-end gap-3 w-full">
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
          form="message-edit-form"
          :disabled="loading"
        >
          Salvar alterações
        </Button>
      </div>
    </template>
  </Modal>
</template>

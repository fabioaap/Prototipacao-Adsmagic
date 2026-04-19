<template>
  <Modal :model-value="open" @update:model-value="emit('update:open', $event)">
    <template #content>
      <div class="max-w-md mx-auto p-6">
        <!-- Step 1: Form -->
        <template v-if="currentStep === 'form'">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Webhook class="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="section-title-md mb-2">{{ t('integrations.whatsappWebhook.formTitle') }}</h2>
            <p class="text-sm text-muted-foreground">
              {{ t('integrations.whatsappWebhook.formDesc') }}
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- Phone Number ID -->
            <div class="space-y-2">
              <Label for="webhook-phone-number-id">
                {{ t('integrations.whatsappWebhook.phoneNumberId') }}
                <span class="text-destructive">*</span>
              </Label>
              <Input
                id="webhook-phone-number-id"
                v-model="formData.phoneNumberId"
                :placeholder="t('integrations.whatsappWebhook.phoneNumberIdPlaceholder')"
                :disabled="isSubmitting"
                required
              />
              <p class="text-xs text-muted-foreground">
                {{ t('integrations.whatsappWebhook.phoneNumberIdHelp') }}
              </p>
            </div>

            <!-- Access Token (optional) -->
            <div class="space-y-2">
              <Label for="webhook-access-token">
                {{ t('integrations.whatsappWebhook.accessToken') }}
              </Label>
              <Input
                id="webhook-access-token"
                v-model="formData.accessToken"
                type="password"
                :placeholder="t('integrations.whatsappWebhook.accessTokenPlaceholder')"
                :disabled="isSubmitting"
              />
              <p class="text-xs text-muted-foreground">
                {{ t('integrations.whatsappWebhook.accessTokenHelp') }}
              </p>
            </div>

            <!-- Account Name (optional) -->
            <div class="space-y-2">
              <Label for="webhook-account-name">
                {{ t('integrations.whatsappWebhook.accountName') }}
              </Label>
              <Input
                id="webhook-account-name"
                v-model="formData.accountName"
                :placeholder="t('integrations.whatsappWebhook.accountNamePlaceholder')"
                :disabled="isSubmitting"
              />
            </div>

            <!-- Error -->
            <div v-if="errorMessage" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-center space-x-2">
                <AlertCircle class="h-4 w-4 text-red-600 flex-shrink-0" />
                <span class="text-sm text-red-600">{{ errorMessage }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                @click="emit('update:open', false)"
                :disabled="isSubmitting"
              >
                {{ t('common.cancel') }}
              </Button>
              <Button
                type="submit"
                :disabled="!formData.phoneNumberId.trim() || isSubmitting"
                :loading="isSubmitting"
              >
                {{ t('integrations.whatsappWebhook.submit') }}
              </Button>
            </div>
          </form>
        </template>

        <!-- Step 2: Success -->
        <template v-else-if="currentStep === 'success'">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 class="section-title-md mb-2">{{ t('integrations.whatsappWebhook.successTitle') }}</h2>
            <p class="text-sm text-muted-foreground">
              {{ t('integrations.whatsappWebhook.successDesc') }}
            </p>
          </div>

          <!-- Webhook URL -->
          <div class="space-y-2 mb-6">
            <Label>{{ t('integrations.whatsappWebhook.webhookUrlLabel') }}</Label>
            <div class="flex items-center gap-2">
              <Input
                :model-value="webhookUrl"
                readonly
                class="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                @click="handleCopyUrl"
              >
                <Copy class="h-4 w-4" />
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ t('integrations.whatsappWebhook.webhookUrlHelp') }}
            </p>
          </div>

          <!-- Copied feedback -->
          <div v-if="showCopied" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
            <div class="flex items-center space-x-2">
              <CheckCircle class="h-4 w-4 text-green-600" />
              <span class="text-sm text-green-600">{{ t('integrations.whatsappWebhook.copied') }}</span>
            </div>
          </div>

          <!-- Done button -->
          <div class="flex justify-end">
            <Button @click="handleDone">
              {{ t('integrations.whatsappWebhook.done') }}
            </Button>
          </div>
        </template>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Webhook, CheckCircle, AlertCircle, Copy } from '@/composables/useIcons'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { useIntegrationsStore } from '@/stores/integrations'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'connected': []
}>()

const { t } = useI18n()
const integrationsStore = useIntegrationsStore()

const currentStep = ref<'form' | 'success'>('form')
const isSubmitting = ref(false)
const errorMessage = ref('')
const webhookUrl = ref('')
const showCopied = ref(false)

const formData = reactive({
  phoneNumberId: '',
  accessToken: '',
  accountName: '',
})

const resetForm = () => {
  currentStep.value = 'form'
  isSubmitting.value = false
  errorMessage.value = ''
  webhookUrl.value = ''
  showCopied.value = false
  formData.phoneNumberId = ''
  formData.accessToken = ''
  formData.accountName = ''
}

const handleSubmit = async () => {
  if (!formData.phoneNumberId.trim()) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const result = await integrationsStore.createOfficialWebhookAccount({
      phoneNumberId: formData.phoneNumberId.trim(),
      accessToken: formData.accessToken.trim() || undefined,
      accountName: formData.accountName.trim() || undefined,
    })

    webhookUrl.value = result.webhookUrl
    currentStep.value = 'success'
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Erro ao configurar webhook'
  } finally {
    isSubmitting.value = false
  }
}

const handleCopyUrl = async () => {
  try {
    await navigator.clipboard.writeText(webhookUrl.value)
    showCopied.value = true
    setTimeout(() => { showCopied.value = false }, 2000)
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = webhookUrl.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showCopied.value = true
    setTimeout(() => { showCopied.value = false }, 2000)
  }
}

const handleDone = () => {
  emit('connected')
  emit('update:open', false)
}

// Reset form when modal closes
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>

<template>
  <Modal :model-value="open" @update:model-value="emit('update:open', $event)">
    <template #content>
      <div class="max-w-md mx-auto p-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare class="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 class="section-title-md mb-2">{{ t('integrations.whatsappWebhook.connectionMethodTitle') }}</h2>
          <p class="text-sm text-muted-foreground">
            {{ t('integrations.whatsappWebhook.connectionMethodDesc') }}
          </p>
        </div>

        <!-- Method Cards -->
        <div class="grid gap-4">
          <!-- QR Code -->
          <button
            class="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors text-left w-full"
            @click="handleSelectQR"
          >
            <div class="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCode class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 class="font-medium text-sm">{{ t('integrations.whatsappWebhook.methodQr') }}</h3>
              <p class="text-xs text-muted-foreground mt-1">{{ t('integrations.whatsappWebhook.methodQrDesc') }}</p>
            </div>
          </button>

          <!-- Webhook -->
          <button
            class="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors text-left w-full"
            @click="handleSelectWebhook"
          >
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Webhook class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 class="font-medium text-sm">{{ t('integrations.whatsappWebhook.methodWebhook') }}</h3>
              <p class="text-xs text-muted-foreground mt-1">{{ t('integrations.whatsappWebhook.methodWebhookDesc') }}</p>
            </div>
          </button>
        </div>

        <!-- Cancel -->
        <div class="mt-6 flex justify-end">
          <Button variant="outline" @click="emit('update:open', false)">
            {{ t('common.cancel') }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { MessageSquare, QrCode, Webhook } from '@/composables/useIcons'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select-qr': []
  'select-webhook': []
}>()

const { t } = useI18n()

const handleSelectQR = () => {
  emit('update:open', false)
  emit('select-qr')
}

const handleSelectWebhook = () => {
  emit('update:open', false)
  emit('select-webhook')
}
</script>

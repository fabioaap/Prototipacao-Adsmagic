<script setup lang="ts">
/**
 * WhatsApp Status Indicator
 *
 * Displays the WhatsApp connection status in the app header.
 * Shows connected phone number when connected, or disconnected status.
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessageCircle, WifiOff } from 'lucide-vue-next'
import { whatsappIntegrationService } from '@/services/api/whatsappIntegrationService'
import { whatsappAdapter } from '@/services/adapters/whatsappAdapter'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ConnectedAccount } from '@/types/whatsapp'

const { t } = useI18n()
const { currentProjectId } = useCurrentProjectId()

// State
const isLoading = ref(true)
const connectedAccount = ref<ConnectedAccount | null>(null)
const error = ref<string | null>(null)

// Computed
const isConnected = computed(() => connectedAccount.value?.status === 'connected')
const formattedPhone = computed(() => {
  if (!connectedAccount.value?.phoneNumber) return ''
  return whatsappAdapter.formatPhoneNumber(connectedAccount.value.phoneNumber)
})
const displayName = computed(() => {
  if (!connectedAccount.value) return ''
  return connectedAccount.value.profileName || formattedPhone.value || 'WhatsApp'
})

// Methods
async function fetchWhatsAppStatus() {
  if (!currentProjectId.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const result = await whatsappIntegrationService.listProjectAccounts(currentProjectId.value)

    if (result.success && result.data.length > 0) {
      // Get the first connected account (most recent or primary)
      const activeAccount = result.data.find(acc => acc.status === 'connected')
      const account = activeAccount ?? result.data[0]
      connectedAccount.value = account ?? null
    } else {
      connectedAccount.value = null
    }
  } catch (err) {
    console.error('[WhatsAppStatusIndicator] Error fetching status:', err)
    error.value = 'Failed to fetch WhatsApp status'
    connectedAccount.value = null
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchWhatsAppStatus()
})

watch(currentProjectId, () => {
  fetchWhatsAppStatus()
})
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <div
          class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors"
          :class="{
            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': isConnected,
            'bg-muted text-muted-foreground': !isConnected && !isLoading,
            'animate-pulse bg-muted': isLoading,
          }"
        >
          <template v-if="isLoading">
            <div class="h-3 w-3 rounded-full bg-muted-foreground/30" />
            <span class="hidden sm:inline">...</span>
          </template>
          <template v-else-if="isConnected">
            <MessageCircle class="h-3 w-3" />
            <span class="hidden sm:inline max-w-[120px] truncate">{{ displayName }}</span>
            <div class="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
          </template>
          <template v-else>
            <WifiOff class="h-3 w-3" />
            <span class="hidden sm:inline">{{ t('header.whatsapp.disconnected') }}</span>
          </template>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div class="text-sm">
          <template v-if="isLoading">
            {{ t('header.whatsapp.loading') }}
          </template>
          <template v-else-if="isConnected">
            <p class="font-medium">{{ t('header.whatsapp.connected') }}</p>
            <p class="text-muted-foreground">{{ formattedPhone }}</p>
            <p v-if="connectedAccount?.profileName" class="text-muted-foreground">
              {{ connectedAccount.profileName }}
            </p>
          </template>
          <template v-else>
            {{ t('header.whatsapp.notConnected') }}
          </template>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

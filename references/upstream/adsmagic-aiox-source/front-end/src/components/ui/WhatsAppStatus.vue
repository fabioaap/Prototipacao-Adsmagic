<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import { whatsappIntegrationService } from '@/services/api/whatsappIntegrationService'
import { whatsappAdapter } from '@/services/adapters/whatsappAdapter'
import { cacheService } from '@/services/cache/cacheService'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'
import { useIntegrationsStore } from '@/stores/integrations'
import type { ConnectedAccount } from '@/types/whatsapp'

const router = useRouter()
const route = useRoute()
const { currentProjectId } = useCurrentProjectId()
const integrationsStore = useIntegrationsStore()

const isLoading = ref(false)
const connectedAccount = ref<ConnectedAccount | null>(null)

interface Props {
  compactOnMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compactOnMobile: false,
})

const isConnected = computed(() => connectedAccount.value?.status === 'connected')
const formattedPhone = computed(() => {
  if (!connectedAccount.value?.phoneNumber) return null
  return whatsappAdapter.formatPhoneNumber(connectedAccount.value.phoneNumber)
})

async function fetchWhatsAppStatus() {
  if (!currentProjectId.value) {
    connectedAccount.value = null
    return
  }

  isLoading.value = true
  try {
    const result = await whatsappIntegrationService.listProjectAccounts(currentProjectId.value)
    if (result.success && result.data.length > 0) {
      const activeAccount = result.data.find(acc => acc.status === 'connected')
      connectedAccount.value = activeAccount ?? result.data[0] ?? null
    } else {
      connectedAccount.value = null
    }
  } catch (err) {
    console.error('[WhatsAppStatus] Error fetching status:', err)
    connectedAccount.value = null
  } finally {
    isLoading.value = false
  }
}

const connect = () => {
  const localeParam = route.params.locale
  const locale = (Array.isArray(localeParam) ? localeParam[0] : localeParam) || 'pt'
  const projectId = route.params.projectId

  if (projectId) {
    if (route.name === 'integrations') {
      router.replace({
        name: 'integrations',
        params: { locale, projectId },
        query: { tab: 'channels' }
      })
    } else {
      router.push({
        name: 'integrations',
        params: { locale, projectId },
        query: { tab: 'channels' }
      })
    }
  }
}

const manageIntegration = () => {
  connect()
}

const disconnect = async () => {
  try {
    await integrationsStore.disconnectPlatform('whatsapp')
    cacheService.invalidatePattern('whatsapp-status')
    connectedAccount.value = null
  } catch (err) {
    console.error('[WhatsAppStatus] Error disconnecting:', err)
  }
}

onMounted(() => {
  fetchWhatsAppStatus()
})

watch(currentProjectId, () => {
  fetchWhatsAppStatus()
})
</script>

<template>
  <DropdownMenu align="right">
    <template #trigger>
      <button
        type="button"
        class="whatsapp-status-button h-[var(--sym-control-height-md)] rounded-control border border-border flex items-center justify-center px-[var(--sym-space-5)] gap-2.5 text-sm text-foreground font-medium transition-colors hover:bg-accent/50 cursor-pointer"
        :class="{ 'whatsapp-status-button--compact-mobile': props.compactOnMobile }"
        aria-label="Status do WhatsApp"
        data-testid="whatsapp-trigger"
      >
        <!-- Ícone WhatsApp oficial SVG inline -->
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5 shrink-0"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span
          class="whatsapp-status-label text-sm leading-[14px] font-medium"
          :class="{ 'whatsapp-status-label--compact-mobile': props.compactOnMobile }"
        >
          WhatsApp
        </span>
        <!-- Pill de status (design exato do Figma) -->
        <span
          class="inline-flex items-center rounded-full px-[5px] py-px text-[11px] leading-[11px] font-medium"
          :class="isConnected
            ? 'bg-success/10 text-success'
            : 'bg-destructive/10 text-destructive'"
          data-testid="whatsapp-status-pill"
        >
          {{ isConnected ? 'Conectado' : 'Desconectado' }}
        </span>
        <!-- Chevron para indicar dropdown -->
        <svg
          class="whatsapp-status-chevron text-muted-foreground"
          :class="{ 'whatsapp-status-chevron--compact-mobile': props.compactOnMobile }"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </template>
    
    <!-- Menu Content -->
    <div class="px-3 py-2 border-b border-border">
      <div class="text-sm font-semibold text-foreground">WhatsApp Business</div>
    </div>
    
    <div class="px-3 py-2">
      <div v-if="isConnected" class="space-y-2">
        <div class="flex items-center gap-2 text-sm">
          <span class="w-2 h-2 rounded-full bg-success"></span>
          <span class="text-foreground font-medium">Conectado</span>
        </div>
        <div v-if="formattedPhone" class="text-xs text-muted-foreground">
          {{ formattedPhone }}
        </div>
      </div>
      
      <div v-else class="space-y-2">
        <div class="flex items-center gap-2 text-sm">
          <span class="w-2 h-2 rounded-full bg-destructive"></span>
          <span class="text-foreground font-medium">Desconectado</span>
        </div>
        <div class="text-xs text-muted-foreground">
          Conecte-se ao WhatsApp Business
        </div>
      </div>
    </div>
    
    <div class="border-t border-border">
      <button
        @click="manageIntegration"
        class="flex w-full items-center justify-center px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
        type="button"
      >
        Gerenciar integração
      </button>

      <button
        v-if="!isConnected"
        @click="connect"
        class="flex w-full items-center justify-center px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
        type="button"
      >
        Conectar WhatsApp
      </button>
      
      <button
        v-else
        @click="disconnect"
        class="flex w-full items-center justify-center px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        type="button"
      >
        Desconectar
      </button>
    </div>
  </DropdownMenu>
</template>

<style scoped>
@media (max-width: 640px) {
  .whatsapp-status-button--compact-mobile {
    padding-inline: 0.625rem;
    gap: 0.5rem;
  }

  .whatsapp-status-label--compact-mobile,
  .whatsapp-status-chevron--compact-mobile {
    display: none;
  }
}
</style>

<template>
  <div class="space-y-4">
    <section class="rounded-xl border border-border bg-gradient-to-br from-background via-background to-muted/20 p-3.5 sm:p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/40"
            :class="getPlatformIconBg(platform)"
          >
            <BrandIcons :name="getPlatformIconName(platform)" class="h-5 w-5" :class="getPlatformIconColor(platform)" />
          </div>

          <div class="min-w-0">
            <h3 class="section-title-sm break-words">{{ connection.accountName }}</h3>
            <p class="text-sm text-muted-foreground">{{ getPlatformName(platform) }}</p>
            <p v-if="primaryResourceLabel" class="mt-0.5 text-[11px] text-muted-foreground break-all">
              {{ primaryResourceLabel }}
            </p>
          </div>
        </div>

        <Badge variant="success" class="self-start">
          <CheckCircle class="h-3 w-3 mr-1" />
          Conectado
        </Badge>
      </div>

      <div class="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-background/80 px-3 py-2.5">
          <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">ID da Conta</p>
          <p class="mt-1 text-sm font-mono break-all text-foreground leading-5">{{ connection.accountId }}</p>
        </div>

        <div class="rounded-lg border border-border bg-background/80 px-3 py-2.5">
          <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Conectado em</p>
          <p class="mt-1 text-sm text-foreground leading-5">{{ formatSafeDateTime(connection.connectedAt) }}</p>
        </div>

        <div v-if="connection.email" class="rounded-lg border border-border bg-background/80 px-3 py-2.5 sm:col-span-2">
          <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Email vinculado</p>
          <p class="mt-1 text-sm text-foreground break-all">{{ connection.email }}</p>
        </div>

        <div v-if="connection.expiresAt" class="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5 sm:col-span-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Expira em</p>
              <p class="mt-1 text-sm text-foreground">{{ formatSafeDateTime(connection.expiresAt) }}</p>
            </div>
            <p class="text-xs font-medium text-warning-700 dark:text-warning-300">
              {{ formatRelativeTime(connection.expiresAt) }}
            </p>
          </div>

          <div class="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-warning/15">
            <div class="h-full rounded-full bg-warning transition-all duration-1000" :style="{ width: getExpirationPercentage() + '%' }"></div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="hasPermissions" class="rounded-xl border border-border bg-background p-3.5">
      <div class="mb-2.5 flex items-center justify-between gap-3">
        <div>
          <h4 class="text-sm font-semibold text-foreground">Permissões concedidas</h4>
          <p class="text-xs text-muted-foreground">Escopos ativos para essa integração.</p>
        </div>
        <span class="text-xs text-muted-foreground">{{ connection.permissions.length }} item(ns)</span>
      </div>

      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="permission in connection.permissions"
          :key="permission"
          variant="secondary"
          class="text-xs"
        >
          {{ formatPermission(permission) }}
        </Badge>
      </div>
    </section>

    <section v-if="hasAdditionalInformation" class="rounded-xl border border-border bg-background p-3 space-y-2.5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 class="text-sm font-semibold text-foreground">Informações adicionais</h4>
          <p class="text-xs text-muted-foreground">Resumo operacional da configuração.</p>
        </div>
        <Badge v-if="googleAdsSummary" variant="secondary" class="text-xs">
          {{ googleAdsSummary.selectedConversionActions.length }} ação(ões) de conversão
        </Badge>
      </div>

      <div v-if="googleAdsSummary" class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
            <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Última atualização</p>
            <p class="mt-1 text-sm text-foreground">
              {{ googleAdsSummary.updatedAt ? formatSafeDateTime(googleAdsSummary.updatedAt) : 'Não informado' }}
            </p>
        </div>

        <div class="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
          <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Ações selecionadas</p>
          <p class="mt-1 text-sm text-foreground">
            {{ googleAdsSummary.selectedConversionActions.length || googleAdsSummary.selectedConversionActionIds.length }} item(ns)
          </p>
        </div>

        <div v-if="googleAdsSummary.selectedConversionActions.length > 0" class="space-y-2 sm:col-span-2">
          <div
            v-for="action in googleAdsSummary.selectedConversionActions"
            :key="action.id"
            class="rounded-lg border border-border bg-background px-3 py-2"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="text-sm font-medium text-foreground">{{ action.name }}</p>
                <p class="mt-0.5 text-xs text-muted-foreground break-all">{{ action.resourceName }}</p>
              </div>
              <Badge variant="secondary" class="text-[11px]">{{ action.status }}</Badge>
            </div>

            <div class="mt-1.5 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
              <span class="rounded-full border border-border bg-background px-2.5 py-1">Tipo: {{ action.type }}</span>
              <span class="rounded-full border border-border bg-background px-2.5 py-1">Categoria: {{ action.category }}</span>
              <span v-if="action.primaryForGoal" class="rounded-full border border-green-300 bg-green-50 px-2.5 py-1 text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300">
                Primária para objetivo
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="genericMetadataEntries.length > 0" class="space-y-1.5">
        <div
          v-for="entry in genericMetadataEntries"
          :key="entry.key"
          class="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-2"
        >
          <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{{ entry.label }}</p>
          <p class="mt-1 text-sm text-foreground whitespace-pre-wrap break-words">{{ entry.value }}</p>
        </div>
      </div>
    </section>

    <!-- Actions -->
    <div class="mt-3 border-t pt-3 space-y-2">
      <div class="grid grid-cols-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          class="w-full justify-center"
          @click="handleViewLogs"
        >
          <FileText class="h-4 w-4 mr-2" />
          Ver Logs
        </Button>

        <Button
          variant="ghost"
          size="sm"
          class="w-full justify-center"
          @click="handleRefresh"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div
        class="grid gap-2"
        :class="showGoogleConversionActions ? 'grid-cols-2' : 'grid-cols-1'"
      >
        <Button
          v-if="showGoogleConversionActions"
          variant="outline"
          size="sm"
          class="w-full justify-center"
          @click="handleManageGoogleConversionActions"
        >
          Gerenciar conversões
        </Button>

        <Button
          variant="destructive"
          size="sm"
          class="w-full justify-center"
          @click="handleDisconnect"
        >
          <Link2 class="h-4 w-4 mr-2 rotate-45" />
          Desconectar
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BrandIcons from '@/components/icons/BrandIcons.vue'
import { CheckCircle, FileText, Link2, RefreshCw } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Connection } from '@/types/models'
import { formatSafeDateTime } from '@/utils/formatters'
import { useFormat } from '@/composables/useFormat'

interface Props {
  /**
   * Dados da conexão
   */
  connection: Connection
  /**
   * Plataforma da conexão
   */
  platform: string
  showGoogleConversionActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showGoogleConversionActions: false,
})

const emit = defineEmits<{
  viewLogs: []
  refresh: []
  disconnect: []
  manageGoogleConversionActions: []
}>()

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatRelativeTime } = useFormat()

type MetadataRecord = Record<string, unknown>

interface GoogleAdsConversionActionSummary {
  id: string
  name: string
  type: string
  status: string
  category: string
  resourceName: string
  primaryForGoal?: boolean
}

interface GoogleAdsMetadataSummary {
  updatedAt?: string
  selectedConversionActionIds: string[]
  selectedConversionActions: GoogleAdsConversionActionSummary[]
}

interface GenericMetadataEntry {
  key: string
  label: string
  value: string
}

const hasPermissions = computed(() => props.connection.permissions.length > 0)

const parsedMetadata = computed<MetadataRecord>(() => {
  const metadata = props.connection.metadata || {}

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, parseMetadataValue(value)])
  )
})

const googleAdsSummary = computed<GoogleAdsMetadataSummary | null>(() => {
  const googleAdsValue = parsedMetadata.value.google_ads

  if (!isRecord(googleAdsValue)) {
    return null
  }

  const selectedConversionActions = Array.isArray(googleAdsValue.selected_conversion_actions)
    ? googleAdsValue.selected_conversion_actions.filter(isRecord).map((action) => ({
        id: typeof action.id === 'string' ? action.id : '',
        name: typeof action.name === 'string' ? action.name : 'Conversion action',
        type: typeof action.type === 'string' ? action.type : 'Não informado',
        status: typeof action.status === 'string' ? action.status : 'Não informado',
        category: typeof action.category === 'string' ? action.category : 'Não informado',
        resourceName: typeof action.resourceName === 'string' ? action.resourceName : '',
        primaryForGoal: action.primaryForGoal === true,
      }))
    : []

  return {
    updatedAt: typeof googleAdsValue.updated_at === 'string' ? googleAdsValue.updated_at : undefined,
    selectedConversionActionIds: Array.isArray(googleAdsValue.selected_conversion_action_ids)
      ? googleAdsValue.selected_conversion_action_ids.filter((id): id is string => typeof id === 'string')
      : [],
    selectedConversionActions,
  }
})

const genericMetadataEntries = computed<GenericMetadataEntry[]>(() => {
  return Object.entries(parsedMetadata.value)
    .filter(([key, value]) => key !== 'google_ads' && key !== 'id' && value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({
      key,
      label: formatMetadataKey(key),
      value: formatMetadataValue(value),
    }))
})

const primaryResourceLabel = computed(() => {
  const resourceId = parsedMetadata.value.id

  if (typeof resourceId !== 'string' || !resourceId.trim()) {
    return null
  }

  return resourceId
})

const hasAdditionalInformation = computed(() => {
  return !!googleAdsSummary.value || genericMetadataEntries.value.length > 0
})

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Calcula a porcentagem de expiração
 */
const getExpirationPercentage = () => {
  if (!props.connection.expiresAt) return 0
  
  const now = new Date().getTime()
  const connected = new Date(props.connection.connectedAt).getTime()
  const expires = new Date(props.connection.expiresAt).getTime()
  
  const total = expires - connected
  const remaining = expires - now
  
  return Math.max(0, Math.min(100, (remaining / total) * 100))
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const parseMetadataValue = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmedValue = value.trim()
  if (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('[')) {
    return value
  }

  try {
    return JSON.parse(trimmedValue)
  } catch {
    return value
  }
}

const formatMetadataValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value) || isRecord(value)) {
    return JSON.stringify(value, null, 2)
  }

  return 'Não informado'
}

// ============================================================================
// METHODS
// ============================================================================

/**
 * Obtém o ícone da plataforma
 */
const getPlatformIconName = (platform: string) => {
  const iconMap: Record<string, 'whatsapp' | 'meta' | 'google' | 'tiktok' | 'linkedin' | 'telegram'> = {
    whatsapp: 'whatsapp',
    meta: 'meta',
    google: 'google',
    tiktok: 'tiktok',
    linkedin: 'linkedin',
    telegram: 'telegram',
  }
  return iconMap[platform] || 'meta'
}

/**
 * Obtém a cor de fundo do ícone da plataforma
 */
const getPlatformIconBg = (platform: string) => {
  const bgMap: Record<string, string> = {
    whatsapp: 'bg-green-100 dark:bg-green-900/20',
    meta: 'bg-blue-100 dark:bg-blue-900/20',
    google: 'bg-amber-100 dark:bg-amber-900/20',
    tiktok: 'bg-pink-100 dark:bg-pink-900/20',
    linkedin: 'bg-blue-100 dark:bg-blue-900/20'
  }
  return bgMap[platform] || 'bg-gray-100 dark:bg-gray-900/20'
}

/**
 * Obtém a cor do ícone da plataforma
 */
const getPlatformIconColor = (platform: string) => {
  const colorMap: Record<string, string> = {
    whatsapp: 'text-green-600 dark:text-green-400',
    meta: 'text-blue-600 dark:text-blue-400',
    google: 'text-amber-600 dark:text-amber-400',
    tiktok: 'text-pink-600 dark:text-pink-400',
    linkedin: 'text-blue-600 dark:text-blue-400',
  }
  return colorMap[platform] || 'text-gray-600 dark:text-gray-400'
}

/**
 * Obtém o nome da plataforma
 */
const getPlatformName = (platform: string) => {
  const nameMap: Record<string, string> = {
    whatsapp: 'WhatsApp Business',
    meta: 'Meta (Facebook/Instagram)',
    google: 'Google Ads',
    tiktok: 'TikTok Ads',
    linkedin: 'LinkedIn Ads'
  }
  return nameMap[platform] || platform
}

/**
 * Formata uma permissão para exibição
 */
const formatPermission = (permission: string) => {
  const permissionMap: Record<string, string> = {
    ads_management: 'Gerenciar Anúncios',
    ads_read: 'Ler Anúncios',
    pages_read_engagement: 'Ler Páginas',
    instagram_basic: 'Instagram Básico',
    business_management: 'Gerenciar Negócios',
    'https://www.googleapis.com/auth/adwords': 'Google Ads',
    'https://www.googleapis.com/auth/analytics.readonly': 'Google Analytics',
    user_info_basic: 'Informações Básicas',
    video_list: 'Listar Vídeos',
    ad_account_info: 'Informações de Conta',
    r_liteprofile: 'Perfil Básico',
    r_emailaddress: 'Endereço de Email',
    w_member_social: 'Social'
  }
  
  return permissionMap[permission] || permission
}

/**
 * Formata uma chave de metadata para exibição
 */
const formatMetadataKey = (key: string) => {
  const keyMap: Record<string, string> = {
    id: 'Recurso vinculado',
    businessId: 'ID do Negócio',
    businessName: 'Nome do Negócio',
    timezone: 'Fuso Horário',
    currency: 'Moeda',
    country: 'País',
    language: 'Idioma',
    google_ads: 'Configuração Google Ads',
  }
  
  return keyMap[key] || key
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleViewLogs = () => {
  emit('viewLogs')
}

const handleRefresh = () => {
  emit('refresh')
}

const handleDisconnect = () => {
  emit('disconnect')
}

const handleManageGoogleConversionActions = () => {
  emit('manageGoogleConversionActions')
}
</script>

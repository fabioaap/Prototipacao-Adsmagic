<script setup lang="ts">
/**
 * SaleAttribution.vue
 * 
 * Componente visual para exibir atribuição de vendas com:
 * - Ícones por plataforma (Meta, Google, TikTok, etc.)
 * - Cores de marca
 * - Badges de UTM (source, campaign, medium)
 * - Indicadores de click IDs (fbclid, gclid, ttclid)
 * 
 * Modos: compact (lista) e expanded (drawer)
 * 
 * @gap G7.4 - Atribuição visual de vendas
 */
import { computed } from 'vue'
import { 
  Target, 
  Globe, 
  Megaphone, 
  Tag,
  MousePointerClick,
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import type { Sale } from '@/types/models'
import { cn } from '@/lib/utils'
import { useOriginsStore } from '@/stores/origins'

interface Props {
  /** Venda para exibir atribuição */
  sale: Sale
  /** Modo de exibição: compact (lista) ou expanded (drawer) */
  mode?: 'compact' | 'expanded'
  /** Se true, mostra todos os UTMs mesmo em modo compact */
  showAllUtms?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'compact',
  showAllUtms: false,
})

const originsStore = useOriginsStore()

const originNameById = computed(() => {
  return new Map(originsStore.origins.map((origin) => [origin.id, origin.name]))
})

const displayOrigin = computed(() => {
  if (!props.sale.origin) return null
  return originNameById.value.get(props.sale.origin) || 'Origem desconhecida'
})

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

interface PlatformInfo {
  name: string
  icon: typeof Target
  colorClass: string
  bgClass: string
}

type PlatformKey = 'meta' | 'google' | 'tiktok' | 'organic' | 'direct' | 'unknown'

const platforms: Record<PlatformKey, PlatformInfo> = {
  meta: {
    name: 'Meta Ads',
    icon: Megaphone,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  google: {
    name: 'Google Ads',
    icon: Target,
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
  },
  tiktok: {
    name: 'TikTok Ads',
    icon: Megaphone,
    colorClass: 'text-pink-600',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
  },
  organic: {
    name: 'Orgânico',
    icon: Globe,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
  },
  direct: {
    name: 'Direto',
    icon: MousePointerClick,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
  },
  unknown: {
    name: 'Não identificado',
    icon: AlertCircle,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
  },
}

// Detecta plataforma baseado nos parâmetros de tracking
const detectedPlatform = computed((): PlatformInfo => {
  const params = props.sale.trackingParams
  const utmSource = props.sale.utmSource?.toLowerCase() || params?.utm_source?.toLowerCase()
  
  // Detecta por click ID
  if (params?.fbclid) return platforms.meta
  if (params?.gclid || params?.gbraid || params?.wbraid) return platforms.google
  if (params?.ttclid) return platforms.tiktok
  
  // Detecta por utm_source
  if (utmSource) {
    if (['facebook', 'fb', 'instagram', 'ig', 'meta'].includes(utmSource)) return platforms.meta
    if (['google', 'gads', 'adwords', 'googleads'].includes(utmSource)) return platforms.google
    if (['tiktok', 'tt', 'tiktokads'].includes(utmSource)) return platforms.tiktok
    if (['organic', 'seo', 'organico'].includes(utmSource)) return platforms.organic
    if (['direct', 'direto', 'none'].includes(utmSource)) return platforms.direct
  }
  
  // Detecta por origem
  const origin = props.sale.origin?.toLowerCase()
  if (origin) {
    if (origin.includes('meta') || origin.includes('facebook') || origin.includes('instagram')) return platforms.meta
    if (origin.includes('google')) return platforms.google
    if (origin.includes('tiktok')) return platforms.tiktok
    if (origin.includes('organic') || origin.includes('orgânico')) return platforms.organic
  }
  
  return platforms.unknown
})

// ============================================================================
// UTM HELPERS
// ============================================================================

const utmSource = computed(() => {
  return props.sale.utmSource || props.sale.trackingParams?.utm_source || null
})

const utmCampaign = computed(() => {
  return props.sale.utmCampaign || props.sale.trackingParams?.utm_campaign || null
})

const utmMedium = computed(() => {
  return props.sale.utmMedium || props.sale.trackingParams?.utm_medium || null
})

const utmContent = computed(() => {
  return props.sale.utmContent || props.sale.trackingParams?.utm_content || null
})

const utmTerm = computed(() => {
  return props.sale.utmTerm || props.sale.trackingParams?.utm_term || null
})

// ============================================================================
// CLICK ID HELPERS
// ============================================================================

interface ClickIdInfo {
  type: 'meta' | 'google' | 'tiktok'
  label: string
  value: string
}

const clickIds = computed<ClickIdInfo[]>(() => {
  const params = props.sale.trackingParams
  if (!params) return []
  
  const ids: ClickIdInfo[] = []
  
  if (params.fbclid) {
    ids.push({ type: 'meta', label: 'fbclid', value: params.fbclid })
  }
  if (params.gclid) {
    ids.push({ type: 'google', label: 'gclid', value: params.gclid })
  }
  if (params.gbraid) {
    ids.push({ type: 'google', label: 'gbraid', value: params.gbraid })
  }
  if (params.wbraid) {
    ids.push({ type: 'google', label: 'wbraid', value: params.wbraid })
  }
  if (params.ttclid) {
    ids.push({ type: 'tiktok', label: 'ttclid', value: params.ttclid })
  }
  
  return ids
})

// ============================================================================
// ATTRIBUTION STATUS
// ============================================================================

const hasAttribution = computed(() => {
  return props.sale.origin || utmSource.value || utmCampaign.value || clickIds.value.length > 0
})

const attributionQuality = computed<'full' | 'partial' | 'none'>(() => {
  if (!hasAttribution.value) return 'none'
  
  const hasClickId = clickIds.value.length > 0
  const hasOrigin = !!props.sale.origin
  const hasCampaign = !!utmCampaign.value
  
  if (hasClickId && (hasOrigin || hasCampaign)) return 'full'
  if (hasClickId || hasOrigin || hasCampaign) return 'partial'
  return 'none'
})
</script>

<template>
  <!-- Compact Mode (for lists) -->
  <div v-if="mode === 'compact'" class="flex flex-col gap-1">
    <!-- Platform + Origin Row -->
    <div class="flex items-center gap-1.5">
      <div 
        :class="cn(
          'w-5 h-5 rounded flex items-center justify-center',
          detectedPlatform.bgClass
        )"
      >
        <component 
          :is="detectedPlatform.icon" 
          :class="cn('h-3 w-3', detectedPlatform.colorClass)" 
        />
      </div>
      
      <Badge 
        v-if="displayOrigin" 
        variant="secondary" 
        class="text-xs"
      >
        {{ displayOrigin }}
      </Badge>
      
      <span 
        v-else-if="!hasAttribution" 
        class="text-xs text-muted-foreground"
      >
        Não atribuído
      </span>
    </div>
    
    <!-- UTM Badges Row -->
    <div v-if="utmSource || utmCampaign" class="flex flex-wrap items-center gap-1">
      <Badge 
        v-if="utmSource" 
        variant="outline" 
        class="text-xs py-0"
      >
        {{ utmSource }}
      </Badge>
      <Badge 
        v-if="utmCampaign" 
        variant="outline" 
        class="text-xs py-0"
      >
        {{ utmCampaign }}
      </Badge>
    </div>
    
    <!-- Click ID Indicator -->
    <div v-if="clickIds.length > 0" class="flex items-center gap-1">
      <CheckCircle2 class="h-3 w-3 text-success" />
      <span class="text-xs text-muted-foreground">
        {{ clickIds.map(c => c.label).join(', ') }}
      </span>
    </div>
  </div>

  <!-- Expanded Mode (for drawers/details) -->
  <div v-else class="space-y-4">
    <!-- Platform Header -->
    <div class="flex items-center gap-3 p-3 rounded-lg" :class="detectedPlatform.bgClass">
      <component 
        :is="detectedPlatform.icon" 
        :class="cn('h-5 w-5', detectedPlatform.colorClass)" 
      />
      <div>
        <p class="text-sm font-medium">{{ detectedPlatform.name }}</p>
        <p 
          v-if="attributionQuality === 'full'" 
          class="text-xs text-success flex items-center gap-1"
        >
          <CheckCircle2 class="h-3 w-3" />
          Atribuição completa
        </p>
        <p 
          v-else-if="attributionQuality === 'partial'" 
          class="text-xs text-muted-foreground"
        >
          Atribuição parcial
        </p>
        <p 
          v-else 
          class="text-xs text-muted-foreground"
        >
          Sem atribuição
        </p>
      </div>
    </div>

    <!-- Origin -->
    <div v-if="displayOrigin" class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <Tag class="h-4 w-4 text-muted-foreground" />
      <div>
        <p class="text-xs text-muted-foreground">Origem</p>
        <p class="text-sm font-medium">{{ displayOrigin }}</p>
      </div>
    </div>

    <!-- UTM Parameters -->
    <div 
      v-if="utmSource || utmMedium || utmCampaign || utmContent || utmTerm" 
      class="p-3 bg-muted/30 rounded-lg space-y-2"
    >
      <div class="flex items-center gap-2 mb-2">
        <Target class="h-4 w-4 text-muted-foreground" />
        <p class="text-xs text-muted-foreground font-medium">Parâmetros UTM</p>
      </div>
      
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div v-if="utmSource">
          <p class="text-xs text-muted-foreground">Source</p>
          <Badge variant="outline" class="text-xs">{{ utmSource }}</Badge>
        </div>
        <div v-if="utmMedium">
          <p class="text-xs text-muted-foreground">Medium</p>
          <Badge variant="outline" class="text-xs">{{ utmMedium }}</Badge>
        </div>
        <div v-if="utmCampaign" class="col-span-2">
          <p class="text-xs text-muted-foreground">Campaign</p>
          <Badge variant="outline" class="text-xs">{{ utmCampaign }}</Badge>
        </div>
        <div v-if="utmContent">
          <p class="text-xs text-muted-foreground">Content</p>
          <Badge variant="outline" class="text-xs">{{ utmContent }}</Badge>
        </div>
        <div v-if="utmTerm">
          <p class="text-xs text-muted-foreground">Term</p>
          <Badge variant="outline" class="text-xs">{{ utmTerm }}</Badge>
        </div>
      </div>
    </div>

    <!-- Click IDs -->
    <div 
      v-if="clickIds.length > 0" 
      class="p-3 bg-muted/30 rounded-lg space-y-2"
    >
      <div class="flex items-center gap-2 mb-2">
        <MousePointerClick class="h-4 w-4 text-muted-foreground" />
        <p class="text-xs text-muted-foreground font-medium">Click IDs</p>
      </div>
      
      <div class="space-y-1">
        <div 
          v-for="clickId in clickIds" 
          :key="clickId.label" 
          class="flex items-center justify-between text-sm"
        >
          <Badge variant="secondary" class="text-xs">
            {{ clickId.label }}
          </Badge>
          <span class="text-xs font-mono text-muted-foreground truncate max-w-[150px]">
            {{ clickId.value.slice(0, 20) }}...
          </span>
        </div>
      </div>
    </div>

    <!-- No Attribution -->
    <div 
      v-if="!hasAttribution" 
      class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
    >
      <AlertCircle class="h-4 w-4 text-muted-foreground" />
      <div>
        <p class="text-sm text-muted-foreground">Sem dados de atribuição</p>
        <p class="text-xs text-muted-foreground">
          Esta venda não possui rastreamento de origem
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTrackingStore } from '@/stores/tracking'
import { useOriginsStore } from '@/stores/origins'
import { useFormat } from '@/composables/useFormat'
import BrandIcons from '@/components/icons/BrandIcons.vue'
import { 
  Search,
  Mail,
  Globe,
  Share2
} from 'lucide-vue-next'

interface Props {
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const trackingStore = useTrackingStore()
const originsStore = useOriginsStore()
const { formatNumber } = useFormat()

// Emits
const emit = defineEmits<{
  'origin-click': [originId: string]
}>()

// Handlers
const handleOriginClick = (originId: string) => {
  emit('origin-click', originId)
}

// Mapeia origens para ícones específicos
const getOriginIcon = (originName: string) => {
  const name = originName.toLowerCase()
  
  // Ícones de marca oficiais
  if (name.includes('facebook') || name.includes('meta')) return 'meta'
  if (name.includes('instagram')) return 'meta' // Instagram é Meta
  if (name.includes('linkedin')) return 'linkedin'
  if (name.includes('tiktok')) return 'tiktok'
  if (name.includes('whatsapp')) return 'whatsapp'
  if (name.includes('telegram')) return 'telegram'
  if (name.includes('google')) return 'google'
  
  // Ícones lucide genéricos para outros casos
  if (name.includes('email') || name.includes('e-mail')) return 'mail'
  if (name.includes('organic') || name.includes('orgânico')) return 'globe'
  
  // Ícone genérico
  return 'share'
}

// Verifica se o ícone é de marca (usa BrandIcons) ou lucide
const isBrandIcon = (icon: string) => {
  return ['meta', 'whatsapp', 'google', 'tiktok', 'linkedin', 'telegram'].includes(icon)
}

// Mapeia ícones lucide
const getLucideIcon = (icon: string) => {
  const iconMap: Record<string, any> = {
    mail: Mail,
    globe: Globe,
    share: Share2,
    search: Search
  }
  return iconMap[icon] || Share2
}

// Calcula mensagens/links por origem
const originStats = computed(() => {
  const origins = originsStore.origins
  const links = trackingStore.links
  
  return origins.map(origin => {
    // Conta quantas mensagens existem para esta origem
    const messageCount = links.filter(link => link.originId === origin.id).length
    return {
      id: origin.id,
      name: origin.name,
      count: messageCount,
      color: origin.color || '#3b82f6',
      icon: getOriginIcon(origin.name),
    }
  }).sort((a, b) => b.count - a.count) // Ordena por quantidade decrescente
})
</script>

<template>
  <div>
    <!-- Header -->
    <h3 class="section-kicker mb-4">
      Mensagens por origem
    </h3>
    
    <!-- Grid de Cards de Origem (Flexbox sem buracos) -->
    <div class="flex flex-wrap gap-4">
      <!-- Loading State -->
      <template v-if="props.loading">
        <div
          v-for="i in 7"
          :key="i"
          class="origin-card rounded-[14px] border border-border bg-card p-4 space-y-3"
        >
          <div class="h-4 w-4 bg-muted animate-pulse rounded" />
          <div class="h-4 w-20 bg-muted animate-pulse rounded" />
          <div class="h-6 w-16 bg-muted animate-pulse rounded" />
        </div>
      </template>
      
      <!-- Cards de Origem -->
      <div
        v-else
        v-for="origin in originStats"
        :key="origin.id"
        class="origin-card relative overflow-hidden rounded-[14px] border border-border bg-card p-4 transition-all hover:shadow-md cursor-pointer"
        @click="handleOriginClick(origin.id)"
      >
        <!-- Ícone da origem -->
        <BrandIcons
          v-if="isBrandIcon(origin.icon)"
          :name="origin.icon as any"
          class="w-5 h-5 mb-2"
          :style="{ color: origin.color }"
        />
        <component
          v-else
          :is="getLucideIcon(origin.icon)"
          class="w-5 h-5 mb-2"
          :style="{ color: origin.color }"
        />
        
        <!-- Nome da origem -->
        <p class="text-xs font-medium text-muted-foreground mb-1 truncate">
          {{ origin.name }}
        </p>
        
        <!-- Contagem de contatos -->
        <p class="text-2xl font-bold">
          {{ formatNumber(origin.count) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 
  Algoritmo Flexbox Responsivo sem Buracos
  Cards sempre preenchem 100% da largura, mesmo na última linha
  Baseado no DashboardV2ViewNew.vue
*/

.origin-card {
  /* Mobile: 1-2 cards por linha */
  flex: 1 1 calc(50% - 0.5rem);
  min-width: 140px;
  box-sizing: border-box;
}

/* 640px+: tablets - 3-4 cards por linha */
@media (min-width: 640px) {
  .origin-card {
    flex: 1 1 160px;
  }
}

/* 768px+: tablets grandes - 4-5 cards por linha */
@media (min-width: 768px) {
  .origin-card {
    flex: 1 1 150px;
  }
}

/* 1024px+: desktop - 5-7 cards por linha */
@media (min-width: 1024px) {
  .origin-card {
    flex: 1 1 140px;
  }
}

/* 1280px+: desktop grande - 7+ cards por linha */
@media (min-width: 1280px) {
  .origin-card {
    flex: 1 1 140px;
  }
}
</style>

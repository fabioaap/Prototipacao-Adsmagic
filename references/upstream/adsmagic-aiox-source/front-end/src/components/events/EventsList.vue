<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="h-16 bg-muted rounded-lg"></div>
      </div>
    </div>

    <div v-else-if="filteredEvents.length === 0" class="text-center py-12">
      <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Activity class="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 class="section-title-sm mb-2">Nenhum evento encontrado</h3>
      <p class="text-muted-foreground mb-4">
        {{ searchQuery ? 'Tente ajustar sua busca' : 'Não há eventos para exibir' }}
      </p>
    </div>

    <div v-else class="overflow-hidden rounded-[14.4px] border border-border">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Plataforma
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tipo de evento
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nome do contato
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Telefone
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Criado em
              </th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="event in paginatedEvents"
              :key="event.id"
              class="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              tabindex="0"
              @click="emit('eventViewDetails', event)"
              @keydown.enter.prevent="emit('eventViewDetails', event)"
              @keydown.space.prevent="emit('eventViewDetails', event)"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'flex h-8 w-8 items-center justify-center rounded-lg',
                      getPlatformColorClasses(event.platform)
                    ]"
                  >
                    <component
                      v-if="getOfficialPlatformLogo(event.platform)"
                      :is="getOfficialPlatformLogo(event.platform)"
                      :size="16"
                    />
                    <BrandIcons
                      v-else-if="getBrandPlatformName(event.platform)"
                      :name="getBrandPlatformName(event.platform)"
                      class="h-4 w-4"
                    />
                    <component
                      v-else
                      :is="getPlatformIcon(event.platform)"
                      class="h-4 w-4"
                    />
                  </div>
                  <span class="text-sm">
                    {{ getPlatformLabel(event.platform) }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-3 text-sm">
                {{ getEventTypeLabel(event.type) }}
              </td>

              <td class="px-4 py-3 text-sm font-medium">
                {{ getContactName(event) }}
              </td>

              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ getContactPhone(event) }}
              </td>

              <td class="px-4 py-3">
                <Badge :variant="getStatusBadge(event.status).variant">
                  {{ getStatusBadge(event.status).label }}
                </Badge>
              </td>

              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ formatDate(event.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center border-t bg-muted/25 px-4 py-3">
        <button class="flex h-8 w-8 items-center justify-center rounded-control border border-border bg-background text-sm font-medium hover:bg-muted">
          1
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { Activity, Webhook } from 'lucide-vue-next'
import BrandIcons from '@/components/icons/BrandIcons.vue'
import GoogleAdsLogoIcon from '@/components/icons/GoogleAdsLogoIcon.vue'
import MetaAdsLogoIcon from '@/components/icons/MetaAdsLogoIcon.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Event } from '@/types/models'
import { useFormat } from '@/composables/useFormat'

interface Props {
  events: Event[]
  searchQuery?: string
  loading?: boolean
  itemsPerPage?: number
  hasActiveFilters?: boolean
  activeFiltersCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  loading: false,
  itemsPerPage: 20,
  hasActiveFilters: false,
  activeFiltersCount: 0,
})

const emit = defineEmits<{
  eventViewDetails: [event: Event]
  eventRetry: [event: Event]
  export: []
  openFilters: []
}>()

const currentPage = ref(1)
const { formatDate } = useFormat()

const filteredEvents = computed(() => {
  let events = props.events

  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
    events = events.filter((event: Event) => {
      const contactName = getContactName(event).toLowerCase()
      const contactPhone = getContactPhone(event).toLowerCase()

      return contactName.includes(query) || contactPhone.includes(query)
    })
  }

  return events
})

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredEvents.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredEvents.value.length / props.itemsPerPage)
})

const getEventTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    purchase: 'Compra',
    conversion: 'Conversão',
    lead: 'Lead',
    page_view: 'Visualização de Página',
    add_to_cart: 'Adicionar ao Carrinho',
    initiate_checkout: 'Iniciar Checkout',
    contact_created: 'Contato Criado',
    contact_updated: 'Contato Atualizado',
    stage_changed: 'Etapa Alterada',
    sale_completed: 'Venda Concluída',
    sale_lost: 'Venda Perdida',
    link_clicked: 'Link Clicado',
    message_sent: 'Mensagem Enviada',
    integration_sync: 'Sincronização',
  }

  return labelMap[type] || type
}

const getOfficialPlatformLogo = (platform?: string): Component | null => {
  const officialLogoMap: Record<string, Component> = {
    google: GoogleAdsLogoIcon,
    meta: MetaAdsLogoIcon,
  }

  return officialLogoMap[platform || ''] || null
}

const getBrandPlatformName = (platform?: string) => {
  const brandPlatformMap: Record<string, 'whatsapp' | 'meta' | 'google' | 'tiktok' | 'linkedin' | 'telegram'> = {
    whatsapp: 'whatsapp',
    tiktok: 'tiktok',
    linkedin: 'linkedin',
    telegram: 'telegram',
  }

  return brandPlatformMap[platform || ''] || null
}

const getPlatformIcon = (platform?: string) => {
  const iconMap: Record<string, Component> = {
    system: Webhook,
  }

  return iconMap[platform || 'system'] || Webhook
}

const getPlatformLabel = (platform?: string) => {
  const labelMap: Record<string, string> = {
    meta: 'Meta Ads',
    google: 'Google Ads',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    system: 'Sistema',
  }

  return labelMap[platform || 'system'] || 'Sistema'
}

const getPlatformColorClasses = (platform?: string) => {
  const colorMap: Record<string, string> = {
    meta: 'bg-blue-500/10 text-blue-600',
    google: 'bg-blue-500/10 text-blue-600',
    tiktok: 'bg-black/5 text-black dark:bg-white/5 dark:text-white',
    linkedin: 'bg-blue-700/10 text-blue-700',
    whatsapp: 'bg-emerald-500/10 text-emerald-600',
    telegram: 'bg-cyan-500/10 text-cyan-600',
    system: 'bg-primary/10 text-primary',
  }

  return colorMap[platform || 'system'] || 'bg-primary/10 text-primary'
}

const getContactName = (event: Event): string => {
  return event.metadata?.contactName || event.metadata?.contact?.name || event.payload?.name || '-'
}

const getContactPhone = (event: Event): string => {
  return event.metadata?.contactPhone || event.metadata?.contact?.phone || event.payload?.phone || '-'
}

const getStatusBadge = (status: string) => {
  const badgeMap: Record<string, { variant: any; label: string }> = {
    sent: { variant: 'success', label: 'Enviado' },
    pending: { variant: 'warning', label: 'Pendente' },
    failed: { variant: 'destructive', label: 'Falhou' },
    success: { variant: 'success', label: 'Sucesso' },
    error: { variant: 'destructive', label: 'Erro' },
    info: { variant: 'secondary', label: 'Info' },
  }

  return badgeMap[status] || { variant: 'secondary', label: status }
}
</script>

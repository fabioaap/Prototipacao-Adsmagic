<template>
  <Drawer
    :open="open"
    size="xl"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-start gap-3 pr-8">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full"
          :class="getEventIconBg(event?.type)"
        >
          <component
            :is="getEventIcon(event?.type)"
            class="h-5 w-5"
            :class="getEventIconColor(event?.type)"
          />
        </div>
        <div class="min-w-0">
          <h2 class="section-title-sm">
            {{ getEventTypeLabel(event?.type) }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ event?.entityType }} • {{ event?.entityId }}
          </p>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-6 p-6">
        <div class="space-y-4">
          <h3 class="section-kicker">Informações Básicas</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label class="text-xs text-muted-foreground">Status</Label>
              <div class="mt-1">
                <Badge :variant="getStatusBadge(event?.status).variant">
                  <component
                    :is="getStatusIcon(event?.status)"
                    class="mr-1 h-3 w-3"
                  />
                  {{ getStatusBadge(event?.status).label }}
                </Badge>
              </div>
            </div>
            <div>
              <Label class="text-xs text-muted-foreground">Plataforma</Label>
              <div class="mt-1 flex items-center space-x-2">
                <component
                  :is="getPlatformIcon(event?.platform)"
                  class="h-4 w-4 text-muted-foreground"
                />
                <span class="text-sm">{{ getPlatformLabel(event?.platform) }}</span>
              </div>
            </div>
            <div>
              <Label class="text-xs text-muted-foreground">Criado em</Label>
              <div class="mt-1 text-sm">
                {{ event?.createdAt ? formatDate(event.createdAt, { day: '2-digit', month: 'long', year: 'numeric' }) : '-' }}
              </div>
            </div>
            <div v-if="event?.processedAt">
              <Label class="text-xs text-muted-foreground">Processado em</Label>
              <div class="mt-1 text-sm">
                {{ formatDate(event.processedAt, { day: '2-digit', month: 'long', year: 'numeric' }) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="event?.metadata" class="space-y-4">
          <h3 class="section-kicker">Metadata</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div v-if="event.metadata.ip">
              <Label class="text-xs text-muted-foreground">IP</Label>
              <div class="mt-1 text-sm font-mono">{{ event.metadata.ip }}</div>
            </div>
            <div v-if="event.metadata.country">
              <Label class="text-xs text-muted-foreground">País</Label>
              <div class="mt-1 text-sm">{{ event.metadata.country }}</div>
            </div>
            <div v-if="event.metadata.city">
              <Label class="text-xs text-muted-foreground">Cidade</Label>
              <div class="mt-1 text-sm">{{ event.metadata.city }}</div>
            </div>
            <div v-if="event.metadata.device">
              <Label class="text-xs text-muted-foreground">Dispositivo</Label>
              <div class="mt-1 text-sm">{{ event.metadata.device }}</div>
            </div>
            <div v-if="event.metadata.browser">
              <Label class="text-xs text-muted-foreground">Navegador</Label>
              <div class="mt-1 text-sm">{{ event.metadata.browser }}</div>
            </div>
            <div v-if="event.metadata.os">
              <Label class="text-xs text-muted-foreground">Sistema Operacional</Label>
              <div class="mt-1 text-sm">{{ event.metadata.os }}</div>
            </div>
          </div>
          <div v-if="event.metadata.userAgent">
            <Label class="text-xs text-muted-foreground">User Agent</Label>
            <div class="mt-1 break-all rounded bg-muted p-2 text-xs font-mono">
              {{ event.metadata.userAgent }}
            </div>
          </div>
        </div>

        <div v-if="event?.payload" class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="section-kicker">Payload</h3>
            <Button
              variant="outline"
              size="sm"
              @click="copyToClipboard(JSON.stringify(event.payload, null, 2))"
            >
              <Copy class="mr-1 h-4 w-4" />
              Copiar
            </Button>
          </div>
          <div class="rounded-lg bg-muted p-4">
            <pre class="overflow-x-auto text-xs"><code>{{ JSON.stringify(event.payload, null, 2) }}</code></pre>
          </div>
        </div>

        <div v-if="event?.response" class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="section-kicker">Response</h3>
            <Button
              variant="outline"
              size="sm"
              @click="copyToClipboard(JSON.stringify(event.response, null, 2))"
            >
              <Copy class="mr-1 h-4 w-4" />
              Copiar
            </Button>
          </div>
          <div class="rounded-lg bg-muted p-4">
            <pre class="overflow-x-auto text-xs"><code>{{ JSON.stringify(event.response, null, 2) }}</code></pre>
          </div>
        </div>

        <div v-if="event?.error" class="space-y-4">
          <h3 class="section-kicker">Detalhes do Erro</h3>
          <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <div class="flex items-start space-x-2">
              <X class="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
              <div class="flex-1">
                <p class="text-sm font-medium text-destructive">Erro</p>
                <p class="mt-1 text-sm text-destructive">{{ event.error }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="(event?.retryCount ?? 0) > 0" class="space-y-4">
          <h3 class="section-kicker">Tentativas de Reenvio</h3>
          <div class="rounded-lg border border-warning/20 bg-warning/10 p-4">
            <div class="flex items-center space-x-2">
              <RefreshCw class="h-4 w-4 text-warning" />
              <span class="text-sm text-warning">
                {{ event?.retryCount ?? 0 }} tentativa(s) de reenvio
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-xs text-muted-foreground">
          ID: {{ event?.id }}
        </div>
        <div class="flex items-center justify-end gap-2">
          <Button
            v-if="event?.status === 'failed' || event?.status === 'cancelled'"
            :disabled="loading"
            @click="handleRetry"
          >
            <RefreshCw class="mr-1 h-4 w-4" />
            Reenviar
          </Button>
          <Button
            variant="outline"
            @click="emit('update:open', false)"
          >
            Fechar
          </Button>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import {
  X,
  Copy,
  RefreshCw,
  UserPlus,
  UserCog,
  ArrowRight,
  CheckCircle,
  XCircle,
  MousePointer,
  MessageSquare,
  Facebook,
  Chrome,
  Music,
  Linkedin,
  Webhook,
  Check,
  Clock,
  Info
} from '@/composables/useIcons'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Component } from 'vue'
import type { BadgeVariant } from '@/components/ui/Badge.vue'
import type { Event } from '@/types/models'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/components/ui/toast/use-toast'

interface Props {
  open: boolean
  event: Event | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  retry: [event: Event]
}>()

const { formatDate } = useFormat()
const { toast } = useToast()

const getEventIcon = (type?: string) => {
  const iconMap: Record<string, Component> = {
    contact_created: UserPlus,
    contact_updated: UserCog,
    stage_changed: ArrowRight,
    sale_completed: CheckCircle,
    sale_lost: XCircle,
    link_clicked: MousePointer,
    message_sent: MessageSquare,
    integration_sync: RefreshCw
  }
  return iconMap[type || ''] || UserPlus
}

const getEventIconBg = (type?: string) => {
  const bgMap: Record<string, string> = {
    contact_created: 'bg-blue-100 dark:bg-blue-900/20',
    contact_updated: 'bg-purple-100 dark:bg-purple-900/20',
    stage_changed: 'bg-orange-100 dark:bg-orange-900/20',
    sale_completed: 'bg-green-100 dark:bg-green-900/20',
    sale_lost: 'bg-red-100 dark:bg-red-900/20',
    link_clicked: 'bg-cyan-100 dark:bg-cyan-900/20',
    message_sent: 'bg-indigo-100 dark:bg-indigo-900/20',
    integration_sync: 'bg-gray-100 dark:bg-gray-900/20'
  }
  return bgMap[type || ''] || 'bg-gray-100 dark:bg-gray-900/20'
}

const getEventIconColor = (type?: string) => {
  const colorMap: Record<string, string> = {
    contact_created: 'text-blue-600 dark:text-blue-400',
    contact_updated: 'text-purple-600 dark:text-purple-400',
    stage_changed: 'text-orange-600 dark:text-orange-400',
    sale_completed: 'text-green-600 dark:text-green-400',
    sale_lost: 'text-red-600 dark:text-red-400',
    link_clicked: 'text-cyan-600 dark:text-cyan-400',
    message_sent: 'text-indigo-600 dark:text-indigo-400',
    integration_sync: 'text-gray-600 dark:text-gray-400'
  }
  return colorMap[type || ''] || 'text-gray-600 dark:text-gray-400'
}

const getEventTypeLabel = (type?: string) => {
  const labelMap: Record<string, string> = {
    contact_created: 'Contato Criado',
    contact_updated: 'Contato Atualizado',
    stage_changed: 'Etapa Alterada',
    sale_completed: 'Venda Concluída',
    sale_lost: 'Venda Perdida',
    link_clicked: 'Link Clicado',
    message_sent: 'Mensagem Enviada',
    integration_sync: 'Sincronização'
  }
  return labelMap[type || ''] || type || 'Evento'
}

const getPlatformIcon = (platform?: string) => {
  const iconMap: Record<string, Component> = {
    meta: Facebook,
    google: Chrome,
    tiktok: Music,
    linkedin: Linkedin,
    whatsapp: MessageSquare,
    system: Webhook
  }
  return iconMap[platform || 'system'] || Webhook
}

const getPlatformLabel = (platform?: string) => {
  const labelMap: Record<string, string> = {
    meta: 'Meta',
    google: 'Google',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    system: 'Sistema'
  }
  return labelMap[platform || 'system'] || 'Sistema'
}

const getStatusIcon = (status?: string) => {
  const iconMap: Record<string, Component> = {
    success: Check,
    pending: Clock,
    failed: XCircle,
    info: Info
  }
  return iconMap[status || ''] || Info
}

const getStatusBadge = (status?: string) => {
  const badgeMap: Record<string, { variant: BadgeVariant; label: string }> = {
    success: { variant: 'success', label: 'Sucesso' },
    pending: { variant: 'warning', label: 'Pendente' },
    failed: { variant: 'destructive', label: 'Falhou' },
    info: { variant: 'secondary', label: 'Info' }
  }
  return badgeMap[status || ''] || { variant: 'secondary', label: status || 'Desconhecido' }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast({
      title: 'Copiado!',
      description: 'Conteúdo copiado para a área de transferência'
    })
  } catch {
    toast({
      title: 'Erro',
      description: 'Não foi possível copiar o conteúdo',
      variant: 'destructive'
    })
  }
}

const handleRetry = () => {
  if (props.event) {
    emit('retry', props.event)
  }
}
</script>
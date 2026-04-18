<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell, Info, CheckCircle2, AlertTriangle, AlertCircle } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    type: 'success',
    title: 'Nova venda registrada',
    message: 'Contato João Silva realizou uma compra de R$ 1.250,00',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 2,
    type: 'info',
    title: 'Meta atualizada',
    message: 'A meta de vendas do mês foi alterada para R$ 50.000,00',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 3,
    type: 'success',
    title: 'Integração conectada',
    message: 'Sua conta Meta Ads foi conectada com sucesso',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 4,
    type: 'warning',
    title: 'Atenção necessária',
    message: 'Sua campanha está próxima do limite de orçamento',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 5,
    type: 'error',
    title: 'Erro na sincronização',
    message: 'Não foi possível sincronizar dados com Meta Ads',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
])

const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  return `${diffDays}d atrás`
}

const getNotificationIcon = (type: NotificationType) => {
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  }
  return icons[type]
}

const getNotificationColor = (type: NotificationType) => {
  const colors = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  }
  return colors[type]
}
</script>

<template>
  <DropdownMenu align="right">
    <template #trigger>
      <button
        type="button"
        class="h-[var(--sym-control-height-md)] w-[var(--sym-control-height-md)] rounded-control border border-border flex items-center justify-center text-foreground font-medium transition-colors hover:bg-accent/50 cursor-pointer"
        aria-label="Notificações"
        data-testid="notification-trigger"
      >
        <Bell :size="20" />
      </button>
    </template>
    
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b" data-testid="notification-panel">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold text-foreground">Notificações</h3>
        <span
          data-testid="unread-count"
          v-if="unreadCount > 0"
          class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground"
        >
          {{ unreadCount }}
        </span>
      </div>
      <Button
        v-if="unreadCount > 0"
        variant="ghost"
        size="sm"
        @click="markAllAsRead"
        data-testid="notification-mark-all"
        class="h-auto py-1 px-2 text-xs"
      >
        Marcar todas como lidas
      </Button>
    </div>
    
    <!-- Notifications List -->
    <div class="max-h-[400px] min-w-[380px] overflow-y-auto">
      <button
        v-for="notification in notifications"
        :key="notification.id"
        data-testid="notification-item"
        class="flex items-start gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
        :class="{ 'bg-accent/30': !notification.read }"
        type="button"
      >
        <!-- Icon -->
        <component
          :is="getNotificationIcon(notification.type)"
          :class="`w-5 h-5 flex-shrink-0 mt-0.5 ${getNotificationColor(notification.type)}`"
        />
        
        <!-- Content -->
        <div class="flex-1 min-w-0 space-y-1">
          <p 
            class="text-sm text-foreground"
            :class="!notification.read ? 'font-medium' : 'font-normal'"
          >
            {{ notification.title }}
          </p>
          <p class="text-xs text-muted-foreground line-clamp-2">
            {{ notification.message }}
          </p>
          <span class="text-xs text-muted-foreground">
            {{ getRelativeTime(notification.createdAt) }}
          </span>
        </div>
      </button>
      
      <div v-if="notifications.length === 0" class="px-4 py-8 text-center">
        <Bell class="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p class="text-sm text-muted-foreground">Nenhuma notificação</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="border-t">
      <Button
        variant="ghost"
        class="w-full justify-center text-sm rounded-none"
      >
        Ver todas as notificações
      </Button>
    </div>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell, Check, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge.vue'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

interface Props {
  notifications?: Notification[]
}

const props = withDefaults(defineProps<Props>(), {
  notifications: () => [],
})

const emit = defineEmits<{
  markAsRead: [id: string]
  markAllAsRead: []
  remove: [id: string]
}>()

const showDropdown = ref(false)

const unreadCount = computed(() => {
  return props.notifications.filter(n => !n.read).length
})

const sortedNotifications = computed(() => {
  return [...props.notifications].sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleMarkAsRead = (id: string) => {
  emit('markAsRead', id)
}

const handleMarkAllAsRead = () => {
  emit('markAllAsRead')
  showDropdown.value = false
}

const handleRemove = (id: string) => {
  emit('remove', id)
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return Check
    case 'error':
    case 'warning':
      return X
    default:
      return Bell
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}
</script>

<template>
  <div class="relative">
    <!-- Bell Icon with Badge -->
    <button
      type="button"
      class="relative rounded-control p-2 hover:bg-accent transition-colors"
      @click="toggleDropdown"
      aria-label="Notificações"
    >
      <Bell class="h-5 w-5" />
      <Badge
        v-if="unreadCount > 0"
        variant="solid"
        color="destructive"
        class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </Badge>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-80 rounded-control border bg-card shadow-lg z-50"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b px-4 py-3">
          <h3 class="section-kicker">Notificações</h3>
          <button
            v-if="unreadCount > 0"
            type="button"
            class="text-xs text-primary hover:underline"
            @click="handleMarkAllAsRead"
          >
            Marcar todas como lidas
          </button>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="sortedNotifications.length === 0" class="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>

          <div
            v-for="notification in sortedNotifications"
            :key="notification.id"
            :class="cn(
              'border-b last:border-0 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer',
              !notification.read && 'bg-accent/20'
            )"
            @click="handleMarkAsRead(notification.id)"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div
                :class="cn(
                  'mt-1 rounded-full p-1.5',
                  notification.type === 'success' && 'bg-success/10 text-success',
                  notification.type === 'error' && 'bg-destructive/10 text-destructive',
                  notification.type === 'warning' && 'bg-warning/10 text-warning',
                  notification.type === 'info' && 'bg-info/10 text-info'
                )"
              >
                <component :is="getNotificationIcon(notification.type)" class="h-4 w-4" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="section-kicker">{{ notification.title }}</h4>
                  <span class="text-xs text-muted-foreground whitespace-nowrap">
                    {{ formatTime(notification.createdAt) }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mt-1">{{ notification.message }}</p>
              </div>

              <!-- Remove Button -->
              <button
                type="button"
                class="mt-1 rounded-control p-1 hover:bg-accent transition-colors"
                @click.stop="handleRemove(notification.id)"
                aria-label="Remover notificação"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Footer (optional) -->
        <div v-if="sortedNotifications.length > 0" class="border-t px-4 py-2 text-center">
          <router-link
            to="/notifications"
            class="text-xs text-primary hover:underline"
            @click="showDropdown = false"
          >
            Ver todas as notificações
          </router-link>
        </div>
      </div>
    </Transition>

    <!-- Overlay -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="showDropdown = false"
    />
  </div>
</template>

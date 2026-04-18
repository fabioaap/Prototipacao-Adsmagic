<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'

interface Props {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showSearch: true,
  showNotifications: true,
})

const emit = defineEmits<{
  search: [query: string]
  notificationMarkAsRead: [id: string]
  notificationMarkAllAsRead: []
  notificationRemove: [id: string]
}>()

// Forward events from AppHeader
const handleSearch = (query: string) => {
  emit('search', query)
}

const handleNotificationMarkAsRead = (id: string) => {
  emit('notificationMarkAsRead', id)
}

const handleNotificationMarkAllAsRead = () => {
  emit('notificationMarkAllAsRead')
}

const handleNotificationRemove = (id: string) => {
  emit('notificationRemove', id)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-30">
      <AppHeader
        :title="props.title"
        :show-search="props.showSearch"
        :show-notifications="props.showNotifications"
        @search="handleSearch"
        @notification-mark-as-read="handleNotificationMarkAsRead"
        @notification-mark-all-as-read="handleNotificationMarkAllAsRead"
        @notification-remove="handleNotificationRemove"
      />
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<style scoped>
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Menu, X } from 'lucide-vue-next'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import UserMenu from '@/components/ui/UserMenu.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import PeriodFilter from '@/components/ui/PeriodFilter.vue'
import AppNotifications from './AppNotifications.vue'
import WhatsAppStatusIndicator from './WhatsAppStatusIndicator.vue'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

interface Props {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
  showSidebarToggle?: boolean
  isSidebarOpen?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  showSearch: true,
  showNotifications: true,
  showSidebarToggle: false,
  isSidebarOpen: false,
})

const emit = defineEmits<{
  search: [query: string]
  notificationMarkAsRead: [id: string]
  notificationMarkAllAsRead: []
  notificationRemove: [id: string]
  periodChange: [period: any, comparison: boolean]
  toggleSidebar: []
}>()

const showSearchBar = ref(false)
const searchQuery = ref('')
const selectedPeriod = ref('30d')
const enableComparison = ref(false)

// Mock notifications (in real app, would come from store/API)
const notifications = ref<Notification[]>([
  {
    id: '1',
    title: 'Nova venda realizada',
    message: 'João Silva - R$ 1.500,00',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
  },
  {
    id: '2',
    title: 'Novo contato adicionado',
    message: 'Maria Santos foi adicionada aos contatos',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
  },
  {
    id: '3',
    title: 'Erro ao enviar evento',
    message: 'Falha ao enviar evento para Meta Ads',
    type: 'error',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
])

const toggleSearch = () => {
  showSearchBar.value = !showSearchBar.value
}

const handleSearch = (query: string) => {
  emit('search', query)
}

const handleNotificationMarkAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
  emit('notificationMarkAsRead', id)
}

const handleNotificationMarkAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  emit('notificationMarkAllAsRead')
}

const handleNotificationRemove = (id: string) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
  emit('notificationRemove', id)
}

const handlePeriodChange = (period: any, comparison: boolean) => {
  emit('periodChange', period, comparison)
}
</script>

<template>
  <header class="sticky top-0 z-40 h-14 border-b bg-background/80 backdrop-blur">
    <div class="h-full flex items-center px-4 gap-4">
      <!-- Sidebar Toggle (mobile) + Title -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <button
          v-if="showSidebarToggle"
          type="button"
          class="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-control border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex-shrink-0"
          :aria-expanded="isSidebarOpen"
          aria-controls="app-sidebar"
          @click="emit('toggleSidebar')"
        >
          <Menu v-if="!isSidebarOpen" class="h-4 w-4" />
          <X v-else class="h-4 w-4" />
        </button>

        <div class="flex-1 min-w-0">
          <h1 v-if="title" class="section-title-sm tracking-tight truncate">{{ title }}</h1>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- WhatsApp Status -->
        <WhatsAppStatusIndicator />

        <!-- Period Filter -->
        <PeriodFilter
          v-model="selectedPeriod"
          v-model:enable-comparison="enableComparison"
          @change="handlePeriodChange"
        />

        <!-- Search Button (Mobile) -->
        <button
          v-if="showSearch"
          class="lg:hidden rounded-control p-2 hover:bg-accent transition-colors"
          @click="toggleSearch"
          aria-label="Buscar"
        >
          <Search class="h-5 w-5" />
        </button>

        <!-- Search Bar (Desktop) -->
        <div v-if="showSearch" class="hidden lg:block">
          <SearchBar
            v-model="searchQuery"
            placeholder="Buscar... (Ctrl+K)"
            @search="handleSearch"
          />
        </div>

        <!-- Language Selector -->
        <LanguageSelector />

        <!-- Notifications -->
        <AppNotifications
          v-if="showNotifications"
          :notifications="notifications"
          @mark-as-read="handleNotificationMarkAsRead"
          @mark-all-as-read="handleNotificationMarkAllAsRead"
          @remove="handleNotificationRemove"
        />

        <!-- User Menu -->
        <UserMenu />
      </div>
    </div>

    <!-- Mobile Search Bar (Expanded) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div v-if="showSearchBar" class="lg:hidden border-t px-4 py-2">
        <SearchBar
          v-model="searchQuery"
          placeholder="Buscar..."
          @search="handleSearch"
        />
      </div>
    </Transition>
  </header>
</template>

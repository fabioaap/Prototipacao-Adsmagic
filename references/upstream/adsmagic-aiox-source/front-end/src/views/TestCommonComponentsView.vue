<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppNotifications from '@/components/layout/AppNotifications.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

// Notification examples
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
    title: 'Atenção: Limite de créditos',
    message: 'Você está próximo do limite mensal',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
  {
    id: '4',
    title: 'Erro ao enviar evento',
    message: 'Falha ao enviar evento para Meta Ads',
    type: 'error',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '5',
    title: 'Campanha pausada',
    message: 'Campanha "Black Friday" foi pausada',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
])

// Event handlers
const handleSearch = (query: string) => {
  console.log('Search query:', query)
}

const handleNotificationMarkAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
  console.log('Mark as read:', id)
}

const handleNotificationMarkAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  console.log('Mark all as read')
}

const handleNotificationRemove = (id: string) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
  console.log('Remove notification:', id)
}

const addNotification = () => {
  const types: Array<'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error']
  const randomType = types[Math.floor(Math.random() * types.length)]

  notifications.value.unshift({
    id: Date.now().toString(),
    title: 'Nova notificação',
    message: 'Esta é uma notificação de teste',
    type: randomType as 'info' | 'success' | 'warning' | 'error',
    read: false,
    createdAt: new Date(),
  })
}

const clearAllNotifications = () => {
  notifications.value = []
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header Example -->
    <AppHeader
      title="Test Common Components"
      :show-search="true"
      :show-notifications="true"
      @search="handleSearch"
      @notification-mark-as-read="handleNotificationMarkAsRead"
      @notification-mark-all-as-read="handleNotificationMarkAllAsRead"
      @notification-remove="handleNotificationRemove"
    />

    <div class="container mx-auto p-6 space-y-8">
      <!-- Page Title -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight mb-2">Common Components Test</h1>
        <p class="text-muted-foreground">
          Testes interativos dos componentes comuns (Session 2.2)
        </p>
      </div>

      <!-- AppNotifications Tests -->
      <section>
        <h2 class="text-2xl font-semibold mb-4">AppNotifications</h2>

        <div class="space-y-6">
          <!-- Standalone notifications component -->
          <Card class="p-6">
            <h3 class="font-medium mb-3">Standalone Notifications Component</h3>
            <div class="flex items-center gap-4">
              <AppNotifications
                :notifications="notifications"
                @mark-as-read="handleNotificationMarkAsRead"
                @mark-all-as-read="handleNotificationMarkAllAsRead"
                @remove="handleNotificationRemove"
              />
              <div class="flex gap-2">
                <Button @click="addNotification" size="sm">
                  Add Notification
                </Button>
                <Button @click="clearAllNotifications" size="sm" variant="outline">
                  Clear All
                </Button>
              </div>
            </div>
            <p class="text-sm text-muted-foreground mt-3">
              Clique no sino para ver as notificações. Teste as funcionalidades de marcar como lido e remover.
            </p>
          </Card>

          <!-- Notification states -->
          <Card class="p-6">
            <h3 class="font-medium mb-3">Notification States</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium mb-2">Unread Notifications:</p>
                <p class="text-2xl font-bold text-primary">
                  {{ notifications.filter(n => !n.read).length }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium mb-2">Total Notifications:</p>
                <p class="text-2xl font-bold">
                  {{ notifications.length }}
                </p>
              </div>
            </div>
          </Card>

          <!-- Notification types -->
          <Card class="p-6">
            <h3 class="font-medium mb-3">Notification Types</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-info"></div>
                <span class="text-sm">Info: {{ notifications.filter(n => n.type === 'info').length }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-success"></div>
                <span class="text-sm">Success: {{ notifications.filter(n => n.type === 'success').length }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-warning"></div>
                <span class="text-sm">Warning: {{ notifications.filter(n => n.type === 'warning').length }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-destructive"></div>
                <span class="text-sm">Error: {{ notifications.filter(n => n.type === 'error').length }}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <!-- AppHeader Integration -->
      <section>
        <h2 class="text-2xl font-semibold mb-4">AppHeader Integration</h2>

        <Card class="p-6">
          <h3 class="font-medium mb-3">Header Features</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium mb-2">Features Integrated:</p>
              <ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>SearchBar (desktop inline, mobile toggle)</li>
                <li>LanguageSelector</li>
                <li>AppNotifications with badge</li>
                <li>UserMenu</li>
                <li>Responsive layout</li>
                <li>Sticky positioning with backdrop blur</li>
              </ul>
            </div>
            <div>
              <p class="text-sm font-medium mb-2">Props Available:</p>
              <ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><code>title</code>: Header title</li>
                <li><code>showSearch</code>: Show/hide search bar</li>
                <li><code>showNotifications</code>: Show/hide notifications</li>
              </ul>
            </div>
            <div>
              <p class="text-sm font-medium mb-2">Events Emitted:</p>
              <ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><code>@search</code>: Search query</li>
                <li><code>@notification-mark-as-read</code>: Notification ID</li>
                <li><code>@notification-mark-all-as-read</code>: Mark all</li>
                <li><code>@notification-remove</code>: Notification ID</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <!-- AppFooter Preview -->
      <section>
        <h2 class="text-2xl font-semibold mb-4">AppFooter Preview</h2>

        <Card class="p-6">
          <h3 class="font-medium mb-3">Footer Component</h3>
          <div class="border rounded-md overflow-hidden">
            <AppFooter :show-links="true" company-name="AdsMagic" />
          </div>
          <p class="text-sm text-muted-foreground mt-3">
            Footer com copyright dinâmico e links de navegação
          </p>
        </Card>

        <Card class="p-6 mt-6">
          <h3 class="font-medium mb-3">Footer without links</h3>
          <div class="border rounded-md overflow-hidden">
            <AppFooter :show-links="false" company-name="My Company" />
          </div>
          <p class="text-sm text-muted-foreground mt-3">
            Footer minimalista sem links
          </p>
        </Card>
      </section>

      <!-- Usage Examples -->
      <section>
        <h2 class="text-2xl font-semibold mb-4">Usage Examples</h2>

        <Card class="p-6">
          <h3 class="font-medium mb-3">Code Examples</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium mb-2">AppHeader:</p>
              <pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>&lt;AppHeader
  title="Dashboard"
  :show-search="true"
  :show-notifications="true"
  @search="handleSearch"
  @notification-mark-as-read="handleMarkAsRead"
/&gt;</code></pre>
            </div>

            <div>
              <p class="text-sm font-medium mb-2">AppNotifications:</p>
              <pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>&lt;AppNotifications
  :notifications="notifications"
  @mark-as-read="handleMarkAsRead"
  @mark-all-as-read="handleMarkAllAsRead"
  @remove="handleRemove"
/&gt;</code></pre>
            </div>

            <div>
              <p class="text-sm font-medium mb-2">AppFooter:</p>
              <pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>&lt;AppFooter
  :show-links="true"
  company-name="Your Company"
/&gt;</code></pre>
            </div>
          </div>
        </Card>
      </section>
    </div>

    <!-- Footer at bottom -->
    <AppFooter class="mt-12" />
  </div>
</template>

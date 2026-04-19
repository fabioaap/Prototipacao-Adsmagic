<template>
  <DashboardSection
    title="Webhooks Customizáveis"
    description="Configure webhooks para enviar dados automaticamente para Zapier, Make, n8n e outros serviços"
    variant="bordered"
  >
    <div class="space-y-6">
      <!-- Header com botão de adicionar -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Badge variant="secondary">
            {{ webhooks.length }} {{ webhooks.length === 1 ? 'webhook' : 'webhooks' }}
          </Badge>
          <Badge v-if="activeWebhooksCount > 0" variant="success">
            {{ activeWebhooksCount }} {{ activeWebhooksCount === 1 ? 'ativo' : 'ativos' }}
          </Badge>
        </div>
        <Button @click="handleAddWebhook" :disabled="loading">
          <Plus class="h-4 w-4 mr-2" />
          Adicionar Webhook
        </Button>
      </div>

      <!-- Lista de webhooks -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <div v-else-if="webhooks.length === 0" class="text-center py-12 border-2 border-dashed rounded-lg">
        <Webhook class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="section-title-sm mb-2">Nenhum webhook configurado</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Configure webhooks para integrar com Zapier, Make, n8n e outros serviços de automação.
        </p>
        <Button @click="handleAddWebhook">
          <Plus class="h-4 w-4 mr-2" />
          Criar primeiro webhook
        </Button>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="webhook in webhooks"
          :key="webhook.id"
          class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4">
              <!-- Ícone do serviço -->
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="getServiceBgColor(webhook.service)"
              >
                <component
                  :is="getServiceIcon(webhook.service)"
                  class="h-5 w-5"
                  :class="getServiceIconColor(webhook.service)"
                />
              </div>

              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="section-title-sm">{{ webhook.name }}</h4>
                  <Badge :variant="webhook.isActive ? 'success' : 'secondary'">
                    {{ webhook.isActive ? 'Ativo' : 'Inativo' }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ getServiceLabel(webhook.service) }}
                </p>
                <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <Activity class="h-3 w-3" />
                    {{ webhook.triggersCount }} {{ webhook.triggersCount === 1 ? 'trigger' : 'triggers' }}
                  </span>
                  <span v-if="webhook.lastTriggeredAt" class="flex items-center gap-1">
                    <Clock class="h-3 w-3" />
                    Último: {{ formatDate(webhook.lastTriggeredAt) }}
                  </span>
                  <span v-if="webhook.failureRate > 0" class="flex items-center gap-1 text-destructive">
                    <AlertTriangle class="h-3 w-3" />
                    {{ webhook.failureRate }}% falhas
                  </span>
                </div>
              </div>
            </div>

            <!-- Ações -->
            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                @click="handleTestWebhook(webhook)"
                :disabled="testingWebhookId === webhook.id"
              >
                <Loader2 v-if="testingWebhookId === webhook.id" class="h-4 w-4 animate-spin" />
                <PlayCircle v-else class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="handleEditWebhook(webhook)">
                <Pencil class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="handleToggleWebhook(webhook)">
                <ToggleLeft v-if="webhook.isActive" class="h-4 w-4" />
                <ToggleRight v-else class="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="sm" @click="handleDeleteWebhook(webhook)">
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <!-- Eventos configurados -->
          <div class="mt-4 pt-4 border-t">
            <p class="text-xs font-medium text-muted-foreground mb-2">Eventos monitorados:</p>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="event in webhook.events"
                :key="event"
                variant="outline"
                class="text-xs"
              >
                {{ getEventLabel(event) }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Adicionar/Editar Webhook -->
    <Modal
      v-model:open="isModalOpen"
      :title="editingWebhook ? 'Editar Webhook' : 'Novo Webhook'"
      description="Configure a URL e os eventos que acionarão este webhook."
      size="lg"
    >
      <template #content>
        <div class="max-h-[70vh] overflow-y-auto">
          <form id="webhook-form" @submit.prevent="handleSaveWebhook" class="space-y-4">
          <!-- Nome -->
          <div class="space-y-2">
            <Label for="webhook-name">Nome do Webhook</Label>
            <Input
              id="webhook-name"
              v-model="formData.name"
              placeholder="Ex: Notificar Zapier sobre novas vendas"
              required
            />
          </div>

          <!-- Serviço -->
          <div class="space-y-2">
            <Label>Serviço de Destino</Label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="service in availableServices"
                :key="service.id"
                type="button"
                class="flex flex-col items-center gap-2 p-3 border rounded-lg transition-colors"
                :class="formData.service === service.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'"
                @click="formData.service = service.id"
              >
                <component
                  :is="service.icon"
                  class="h-6 w-6"
                  :class="formData.service === service.id ? 'text-primary' : 'text-muted-foreground'"
                />
                <span class="text-xs font-medium">{{ service.label }}</span>
              </button>
            </div>
          </div>

          <!-- URL -->
          <div class="space-y-2">
            <Label for="webhook-url">URL do Webhook</Label>
            <Input
              id="webhook-url"
              v-model="formData.url"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              required
            />
            <p class="text-xs text-muted-foreground">
              Cole a URL do webhook fornecida pelo serviço de automação.
            </p>
          </div>

          <!-- Eventos -->
          <div class="space-y-2">
            <Label>Eventos que acionam o webhook</Label>
            <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              <label
                v-for="event in availableEvents"
                :key="event.id"
                class="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  :checked="formData.events.includes(event.id)"
                  @update:checked="toggleEvent(event.id)"
                />
                <span class="text-sm">{{ event.label }}</span>
              </label>
            </div>
          </div>

          <!-- Headers customizados -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Headers Customizados (opcional)</Label>
              <Button type="button" variant="ghost" size="sm" @click="addHeader">
                <Plus class="h-4 w-4" />
              </Button>
            </div>
            <div v-if="formData.headers.length > 0" class="space-y-2">
              <div
                v-for="(header, index) in formData.headers"
                :key="index"
                class="flex items-center gap-2"
              >
                <Input
                  v-model="header.key"
                  placeholder="Header Key"
                  class="flex-1"
                />
                <Input
                  v-model="header.value"
                  placeholder="Header Value"
                  class="flex-1"
                />
                <Button type="button" variant="ghost" size="sm" @click="removeHeader(index)">
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Ativo -->
          <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p class="font-medium">Webhook Ativo</p>
              <p class="text-sm text-muted-foreground">
                Desative para pausar temporariamente o envio de dados.
              </p>
            </div>
            <Switch v-model:checked="formData.isActive" />
          </div>

          </form>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" @click="isModalOpen = false">
            Cancelar
          </Button>
          <Button type="submit" form="webhook-form" :disabled="isSaving">
            <Loader2 v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
            {{ editingWebhook ? 'Salvar Alterações' : 'Criar Webhook' }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Modal de Confirmação de Exclusão -->
    <Modal
      v-model:open="isDeleteModalOpen"
      title="Excluir Webhook"
      :description="`Tem certeza que deseja excluir o webhook \"${webhookToDelete?.name ?? ''}\"? Esta ação não pode ser desfeita.`"
      size="md"
    >
      <template #footer>
        <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" @click="isDeleteModalOpen = false">
            Cancelar
          </Button>
          <Button variant="destructive" @click="confirmDeleteWebhook" :disabled="isDeleting">
            <Loader2 v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
            Excluir
          </Button>
        </div>
      </template>
    </Modal>
  </DashboardSection>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Webhook,
  Loader2,
  PlayCircle,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Activity,
  Clock,
  AlertTriangle,
  X,
  Zap,
  Link2,
  Code2,
  Globe
} from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'
import DashboardSection from '@/components/ui/DashboardSection.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Switch from '@/components/ui/Switch.vue'
import Modal from '@/components/ui/Modal.vue'

// ============================================================================
// TYPES
// ============================================================================

interface WebhookHeader {
  key: string
  value: string
}

interface CustomWebhook {
  id: string
  name: string
  url: string
  service: 'zapier' | 'make' | 'n8n' | 'custom'
  events: string[]
  headers: WebhookHeader[]
  isActive: boolean
  triggersCount: number
  lastTriggeredAt: string | null
  failureRate: number
  createdAt: string
  updatedAt: string
}

interface WebhookFormData {
  name: string
  url: string
  service: 'zapier' | 'make' | 'n8n' | 'custom'
  events: string[]
  headers: WebhookHeader[]
  isActive: boolean
}

// ============================================================================
// PROPS & EMITS
// ============================================================================

interface Props {
  loading?: boolean
}

defineProps<Props>()

// ============================================================================
// STORES
// ============================================================================

const toast = useToastStore()

// ============================================================================
// STATE
// ============================================================================

const webhooks = ref<CustomWebhook[]>([
  // Mock data
  {
    id: 'wh-1',
    name: 'Zapier - Novas Vendas',
    url: 'https://hooks.zapier.com/hooks/catch/12345/abcdef',
    service: 'zapier',
    events: ['sale_created', 'sale_completed'],
    headers: [],
    isActive: true,
    triggersCount: 156,
    lastTriggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    failureRate: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'wh-2',
    name: 'Make - Novos Contatos',
    url: 'https://hook.make.com/abcdef123456',
    service: 'make',
    events: ['contact_created', 'contact_stage_changed'],
    headers: [{ key: 'X-Custom-Header', value: 'my-value' }],
    isActive: true,
    triggersCount: 342,
    lastTriggeredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    failureRate: 2.3,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'wh-3',
    name: 'n8n - Eventos de Tracking',
    url: 'https://n8n.myserver.com/webhook/tracking',
    service: 'n8n',
    events: ['event_page_view', 'event_conversion'],
    headers: [],
    isActive: false,
    triggersCount: 89,
    lastTriggeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    failureRate: 0,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
])

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingWebhook = ref<CustomWebhook | null>(null)
const webhookToDelete = ref<CustomWebhook | null>(null)
const testingWebhookId = ref<string | null>(null)
const isSaving = ref(false)
const isDeleting = ref(false)

const formData = ref<WebhookFormData>({
  name: '',
  url: '',
  service: 'zapier',
  events: [],
  headers: [],
  isActive: true
})

// ============================================================================
// COMPUTED
// ============================================================================

const activeWebhooksCount = computed(() => 
  webhooks.value.filter(w => w.isActive).length
)

// ============================================================================
// SERVICES
// ============================================================================

const availableServices = [
  { id: 'zapier' as const, label: 'Zapier', icon: Zap },
  { id: 'make' as const, label: 'Make', icon: Link2 },
  { id: 'n8n' as const, label: 'n8n', icon: Code2 },
  { id: 'custom' as const, label: 'Custom', icon: Globe }
]

const availableEvents = [
  { id: 'contact_created', label: 'Contato Criado' },
  { id: 'contact_updated', label: 'Contato Atualizado' },
  { id: 'contact_stage_changed', label: 'Estágio Alterado' },
  { id: 'contact_deleted', label: 'Contato Excluído' },
  { id: 'sale_created', label: 'Venda Criada' },
  { id: 'sale_completed', label: 'Venda Concluída' },
  { id: 'sale_cancelled', label: 'Venda Cancelada' },
  { id: 'event_page_view', label: 'Visualização de Página' },
  { id: 'event_conversion', label: 'Conversão' },
  { id: 'event_click', label: 'Clique em Link' },
  { id: 'integration_connected', label: 'Integração Conectada' },
  { id: 'integration_error', label: 'Erro de Integração' }
]

// ============================================================================
// HELPERS
// ============================================================================

function getServiceIcon(service: string) {
  const icons: Record<string, typeof Zap> = {
    zapier: Zap,
    make: Link2,
    n8n: Code2,
    custom: Globe
  }
  return icons[service] || Globe
}

function getServiceLabel(service: string) {
  const labels: Record<string, string> = {
    zapier: 'Zapier',
    make: 'Make (Integromat)',
    n8n: 'n8n',
    custom: 'Webhook Customizado'
  }
  return labels[service] || 'Webhook'
}

function getServiceBgColor(service: string) {
  const colors: Record<string, string> = {
    zapier: 'bg-orange-100 dark:bg-orange-900/20',
    make: 'bg-purple-100 dark:bg-purple-900/20',
    n8n: 'bg-red-100 dark:bg-red-900/20',
    custom: 'bg-gray-100 dark:bg-gray-900/20'
  }
  return colors[service] || 'bg-gray-100 dark:bg-gray-900/20'
}

function getServiceIconColor(service: string) {
  const colors: Record<string, string> = {
    zapier: 'text-orange-600 dark:text-orange-400',
    make: 'text-purple-600 dark:text-purple-400',
    n8n: 'text-red-600 dark:text-red-400',
    custom: 'text-gray-600 dark:text-gray-400'
  }
  return colors[service] || 'text-gray-600 dark:text-gray-400'
}

function getEventLabel(eventId: string) {
  const event = availableEvents.find(e => e.id === eventId)
  return event?.label || eventId
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return date.toLocaleDateString('pt-BR')
}

// ============================================================================
// HANDLERS
// ============================================================================

function handleAddWebhook() {
  editingWebhook.value = null
  formData.value = {
    name: '',
    url: '',
    service: 'zapier',
    events: [],
    headers: [],
    isActive: true
  }
  isModalOpen.value = true
}

function handleEditWebhook(webhook: CustomWebhook) {
  editingWebhook.value = webhook
  formData.value = {
    name: webhook.name,
    url: webhook.url,
    service: webhook.service,
    events: [...webhook.events],
    headers: webhook.headers.map(h => ({ ...h })),
    isActive: webhook.isActive
  }
  isModalOpen.value = true
}

function handleDeleteWebhook(webhook: CustomWebhook) {
  webhookToDelete.value = webhook
  isDeleteModalOpen.value = true
}

async function confirmDeleteWebhook() {
  if (!webhookToDelete.value) return

  isDeleting.value = true
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    webhooks.value = webhooks.value.filter(w => w.id !== webhookToDelete.value!.id)
    toast.addToast({
      title: 'Sucesso',
      description: 'Webhook excluído com sucesso',
      variant: 'success'
    })
    isDeleteModalOpen.value = false
    webhookToDelete.value = null
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao excluir webhook',
      variant: 'destructive'
    })
  } finally {
    isDeleting.value = false
  }
}

async function handleToggleWebhook(webhook: CustomWebhook) {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = webhooks.value.findIndex(w => w.id === webhook.id)
    if (index !== -1) {
      if (webhooks.value[index]) {
        webhooks.value[index].isActive = !webhooks.value[index].isActive
        toast.addToast({
          title: 'Webhook',
          description: webhooks.value[index].isActive 
            ? 'Webhook ativado' 
            : 'Webhook desativado',
          variant: 'success'
        })
      }
    }
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao alterar status do webhook',
      variant: 'destructive'
    })
  }
}

async function handleTestWebhook(webhook: CustomWebhook) {
  testingWebhookId.value = webhook.id
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simular envio de teste
    toast.addToast({
      title: 'Teste',
      description: 'Teste enviado com sucesso! Verifique o serviço de destino.',
      variant: 'success'
    })
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao enviar teste',
      variant: 'destructive'
    })
  } finally {
    testingWebhookId.value = null
  }
}

async function handleSaveWebhook() {
  if (!formData.value.name || !formData.value.url || formData.value.events.length === 0) {
    toast.addToast({
      title: 'Erro',
      description: 'Preencha todos os campos obrigatórios',
      variant: 'destructive'
    })
    return
  }

  isSaving.value = true
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500))

    if (editingWebhook.value) {
      // Atualizar webhook existente
      const index = webhooks.value.findIndex(w => w.id === editingWebhook.value!.id)
      if (index !== -1) {
      const existingWebhook = webhooks.value[index]
      if (existingWebhook) {
        webhooks.value[index] = {
          ...formData.value,
          id: existingWebhook.id || `wh-${Date.now()}`,
          name: formData.value.name,
          url: formData.value.url,
          service: formData.value.service,
          events: formData.value.events,
          headers: formData.value.headers,
          isActive: formData.value.isActive,
          triggersCount: existingWebhook.triggersCount || 0,
          lastTriggeredAt: existingWebhook.lastTriggeredAt || null,
          failureRate: existingWebhook.failureRate || 0,
          createdAt: existingWebhook.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      }
      toast.addToast({
        title: 'Sucesso',
        description: 'Webhook atualizado com sucesso',
        variant: 'success'
      })
    } else {
      // Criar novo webhook
      const newWebhook: CustomWebhook = {
        id: `wh-${Date.now()}`,
        name: formData.value.name,
        url: formData.value.url,
        service: formData.value.service,
        events: formData.value.events,
        headers: formData.value.headers,
        isActive: formData.value.isActive,
        triggersCount: 0,
        lastTriggeredAt: null,
        failureRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      webhooks.value.push(newWebhook)
      toast.addToast({
        title: 'Sucesso',
        description: 'Webhook criado com sucesso',
        variant: 'success'
      })
    }

    isModalOpen.value = false
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao salvar webhook',
      variant: 'destructive'
    })
  } finally {
    isSaving.value = false
  }
}

function toggleEvent(eventId: string) {
  const index = formData.value.events.indexOf(eventId)
  if (index === -1) {
    formData.value.events.push(eventId)
  } else {
    formData.value.events.splice(index, 1)
  }
}

function addHeader() {
  formData.value.headers.push({ key: '', value: '' })
}

function removeHeader(index: number) {
  formData.value.headers.splice(index, 1)
}
</script>

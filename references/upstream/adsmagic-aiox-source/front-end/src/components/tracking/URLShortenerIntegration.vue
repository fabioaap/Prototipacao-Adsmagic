<template>
  <DashboardSection
    title="Encurtadores de URL"
    description="Conecte com bit.ly ou Rebrandly para links personalizados"
    variant="bordered"
  >
    <div class="space-y-6">
      <!-- Status das Integrações -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Bit.ly -->
        <div 
          class="border rounded-lg p-4 transition-colors"
          :class="bitlyConnected ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : ''"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <LinkIcon class="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 class="section-title-sm">Bit.ly</h4>
                <p class="text-sm text-muted-foreground">
                  O encurtador de URL mais popular
                </p>
              </div>
            </div>
            <Badge :variant="bitlyConnected ? 'success' : 'secondary'">
              {{ bitlyConnected ? 'Conectado' : 'Não conectado' }}
            </Badge>
          </div>

          <div class="mt-4 space-y-3">
            <div v-if="bitlyConnected" class="flex items-center gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Links criados</p>
                <p class="font-semibold">{{ bitlyStats.linksCreated }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Cliques totais</p>
                <p class="font-semibold">{{ bitlyStats.totalClicks.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Domínio</p>
                <p class="font-semibold">{{ bitlyStats.domain }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Button
                v-if="!bitlyConnected"
                @click="handleConnectBitly"
                :disabled="connectingBitly"
              >
                <Loader2 v-if="connectingBitly" class="h-4 w-4 mr-2 animate-spin" />
                <LinkIcon v-else class="h-4 w-4 mr-2" />
                Conectar Bit.ly
              </Button>
              <template v-else>
                <Button variant="outline" size="sm" @click="handleSyncBitly" :disabled="syncingBitly">
                  <Loader2 v-if="syncingBitly" class="h-4 w-4 mr-2 animate-spin" />
                  <RefreshCw v-else class="h-4 w-4 mr-2" />
                  Sincronizar
                </Button>
                <Button variant="ghost" size="sm" @click="handleDisconnectBitly">
                  <Unplug class="h-4 w-4" />
                </Button>
              </template>
            </div>
          </div>
        </div>

        <!-- Rebrandly -->
        <div 
          class="border rounded-lg p-4 transition-colors"
          :class="rebrandlyConnected ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : ''"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Globe class="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 class="section-title-sm">Rebrandly</h4>
                <p class="text-sm text-muted-foreground">
                  Links com domínio personalizado
                </p>
              </div>
            </div>
            <Badge :variant="rebrandlyConnected ? 'success' : 'secondary'">
              {{ rebrandlyConnected ? 'Conectado' : 'Não conectado' }}
            </Badge>
          </div>

          <div class="mt-4 space-y-3">
            <div v-if="rebrandlyConnected" class="flex items-center gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Links criados</p>
                <p class="font-semibold">{{ rebrandlyStats.linksCreated }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Cliques totais</p>
                <p class="font-semibold">{{ rebrandlyStats.totalClicks.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Domínios</p>
                <p class="font-semibold">{{ rebrandlyStats.domains.length }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Button
                v-if="!rebrandlyConnected"
                @click="handleConnectRebrandly"
                :disabled="connectingRebrandly"
              >
                <Loader2 v-if="connectingRebrandly" class="h-4 w-4 mr-2 animate-spin" />
                <Globe v-else class="h-4 w-4 mr-2" />
                Conectar Rebrandly
              </Button>
              <template v-else>
                <Button variant="outline" size="sm" @click="handleSyncRebrandly" :disabled="syncingRebrandly">
                  <Loader2 v-if="syncingRebrandly" class="h-4 w-4 mr-2 animate-spin" />
                  <RefreshCw v-else class="h-4 w-4 mr-2" />
                  Sincronizar
                </Button>
                <Button variant="ghost" size="sm" @click="handleDisconnectRebrandly">
                  <Unplug class="h-4 w-4" />
                </Button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuração de Domínio Padrão -->
      <div v-if="bitlyConnected || rebrandlyConnected" class="p-4 bg-muted rounded-lg">
        <h4 class="section-title-sm mb-3">Configuração de Encurtamento</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Serviço padrão -->
          <div class="space-y-2">
            <Label>Serviço Padrão</Label>
            <Select 
              v-model="defaultService"
              :options="[]"
              placeholder="Selecionar serviço"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Adsmagic (adm.ag)</SelectItem>
                <SelectItem v-if="bitlyConnected" value="bitly">Bit.ly</SelectItem>
                <SelectItem v-if="rebrandlyConnected" value="rebrandly">Rebrandly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Domínio (se Rebrandly) -->
          <div v-if="defaultService === 'rebrandly' && rebrandlyConnected" class="space-y-2">
            <Label>Domínio Personalizado</Label>
            <Select 
              v-model="selectedDomain"
              :options="[]"
              placeholder="Selecionar domínio"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o domínio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="domain in rebrandlyStats.domains" 
                  :key="domain.id"
                  :value="domain.id"
                >
                  {{ domain.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Opções -->
        <div class="mt-4 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Encurtar automaticamente novos links</p>
              <p class="text-sm text-muted-foreground">
                Novos links de rastreamento serão encurtados automaticamente.
              </p>
            </div>
            <Switch v-model:checked="autoShorten" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Sincronizar estatísticas</p>
              <p class="text-sm text-muted-foreground">
                Importar cliques do serviço de encurtamento.
              </p>
            </div>
            <Switch v-model:checked="syncStats" />
          </div>
        </div>

        <div class="mt-4">
          <Button @click="handleSaveSettings" :disabled="isSavingSettings">
            <Loader2 v-if="isSavingSettings" class="h-4 w-4 mr-2 animate-spin" />
            Salvar Configurações
          </Button>
        </div>
      </div>

      <!-- Links Importados -->
      <div v-if="importedLinks.length > 0">
        <h4 class="section-title-sm mb-3">Links Importados</h4>
        <div class="border rounded-lg divide-y">
          <div
            v-for="link in importedLinks"
            :key="link.id"
            class="p-3 flex items-center justify-between hover:bg-muted/50"
          >
            <div class="flex items-center gap-3">
              <component
                :is="link.source === 'bitly' ? LinkIcon : Globe"
                class="h-4 w-4 text-muted-foreground"
              />
              <div>
                <a 
                  :href="link.shortUrl" 
                  target="_blank" 
                  class="font-medium text-primary hover:underline"
                >
                  {{ link.shortUrl }}
                </a>
                <p class="text-xs text-muted-foreground truncate max-w-xs">
                  → {{ link.destinationUrl }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-muted-foreground">
                {{ link.clicks.toLocaleString() }} cliques
              </span>
              <Button variant="ghost" size="sm" @click="handleCopyLink(link.shortUrl)">
                <Copy class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Conexão Bit.ly -->
    <Modal
      v-model:open="isBitlyModalOpen"
      title="Conectar Bit.ly"
      description="Insira seu Access Token do Bit.ly para conectar."
      size="md"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="bitly-token">Access Token</Label>
          <Input
            id="bitly-token"
            v-model="bitlyToken"
            type="password"
            placeholder="Seu token de API do Bit.ly"
          />
          <p class="text-xs text-muted-foreground">
            Obtenha seu token em 
            <a href="https://app.bitly.com/settings/api/" target="_blank" class="text-primary hover:underline">
              app.bitly.com/settings/api
            </a>
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" @click="isBitlyModalOpen = false">
            Cancelar
          </Button>
          <Button @click="handleSubmitBitlyToken" :disabled="!bitlyToken || connectingBitly">
            <Loader2 v-if="connectingBitly" class="h-4 w-4 mr-2 animate-spin" />
            Conectar
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Modal de Conexão Rebrandly -->
    <Modal
      v-model:open="isRebrandlyModalOpen"
      title="Conectar Rebrandly"
      description="Insira sua API Key do Rebrandly para conectar."
      size="md"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="rebrandly-key">API Key</Label>
          <Input
            id="rebrandly-key"
            v-model="rebrandlyApiKey"
            type="password"
            placeholder="Sua API Key do Rebrandly"
          />
          <p class="text-xs text-muted-foreground">
            Obtenha sua key em 
            <a href="https://app.rebrandly.com/account/api-keys" target="_blank" class="text-primary hover:underline">
              app.rebrandly.com/account/api-keys
            </a>
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" @click="isRebrandlyModalOpen = false">
            Cancelar
          </Button>
          <Button @click="handleSubmitRebrandlyKey" :disabled="!rebrandlyApiKey || connectingRebrandly">
            <Loader2 v-if="connectingRebrandly" class="h-4 w-4 mr-2 animate-spin" />
            Conectar
          </Button>
        </div>
      </template>
    </Modal>
  </DashboardSection>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Link as LinkIcon,
  Globe,
  RefreshCw,
  Unplug,
  Loader2,
  Copy
} from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'
import DashboardSection from '@/components/ui/DashboardSection.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Switch from '@/components/ui/Switch.vue'
import Select from '@/components/ui/Select.vue'
import SelectTrigger from '@/components/ui/SelectTrigger.vue'
import SelectValue from '@/components/ui/SelectValue.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import Modal from '@/components/ui/Modal.vue'

// ============================================================================
// TYPES
// ============================================================================

interface ImportedLink {
  id: string
  shortUrl: string
  destinationUrl: string
  clicks: number
  source: 'bitly' | 'rebrandly'
  createdAt: string
}

interface RebrandlyDomain {
  id: string
  name: string
}

// ============================================================================
// STORES
// ============================================================================

const toast = useToastStore()

// ============================================================================
// STATE
// ============================================================================

// Bit.ly
const bitlyConnected = ref(false)
const bitlyToken = ref('')
const isBitlyModalOpen = ref(false)
const connectingBitly = ref(false)
const syncingBitly = ref(false)
const bitlyStats = ref({
  linksCreated: 0,
  totalClicks: 0,
  domain: 'bit.ly'
})

// Rebrandly
const rebrandlyConnected = ref(false)
const rebrandlyApiKey = ref('')
const isRebrandlyModalOpen = ref(false)
const connectingRebrandly = ref(false)
const syncingRebrandly = ref(false)
const rebrandlyStats = ref({
  linksCreated: 0,
  totalClicks: 0,
  domains: [] as RebrandlyDomain[]
})

// Settings
const defaultService = ref<'internal' | 'bitly' | 'rebrandly'>('internal')
const selectedDomain = ref('')
const autoShorten = ref(true)
const syncStats = ref(true)
const isSavingSettings = ref(false)

// Imported links
const importedLinks = ref<ImportedLink[]>([])

// ============================================================================
// HANDLERS - Bit.ly
// ============================================================================

function handleConnectBitly() {
  isBitlyModalOpen.value = true
}

async function handleSubmitBitlyToken() {
  if (!bitlyToken.value) return

  connectingBitly.value = true
  try {
    // Simular conexão
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    bitlyConnected.value = true
    bitlyStats.value = {
      linksCreated: 47,
      totalClicks: 12453,
      domain: 'bit.ly'
    }
    
    // Importar alguns links de exemplo
    importedLinks.value.push(
      {
        id: 'bl-1',
        shortUrl: 'https://bit.ly/3abc123',
        destinationUrl: 'https://meusite.com/campanha-natal',
        clicks: 1234,
        source: 'bitly',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bl-2',
        shortUrl: 'https://bit.ly/3xyz789',
        destinationUrl: 'https://meusite.com/promo',
        clicks: 567,
        source: 'bitly',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    )
    
    toast.addToast({
      title: 'Sucesso',
      description: 'Bit.ly conectado com sucesso!',
      variant: 'success'
    })
    isBitlyModalOpen.value = false
    bitlyToken.value = ''
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao conectar Bit.ly',
      variant: 'destructive'
    })
  } finally {
    connectingBitly.value = false
  }
}

async function handleSyncBitly() {
  syncingBitly.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    bitlyStats.value.totalClicks += 234
    toast.addToast({
      title: 'Sincronizado',
      description: 'Estatísticas do Bit.ly sincronizadas!',
      variant: 'success'
    })
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao sincronizar Bit.ly',
      variant: 'destructive'
    })
  } finally {
    syncingBitly.value = false
  }
}

async function handleDisconnectBitly() {
  bitlyConnected.value = false
  bitlyStats.value = { linksCreated: 0, totalClicks: 0, domain: 'bit.ly' }
  importedLinks.value = importedLinks.value.filter(l => l.source !== 'bitly')
  if (defaultService.value === 'bitly') {
    defaultService.value = 'internal'
  }
  toast.addToast({
    title: 'Desconectado',
    description: 'Bit.ly desconectado',
    variant: 'success'
  })
}

// ============================================================================
// HANDLERS - Rebrandly
// ============================================================================

function handleConnectRebrandly() {
  isRebrandlyModalOpen.value = true
}

async function handleSubmitRebrandlyKey() {
  if (!rebrandlyApiKey.value) return

  connectingRebrandly.value = true
  try {
    // Simular conexão
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    rebrandlyConnected.value = true
    rebrandlyStats.value = {
      linksCreated: 23,
      totalClicks: 8765,
      domains: [
        { id: 'dom-1', name: 'link.meusite.com' },
        { id: 'dom-2', name: 'go.minhaempresa.com.br' }
      ]
    }
    selectedDomain.value = 'dom-1'
    
    // Importar alguns links de exemplo
    importedLinks.value.push(
      {
        id: 'rb-1',
        shortUrl: 'https://link.meusite.com/oferta',
        destinationUrl: 'https://meusite.com/oferta-especial',
        clicks: 2345,
        source: 'rebrandly',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    )
    
    toast.addToast({
      title: 'Conectado',
      description: 'Rebrandly conectado com sucesso!',
      variant: 'success'
    })
    isRebrandlyModalOpen.value = false
    rebrandlyApiKey.value = ''
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao conectar Rebrandly',
      variant: 'destructive'
    })
  } finally {
    connectingRebrandly.value = false
  }
}

async function handleSyncRebrandly() {
  syncingRebrandly.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    rebrandlyStats.value.totalClicks += 156
    toast.addToast({
      title: 'Sincronizado',
      description: 'Estatísticas do Rebrandly sincronizadas!',
      variant: 'success'
    })
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao sincronizar Rebrandly',
      variant: 'destructive'
    })
  } finally {
    syncingRebrandly.value = false
  }
}

async function handleDisconnectRebrandly() {
  rebrandlyConnected.value = false
  rebrandlyStats.value = { linksCreated: 0, totalClicks: 0, domains: [] }
  importedLinks.value = importedLinks.value.filter(l => l.source !== 'rebrandly')
  selectedDomain.value = ''
  if (defaultService.value === 'rebrandly') {
    defaultService.value = 'internal'
  }
  toast.addToast({
    title: 'Desconectado',
    description: 'Rebrandly desconectado',
    variant: 'success'
  })
}

// ============================================================================
// HANDLERS - Settings & Utilities
// ============================================================================

async function handleSaveSettings() {
  isSavingSettings.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.addToast({
      title: 'Salvo',
      description: 'Configurações salvas!',
      variant: 'success'
    })
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao salvar configurações',
      variant: 'destructive'
    })
  } finally {
    isSavingSettings.value = false
  }
}

async function handleCopyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    toast.addToast({
      title: 'Sucesso',
      description: 'Link copiado!',
      variant: 'success'
    })
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao copiar link',
      variant: 'destructive'
    })
  }
}
</script>

<template>
  <div class="w-full min-w-0 max-w-full overflow-hidden rounded-lg border bg-card p-4 sm:p-6">
    <!-- Header -->
    <div class="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start space-x-3 sm:items-center">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Code class="h-5 w-5 text-primary" />
        </div>
        <div class="min-w-0">
          <h3 class="section-title-sm">Tag de Rastreamento</h3>
          <p class="text-sm text-muted-foreground">
            Instale o código no seu site para rastrear conversões
          </p>
        </div>
      </div>

      <!-- Status Badge -->
      <Badge :color="getInstallationStatusColor()" class="self-start sm:self-auto">
        <component
          :is="getInstallationStatusIcon()"
          class="h-3 w-3 mr-1"
        />
        {{ getInstallationStatusLabel() }}
      </Badge>
    </div>

    <!-- Script Code -->
    <div class="mb-4">
      <div class="mb-2 flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label class="text-sm font-medium">Código da Tag</Label>
        <Button
          variant="outline"
          size="sm"
          class="w-full sm:w-auto"
          @click="handleCopy"
          :disabled="loading"
        >
          <Copy class="h-4 w-4 mr-2" />
          Copiar
        </Button>
      </div>
      
      <div class="relative max-w-full overflow-hidden rounded-lg bg-muted p-4">
        <pre class="max-w-full overflow-x-auto text-xs"><code>{{ scriptCode }}</code></pre>
        <div class="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            @click="handleCopy"
            :disabled="loading"
            class="h-8 w-8 p-0"
          >
            <Copy class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Installation Instructions -->
    <div class="mb-4">
      <h4 class="section-kicker mb-2">Como instalar:</h4>
      <ol class="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
        <li>Copie o código acima</li>
        <li>Cole no <code class="bg-muted px-1 rounded">&lt;head&gt;</code> do seu site</li>
        <li>Certifique-se de que está antes do <code class="bg-muted px-1 rounded">&lt;/head&gt;</code></li>
        <li>Salve e publique as alterações</li>
      </ol>
    </div>

    <!-- Installation Status Details -->
    <div v-if="isInstalled" class="mb-4 rounded-lg border border-success/20 bg-success/10 p-3">
      <div class="flex items-start space-x-2">
        <CheckCircle class="h-4 w-4 text-success" />
        <div>
          <p class="text-sm font-medium text-success">Tag Instalada com Sucesso</p>
          <p class="text-xs text-success/80 mt-1">
            Última verificação: {{ lastPing ? formatDate(lastPing, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Nunca' }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="mb-4 rounded-lg border border-warning/20 bg-warning/10 p-3">
      <div class="flex items-start space-x-2">
        <AlertTriangle class="h-4 w-4 text-warning" />
        <div>
          <p class="text-sm font-medium text-warning">Tag Não Detectada</p>
          <p class="text-xs text-warning/80 mt-1">
            Verifique se o código foi instalado corretamente
          </p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="isInstalled && eventsReceived > 0" class="mb-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="text-center p-3 bg-muted/50 rounded-lg">
          <div class="section-title-sm">{{ formatNumber(eventsReceived) }}</div>
          <div class="text-xs text-muted-foreground">Eventos Recebidos</div>
        </div>
        <div class="text-center p-3 bg-muted/50 rounded-lg">
          <div class="section-title-sm">{{ lastPing ? formatRelativeTime(lastPing) : 'Nunca' }}</div>
          <div class="text-xs text-muted-foreground">Última Atividade</div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:space-x-2 sm:gap-0">
        <Button
          variant="outline"
          size="sm"
          class="w-full sm:w-auto"
          @click="handleCheckInstallation"
          :disabled="loading"
          :loading="loading"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Verificar Instalação
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          class="w-full sm:w-auto"
          @click="handleViewDocumentation"
        >
          <ExternalLink class="h-4 w-4 mr-2" />
          Documentação
        </Button>
      </div>

      <!-- Project ID -->
      <div class="w-full break-all text-xs text-muted-foreground sm:w-auto sm:text-right">
        ID: {{ projectId }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Code, 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Label from '@/components/ui/Label.vue'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  buildTagSnippet,
  TAG_SCRIPT_URL,
} from '@/services/tagSnippet'

interface Props {
  /**
   * ID do projeto
   */
  projectId: string
  /**
   * Se true, tag está instalada
   */
  isInstalled: boolean
  /**
   * Se true, indica loading state
   */
  loading?: boolean
  /**
   * Número de eventos recebidos
   */
  eventsReceived?: number
  /**
   * Código pronto da tag (opcional)
   */
  scriptCode?: string
  /**
   * Último ping da tag
   */
  lastPing?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  eventsReceived: 0
})

const emit = defineEmits<{
  copy: []
  checkInstallation: []
}>()

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatDate, formatRelativeTime, formatNumber } = useFormat()
const { toast } = useToast()

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Código da tag de rastreamento
 */
const scriptCode = computed(() => {
  if (props.scriptCode?.trim()) {
    return props.scriptCode
  }

  try {
    return buildTagSnippet({
      projectId: props.projectId || 'PROJECT_ID_AQUI',
      scriptUrl: TAG_SCRIPT_URL,
      debug: false,
      autoInit: true,
    })
  } catch {
    return '<!-- Erro ao gerar tag: projectId inválido -->'
  }
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Obtém o ícone do status de instalação
 */
const getInstallationStatusIcon = () => {
  if (props.isInstalled) {
    return CheckCircle
  }
  return AlertTriangle
}


/**
 * Obtém o label do status de instalação
 */
const getInstallationStatusLabel = () => {
  if (props.isInstalled) {
    return 'Instalado'
  }
  return 'Não Instalado'
}

/**
 * Obtém a cor do badge do status de instalação
 */
const getInstallationStatusColor = () => {
  if (props.isInstalled) {
    return 'success'
  }
  return 'warning'
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(scriptCode.value)
    toast({
      title: 'Copiado!',
      description: 'Código da tag copiado para a área de transferência'
    })
    emit('copy')
  } catch (error) {
    toast({
      title: 'Erro',
      description: 'Não foi possível copiar o código',
      variant: 'destructive'
    })
  }
}

const handleCheckInstallation = () => {
  emit('checkInstallation')
}

const handleViewDocumentation = () => {
  // Abrir documentação em nova aba
  window.open('https://docs.adsmagic.com.br/tag-installation', '_blank')
}
</script>

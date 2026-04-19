<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MessageSquare, 
  ShoppingCart, 
  Target, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  Shield,
  Settings,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  Upload,
  Share,
  Copy,
  ExternalLink
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'

interface Props {
  /**
   * Ícone selecionado
   */
  modelValue: string
  /**
   * Se true, está desabilitado
   */
  disabled?: boolean
  /**
   * Categoria de ícones a mostrar
   */
  category?: 'all' | 'business' | 'communication' | 'status' | 'actions'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  category: 'all',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Estado local
const isOpen = ref(false)

// Ícones disponíveis organizados por categoria
const iconCategories = {
  business: [
    { name: 'user', component: User, label: 'Usuário' },
    { name: 'target', component: Target, label: 'Alvo' },
    { name: 'trending-up', component: TrendingUp, label: 'Crescimento' },
    { name: 'shopping-cart', component: ShoppingCart, label: 'Carrinho' },
    { name: 'shield', component: Shield, label: 'Segurança' },
    { name: 'settings', component: Settings, label: 'Configurações' },
  ],
  communication: [
    { name: 'mail', component: Mail, label: 'Email' },
    { name: 'phone', component: Phone, label: 'Telefone' },
    { name: 'message-square', component: MessageSquare, label: 'Mensagem' },
    { name: 'globe', component: Globe, label: 'Website' },
    { name: 'share', component: Share, label: 'Compartilhar' },
  ],
  status: [
    { name: 'check-circle', component: CheckCircle, label: 'Sucesso' },
    { name: 'x-circle', component: XCircle, label: 'Erro' },
    { name: 'alert-circle', component: AlertCircle, label: 'Atenção' },
    { name: 'clock', component: Clock, label: 'Tempo' },
    { name: 'star', component: Star, label: 'Favorito' },
  ],
  actions: [
    { name: 'plus', component: Plus, label: 'Adicionar' },
    { name: 'minus', component: Minus, label: 'Remover' },
    { name: 'edit', component: Edit, label: 'Editar' },
    { name: 'trash-2', component: Trash2, label: 'Excluir' },
    { name: 'eye', component: Eye, label: 'Visualizar' },
    { name: 'eye-off', component: EyeOff, label: 'Ocultar' },
    { name: 'lock', component: Lock, label: 'Bloquear' },
    { name: 'unlock', component: Unlock, label: 'Desbloquear' },
    { name: 'download', component: Download, label: 'Download' },
    { name: 'upload', component: Upload, label: 'Upload' },
    { name: 'copy', component: Copy, label: 'Copiar' },
    { name: 'external-link', component: ExternalLink, label: 'Link Externo' },
  ],
}

// Computed
const selectedIcon = computed(() => props.modelValue)
const availableIcons = computed(() => {
  if (props.category === 'all') {
    return Object.values(iconCategories).flat()
  }
  return iconCategories[props.category] || []
})

const selectedIconData = computed(() => {
  return availableIcons.value.find(icon => icon.name === selectedIcon.value)
})

// Handlers
const handleIconSelect = (iconName: string) => {
  emit('update:modelValue', iconName)
}

const toggleOpen = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}
</script>

<template>
  <div class="relative">
    <!-- Icon Button -->
    <Button
      type="button"
      variant="outline"
      :disabled="props.disabled"
      @click="toggleOpen"
    >
      <div class="flex items-center gap-2">
        <component
          v-if="selectedIconData"
          :is="selectedIconData.component"
          class="h-4 w-4"
        />
        <User
          v-else
          class="h-4 w-4"
        />
        <span class="text-sm">{{ selectedIconData?.label || 'Selecionar ícone' }}</span>
      </div>
    </Button>

    <!-- Icon Picker Dropdown -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 mt-2 p-4 bg-card border border-border rounded-lg shadow-lg z-50 min-w-80 max-h-96 overflow-y-auto"
    >
      <div class="space-y-4">
        <!-- Selected Icon Preview -->
        <div v-if="selectedIconData" class="space-y-2">
          <label class="text-sm font-medium">Ícone Selecionado</label>
          <div class="p-3 border border-border rounded-lg bg-muted/20">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <component :is="selectedIconData.component" class="h-4 w-4 text-primary" />
              </div>
              <div>
                <p class="font-medium text-sm">{{ selectedIconData.label }}</p>
                <p class="text-xs text-muted-foreground">{{ selectedIcon }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Icon Grid -->
        <div class="space-y-2">
          <label class="text-sm font-medium">
            {{ props.category === 'all' ? 'Todos os Ícones' : `Ícones de ${props.category}` }}
          </label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="icon in availableIcons"
              :key="icon.name"
              type="button"
              :class="cn(
                'h-10 w-10 rounded border border-border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-center',
                selectedIcon === icon.name ? 'border-primary ring-2 ring-primary/20 bg-primary/10' : 'hover:border-primary/50 hover:bg-muted/50'
              )"
              :disabled="props.disabled"
              :title="icon.label"
              @click="handleIconSelect(icon.name)"
            >
              <component :is="icon.component" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Category Filter (only show if category is 'all') -->
        <div v-if="props.category === 'all'" class="space-y-2">
          <label class="text-sm font-medium">Filtrar por Categoria</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(_category, key) in iconCategories"
              :key="key"
              type="button"
              class="px-3 py-1 text-xs rounded-full border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
              @click="() => {}"
            >
              {{ key }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    />
  </div>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground)) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted-foreground));
  border-radius: 2px;
}
</style>

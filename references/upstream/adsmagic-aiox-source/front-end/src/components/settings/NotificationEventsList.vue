<template>
  <div class="space-y-4">
    <!-- Header with Select All -->
    <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0 sm:flex-1">
        <h4 class="section-title-sm">Eventos para Notificar</h4>
        <p class="text-sm text-muted-foreground">
          Selecione quais eventos devem gerar notificações por email
        </p>
      </div>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:space-x-2 sm:gap-0">
        <Button
          variant="outline"
          size="sm"
          class="w-full sm:w-auto"
          @click="handleSelectAll"
          :disabled="disabled"
        >
          <CheckSquare class="h-4 w-4 mr-1" />
          Selecionar Todos
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="w-full sm:w-auto"
          @click="handleDeselectAll"
          :disabled="disabled"
        >
          <Square class="h-4 w-4 mr-1" />
          Desmarcar Todos
        </Button>
      </div>
    </div>

    <!-- Events by Category -->
    <div class="space-y-6">
      <div
        v-for="category in eventCategories"
        :key="category.id"
        class="space-y-3"
      >
        <!-- Category Header -->
        <div class="flex items-center space-x-2">
          <component :is="category.icon" class="h-5 w-5 text-muted-foreground" />
          <h5 class="font-medium">{{ category.name }}</h5>
          <Badge variant="secondary" class="text-xs">
            {{ getSelectedCount(category.events) }}/{{ category.events.length }}
          </Badge>
        </div>

        <!-- Events List -->
        <div class="grid gap-3 pl-7">
          <div
            v-for="event in category.events"
            :key="event.id"
            class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              :id="event.id"
              :checked="selectedEvents.includes(event.id)"
              @update:checked="handleEventToggle(event.id)"
              :disabled="disabled"
              class="mt-1"
            />
            <div class="flex-1 min-w-0">
              <Label
                :for="event.id"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <span class="font-medium">{{ event.label }}</span>
                <Badge
                  v-if="event.important"
                  variant="destructive"
                  class="text-xs"
                >
                  Importante
                </Badge>
              </Label>
              <p class="text-sm text-muted-foreground mt-1">
                {{ event.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="p-4 bg-muted/50 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium">
            {{ selectedEvents.length }} de {{ totalEvents }} eventos selecionados
          </p>
          <p class="text-xs text-muted-foreground">
            Você receberá notificações por email para os eventos selecionados
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm font-medium text-green-600">
            {{ Math.round((selectedEvents.length / totalEvents) * 100) }}% selecionado
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Users, 
  DollarSign, 
  Link, 
  Zap, 
  CheckSquare, 
  Square 
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Label from '@/components/ui/Label.vue'
import Badge from '@/components/ui/Badge.vue'

interface Props {
  /**
   * Eventos selecionados
   */
  selectedEvents: string[]
  /**
   * Se true, componente está desabilitado
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:selectedEvents': [events: string[]]
}>()

// ============================================================================
// DATA
// ============================================================================

const eventCategories = [
  {
    id: 'contacts',
    name: 'Contatos',
    icon: Users,
    events: [
      {
        id: 'contact_created',
        label: 'Novo contato criado',
        description: 'Quando um novo contato entra no funil',
        important: true
      },
      {
        id: 'contact_stage_changed',
        label: 'Contato mudou de etapa',
        description: 'Quando um contato avança ou retrocede no funil',
        important: false
      },
      {
        id: 'contact_lost',
        label: 'Contato perdido',
        description: 'Quando um contato vai para etapa perdida',
        important: true
      }
    ]
  },
  {
    id: 'sales',
    name: 'Vendas',
    icon: DollarSign,
    events: [
      {
        id: 'sale_completed',
        label: 'Venda realizada',
        description: 'Quando uma venda é concluída',
        important: true
      },
      {
        id: 'sale_lost',
        label: 'Venda perdida',
        description: 'Quando uma venda é marcada como perdida',
        important: false
      }
    ]
  },
  {
    id: 'links',
    name: 'Links de Rastreamento',
    icon: Link,
    events: [
      {
        id: 'link_clicked',
        label: 'Link rastreado clicado',
        description: 'Quando alguém clica em um link de rastreamento',
        important: false
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrações',
    icon: Zap,
    events: [
      {
        id: 'integration_connected',
        label: 'Integração conectada',
        description: 'Quando uma integração é conectada com sucesso',
        important: false
      },
      {
        id: 'integration_error',
        label: 'Erro em integração',
        description: 'Quando ocorre um erro em uma integração',
        important: true
      }
    ]
  }
]

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Total de eventos disponíveis
 */
const totalEvents = computed(() => {
  return eventCategories.reduce((total, category) => total + category.events.length, 0)
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Conta quantos eventos de uma categoria estão selecionados
 */
const getSelectedCount = (events: any[]) => {
  return events.filter(event => props.selectedEvents.includes(event.id)).length
}

/**
 * Seleciona todos os eventos
 */
const handleSelectAll = () => {
  const allEventIds = eventCategories.flatMap(category => 
    category.events.map(event => event.id)
  )
  emit('update:selectedEvents', allEventIds)
}

/**
 * Desmarca todos os eventos
 */
const handleDeselectAll = () => {
  emit('update:selectedEvents', [])
}

/**
 * Alterna um evento específico
 */
const handleEventToggle = (eventId: string) => {
  const newSelection = props.selectedEvents.includes(eventId)
    ? props.selectedEvents.filter(id => id !== eventId)
    : [...props.selectedEvents, eventId]
  
  emit('update:selectedEvents', newSelection)
}
</script>

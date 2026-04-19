<script setup lang="ts">
import { computed } from 'vue'
import { DollarSign, Calendar, Tag, MapPin, Smartphone } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import type { Sale } from '@/types/models'
import { useFormat } from '@/composables/useFormat'
import { formatSafeCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

interface Props {
  /**
   * Venda a ser exibida
   */
  sale: Sale
  /**
   * Se true, mostra botões de ação
   */
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const emit = defineEmits<{
  view: [sale: Sale]
  edit: [sale: Sale]
  delete: [sale: Sale]
}>()

const { formatDate } = useFormat()

// Status badge variant
const statusVariant = computed(() => {
  return props.sale.status === 'completed' ? 'success' : 'destructive'
})

const statusLabel = computed(() => {
  return props.sale.status === 'completed' ? 'Realizada' : 'Perdida'
})

// Handlers
const handleView = () => {
  emit('view', props.sale)
}

const handleEdit = () => {
  emit('edit', props.sale)
}

const handleDelete = () => {
  emit('delete', props.sale)
}
</script>

<template>
  <div
    :class="cn(
      'group relative rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md',
      'cursor-pointer'
    )"
    @click="handleView"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <div
          :class="cn(
            'h-10 w-10 rounded-full flex items-center justify-center',
            props.sale.status === 'completed'
              ? 'bg-green-100 dark:bg-green-900/20'
              : 'bg-red-100 dark:bg-red-900/20'
          )"
        >
          <DollarSign
            :class="cn(
              'h-5 w-5',
              props.sale.status === 'completed'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )"
          />
        </div>

        <div>
          <p class="font-semibold text-sm">
            #{{ props.sale.id.slice(0, 8) }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ formatDate(props.sale.date, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
          </p>
        </div>
      </div>

      <Badge :variant="statusVariant">
        {{ statusLabel }}
      </Badge>
    </div>

    <!-- Valor -->
    <div class="mb-4">
      <p class="text-2xl font-bold">
        {{ formatSafeCurrency(props.sale.value, props.sale.currency) }}
      </p>
    </div>

    <!-- Metadata -->
    <div class="space-y-2 mb-4">
      <!-- Data -->
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar class="h-3 w-3" />
        <span>{{ formatDate(props.sale.date) }}</span>
      </div>

      <!-- Motivo (se perdida) -->
      <div
        v-if="props.sale.status === 'lost' && props.sale.lostReason"
        class="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Tag class="h-3 w-3" />
        <span>{{ props.sale.lostReason }}</span>
      </div>

      <!-- Localização -->
      <div
        v-if="props.sale.city || props.sale.country"
        class="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <MapPin class="h-3 w-3" />
        <span>{{ props.sale.city }}, {{ props.sale.country }}</span>
      </div>

      <!-- Dispositivo -->
      <div
        v-if="props.sale.device"
        class="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Smartphone class="h-3 w-3" />
        <span>{{ props.sale.device }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div
      v-if="props.showActions"
      class="flex items-center gap-2 pt-4 border-t border-border"
      @click.stop
    >
      <Button
        variant="ghost"
        size="sm"
        class="flex-1"
        @click="handleView"
      >
        Ver Detalhes
      </Button>
      <Button
        variant="ghost"
        size="sm"
        @click="handleEdit"
      >
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        @click="handleDelete"
      >
        Excluir
      </Button>
    </div>
  </div>
</template>


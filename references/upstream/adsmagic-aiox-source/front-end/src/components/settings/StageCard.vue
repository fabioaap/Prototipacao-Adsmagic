<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Trash2, Users, Settings } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Stage } from '@/types/models'
import { cn } from '@/lib/utils'

interface Props {
  /**
   * Etapa a ser exibida
   */
  stage: Stage
  /**
   * Se true, mostra botões de ação
   */
  showActions?: boolean
  /**
   * Se true, está sendo arrastada
   */
  isDragging?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  isDragging: false,
})

const emit = defineEmits<{
  edit: [stage: Stage]
  delete: [stage: Stage]
}>()

// Computed
const stageTypeBadge = computed(() => {
  switch (props.stage.type) {
    case 'normal':
      return { variant: 'secondary' as const, label: 'Normal' }
    case 'sale':
      return { variant: 'success' as const, label: 'Venda' }
    case 'lost':
      return { variant: 'destructive' as const, label: 'Perdida' }
    default:
      return { variant: 'secondary' as const, label: 'Normal' }
  }
})

const canDelete = computed(() => {
  // Cannot delete "Contato iniciado" stage
  if (props.stage.name.toLowerCase().includes('iniciado')) {
    return false
  }
  // Cannot delete if has contacts
  return props.stage.contactsCount === 0
})

// Handlers
const handleEdit = () => {
  emit('edit', props.stage)
}

const handleDelete = () => {
  emit('delete', props.stage)
}
</script>

<template>
  <div
    :class="cn(
      'group relative rounded-lg border border-border bg-card p-4 transition-all',
      'hover:shadow-md hover:border-primary/20',
      props.isDragging && 'shadow-lg border-primary/30 scale-105'
    )"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h4 class="section-kicker truncate mb-1">
          {{ props.stage.name }}
        </h4>
        <Badge :variant="stageTypeBadge.variant" class="text-xs">
          {{ stageTypeBadge.label }}
        </Badge>
      </div>

      <!-- Actions -->
      <div
        v-if="props.showActions"
        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Button
          variant="ghost"
          size="sm"
          @click="handleEdit"
        >
          <Edit class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          :disabled="!canDelete"
          @click="handleDelete"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Description -->
    <p
      v-if="props.stage.description"
      class="text-xs text-muted-foreground mb-3 line-clamp-2"
    >
      {{ props.stage.description }}
    </p>

    <!-- Stats -->
    <div class="flex items-center gap-4 text-xs text-muted-foreground">
      <div class="flex items-center gap-1">
        <Users class="h-3 w-3" />
        <span>{{ props.stage.contactsCount }} contatos</span>
      </div>
      <div class="flex items-center gap-1">
        <Settings class="h-3 w-3" />
        <span>Ordem {{ props.stage.order }}</span>
      </div>
    </div>

    <!-- Cannot Delete Warning -->
    <div
      v-if="!canDelete && (props.stage.contactsCount ?? 0) > 0"
      class="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground"
    >
      <p>Esta etapa não pode ser excluída pois possui contatos associados.</p>
    </div>

    <div
      v-else-if="!canDelete"
      class="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground"
    >
      <p>Esta etapa não pode ser excluída (etapa do sistema).</p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

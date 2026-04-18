<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Trash2, Globe, Users } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Origin } from '@/types/models'
import { cn } from '@/lib/utils'

interface Props {
  /**
   * Origem a ser exibida
   */
  origin: Origin
  /**
   * Se true, mostra botões de ação
   */
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const emit = defineEmits<{
  edit: [origin: Origin]
  delete: [origin: Origin]
}>()

// Computed
const canDelete = computed(() => !props.origin.isSystem)

const originBadge = computed(() => {
  return props.origin.isSystem
    ? { variant: 'secondary' as const, label: 'Sistema' }
    : { variant: 'default' as const, label: 'Customizada' }
})

// Handlers
const handleEdit = () => {
  emit('edit', props.origin)
}

const handleDelete = () => {
  emit('delete', props.origin)
}
</script>

<template>
  <div
    :class="cn(
      'group relative rounded-lg border border-border bg-card p-4 transition-all',
      'hover:shadow-md hover:border-primary/20',
      props.origin.isSystem && 'bg-muted/20'
    )"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Icon -->
        <div
          :class="cn(
            'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
            props.origin.isSystem
              ? 'bg-primary/10 text-primary'
              : 'bg-secondary text-secondary-foreground'
          )"
          :style="!props.origin.isSystem ? { backgroundColor: props.origin.color + '20', color: props.origin.color } : {}"
        >
          <Globe class="h-5 w-5" />
        </div>

        <!-- Origin Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h4 class="section-kicker truncate">
              {{ props.origin.name }}
            </h4>
            <Badge :variant="originBadge.variant" class="text-xs">
              {{ originBadge.label }}
            </Badge>
          </div>
          <p
            v-if="props.origin.description"
            class="text-xs text-muted-foreground line-clamp-2"
          >
            {{ props.origin.description }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div
        v-if="props.showActions && !props.origin.isSystem"
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
          @click="handleDelete"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-4 text-xs text-muted-foreground">
      <div class="flex items-center gap-1">
        <Users class="h-3 w-3" />
        <span>{{ props.origin.contactsCount }} contatos</span>
      </div>
      <div v-if="!props.origin.isSystem" class="flex items-center gap-1">
        <div
          class="h-3 w-3 rounded-full"
          :style="{ backgroundColor: props.origin.color }"
        />
        <span>{{ props.origin.color }}</span>
      </div>
    </div>

    <!-- System Origin Notice -->
    <div
      v-if="props.origin.isSystem"
      class="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground"
    >
      <p>Esta origem é do sistema e não pode ser editada ou excluída.</p>
    </div>

    <!-- Cannot Delete Notice -->
    <div
      v-else-if="!canDelete"
      class="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground"
    >
      <p>Esta origem não pode ser excluída pois é do sistema.</p>
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

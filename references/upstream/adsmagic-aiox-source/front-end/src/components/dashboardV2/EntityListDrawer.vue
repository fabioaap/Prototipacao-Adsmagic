<script setup lang="ts">
import { X, User, Briefcase, CheckCircle, ExternalLink } from 'lucide-vue-next'
import { useFormat } from '@/composables/useFormat'
import type { DrillDownEntity } from '@/types'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

interface Props {
  /**
   * Whether drawer is open
   */
  open: boolean
  
  /**
   * Drawer title
   */
  title: string
  
  /**
   * List of entities
   */
  entities: DrillDownEntity[]
  
  /**
   * Loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  entityClick: [entity: DrillDownEntity]
}>()

const { formatCurrency, formatDate } = useFormat()

// Get icon for entity type
function getEntityIcon(type: DrillDownEntity['type']) {
  const icons = {
    contact: User,
    deal: Briefcase,
    sale: CheckCircle
  }
  return icons[type]
}

// Get badge variant for entity type
function getEntityBadgeVariant(type: DrillDownEntity['type']) {
  const variants = {
    contact: 'default',
    deal: 'warning',
    sale: 'success'
  }
  return variants[type] as 'default' | 'warning' | 'success'
}

// Get entity type label
function getEntityTypeLabel(type: DrillDownEntity['type']): string {
  const labels = {
    contact: 'Contato',
    deal: 'Negócio',
    sale: 'Venda'
  }
  return labels[type]
}

// Handle close
function handleClose() {
  emit('update:open', false)
}

// Handle entity click
function handleEntityClick(entity: DrillDownEntity) {
  emit('entityClick', entity)
}
</script>

<template>
  <Drawer
    :open="props.open"
    @update:open="(value) => emit('update:open', value)"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="section-title-sm">
            {{ props.title }}
          </h2>
          <p class="text-sm text-muted-foreground mt-1">
            {{ props.entities.length }} {{ props.entities.length === 1 ? 'item' : 'itens' }}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          @click="handleClose"
          aria-label="Fechar"
        >
          <X class="h-5 w-5" />
        </Button>
      </div>
    </template>

    <template #content>
      <div class="p-6">
        <!-- Loading State -->
        <div v-if="props.loading" class="space-y-4">
          <div
            v-for="i in 5"
            :key="i"
            class="h-24 bg-muted animate-pulse rounded-lg"
          />
        </div>

        <!-- Entity List -->
        <div v-else-if="props.entities.length > 0" class="space-y-3" role="list">
          <button
            v-for="entity in props.entities"
            :key="entity.id"
            class="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent/5 hover:border-accent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="handleEntityClick(entity)"
            role="listitem"
          >
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div
                class="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0"
              >
                <component
                  :is="getEntityIcon(entity.type)"
                  class="h-5 w-5 text-accent-foreground"
                  aria-hidden="true"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="section-kicker truncate">
                      {{ entity.name }}
                    </h4>
                    <p class="text-xs text-muted-foreground mt-0.5">
                      {{ formatDate(entity.createdAt) }}
                    </p>
                  </div>

                  <Badge :variant="getEntityBadgeVariant(entity.type)">
                    {{ getEntityTypeLabel(entity.type) }}
                  </Badge>
                </div>

                <!-- Details -->
                <div class="flex items-center gap-4 text-xs text-muted-foreground">
                  <div class="flex items-center gap-1">
                    <span class="font-medium">Etapa:</span>
                    <span>{{ entity.stage }}</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span class="font-medium">Origem:</span>
                    <span>{{ entity.origin }}</span>
                  </div>

                  <div
                    v-if="entity.value"
                    class="flex items-center gap-1 text-success"
                  >
                    <span class="font-medium">Valor:</span>
                    <span>{{ formatCurrency(entity.value) }}</span>
                  </div>
                </div>
              </div>

              <!-- Arrow -->
              <ExternalLink
                class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                aria-hidden="true"
              />
            </div>
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <div
            class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
          >
            <User class="h-8 w-8 text-muted-foreground" />
          </div>
          <p class="text-sm text-muted-foreground">
            Nenhum item encontrado
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <Button
        variant="outline"
        class="w-full"
        @click="handleClose"
      >
        Fechar
      </Button>
    </template>
  </Drawer>
</template>


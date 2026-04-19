<script setup lang="ts">
import { computed } from 'vue'
import { DollarSign, Calendar, MapPin, Smartphone, Monitor, User } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Drawer from '@/components/ui/Drawer.vue'
import SaleAttribution from '@/components/sales/SaleAttribution.vue'
import type { Sale } from '@/types/models'
import { useContactsStore } from '@/stores/contacts'
import { formatSafeCurrency, formatSafeDate } from '@/utils/formatters'

interface Props {
  /**
   * Se true, exibe o drawer
   */
  open: boolean
  /**
   * Venda a ser exibida
   */
  sale: Sale | null
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  sale: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [sale: Sale]
  delete: [sale: Sale]
}>()

const contactsStore = useContactsStore()

// ============================================================================
// COMPUTED
// ============================================================================

// Get contact data
const contact = computed(() => {
  if (!props.sale?.contactId) return null
  return contactsStore.contacts.find(c => c.id === props.sale?.contactId)
})

// Formatted value
const formattedValue = computed(() => {
  if (!props.sale) return 'R$ 0,00'
  return formatSafeCurrency(props.sale.value)
})

// Formatted date
const formattedDate = computed(() => {
  if (!props.sale?.createdAt) return '-'
  return formatSafeDate(props.sale.createdAt)
})

// Device icon
const deviceIcon = computed(() => {
  if (!props.sale?.device) return Monitor
  return props.sale.device === 'mobile' ? Smartphone : Monitor
})

// Status badge class
const statusBadgeClass = computed(() => {
  if (!props.sale) return 'bg-muted text-muted-foreground'
  
  return props.sale.status === 'completed'
    ? 'bg-success/10 text-success border-success/20'
    : 'bg-destructive/10 text-destructive border-destructive/20'
})

// Status label
const statusLabel = computed(() => {
  if (!props.sale) return '-'
  return props.sale.status === 'completed' ? 'Concluída' : 'Perdida'
})

// ============================================================================
// HANDLERS
// ============================================================================

const handleEdit = () => {
  if (props.sale) {
    emit('edit', props.sale)
  }
}

const handleDelete = () => {
  if (props.sale) {
    emit('delete', props.sale)
  }
}
</script>

<template>
  <Drawer
    :open="props.open && !!props.sale"
    title="Detalhes da Venda"
    :description="props.sale ? `ID: ${props.sale.id.slice(0, 8)}...` : undefined"
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div v-if="props.sale" class="p-4 sm:p-6 space-y-6">
        <!-- Valor e Status -->
        <div class="bg-muted/50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="mb-2 flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <DollarSign class="h-5 w-5 text-success" />
                </div>
                <p class="text-sm text-muted-foreground">Valor</p>
              </div>
              <p class="text-3xl font-bold text-foreground">{{ formattedValue }}</p>
            </div>
            <Badge :class="statusBadgeClass">
              {{ statusLabel }}
            </Badge>
          </div>
        </div>

        <!-- Informações Principais -->
        <section>
          <h3 class="section-kicker mb-3">Informações</h3>
          <div class="space-y-3">
            <!-- Data -->
            <div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Calendar class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Data da Venda</p>
                <p class="text-sm font-medium">{{ formattedDate }}</p>
              </div>
            </div>

            <!-- Contato -->
            <div v-if="contact" class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <User class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Contato</p>
                <p class="text-sm font-medium">{{ contact.name }}</p>
                <p v-if="contact.email" class="text-xs text-muted-foreground">{{ contact.email }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Atribuição (origem, UTMs, click IDs) -->
        <section>
          <h3 class="section-kicker mb-3">Atribuição</h3>
          <SaleAttribution :sale="props.sale" mode="expanded" />
        </section>

        <!-- Informações de Rastreamento (localização e dispositivo) -->
        <section v-if="props.sale.city || props.sale.country || props.sale.device">
          <h3 class="section-kicker mb-3">Localização</h3>
          <div class="space-y-3">
            <!-- Localização -->
            <div v-if="props.sale.city || props.sale.country" class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <MapPin class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Localização</p>
                <p class="text-sm font-medium">
                  {{ [props.sale.city, props.sale.country].filter(Boolean).join(', ') }}
                </p>
              </div>
            </div>

            <!-- Dispositivo -->
            <div v-if="props.sale.device" class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <component :is="deviceIcon" class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Dispositivo</p>
                <p class="text-sm font-medium capitalize">{{ props.sale.device }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Metadados -->
        <section>
          <h3 class="section-kicker mb-3">Metadados</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">ID da Venda</span>
              <span class="font-mono text-xs">{{ props.sale.id }}</span>
            </div>
            <div v-if="props.sale.projectId" class="flex justify-between">
              <span class="text-muted-foreground">ID do Projeto</span>
              <span class="font-mono text-xs">{{ props.sale.projectId }}</span>
            </div>
          </div>
        </section>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" class="flex-1" @click="handleEdit">
          Editar
        </Button>
        <Button variant="destructive" class="flex-1" @click="handleDelete">
          Excluir
        </Button>
      </div>
    </template>
  </Drawer>
</template>

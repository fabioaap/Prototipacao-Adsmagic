<script setup lang="ts">
import { computed } from 'vue'
import { Mail, Phone, MapPin, Eye, Edit2, Trash2, DollarSign } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { Contact, Tag } from '@/types/models'
import { useStagesStore } from '@/stores/stages'
import { useOriginsStore } from '@/stores/origins'
import { formatSafeDate } from '@/utils/formatters'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import StageBadge from '@/components/ui/StageBadge.vue'
import { MoreVertical } from '@/composables/useIcons'

interface Props {
  /**
   * Contato a ser exibido
   */
  contact: Contact
  /**
   * Tags do contato (carregadas no nível da lista)
   */
  tags?: Tag[]
  /**
   * Se true, mostra checkbox de seleção
   */
  selectable?: boolean
  /**
   * Se true, linha está selecionada
   */
  selected?: boolean
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  selectable: false,
  selected: false,
  loading: false,
})

const emit = defineEmits<{
  select: [contact: Contact, selected: boolean]
  viewDetails: [contact: Contact]
  edit: [contact: Contact]
  delete: [contact: Contact]
  addSale: [contact: Contact]
}>()

const stagesStore = useStagesStore()
const originsStore = useOriginsStore()

// Get stage data
const stage = computed(() => {
  return stagesStore.stages.find(s => s.id === props.contact.stage)
})

// Get origin data
const origin = computed(() => {
  return originsStore.origins.find(o => o.id === props.contact.origin)
})

// Avatar fallback (iniciais)
const avatarFallback = computed(() => {
  return props.contact.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// Handle selection
const handleSelect = () => {
  emit('select', props.contact, !props.selected)
}

// Handle actions
const handleViewDetails = () => {
  emit('viewDetails', props.contact)
}

const handleEdit = () => {
  emit('edit', props.contact)
}

const handleDelete = () => {
  emit('delete', props.contact)
}

const handleAddSale = () => {
  emit('addSale', props.contact)
}
</script>

<template>
  <tr
    :class="cn(
      'border-b border-border transition-colors hover:bg-muted/50',
      {
        'bg-muted/30': props.selected,
      }
    )"
  >
    <!-- Checkbox -->
    <td v-if="props.selectable" class="w-12 px-4 py-3">
      <input
        type="checkbox"
        :checked="props.selected"
        class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
        @change="handleSelect"
      />
    </td>

    <!-- Loading State -->
    <template v-if="props.loading">
      <td class="px-4 py-3" colspan="7">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-32 bg-muted animate-pulse rounded" />
            <div class="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </td>
    </template>

    <!-- Content -->
    <template v-else>
      <!-- Nome e Avatar -->
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="relative flex-shrink-0">
            <img
              v-if="props.contact.avatar"
              :src="props.contact.avatar"
              :alt="props.contact.name"
              class="h-10 w-10 rounded-full object-cover"
            />
            <div
              v-else
              class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm"
            >
              {{ avatarFallback }}
            </div>
          </div>
          <div class="min-w-0">
            <p class="font-medium text-sm truncate">
              {{ props.contact.name }}
            </p>
            <p v-if="props.contact.company" class="text-xs text-muted-foreground truncate">
              {{ props.contact.company }}
            </p>
          </div>
        </div>
      </td>

      <!-- Email -->
      <td class="px-4 py-3">
        <div v-if="props.contact.email" class="flex items-center gap-2 text-sm">
          <Mail class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="truncate">{{ props.contact.email }}</span>
        </div>
        <span v-else class="text-sm text-muted-foreground">-</span>
      </td>

      <!-- Telefone -->
      <td class="px-4 py-3">
        <div v-if="props.contact.phone" class="flex items-center gap-2 text-sm">
          <Phone class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{{ props.contact.phone }}</span>
        </div>
        <span v-else class="text-sm text-muted-foreground">-</span>
      </td>

      <!-- Localização -->
      <td class="px-4 py-3">
        <div v-if="props.contact.location" class="flex items-center gap-2 text-sm">
          <MapPin class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="truncate">{{ props.contact.location }}</span>
        </div>
        <span v-else class="text-sm text-muted-foreground">-</span>
      </td>

      <!-- Etapa -->
      <td class="px-4 py-3">
        <StageBadge v-if="stage" :stage="stage" size="md" />
        <span v-else class="text-sm text-muted-foreground">-</span>
      </td>

      <!-- Origem -->
      <td class="px-4 py-3">
        <span v-if="origin" class="text-sm">
          {{ origin.name }}
        </span>
        <span v-else class="text-sm text-muted-foreground">-</span>
      </td>

      <!-- Data de Criação -->
      <td class="px-4 py-3 text-sm text-muted-foreground">
        {{ formatSafeDate(props.contact.createdAt) }}
      </td>

      <!-- Actions -->
      <td class="px-4 py-3">
        <div class="flex items-center justify-end gap-1">
          <button
            class="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            title="Ver detalhes"
            @click="handleViewDetails"
          >
            <Eye class="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            class="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
            title="Adicionar venda"
            @click="handleAddSale"
          >
            <DollarSign class="h-4 w-4 text-muted-foreground" />
          </button>
          <DropdownMenu align="right">
            <template #trigger>
              <button
                type="button"
                class="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                title="Mais ações"
                aria-label="Mais ações"
              >
                <MoreVertical class="h-4 w-4 text-muted-foreground" />
              </button>
            </template>
            <template #default="{ close }">
              <button
                type="button"
                class="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                @click="handleEdit(); close()"
              >
                <Edit2 class="h-4 w-4" />
                <span>Editar</span>
              </button>
              <div class="border-t my-1" />
              <button
                type="button"
                class="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                @click="handleDelete(); close()"
              >
                <Trash2 class="h-4 w-4" />
                <span>Excluir</span>
              </button>
            </template>
          </DropdownMenu>
        </div>
      </td>
    </template>
  </tr>
</template>

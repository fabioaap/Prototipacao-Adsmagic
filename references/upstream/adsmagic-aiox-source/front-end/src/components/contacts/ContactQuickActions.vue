<script setup lang="ts">
import { Eye, Edit2, Trash2, Copy, Archive, Star, MoreVertical } from 'lucide-vue-next'
import type { Contact } from '@/types/models'

interface Props {
  /**
   * Contato para ações
   */
  contact: Contact
  /**
   * Se true, mostra todas as ações (senão mostra apenas básicas)
   */
  showAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAll: false,
})

const emit = defineEmits<{
  viewDetails: [contact: Contact]
  edit: [contact: Contact]
  delete: [contact: Contact]
  duplicate: [contact: Contact]
  archive: [contact: Contact]
  toggleFavorite: [contact: Contact]
}>()

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

const handleDuplicate = () => {
  emit('duplicate', props.contact)
}

const handleArchive = () => {
  emit('archive', props.contact)
}

const handleToggleFavorite = () => {
  emit('toggleFavorite', props.contact)
}
</script>

<template>
  <div class="relative inline-block">
    <!-- Dropdown Menu Button -->
    <div class="group">
      <button
        class="p-1.5 rounded hover:bg-muted transition-colors"
        aria-label="Ações"
      >
        <MoreVertical class="h-4 w-4 text-muted-foreground" />
      </button>

      <!-- Dropdown Menu -->
      <div
        class="absolute right-0 mt-1 w-48 rounded-control shadow-lg bg-popover border border-border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
      >
        <div class="py-1" role="menu">
          <!-- View Details -->
          <button
            class="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            @click="handleViewDetails"
          >
            <Eye class="h-4 w-4" />
            Ver detalhes
          </button>

          <!-- Edit -->
          <button
            class="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            @click="handleEdit"
          >
            <Edit2 class="h-4 w-4" />
            Editar
          </button>

          <!-- Additional Actions (se showAll) -->
          <template v-if="props.showAll">
            <!-- Divider -->
            <div class="border-t border-border my-1" />

            <!-- Duplicate -->
            <button
              class="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              @click="handleDuplicate"
            >
              <Copy class="h-4 w-4" />
              Duplicar
            </button>

            <!-- Toggle Favorite -->
            <button
              class="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              @click="handleToggleFavorite"
            >
              <Star class="h-4 w-4" />
              {{ props.contact.isFavorite ? 'Desfavoritar' : 'Favoritar' }}
            </button>

            <!-- Archive -->
            <button
              class="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              @click="handleArchive"
            >
              <Archive class="h-4 w-4" />
              Arquivar
            </button>
          </template>

          <!-- Divider -->
          <div class="border-t border-border my-1" />

          <!-- Delete -->
          <button
            class="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            @click="handleDelete"
          >
            <Trash2 class="h-4 w-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mantém o menu visível enquanto hover sobre ele */
.group:hover > div,
.group > div:hover {
  opacity: 1;
  visibility: visible;
}
</style>

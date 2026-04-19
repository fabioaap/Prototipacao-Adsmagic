<script setup lang="ts">
/**
 * TagsManager Component
 *
 * Componente para gerenciar tags (criar, editar, excluir).
 * Usado na página de configurações.
 *
 * @component
 */

import { ref, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Tag as TagIcon, Loader2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useTagsStore } from '@/stores/tags'
import { useToast } from '@/components/ui/toast/use-toast'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import TagBadge from './TagBadge.vue'
import type { Tag, CreateTagDTO, UpdateTagDTO } from '@/types'

const tagsStore = useTagsStore()
const { toast } = useToast()

// ============================================================================
// STATE
// ============================================================================

const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isSubmitting = ref(false)
const editingTag = ref<Tag | null>(null)
const tagToDelete = ref<Tag | null>(null)

const formData = ref<CreateTagDTO>({
  name: '',
  color: '#3b82f6',
  description: '',
})

// ============================================================================
// COMPUTED
// ============================================================================

const isEditing = computed(() => editingTag.value !== null)
const formTitle = computed(() => isEditing.value ? 'Editar Tag' : 'Nova Tag')

const formValid = computed(() => {
  const name = formData.value.name.trim()
  if (name.length < 2 || name.length > 50) return false
  
  // Check for duplicates (excluding current tag in edit mode)
  const isDuplicate = tagsStore.tags.some(
    tag => tag.name.toLowerCase() === name.toLowerCase() && tag.id !== editingTag.value?.id
  )
  
  return !isDuplicate
})

// ============================================================================
// METHODS
// ============================================================================

onMounted(async () => {
  if (tagsStore.tags.length === 0) {
    await tagsStore.fetchTags()
  }
})

function openCreateForm() {
  editingTag.value = null
  formData.value = {
    name: '',
    color: tagsStore.availableColors[Math.floor(Math.random() * tagsStore.availableColors.length)] || '#3b82f6',
    description: '',
  }
  isFormOpen.value = true
}

function openEditForm(tag: Tag) {
  editingTag.value = tag
  formData.value = {
    name: tag.name,
    color: tag.color,
    description: tag.description || '',
  }
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editingTag.value = null
}

async function handleSubmit() {
  if (!formValid.value) return
  
  isSubmitting.value = true
  
  try {
    if (isEditing.value) {
      // Update existing tag
      await tagsStore.updateTag(editingTag.value!.id, formData.value as UpdateTagDTO)
      toast({
        title: 'Tag atualizada',
        description: `Tag "${formData.value.name}" foi atualizada com sucesso.`,
      })
    } else {
      // Create new tag
      await tagsStore.createTag(formData.value)
      toast({
        title: 'Tag criada',
        description: `Tag "${formData.value.name}" foi criada com sucesso.`,
      })
    }
    
    closeForm()
  } catch (error) {
    toast({
      title: 'Erro',
      description: error instanceof Error ? error.message : 'Erro ao salvar tag',
      variant: 'destructive',
    })
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(tag: Tag) {
  tagToDelete.value = tag
  isDeleteDialogOpen.value = true
}

async function handleDelete() {
  if (!tagToDelete.value) return
  
  try {
    await tagsStore.deleteTag(tagToDelete.value.id)
    toast({
      title: 'Tag excluída',
      description: `Tag "${tagToDelete.value.name}" foi excluída.`,
    })
    isDeleteDialogOpen.value = false
    tagToDelete.value = null
  } catch (error) {
    toast({
      title: 'Erro',
      description: error instanceof Error ? error.message : 'Erro ao excluir tag',
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="section-title-sm">Tags</h3>
        <p class="text-sm text-muted-foreground">
          Gerencie as tags para categorizar seus contatos.
          {{ tagsStore.tagsCount }}/50 tags criadas.
        </p>
      </div>
      
      <Button
        :disabled="!tagsStore.canCreateTag"
        @click="openCreateForm"
      >
        <Plus class="h-4 w-4 mr-2" />
        Nova Tag
      </Button>
    </div>

    <!-- Loading state -->
    <div
      v-if="tagsStore.isLoading"
      class="flex items-center justify-center py-8"
    >
      <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="tagsStore.tags.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center border rounded-lg"
    >
      <TagIcon class="h-12 w-12 text-muted-foreground mb-4" />
      <h4 class="section-title-sm mb-2">Nenhuma tag criada</h4>
      <p class="text-sm text-muted-foreground mb-4">
        Crie tags para organizar seus contatos.
      </p>
      <Button @click="openCreateForm">
        <Plus class="h-4 w-4 mr-2" />
        Criar primeira tag
      </Button>
    </div>

    <!-- Tags list -->
    <div
      v-else
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="tag in tagsStore.sortedTags"
        :key="tag.id"
        class="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="w-4 h-4 rounded-full shrink-0"
            :style="{ backgroundColor: tag.color }"
          />
          <div class="min-w-0">
            <p class="font-medium truncate">{{ tag.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ tag.contactsCount || 0 }} contato(s)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click="openEditForm(tag)"
          >
            <Pencil class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-destructive hover:text-destructive"
            @click="confirmDelete(tag)"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Form Dialog -->
    <AlertDialog
      :model-value="isFormOpen"
      :title="formTitle"
      :description="isEditing ? 'Atualize as informações da tag.' : 'Preencha as informações para criar uma nova tag.'"
      confirm-text="Salvar"
      cancel-text="Cancelar"
      :loading="isSubmitting"
      @confirm="handleSubmit"
      @cancel="closeForm"
      @update:model-value="(open: boolean) => !open && closeForm()"
    >
      <div class="space-y-4 py-4">
        <!-- Name -->
        <div class="space-y-2">
          <label for="tag-name" class="text-sm font-medium">
            Nome *
          </label>
          <Input
            id="tag-name"
            v-model="formData.name"
            placeholder="Ex: VIP, Quente, Indicação..."
            maxlength="50"
          />
          <p class="text-xs text-muted-foreground">
            {{ formData.name.length }}/50 caracteres
          </p>
        </div>

        <!-- Color -->
        <div class="space-y-2">
          <label class="text-sm font-medium">
            Cor
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in tagsStore.availableColors"
              :key="color"
              type="button"
              :class="cn(
                'w-8 h-8 rounded-full border-2 transition-transform',
                formData.color === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
              )"
              :style="{ backgroundColor: color }"
              :aria-label="`Selecionar cor ${color}`"
              @click="formData.color = color"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label for="tag-description" class="text-sm font-medium">
            Descrição (opcional)
          </label>
          <Input
            id="tag-description"
            v-model="formData.description"
            placeholder="Descrição da tag..."
            maxlength="200"
          />
        </div>

        <!-- Preview -->
        <div class="space-y-2">
          <label class="text-sm font-medium">
            Preview
          </label>
          <TagBadge
            v-if="formData.name"
            :tag="{
              id: 'preview',
              projectId: '',
              name: formData.name,
              color: formData.color,
              createdAt: '',
            }"
            size="md"
          />
          <span v-else class="text-sm text-muted-foreground">
            Digite um nome para ver o preview
          </span>
        </div>
      </div>
    </AlertDialog>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog
      :model-value="isDeleteDialogOpen"
      title="Excluir tag"
      :description="`Tem certeza que deseja excluir a tag '${tagToDelete?.name}'? Esta ação removerá a tag de todos os contatos associados.`"
      confirm-text="Excluir"
      cancel-text="Cancelar"
      variant="destructive"
      @confirm="handleDelete"
      @cancel="isDeleteDialogOpen = false"
      @update:model-value="(open: boolean) => !open && (isDeleteDialogOpen = false)"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * TagSelector Component
 *
 * Dropdown para selecionar múltiplas tags.
 * Permite criar novas tags inline.
 *
 * @component
 */

import { ref, computed, watch, onMounted } from 'vue'
import { Check, Plus, ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useTagsStore } from '@/stores/tags'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import TagBadge from './TagBadge.vue'
import type { Tag } from '@/types'

interface Props {
  /** Currently selected tag IDs */
  modelValue: string[]
  /** Placeholder text */
  placeholder?: string
  /** Allow creating new tags */
  allowCreate?: boolean
  /** Maximum tags that can be selected */
  maxTags?: number
  /** Disable the selector */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecionar tags...',
  allowCreate: true,
  maxTags: 10,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const tagsStore = useTagsStore()

const isOpen = ref(false)
const searchTerm = ref('')
const isCreating = ref(false)
const newTagColor = ref('#3b82f6')

// Load tags on mount
onMounted(async () => {
  if (tagsStore.tags.length === 0) {
    await tagsStore.fetchTags()
  }
})

/**
 * Selected tags based on modelValue
 */
const selectedTags = computed(() => {
  return tagsStore.getTagsByIds(props.modelValue)
})

/**
 * Filtered tags based on search
 */
const filteredTags = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return tagsStore.sortedTags
  
  return tagsStore.sortedTags.filter(tag =>
    tag.name.toLowerCase().includes(term)
  )
})

/**
 * Check if we can create a new tag with current search term
 */
const canCreateNewTag = computed(() => {
  if (!props.allowCreate || !searchTerm.value.trim()) return false
  if (!tagsStore.canCreateTag) return false
  
  // Check if tag with this name already exists
  const term = searchTerm.value.toLowerCase().trim()
  return !tagsStore.sortedTags.some(
    tag => tag.name.toLowerCase() === term
  )
})

/**
 * Check if max tags reached
 */
const maxTagsReached = computed(() => {
  return props.modelValue.length >= props.maxTags
})

/**
 * Toggle tag selection
 */
function toggleTag(tag: Tag) {
  const isSelected = props.modelValue.includes(tag.id)
  
  if (isSelected) {
    // Remove tag
    emit('update:modelValue', props.modelValue.filter(id => id !== tag.id))
  } else {
    // Add tag (if not at max)
    if (!maxTagsReached.value) {
      emit('update:modelValue', [...props.modelValue, tag.id])
    }
  }
}

/**
 * Remove tag from selection
 */
function removeTag(tag: Tag) {
  emit('update:modelValue', props.modelValue.filter(id => id !== tag.id))
}

/**
 * Create new tag
 */
async function createTag() {
  if (!canCreateNewTag.value) return
  
  isCreating.value = true
  
  try {
    const newTag = await tagsStore.createTag({
      name: searchTerm.value.trim(),
      color: newTagColor.value,
    })
    
    // Select the new tag
    if (!maxTagsReached.value) {
      emit('update:modelValue', [...props.modelValue, newTag.id])
    }
    
    searchTerm.value = ''
    newTagColor.value = tagsStore.availableColors[Math.floor(Math.random() * tagsStore.availableColors.length)] || '#3b82f6'
  } catch (error) {
    console.error('Error creating tag:', error)
  } finally {
    isCreating.value = false
  }
}

/**
 * Handle key events
 */
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && canCreateNewTag.value) {
    event.preventDefault()
    createTag()
  }
}

// Reset new tag color when opening
watch(isOpen, (open) => {
  if (open) {
    newTagColor.value = tagsStore.availableColors[Math.floor(Math.random() * tagsStore.availableColors.length)] || '#3b82f6'
  }
})
</script>

<template>
  <div class="w-full">
    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="isOpen"
          :disabled="disabled"
          :class="cn(
            'w-full justify-between min-h-[40px] h-auto',
            !selectedTags.length && 'text-muted-foreground'
          )"
        >
          <div class="flex flex-wrap gap-1 items-center flex-1">
            <template v-if="selectedTags.length">
              <TagBadge
                v-for="tag in selectedTags"
                :key="tag.id"
                :tag="tag"
                size="sm"
                removable
                @remove="removeTag"
              />
            </template>
            <span v-else class="text-muted-foreground">
              {{ placeholder }}
            </span>
          </div>
          <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent class="w-[300px] p-0" align="start">
        <!-- Search input -->
        <div class="p-2 border-b">
          <Input
            v-model="searchTerm"
            placeholder="Buscar ou criar tag..."
            class="h-8"
            @keydown="handleKeyDown"
          />
        </div>

        <!-- Tags list -->
        <div class="max-h-[200px] overflow-y-auto p-1">
          <template v-if="filteredTags.length">
            <button
              v-for="tag in filteredTags"
              :key="tag.id"
              type="button"
              :class="cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-control text-sm',
                'hover:bg-accent transition-colors',
                modelValue.includes(tag.id) && 'bg-accent',
                maxTagsReached && !modelValue.includes(tag.id) && 'opacity-50 cursor-not-allowed'
              )"
              :disabled="maxTagsReached && !modelValue.includes(tag.id)"
              @click="toggleTag(tag)"
            >
              <span
                class="w-3 h-3 rounded-full shrink-0"
                :style="{ backgroundColor: tag.color }"
              />
              <span class="flex-1 text-left truncate">{{ tag.name }}</span>
              <Check
                v-if="modelValue.includes(tag.id)"
                class="h-4 w-4 text-primary shrink-0"
              />
              <span
                v-else-if="tag.contactsCount"
                class="text-xs text-muted-foreground"
              >
                {{ tag.contactsCount }}
              </span>
            </button>
          </template>

          <div
            v-else-if="!canCreateNewTag"
            class="py-4 text-center text-sm text-muted-foreground"
          >
            Nenhuma tag encontrada
          </div>
        </div>

        <!-- Create new tag -->
        <div
          v-if="canCreateNewTag"
          class="border-t p-2"
        >
          <button
            type="button"
            :class="cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-control text-sm',
              'hover:bg-accent transition-colors',
              isCreating && 'opacity-50 cursor-wait'
            )"
            :disabled="isCreating"
            @click="createTag"
          >
            <Plus class="h-4 w-4 text-primary" />
            <span>Criar tag "{{ searchTerm.trim() }}"</span>
          </button>

          <!-- Color picker for new tag -->
          <div class="flex gap-1 mt-2 px-2">
            <button
              v-for="color in tagsStore.availableColors"
              :key="color"
              type="button"
              :class="cn(
                'w-5 h-5 rounded-full border-2 transition-transform',
                newTagColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
              )"
              :style="{ backgroundColor: color }"
              :aria-label="`Selecionar cor ${color}`"
              @click="newTagColor = color"
            />
          </div>
        </div>

        <!-- Max tags warning -->
        <div
          v-if="maxTagsReached"
          class="border-t p-2 text-xs text-muted-foreground text-center"
        >
          Máximo de {{ maxTags }} tags atingido
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

// @ts-nocheck
<template>
  <div>
    <div
      v-if="dialog"
      :class="cn('fixed inset-0 z-50 bg-black/50')"
      :data-testid="dialog ? 'command-dialog-overlay' : undefined"
    >
      <div
        :class="cn(
          'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
          'border bg-background p-6 shadow-lg duration-200 sm:rounded-lg'
        )"
        role="dialog"
        :aria-modal="dialog"
        :data-testid="dialog ? 'command' : undefined"
      >
        <div class="flex flex-col space-y-3">
          <input
            v-model="internalSearchTerm"
            :placeholder="placeholder"
            :class="cn(
              'flex h-10 w-full rounded-control border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            )"
            role="combobox"
            :aria-expanded="true"
            data-testid="input"
            @input="handleInput"
          />
          
          <div
            :class="cn('max-h-[300px] overflow-y-auto')"
            role="listbox"
            data-testid="list"
          >
            <div v-if="filteredItems.length === 0" data-testid="empty">
              {{ emptyText }}
            </div>
            
            <div v-else>
              <div
                v-if="groupHeading"
                :class="cn('px-2 py-1.5 text-xs font-medium text-muted-foreground')"
                :aria-label="groupHeading"
                data-testid="group"
              >
                {{ groupHeading }}
              </div>
              
              <div
                v-for="(item, index) in filteredItems"
                :key="item.id || index"
                :class="cn(
                  'relative flex cursor-pointer select-none items-center rounded-control px-2 py-1.5 text-sm',
                  'outline-none hover:bg-accent hover:text-accent-foreground',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  selectedIndex === index && 'bg-accent text-accent-foreground'
                )"
                role="option"
                :aria-selected="selectedIndex === index"
                :data-selected="selectedIndex === index"
                :data-testid="`item-${item.id || index + 1}`"
                :data-disabled="item.disabled"
                @click="handleSelect(item, index)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Inline Command -->
    <div
      v-else
      :class="cn('flex flex-col space-y-2')"
      data-testid="command"
    >
      <input
        v-model="internalSearchTerm"
        :placeholder="placeholder"
        :class="cn(
          'flex h-10 w-full rounded-control border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )"
        role="combobox"
        :aria-expanded="true"
        data-testid="input"
        @input="handleInput"
      />
      
      <div
        :class="cn('max-h-[300px] overflow-y-auto border rounded-control p-1')"
        role="listbox"
        data-testid="list"
      >
        <div v-if="filteredItems.length === 0" class="p-2 text-sm text-muted-foreground" data-testid="empty">
          {{ emptyText }}
        </div>
        
        <div v-else>
          <div
            v-if="groupHeading"
            :class="cn('px-2 py-1.5 text-xs font-medium text-muted-foreground')"
            :aria-label="groupHeading"
            data-testid="group"
          >
            {{ groupHeading }}
          </div>
          
          <div
            v-for="(item, index) in filteredItems"
            :key="item.id || index"
            :class="cn(
              'relative flex cursor-pointer select-none items-center rounded-control px-2 py-1.5 text-sm',
              'outline-none hover:bg-accent hover:text-accent-foreground transition-colors',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
              selectedIndex === index && 'bg-accent text-accent-foreground'
            )"
            role="option"
            :aria-selected="selectedIndex === index"
            :data-selected="selectedIndex === index"
            :data-testid="`item-${item.id || index + 1}`"
            :data-disabled="item.disabled"
            @click="handleSelect(item, index)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

interface CommandItem {
  id?: string | number
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  open?: boolean
  searchTerm?: string
  placeholder?: string
  emptyText?: string
  groupHeading?: string
  items?: CommandItem[]
  dialog?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'update:searchTerm', value: string): void
  (e: 'select', item: CommandItem): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  searchTerm: '',
  placeholder: 'Type a command...',
  emptyText: 'No results found.',
  groupHeading: 'Commands',
  items: () => [],
  dialog: false
})

const emit = defineEmits<Emits>()

const internalSearchTerm = ref(props.searchTerm)
const selectedIndex = ref(0)
const isOpen = ref(props.open)

// Computed
const filteredItems = computed(() => {
  if (!internalSearchTerm.value) return props.items
  
  return props.items.filter(item => 
    item.label.toLowerCase().includes(internalSearchTerm.value.toLowerCase()) ||
    item.value.toLowerCase().includes(internalSearchTerm.value.toLowerCase())
  )
})

// Methods
const handleInput = () => {
  emit('update:searchTerm', internalSearchTerm.value)
  selectedIndex.value = 0 // Reset selection
}

const handleSelect = (item: CommandItem, index: number) => {
  if (item.disabled) return
  
  selectedIndex.value = index
  emit('select', item)
  
  if (props.dialog) {
    emit('update:open', false)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value && !props.dialog) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (selectedIndex.value < filteredItems.value.length - 1) {
        selectedIndex.value++
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (selectedIndex.value > 0) {
        selectedIndex.value--
      }
      break
    case 'Home':
      event.preventDefault()
      selectedIndex.value = 0
      break
    case 'End':
      event.preventDefault()
      selectedIndex.value = filteredItems.value.length - 1
      break
    case 'Enter':
      event.preventDefault()
      if (filteredItems.value[selectedIndex.value]) {
        handleSelect(filteredItems.value[selectedIndex.value], selectedIndex.value)
      }
      break
    case 'Escape':
      if (props.dialog) {
        emit('update:open', false)
      }
      break
  }
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Cmd+K or Ctrl+K to open dialog
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    if (props.dialog) {
      emit('update:open', true)
    }
  }
}

// Watchers
watch(() => props.searchTerm, (newValue) => {
  internalSearchTerm.value = newValue
})

watch(() => props.open, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:open', newValue)
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  if (props.dialog) {
    document.addEventListener('keydown', handleGlobalKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (props.dialog) {
    document.removeEventListener('keydown', handleGlobalKeydown)
  }
})
</script>
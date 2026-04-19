<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'

interface Props {
  /**
   * Cor selecionada
   */
  modelValue: string
  /**
   * Se true, está desabilitado
   */
  disabled?: boolean
  /**
   * Cores predefinidas para escolha rápida
   */
  presets?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  presets: () => [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#6366f1', // Indigo
    '#f43f5e', // Rose
    '#14b8a6', // Teal
  ],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Estado local
const isOpen = ref(false)

// Computed
const selectedColor = computed(() => props.modelValue)

// Handlers
const handleColorChange = (color: string) => {
  emit('update:modelValue', color)
}

const handlePresetClick = (color: string) => {
  handleColorChange(color)
}

const toggleOpen = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}
</script>

<template>
  <div class="relative">
    <!-- Color Button -->
    <Button
      type="button"
      variant="outline"
      :disabled="props.disabled"
      @click="toggleOpen"
    >
      <div class="flex items-center gap-2">
        <div
          class="h-4 w-4 rounded border border-border"
          :style="{ backgroundColor: selectedColor }"
        />
        <span class="text-sm">{{ selectedColor }}</span>
      </div>
    </Button>

    <!-- Color Picker Dropdown -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 mt-2 p-4 bg-card border border-border rounded-lg shadow-lg z-50 min-w-64"
    >
      <!-- Custom Color Input -->
      <div class="space-y-3">
        <div class="space-y-2">
          <label class="text-sm font-medium">Cor Personalizada</label>
          <div class="flex items-center gap-2">
            <input
              v-model="selectedColor"
              type="color"
              class="h-10 w-10 rounded border border-border cursor-pointer"
              :disabled="props.disabled"
              @input="handleColorChange(($event.target as HTMLInputElement)?.value)"
            />
            <input
              v-model="selectedColor"
              type="text"
              placeholder="#3b82f6"
              class="flex-1 px-3 py-2 border border-border rounded-control text-sm"
              :disabled="props.disabled"
              @input="handleColorChange(($event.target as HTMLInputElement)?.value)"
            />
          </div>
        </div>

        <!-- Color Presets -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Cores Predefinidas</label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="color in props.presets"
              :key="color"
              type="button"
              :class="cn(
                'h-8 w-8 rounded border-2 border-border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20',
                selectedColor === color ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
              )"
              :style="{ backgroundColor: color }"
              :disabled="props.disabled"
              @click="handlePresetClick(color)"
            >
              <Check
                v-if="selectedColor === color"
                class="h-4 w-4 text-white drop-shadow-sm"
              />
            </button>
          </div>
        </div>

        <!-- Selected Color Preview -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Preview</label>
          <div class="p-3 border border-border rounded-lg bg-muted/20">
            <div class="flex items-center gap-3">
              <div
                class="h-8 w-8 rounded-full flex items-center justify-center"
                :style="{ backgroundColor: selectedColor + '20', color: selectedColor }"
              >
                <div class="h-4 w-4 rounded-full" :style="{ backgroundColor: selectedColor }" />
              </div>
              <div>
                <p class="font-medium text-sm">Cor Selecionada</p>
                <p class="text-xs text-muted-foreground">{{ selectedColor }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    />
  </div>
</template>

<style scoped>
/* Custom scrollbar for color presets if needed */
.grid {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground)) transparent;
}

.grid::-webkit-scrollbar {
  width: 4px;
}

.grid::-webkit-scrollbar-track {
  background: transparent;
}

.grid::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted-foreground));
  border-radius: 2px;
}
</style>

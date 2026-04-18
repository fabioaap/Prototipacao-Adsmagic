<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { Country, CountrySelectProps, CountrySelectEmits } from '@/types/country'
import { COUNTRIES } from '@/types/country'

const props = withDefaults(defineProps<CountrySelectProps>(), {
  disabled: false,
  placeholder: 'Selecione um país'
})

const emit = defineEmits<CountrySelectEmits>()

// Estado local
const isOpen = ref(false)
const searchQuery = ref('')
const selectedCountry = ref<Country | null>(props.modelValue ?? null)

// Computed
const filteredCountries = computed(() => {
  if (!searchQuery.value) {
    return COUNTRIES
  }
  
  const query = searchQuery.value.toLowerCase()
  return COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(query) ||
    country.namePt.toLowerCase().includes(query) ||
    country.ddi.includes(query) ||
    country.code.toLowerCase().includes(query)
  )
})

const displayValue = computed(() => {
  if (!selectedCountry.value) return ''
  return `${selectedCountry.value.flag} ${selectedCountry.value.namePt} (${selectedCountry.value.ddi})`
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  selectedCountry.value = newValue ?? null
})

watch(selectedCountry, (newCountry) => {
  if (newCountry) {
    emit('update:modelValue', newCountry)
  }
})

// Métodos
const selectCountry = (country: Country) => {
  selectedCountry.value = country
  isOpen.value = false
  searchQuery.value = ''
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  
  switch (event.key) {
    case 'Escape':
      isOpen.value = false
      searchQuery.value = ''
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      toggleDropdown()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
      }
      break
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.country-select')) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

// Classes CSS
const triggerClass = cn(
  'flex h-10 w-full items-center justify-between rounded-control border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'cursor-pointer hover:bg-accent hover:text-accent-foreground'
)

const dropdownClass = cn(
  'absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-control border border-input bg-background shadow-lg',
  'animate-in fade-in-0 zoom-in-95'
)

const optionClass = cn(
  'relative flex cursor-pointer items-center gap-3 px-3 py-2 text-sm',
  'hover:bg-accent hover:text-accent-foreground',
  'focus:bg-accent focus:text-accent-foreground focus:outline-none'
)
</script>

<template>
  <div class="country-select relative" @click-outside="handleClickOutside">
    <!-- Trigger -->
    <div
      :class="triggerClass"
      @click="toggleDropdown"
      @keydown="handleKeydown"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
    >
      <span v-if="selectedCountry" class="truncate">
        {{ displayValue }}
      </span>
      <span v-else class="text-muted-foreground">
        {{ placeholder }}
      </span>
      
      <!-- Arrow Icon -->
      <svg
        :class="cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isOpen" :class="dropdownClass">
        <!-- Search Input -->
        <div class="p-2 border-b border-input">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar país..."
            class="w-full px-3 py-2 text-sm border border-input rounded-control bg-background"
            @click.stop
          />
        </div>

        <!-- Countries List -->
        <div class="py-1">
          <div
            v-for="country in filteredCountries"
            :key="country.code"
            :class="optionClass"
            @click="selectCountry(country)"
            :aria-selected="selectedCountry?.code === country.code"
            role="option"
          >
            <span class="text-lg">{{ country.flag }}</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium">{{ country.namePt }}</div>
              <div class="text-xs text-muted-foreground">{{ country.name }}</div>
            </div>
            <span class="text-sm font-mono text-muted-foreground">{{ country.ddi }}</span>
          </div>

          <!-- No Results -->
          <div v-if="filteredCountries.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
            Nenhum país encontrado
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-in {
  animation: fade-in 0.1s ease-out, zoom-in 0.1s ease-out;
}
</style>

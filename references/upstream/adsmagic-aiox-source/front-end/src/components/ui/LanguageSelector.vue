<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLanguageStore, LANGUAGES, type Locale } from '@/stores/language'
import { useLocalizedRoute } from '@/composables/useLocalizedRoute'

const languageStore = useLanguageStore()
const { switchLocale } = useLocalizedRoute()

// State
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Computed
const currentLanguage = computed(() => languageStore.getCurrentLanguage())

/**
 * Alterna abertura do dropdown
 */
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

/**
 * Seleciona um idioma e navega para a mesma rota com novo locale
 */
const selectLanguage = (code: Locale) => {
  // Fecha dropdown
  isOpen.value = false

  // Se já está no idioma selecionado, não faz nada
  if (code === languageStore.currentLocale) {
    return
  }

  // Troca o locale (que vai atualizar a URL via router)
  switchLocale(code)
}

/**
 * Fecha dropdown quando clica fora
 */
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="language-selector" ref="dropdownRef">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="language-button"
      :class="{ 'active': isOpen }"
      :aria-label="`Current language: ${currentLanguage.nativeName}`"
      :aria-expanded="isOpen"
      data-testid="language-trigger"
    >
      <span class="flag" role="img" :aria-label="currentLanguage.name">
        {{ currentLanguage.flag }}
      </span>
      <span class="code">{{ currentLanguage.code.toUpperCase() }}</span>
      <svg
        class="chevron"
        :class="{ 'rotated': isOpen }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu" role="menu" data-testid="language-menu">
        <button
          v-for="lang in LANGUAGES"
          :key="lang.code"
          type="button"
          @click="selectLanguage(lang.code)"
          class="dropdown-item"
          :class="{ 'selected': lang.code === currentLanguage.code }"
          role="menuitem"
        >
          <span class="flag" role="img" :aria-label="lang.name">
            {{ lang.flag }}
          </span>
          <span class="language-info">
            <span class="native-name">{{ lang.nativeName }}</span>
            <span class="code-small">{{ lang.code.toUpperCase() }}</span>
          </span>
          <svg
            v-if="lang.code === currentLanguage.code"
            class="check-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.3337 4L6.00033 11.3333L2.66699 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
  z-index: 50;
}

.language-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sym-space-3);
  padding: 0 var(--sym-space-6);
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-control);
  color: hsl(var(--foreground));
  font-size: var(--sym-font-size-3);
  font-weight: 500;
  letter-spacing: 0.7px;
  line-height: var(--sym-line-3);
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  height: var(--sym-control-height-md);
  box-sizing: border-box;
}

.language-button:hover {
  background: hsl(var(--secondary));
  border-color: hsl(var(--border));
}

.language-button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.language-button.active {
  background: hsl(var(--secondary));
  border-color: hsl(var(--border));
}

.flag {
  font-size: 1.25rem;
  line-height: 1;
}

.code {
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1;
  display: flex;
  align-items: center;
}

.chevron {
  transition: transform 0.2s ease;
  color: hsl(var(--muted-foreground));
  display: flex;
  align-items: center;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px hsl(var(--foreground) / 0.12), 0 4px 6px -2px hsl(var(--foreground) / 0.08);
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background: hsl(var(--secondary));
}

.dropdown-item:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: -2px;
  z-index: 1;
}

.dropdown-item.selected {
  background: hsl(var(--secondary));
}

.dropdown-item .flag {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.language-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.native-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.code-small {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.check-icon {
  color: hsl(var(--primary));
  flex-shrink: 0;
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Responsive */
@media (max-width: 640px) {
  .language-button {
    padding: 0.375rem 0.625rem;
  }

  .code {
    display: none;
  }

  .dropdown-menu {
    min-width: 180px;
  }
}
</style>

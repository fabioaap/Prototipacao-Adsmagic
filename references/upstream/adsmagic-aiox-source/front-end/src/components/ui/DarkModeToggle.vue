<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '@/composables/useDarkMode'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

const { isDark, toggle } = useDarkMode()

const modeLabel = computed(() => isDark.value ? t('ui.darkMode.lightMode') : t('ui.darkMode.darkMode'))
const ariaLabel = computed(() => t('ui.darkMode.toggleMode'))
</script>

<template>
  <button
    @click="toggle"
    class="inline-flex items-center justify-center gap-2 rounded-control px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    type="button"
    :aria-label="ariaLabel"
  >
    <Moon v-if="!isDark" class="h-4 w-4" />
    <Sun v-else class="h-4 w-4" />
    <span>{{ modeLabel }}</span>
  </button>
</template>

<style scoped>
</style>

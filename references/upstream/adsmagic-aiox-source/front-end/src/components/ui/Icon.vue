<script setup lang="ts">
/**
 * @deprecated Use icons from @/composables/useIcons instead. This component will be removed in Phase 3.
 * 
 * Migration guide:
 * ```diff
 * - <Icon name="home" :size="20" />
 * + <script setup>
 * + import { Home } from '@/composables/useIcons'
 * + </script>
 * + <Home :size="20" />
 * ```
 * 
 * Icon mapping:
 * - name="home" → Home from Lucide
 * - name="users" → Users from Lucide
 * - name="sales" → BarChart3 or DollarSign from Lucide
 * - name="bell" → Bell from Lucide
 * - name="menu" → Menu from Lucide
 * 
 * See specs/005-design-system-consolidation/quickstart.md for details.
 */
interface Props {
  name: 'home' | 'users' | 'sales' | 'bell' | 'menu'
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
})
</script>

<template>
  <span class="inline-flex items-center justify-center" :style="{ width: props.size + 'px', height: props.size + 'px' }" aria-hidden="true">
    <svg v-if="props.name === 'home'" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full">
      <path d="M10.707 1.707a1 1 0 00-1.414 0l-8 8A1 1 0 002 11h1v6a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-8-8z" />
    </svg>
    <svg v-else-if="props.name === 'users'" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full">
      <path fill-rule="evenodd" d="M10 6a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
    </svg>
    <svg v-else-if="props.name === 'sales'" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full">
      <path d="M3 3h2v14H3V3zm12 0h2v14h-2V3zM8 7h4v10H8V7z" />
    </svg>
    <svg v-else-if="props.name === 'bell'" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 002-2H8a2 2 0 002 2z" />
    </svg>
    <svg v-else viewBox="0 0 20 20" fill="currentColor" class="w-full h-full">
      <path d="M3 6h14v2H3V6zm0 4h14v2H3v-2zm0 4h14v2H3v-2z" />
    </svg>
  </span>
</template>

<style scoped>
</style>



<script setup lang="ts">
/**
 * Origin Badge Component
 * Renderiza badge circular colorido + nome da origem
 * Usado na Origins Performance Table
 */
import { computed } from 'vue'
import type { OriginPerformance } from '@/types'

interface Props {
  origin: Partial<Pick<OriginPerformance, 'name' | 'color' | 'origin'>>
}

const props = defineProps<Props>()

// Nome a exibir (prioriza 'name', fallback para 'origin')
const displayName = computed(() => props.origin.name || props.origin.origin || 'Desconhecido')

// Cor para o badge (fallback para cinza)
const badgeColor = computed(() => props.origin.color || '#94a3b8')

// Estilo inline para o badge circular (cor dinâmica)
const badgeStyle = computed(() => ({
  backgroundColor: badgeColor.value,
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  flexShrink: 0
}))
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Badge circular colorido -->
    <div :style="badgeStyle" />
    
    <!-- Nome da origem -->
    <span class="text-sm font-medium text-slate-900">
      {{ displayName }}
    </span>
  </div>
</template>

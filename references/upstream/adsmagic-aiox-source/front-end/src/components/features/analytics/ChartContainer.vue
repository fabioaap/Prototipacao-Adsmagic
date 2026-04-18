<script setup lang="ts">
import { cn } from '@/lib/utils'
import { AlertCircle, Inbox } from 'lucide-vue-next'

interface Props {
  title?: string
  isLoading?: boolean
  error?: string | null
  isEmpty?: boolean
  height?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  isLoading: false,
  error: null,
  isEmpty: false,
  height: 'md',
})

const heightClasses = {
  sm: 'h-48',
  md: 'h-80',
  lg: 'h-96',
}
</script>

<template>
  <div
    :class="cn(
      'w-full rounded-lg border bg-white dark:bg-slate-900',
      'border-slate-200 dark:border-slate-700',
      'overflow-hidden'
    )"
  >
    <!-- Header -->
    <div v-if="title" class="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <h3 class="section-title-sm">
        {{ title }}
      </h3>
    </div>

    <!-- Content -->
    <div :class="cn('relative', heightClasses[height as keyof typeof heightClasses])">
      <!-- Chart content (default slot) -->
      <div
        v-if="!isLoading && !error && !isEmpty"
        class="w-full h-full p-6 overflow-auto"
      >
        <slot />
      </div>

      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/50"
      >
        <div class="flex flex-col items-center gap-3">
          <div
            class="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"
          />
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Carregando...
          </p>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-if="error"
        class="absolute inset-0 flex items-center justify-center bg-destructive/10"
      >
        <div class="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle class="w-8 h-8 text-destructive" />
          <div>
            <p class="text-sm font-medium text-destructive">
              Erro ao carregar dados
            </p>
            <p class="text-xs text-destructive mt-1">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="isEmpty && !isLoading && !error"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <Inbox class="w-12 h-12 text-slate-400 dark:text-slate-500" />
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Nenhum dado disponível
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
              <slot name="empty-message">Tente ajustar seus filtros</slot>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

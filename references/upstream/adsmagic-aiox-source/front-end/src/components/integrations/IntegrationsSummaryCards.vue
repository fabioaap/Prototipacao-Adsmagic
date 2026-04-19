<script setup lang="ts">
interface Props {
  connectedCount: number
  availablePlatforms?: number
}

const props = withDefaults(defineProps<Props>(), {
  availablePlatforms: 4,
})
</script>

<template>
  <div class="flex w-full flex-col items-stretch gap-3 sm:flex-1 sm:flex-row sm:flex-wrap">
    <div class="w-full rounded-surface border border-border bg-card px-4 py-3 sm:min-w-[148px] sm:w-auto">
      <div class="mb-1 text-sm text-muted-foreground">Integrações conectadas</div>
      <div class="text-2xl font-bold leading-none">{{ props.connectedCount }}</div>
    </div>

    <div class="w-full rounded-surface border border-border bg-card px-4 py-3 sm:min-w-[148px] sm:w-auto">
      <div class="mb-1 text-sm text-muted-foreground">Plataformas suportadas</div>
      <div class="text-2xl font-bold leading-none">{{ props.availablePlatforms }}</div>
    </div>
  </div>
</template>

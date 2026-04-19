<script setup lang="ts">
interface Props {
  projectName: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col" data-testid="project-name">
    <span 
      class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      data-testid="project-name-label"
    >
      Nome do projeto
    </span>
    <h1 
      class="text-lg font-semibold text-foreground leading-tight truncate max-w-[280px]"
      :title="projectName"
      data-testid="project-name-title"
    >
      {{ projectName }}
    </h1>
  </div>
</template>

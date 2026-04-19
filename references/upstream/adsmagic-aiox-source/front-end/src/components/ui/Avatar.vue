<script setup lang="ts">
interface Props {
  src?: string
  name?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  name: '',
  size: 32,
})

function initials(name?: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}
</script>

<template>
  <div
    class="inline-flex items-center justify-center rounded-full bg-muted text-foreground/80 overflow-hidden"
    :style="{ width: props.size + 'px', height: props.size + 'px', fontSize: Math.max(10, Math.floor(props.size/3)) + 'px' }"
    aria-label="Avatar"
  >
    <img v-if="props.src" :src="props.src" alt="" class="w-full h-full object-cover" />
    <span v-else>{{ initials(props.name) }}</span>
  </div>
</template>

<style scoped>
</style>



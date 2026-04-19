<script setup lang="ts">
interface Props {
  stickyHeader?: boolean
  density?: 'comfortable' | 'compact'
  loading?: boolean
  empty?: boolean
}

withDefaults(defineProps<Props>(), {
  stickyHeader: true,
  density: 'comfortable',
  loading: false,
  empty: false,
})
</script>

<template>
  <div class="w-full overflow-x-auto scrollbar-thin">
    <div v-if="loading" class="p-6 text-sm text-muted-foreground">Carregando...</div>
    <div v-else-if="empty" class="p-6 text-sm text-muted-foreground">Sem dados para exibir</div>
    <table v-else :class="['w-full text-sm', density === 'compact' ? 'leading-tight' : 'leading-normal']">
      <thead :class="['bg-muted text-muted-foreground', stickyHeader ? 'sticky top-0 z-10' : '']">
        <tr>
          <slot name="head" />
        </tr>
      </thead>
      <tbody class="bg-card divide-y">
        <slot />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
</style>



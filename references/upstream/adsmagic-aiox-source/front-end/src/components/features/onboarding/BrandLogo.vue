<script setup lang="ts">
interface Props {
  height?: number
}

import logoUrl from '@/assets/saas-logo.svg'

const props = withDefaults(defineProps<Props>(), {
  height: 48,
})
</script>

<template>
  <img
    :src="logoUrl"
    alt="Adsmagic logo"
    :style="{ height: props.height + 'px' }"
    class="mx-auto"
  />
</template>

<style scoped>
</style>



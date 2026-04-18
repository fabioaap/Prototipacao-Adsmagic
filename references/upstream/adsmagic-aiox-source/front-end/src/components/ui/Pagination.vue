<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  page: number
  pageSize: number
  total: number
}

const props = defineProps<Props>()

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()
const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:current-page', value: number): void
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < pageCount.value)

function goTo(page: number) {
  const clamped = Math.min(pageCount.value, Math.max(1, page))
  emit('update:page', clamped)
  emit('update:current-page', clamped)
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 text-sm">
    <div class="text-muted-foreground">
      {{ t('ui.pagination.pageOf', { current: page, total: pageCount }) }}
    </div>
    <div class="flex items-center gap-2">
      <button class="px-3 py-1 rounded-control border disabled:opacity-50" :disabled="!canPrev" @click="goTo(page - 1)">{{ t('ui.pagination.previous') }}</button>
      <button class="px-3 py-1 rounded-control border disabled:opacity-50" :disabled="!canNext" @click="goTo(page + 1)">{{ t('ui.pagination.next') }}</button>
    </div>
  </div>
</template>

<style scoped>
</style>


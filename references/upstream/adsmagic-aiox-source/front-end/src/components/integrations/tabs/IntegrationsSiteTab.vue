<template>
  <div class="grid min-w-0 gap-6">
    <TagScriptCard
      :project-id="projectId"
      :script-code="scriptCode"
      :is-installed="isInstalled"
      :loading="loading"
      :events-received="eventsReceived"
      :last-ping="lastPing"
      @copy="emit('copy')"
      @check-installation="emit('check-installation')"
    />
  </div>
</template>

<script setup lang="ts">
import TagScriptCard from '@/components/integrations/TagScriptCard.vue'

interface Props {
  projectId: string
  scriptCode?: string
  isInstalled: boolean
  loading?: boolean
  eventsReceived?: number
  lastPing?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  eventsReceived: 0,
  scriptCode: undefined,
  lastPing: undefined,
})

const emit = defineEmits<{
  copy: []
  'check-installation': []
}>()
</script>

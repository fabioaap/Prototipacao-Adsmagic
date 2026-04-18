<script setup lang="ts">
import { ChevronRight, X } from 'lucide-vue-next'
import type { CampaignsHierarchySelection, CampaignsTableLevel } from '@/types/campaigns'

interface Props {
  selection: CampaignsHierarchySelection
  activeTab: CampaignsTableLevel
}

const props = defineProps<Props>()

const emit = defineEmits<{
  navigate: [level: CampaignsTableLevel]
  clear: []
}>()

function handleNavigate(level: CampaignsTableLevel) {
  emit('navigate', level)
}
</script>

<template>
  <div
    v-if="props.selection.campaignId"
    class="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
  >
    <button
      type="button"
      class="text-muted-foreground hover:text-foreground transition-colors font-medium"
      @click="handleNavigate('campaign')"
    >
      Todas campanhas
    </button>

    <ChevronRight class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />

    <button
      v-if="props.selection.adsetId"
      type="button"
      class="text-muted-foreground hover:text-foreground transition-colors font-medium truncate max-w-[200px]"
      :title="props.selection.campaignName ?? undefined"
      @click="handleNavigate('adset')"
    >
      {{ props.selection.campaignName }}
    </button>
    <span
      v-else
      class="text-foreground font-semibold truncate max-w-[200px]"
      :title="props.selection.campaignName ?? undefined"
    >
      {{ props.selection.campaignName }}
    </span>

    <template v-if="props.selection.adsetId">
      <ChevronRight class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <span
        class="text-foreground font-semibold truncate max-w-[200px]"
        :title="props.selection.adsetName ?? undefined"
      >
        {{ props.selection.adsetName }}
      </span>
    </template>

    <button
      type="button"
      class="ml-auto text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
      title="Limpar filtro"
      @click="emit('clear')"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

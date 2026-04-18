<script setup lang="ts">
import { computed } from 'vue'

export interface ChannelData {
  name: string
  value: number
  percentage: number
  color: string
}

interface Props {
  title: string
  subtitle: string
  totalLabel: string
  totalValue: string
  channels: ChannelData[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  channelClick: [channel: ChannelData]
}>()

// Calcular stroke-dasharray para cada canal
const channelsWithStroke = computed(() => {
  const circumference = 2 * Math.PI * 70 // r=70
  let cumulativeOffset = 0

  return props.channels.map((channel) => {
    const dashLength = (channel.percentage / 100) * circumference
    const dashArray = `${dashLength} ${circumference}`
    const offset = -cumulativeOffset
    cumulativeOffset += dashLength

    return {
      ...channel,
      dashArray,
      offset
    }
  })
})
</script>

<template>
  <div class="card-shadow rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="section-title-sm">{{ title }}</h2>
        <p class="text-xs text-slate-500">{{ subtitle }}</p>
      </div>
      <div class="rounded-xl bg-info/10 px-3 py-1 text-xs font-medium text-info self-start">
        {{ totalLabel }}: {{ totalValue }}
      </div>
    </div>
    
    <div class="mt-4 flex flex-col items-center gap-4 sm:mt-6 sm:flex-row sm:gap-6">
      <!-- Donut Chart -->
      <div class="flex-1 w-full sm:w-auto">
        <div class="relative mx-auto h-28 w-28 sm:h-44 sm:w-44 lg:h-48 lg:w-48">
          <svg viewBox="0 0 200 200" class="h-full w-full -rotate-90">
            <circle
              v-for="(channel, index) in channelsWithStroke"
              :key="index"
              cx="100"
              cy="100"
              r="70"
              fill="none"
              :stroke="channel.color"
              stroke-width="20"
              :stroke-dasharray="channel.dashArray"
              :stroke-dashoffset="channel.offset"
              class="transition-all duration-500"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <p class="text-sm section-title-sm">{{ (title.split(' ')[0] || '').toUpperCase() }}</p>
              <p class="text-xs sm:text-base font-semibold text-slate-700">{{ totalValue }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex w-full flex-col gap-2 text-xs sm:w-40 sm:gap-3">
        <button
          v-for="channel in channels"
          :key="channel.name"
          class="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors cursor-pointer hover:bg-slate-100"
          @click="emit('channelClick', channel)"
        >
          <div
            class="h-3 w-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: channel.color }"
          />
          <span class="text-slate-600 truncate">{{ channel.name }}</span>
          <span class="ml-auto section-title-sm">{{ channel.percentage.toFixed(1) }}%</span>
        </button>
      </div>
    </div>
  </div>
</template>

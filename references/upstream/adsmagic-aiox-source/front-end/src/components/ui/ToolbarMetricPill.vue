<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="cn(
      'inline-flex h-[40px] items-center justify-center gap-2 rounded-[14px] border border-[#e5e7eb] bg-white px-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] whitespace-nowrap',
      props.class
    )"
  >
    <span class="text-[14px] leading-5 text-[#64748b]">{{ label }}</span>
    <span class="text-[14px] font-medium leading-5 text-[#020817]">{{ value }}</span>
  </div>
</template>
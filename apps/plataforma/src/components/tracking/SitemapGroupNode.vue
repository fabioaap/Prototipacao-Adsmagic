<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

type GroupNodeData = {
  label: string
  icon: string
  count: number
  tone: 'blue' | 'violet' | 'emerald' | 'amber' | 'slate' | 'rose'
}

defineProps<NodeProps<GroupNodeData>>()

const toneClasses = {
  blue: 'border-sky-500/25 bg-sky-500/10 text-sky-200',
  violet: 'border-violet-500/25 bg-violet-500/10 text-violet-200',
  emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
  slate: 'border-slate-700 bg-slate-800/90 text-slate-200',
  rose: 'border-rose-500/25 bg-rose-500/10 text-rose-200',
} as const
</script>

<template>
  <div class="relative min-w-[180px] rounded-3xl border px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)]" :class="toneClasses[data.tone]">
    <Handle id="left" type="target" :position="Position.Left" class="!h-2 !w-2 !border-0 !bg-transparent opacity-0" />
    <Handle id="right" type="source" :position="Position.Right" class="!h-2 !w-2 !border-0 !bg-transparent opacity-0" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="!h-2 !w-2 !border-0 !bg-transparent opacity-0" />

    <div class="flex items-center gap-3">
      <span class="text-lg">{{ data.icon }}</span>
      <div>
        <p class="text-sm font-semibold">{{ data.label }}</p>
        <p class="text-xs opacity-75">{{ data.count }} rotas</p>
      </div>
    </div>
  </div>
</template>
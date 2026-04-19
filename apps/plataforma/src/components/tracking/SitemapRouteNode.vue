<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

type RouteNodeData = {
  name: string
  path: string
  requiresAuth: boolean
}

const props = defineProps<NodeProps<RouteNodeData>>()

function openRoute() {
  window.open(`${window.location.origin}${props.data.path}`, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <button
    type="button"
    class="relative w-[124px] rounded-2xl border p-3 text-left shadow-[0_10px_20px_rgba(0,0,0,0.16)] transition-transform duration-150 hover:-translate-y-0.5"
    :class="data.requiresAuth
      ? 'border-slate-700 bg-slate-950 text-slate-100'
      : 'border-slate-200/10 bg-slate-50 text-slate-900'"
    @click.stop="openRoute"
  >
    <Handle id="top" type="target" :position="Position.Top" class="!h-2 !w-2 !border-0 !bg-transparent opacity-0" />
    <Handle id="left" type="target" :position="Position.Left" class="!h-2 !w-2 !border-0 !bg-transparent opacity-0" />

    <p class="truncate text-[11px] font-semibold">{{ data.name }}</p>
    <p class="mt-1 truncate text-[10px] opacity-70">{{ data.path }}</p>
  </button>
</template>
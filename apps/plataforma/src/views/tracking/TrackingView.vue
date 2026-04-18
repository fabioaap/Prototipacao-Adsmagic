<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import type { Node, Edge } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

import SitemapGroupNode from '@/components/tracking/SitemapGroupNode.vue'
import SitemapRouteNode from '@/components/tracking/SitemapRouteNode.vue'
import { mockRoutes, routeGroupMeta } from '@/data/tracking'

const nodeTypes = {
  group: SitemapGroupNode,
  route: SitemapRouteNode,
}

const ROUTE_GAP = 85
const GROUP_SECTION_PAD = 24
const GROUP_X = 20
const ROUTE_X = 290

function toNodeId(group: string) {
  return `group-${group.toLowerCase().replace(/\s+/g, '-')}`
}

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  let cumY = 0

  for (const groupMeta of routeGroupMeta) {
    const routes = mockRoutes.filter(r => r.group === groupMeta.group)
    if (routes.length === 0) continue

    const sectionHeight = routes.length * ROUTE_GAP
    const groupY = cumY + sectionHeight / 2 - 32

    nodes.push({
      id: toNodeId(groupMeta.group),
      type: 'group',
      position: { x: GROUP_X, y: groupY },
      data: {
        label: groupMeta.label,
        icon: groupMeta.icon,
        count: routes.length,
        tone: groupMeta.tone,
      },
    })

    routes.forEach((route, i) => {
      nodes.push({
        id: route.id,
        type: 'route',
        position: { x: ROUTE_X, y: cumY + i * ROUTE_GAP },
        data: {
          name: route.name,
          path: route.path,
          requiresAuth: route.requiresAuth,
        },
      })

      edges.push({
        id: `e-${route.id}`,
        source: toNodeId(groupMeta.group),
        target: route.id,
        sourceHandle: 'right',
        targetHandle: 'left',
        type: 'smoothstep',
        style: { stroke: '#3f3f46', strokeWidth: 1.5 },
      })
    })

    cumY += sectionHeight + GROUP_SECTION_PAD
  }

  return { nodes, edges }
}

const { nodes, edges } = buildGraph()

const totalRoutes = mockRoutes.length
const totalGroups = routeGroupMeta.filter(g => mockRoutes.some(r => r.group === g.group)).length
const authRequired = mockRoutes.filter(r => r.requiresAuth).length
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-6 pb-4">
    <section class="border-b border-slate-900 pb-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Mapa de navegação</p>
      <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Rotas</h2>
      <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
        Mapa estrutural das rotas da plataforma Adsmagic. Clique em qualquer nó para abrir a rota em nova aba.
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-400">
          <span class="font-semibold text-slate-100">{{ totalRoutes }}</span> rotas
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-400">
          <span class="font-semibold text-slate-100">{{ totalGroups }}</span> grupos
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-400">
          <span class="font-semibold text-primary-400">{{ authRequired }}</span> requerem auth
        </div>
        <div class="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-500">
          <span class="inline-block h-3 w-4 rounded border border-slate-700 bg-slate-950"></span>
          Auth
          <span class="ml-2 inline-block h-3 w-4 rounded border border-slate-200/10 bg-slate-50"></span>
          Público
        </div>
      </div>
    </section>

    <div class="relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        :fit-view-on-init="true"
        :default-zoom="0.8"
        :min-zoom="0.2"
        :max-zoom="2"
        :nodes-draggable="false"
        :nodes-connectable="false"
        class="h-full w-full"
      >
        <Background pattern-color="#27272a" :gap="28" :size="1" />
        <MiniMap
          :node-color="(n) => n.data?.requiresAuth ? '#18181b' : '#fafafa'"
          class="!bottom-4 !right-4 !rounded-2xl !border !border-slate-800 !bg-slate-900/90"
        />
        <Controls class="!bottom-4 !left-4" />
      </VueFlow>
    </div>
  </div>
</template>

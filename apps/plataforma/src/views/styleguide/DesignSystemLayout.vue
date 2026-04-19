<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { ChevronRight, Minus, PanelLeft, Plus, Search } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import Badge from '@/components/ui/badge/Badge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  countLeafPages,
  dsNavTree,
  findFirstLeaf,
  findNodeBySegments,
  findTrailBySegments,
  getNodeHref,
  normalizeDsSegments,
  type DsNavNode,
} from './dsNavTree'

const route = useRoute()

const currentSegments = computed(() => normalizeDsSegments(route.params.slug as string | string[] | undefined))
const currentNode = computed(() => findNodeBySegments(currentSegments.value))
const currentTrail = computed(() => findTrailBySegments(currentSegments.value))
const isHub = computed(() => currentSegments.value.length === 0)

const searchQuery = ref('')
const openNodes = ref<Record<string, boolean>>({})
const sidebarCollapsed = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('ds-sidebar-collapsed') === '1'
    : false,
)

const hubCards = computed(() => dsNavTree.map((node) => ({
  ...node,
  href: getNodeHref(findFirstLeaf(node)),
  pageCount: countLeafPages(node),
})))

const currentContextTitle = computed(() => currentTrail.value.at(-1)?.title || 'BrandOS')

watchEffect(() => {
  document.title = `${currentContextTitle.value} — Adsmagic Workspace`
})

watch(
  () => currentTrail.value.map((entry) => entry.id).join('/'),
  () => {
    currentTrail.value.forEach((entry) => {
      if (entry.children?.length) {
        openNodes.value[entry.id] = true
      }
    })
  },
  { immediate: true },
)

function nodeTarget(node: DsNavNode) {
  return getNodeHref(node.pageId ? node : findFirstLeaf(node))
}

function nodeIsInTrail(node: DsNavNode) {
  return currentTrail.value.some((entry) => entry.id === node.id)
}

function nodeIsCurrent(node: DsNavNode) {
  return currentNode.value?.id === node.id
}

function statusVariant(status: DsNavNode['status']) {
  if (status === 'live') return 'success'
  if (status === 'beta') return 'info'
  return 'warning'
}

function statusLabel(status: DsNavNode['status']) {
  if (status === 'live') return 'Live'
  if (status === 'beta') return 'Beta'
  return 'Planned'
}

function iconForRoot(node: DsNavNode) {
  if (node.tone === 'brand') return 'brand_awareness'
  if (node.tone === 'marketing') return 'campaign'
  return 'layers'
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('ds-sidebar-collapsed', sidebarCollapsed.value ? '1' : '0')
}

function nodeMatchesQuery(node: DsNavNode, query: string) {
  const normalized = query.trim().toLowerCase()

  if (!normalized) return true

  return [node.title, node.description, node.pageId]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized))
}

function filterNodes(nodes: DsNavNode[], query: string): DsNavNode[] {
  const normalized = query.trim().toLowerCase()

  if (!normalized) return nodes

  return nodes.reduce<DsNavNode[]>((accumulator, node) => {
    const childMatches = node.children ? filterNodes(node.children, normalized) : undefined

    if (nodeMatchesQuery(node, normalized)) {
      accumulator.push({
        ...node,
        children: node.children,
      })
      return accumulator
    }

    if (childMatches?.length) {
      accumulator.push({
        ...node,
        children: childMatches,
      })
    }

    return accumulator
  }, [])
}

function sectionIsOpen(node: DsNavNode) {
  if (searchQuery.value.trim()) return true
  return openNodes.value[node.id] ?? nodeIsInTrail(node)
}

function toggleSection(node: DsNavNode) {
  openNodes.value[node.id] = !sectionIsOpen(node)
}

const filteredTree = computed(() => filterNodes(dsNavTree, searchQuery.value))
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="flex min-h-screen max-lg:flex-col">
      <aside
        class="border-b border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:border-b-0 lg:border-r lg:transition-[width] lg:duration-300 lg:ease-in-out"
        :class="sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[280px]'"
      >
        <div class="flex h-full flex-col" :class="{ 'lg:hidden': sidebarCollapsed }">
          <div class="border-b border-border p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <img src="/logo-icon.svg" alt="Adsmagic" class="h-5 w-5 object-contain" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-foreground">Adsmagic</p>
                <p class="text-xs text-muted-foreground">BrandOS</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                class="hidden h-8 w-8 shadow-none lg:inline-flex"
                title="Recolher sidebar"
                @click="toggleSidebar"
              >
                <PanelLeft class="h-4 w-4" />
              </Button>
            </div>

            <div class="relative mt-4">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Buscar páginas"
                class="h-9 border-border bg-background pl-9 shadow-none"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-3">
            <section v-for="root in filteredTree" :key="root.id" class="mb-5 last:mb-0">
              <div class="mb-2 flex items-center justify-between px-2">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {{ root.title }}
                </p>
                <Badge :variant="statusVariant(root.status)" class="h-5 px-1.5 text-[10px]">
                  {{ statusLabel(root.status) }}
                </Badge>
              </div>

              <div class="space-y-1">
                <template v-for="child in root.children ?? []" :key="child.id">
                  <Button
                    v-if="child.children?.length"
                    variant="ghost"
                    size="sm"
                    class="h-auto w-full justify-start gap-2 px-2.5 py-2 text-sm shadow-none"
                    :class="nodeIsInTrail(child)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
                    @click="toggleSection(child)"
                  >
                    <span class="truncate font-medium">{{ child.title }}</span>
                    <component
                      :is="sectionIsOpen(child) ? Minus : Plus"
                      class="ml-auto h-4 w-4 text-muted-foreground"
                    />
                  </Button>

                  <RouterLink
                    v-else
                    :to="nodeTarget(child)"
                    class="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition"
                    :class="nodeIsCurrent(child)
                      ? 'bg-primary text-primary-foreground'
                      : nodeIsInTrail(child)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
                  >
                    <span class="truncate font-medium">{{ child.title }}</span>
                  </RouterLink>

                  <div
                    v-if="child.children?.length && sectionIsOpen(child)"
                    class="ml-4 space-y-1 border-l border-border pl-3"
                  >
                    <RouterLink
                      v-for="leaf in child.children"
                      :key="leaf.id"
                      :to="nodeTarget(leaf)"
                      class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition"
                      :class="nodeIsCurrent(leaf)
                        ? 'bg-primary text-primary-foreground'
                        : nodeIsInTrail(leaf)
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
                    >
                      <span class="truncate">{{ leaf.title }}</span>
                      <ChevronRight class="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    </RouterLink>
                  </div>
                </template>
              </div>
            </section>
          </div>

          <div class="border-t border-border p-3">
            <div class="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
              <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span class="text-xs text-muted-foreground">workspace-produto</span>
            </div>
          </div>
        </div>

        <div
          class="hidden h-full flex-col items-center py-3"
          :class="{ 'lg:flex': sidebarCollapsed }"
        >
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <img src="/logo-icon.svg" alt="Adsmagic" class="h-5 w-5 object-contain" />
          </div>

          <Button
            variant="outline"
            size="icon"
            class="h-10 w-10 shadow-none"
            title="Expandir sidebar"
            @click="toggleSidebar"
          >
            <PanelLeft class="h-4 w-4" />
          </Button>

          <nav class="mt-4 flex flex-col gap-2">
            <RouterLink
              v-for="root in dsNavTree"
              :key="root.id"
              :to="nodeTarget(root)"
              :title="root.title"
              class="flex h-10 w-10 items-center justify-center rounded-md transition"
              :class="nodeIsInTrail(root)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
            >
              <span class="material-symbols-outlined text-xl">{{ iconForRoot(root) }}</span>
            </RouterLink>
          </nav>
        </div>
      </aside>

      <div class="min-w-0 flex-1">
        <header class="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div class="flex h-14 items-center gap-3 px-4 lg:px-6">
            <div v-if="isHub" class="min-w-0">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Adsmagic</p>
              <p class="truncate text-sm font-medium text-foreground">{{ currentContextTitle }}</p>
            </div>

            <nav v-else class="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <RouterLink to="/styleguide" class="font-medium text-foreground/80 hover:text-foreground">
                Styleguide
              </RouterLink>
              <template v-for="crumb in currentTrail" :key="crumb.id">
                <Separator orientation="vertical" class="h-4 bg-border" />
                <RouterLink
                  :to="nodeTarget(crumb)"
                  class="truncate transition"
                  :class="nodeIsCurrent(crumb)
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground/80'"
                >
                  {{ crumb.title }}
                </RouterLink>
              </template>
            </nav>
          </div>
        </header>

        <main class="min-w-0 p-4 lg:p-6">
          <div class="mx-auto max-w-7xl">
            <section v-if="isHub" class="space-y-4">
              <Card>
                <CardHeader class="pb-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Workspace</p>
                  <CardTitle class="text-3xl tracking-tight md:text-4xl">BrandOS</CardTitle>
                  <CardDescription class="max-w-3xl text-sm leading-7 md:text-base">
                    O BrandOS agora está organizado em duas trilhas complementares: Design System para código de produto digital e Brand System para identidade, assets, templates e governança de marca.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div class="grid gap-4 xl:grid-cols-3">
                <RouterLink
                  v-for="card in hubCards"
                  :key="card.id"
                  :to="card.href"
                  class="block transition"
                >
                  <Card class="h-full hover:border-primary/30 hover:shadow-md">
                    <CardHeader class="pb-4">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {{ card.title }}
                          </p>
                          <CardTitle class="mt-2 text-xl leading-tight">{{ card.description }}</CardTitle>
                        </div>
                        <Badge :variant="statusVariant(card.status)">
                          {{ statusLabel(card.status) }}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent class="flex items-end justify-between">
                      <div>
                        <div class="text-3xl font-semibold tracking-tight text-foreground">
                          {{ card.pageCount }}
                        </div>
                        <p class="text-sm text-muted-foreground">páginas</p>
                      </div>
                      <span class="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                        Abrir
                        <ChevronRight class="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </RouterLink>
              </div>

              <div class="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <Card>
                  <CardHeader class="pb-4">
                    <CardTitle class="text-lg">Como navegar</CardTitle>
                  </CardHeader>
                  <CardContent class="grid gap-3 md:grid-cols-2">
                    <Card class="border-border bg-muted/40 shadow-none">
                      <CardContent class="p-4 text-sm leading-6 text-muted-foreground">
                      Use a busca lateral para achar foundations, components, assets, templates e guidelines sem percorrer a árvore inteira.
                      </CardContent>
                    </Card>
                    <Card class="border-border bg-muted/40 shadow-none">
                      <CardContent class="p-4 text-sm leading-6 text-muted-foreground">
                      Os grupos funcionam como capítulos colapsáveis, mantendo o sitemap legível sem espalhar páginas soltas pela navegação.
                      </CardContent>
                    </Card>
                    <Card class="border-border bg-muted/40 shadow-none">
                      <CardContent class="p-4 text-sm leading-6 text-muted-foreground">
                      Cada trilha resume uma camada real do sistema: produto digital de um lado, marca e produção criativa do outro.
                      </CardContent>
                    </Card>
                    <Card class="border-border bg-muted/40 shadow-none">
                      <CardContent class="p-4 text-sm leading-6 text-muted-foreground">
                      O topo da página mantém contexto com breadcrumb e navegação persistente enquanto os nós pais redirecionam para a primeira folha útil.
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader class="pb-4">
                    <CardTitle class="text-lg">Áreas ativas</CardTitle>
                  </CardHeader>
                  <CardContent class="space-y-3">
                    <Card
                      v-for="card in hubCards"
                      :key="`${card.id}-summary`"
                      class="border-border bg-muted/40 shadow-none"
                    >
                      <CardContent class="flex items-center justify-between p-4">
                        <div>
                          <p class="text-sm font-medium text-foreground">{{ card.title }}</p>
                          <p class="text-xs text-muted-foreground">{{ card.pageCount }} páginas documentadas</p>
                        </div>
                        <Badge :variant="statusVariant(card.status)">
                          {{ statusLabel(card.status) }}
                        </Badge>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section v-else>
              <RouterView />
            </section>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

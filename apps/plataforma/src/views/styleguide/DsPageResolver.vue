<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Badge from '@/components/ui/badge/Badge.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import BrandEditorialRenderer from './BrandEditorialRenderer.vue'
import BrandShowcasePreview from './BrandShowcasePreview.vue'
import { dsPageContent } from './dsContent'
import {
  findFirstLeaf,
  findNodeBySegments,
  getNodeHref,
  normalizeDsSegments,
} from './dsNavTree'

const route = useRoute()
const router = useRouter()

const currentSegments = computed(() => normalizeDsSegments(route.params.slug as string | string[] | undefined))
const currentNode = computed(() => findNodeBySegments(currentSegments.value))
const page = computed(() => {
  const pageId = currentNode.value?.pageId
  return pageId ? dsPageContent[pageId] ?? null : null
})

const legacyRouteRedirects: Record<string, string> = {
  'platform/overview': '/styleguide/design-system/foundations/colors',
  'platform/tokens/colors': '/styleguide/design-system/foundations/colors',
  'platform/tokens/spacing': '/styleguide/design-system/foundations/spacing',
  'platform/components/base-ui': '/styleguide/design-system/components/base-ui',
  'brand/cover': '/styleguide/brand/identity/logo',
  'brand/foundations/logo-symbol': '/styleguide/brand/identity/logo',
  'brand/identity/logo-symbol': '/styleguide/brand/identity/logo',
  'brand/foundations/symbol': '/styleguide/brand/identity/symbol',
  'brand/foundations/colors': '/styleguide/brand/identity/colors',
  'brand/foundations/typography': '/styleguide/brand/identity/typography',
  'brand/foundations/grafismos': '/styleguide/brand/identity/grafismos',
  'brand/template-families/social-posts': '/styleguide/brand/templates/social-posts',
  'brand/template-families/display-ads': '/styleguide/brand/templates/display-ads',
  'brand/template-families/lp-sections': '/styleguide/design-system/lp-components',
  'brand/template-families/decks-one-pagers': '/styleguide/brand/templates/presentation',
  'brand/template-families/collaterals-signatures': '/styleguide/brand/templates/presentation',
  'brand/creative-system/primitives': '/styleguide/brand/templates/primitives',
  'brand/creative-system/cards': '/styleguide/brand/templates/cards',
  'brand/creative-system/patterns': '/styleguide/brand/templates/patterns',
  'brand/creative-system/campaign': '/styleguide/brand/templates/campaign-creatives',
  'brand/assets': '/styleguide/brand/visual-language',
  'brand/assets/illustrations': '/styleguide/brand/visual-language/illustrations',
  'brand/assets/photography': '/styleguide/brand/visual-language/photography',
  'brand/assets/icons-symbols': '/styleguide/brand/visual-language/icons-symbols',
}

const customPageComponents: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  'brand-creative-primitives': defineAsyncComponent(() => import('./pages/BrandPrimitivesPage.vue')),
  'brand-creative-campaign': defineAsyncComponent(() => import('./pages/BrandCreativesPage.vue')),
  'brand-logo': defineAsyncComponent(() => import('./pages/BrandLogoPage.vue')),
  'brand-symbol': defineAsyncComponent(() => import('./pages/BrandSymbolPage.vue')),
  'brand-foundations-colors': defineAsyncComponent(() => import('./pages/BrandColorsPage.vue')),
  'brand-foundations-typography': defineAsyncComponent(() => import('./pages/BrandTypographyPage.vue')),
  'brand-foundations-grafismos': defineAsyncComponent(() => import('./pages/BrandGrafismosPage.vue')),
  'brand-cards': defineAsyncComponent(() => import('./pages/BrandCardsPage.vue')),
  'brand-patterns': defineAsyncComponent(() => import('./pages/BrandPatternsPage.vue')),
  'brand-cover': defineAsyncComponent(() => import('./pages/BrandCoverPage.vue')),
  'brand-instagram-carousels': defineAsyncComponent(() => import('./pages/BrandInstagramCarouselsPage.vue')),
  'brand-carousel-post1': defineAsyncComponent(() => import('./pages/BrandCarouselPost1Page.vue')),
}

const customPage = computed(() => {
  const pageId = currentNode.value?.pageId
  return pageId ? (customPageComponents[pageId] ?? null) : null
})

watch(
  () => currentSegments.value.join('/'),
  () => {
    if (!currentSegments.value.length) return

    const node = currentNode.value
    if (!node) {
      const legacyTarget = legacyRouteRedirects[currentSegments.value.join('/')]
      if (legacyTarget) {
        router.replace(legacyTarget)
        return
      }

      router.replace('/styleguide')
      return
    }

    if (!node.pageId) {
      router.replace(getNodeHref(findFirstLeaf(node)))
    }
  },
  { immediate: true },
)

function toneLabel(tone: string) {
  if (tone === 'brand') return 'Brand System'
  if (tone === 'marketing') return 'Marketing System'
  return 'Design System'
}

function toneBadgeVariant(tone: string) {
  if (tone === 'brand') return 'success'
  if (tone === 'marketing') return 'warning'
  return 'info'
}

function statusBadgeVariant(status: string) {
  if (status === 'Live') return 'success'
  if (status === 'Beta') return 'info'
  return 'warning'
}

function heroClass(tone: string) {
  if (tone === 'brand') {
    return 'border-emerald-500/20 bg-card'
  }
  if (tone === 'marketing') {
    return 'border-amber-500/20 bg-card'
  }
  return 'border-border bg-card'
}

function heroStripeClass(tone: string) {
  if (tone === 'brand') return 'bg-emerald-500'
  if (tone === 'marketing') return 'bg-amber-500'
  return 'bg-primary'
}

function sectionGridClass(columns = 3) {
  if (columns === 1) return 'grid-cols-1'
  if (columns === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
}

function swatchTextClass(dark?: boolean) {
  return dark ? 'text-white' : 'text-foreground'
}

function ratioThemeClass(theme: string) {
  if (theme === 'dark') {
    return 'bg-[linear-gradient(135deg,#010543,#0f1a68)] text-white'
  }
  if (theme === 'split') {
    return 'bg-[linear-gradient(90deg,#010543_0%,#010543_37%,#ffffff_37%,#eef2ff_100%)] text-slate-900'
  }
  if (theme === 'editorial') {
    return 'bg-[linear-gradient(135deg,#ffffff,#dbeafe)] text-slate-900'
  }
  return 'bg-[linear-gradient(135deg,#ffffff,#f0fdf4)] text-slate-900'
}

function isInternalLink(target: string) {
  return target.startsWith('/')
}
</script>

<template>
  <!-- Custom-only page (no dsContent entry required) -->
  <div v-if="!page && customPage">
    <component :is="customPage" />
  </div>

  <!-- Editorial layout for Brand pages -->
  <div v-else-if="page && page.tone === 'brand'">
    <BrandEditorialRenderer :page="page" />
    <component v-if="customPage" :is="customPage" class="mt-8" />
  </div>

  <!-- Generic layout for non-brand pages -->
  <div v-else-if="page" class="space-y-8">
    <Card :class="['overflow-hidden', heroClass(page.tone)]">
      <div class="h-1.5 w-full" :class="heroStripeClass(page.tone)"></div>
      <CardHeader class="max-w-4xl px-6 py-6 md:px-7 md:py-7">
        <div class="flex flex-wrap items-center gap-3">
          <Badge :variant="toneBadgeVariant(page.tone)">
            {{ toneLabel(page.tone) }}
          </Badge>
          <Badge :variant="statusBadgeVariant(page.status)">
            {{ page.status }}
          </Badge>
        </div>

        <p class="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {{ page.eyebrow }}
        </p>
        <CardTitle class="mt-3 max-w-4xl text-3xl tracking-tight md:text-4xl">
          {{ page.title }}
        </CardTitle>
        <CardDescription class="mt-4 max-w-3xl text-sm leading-7 md:text-base text-muted-foreground">
          {{ page.lead }}
        </CardDescription>

        <Card v-if="page.highlight" class="mt-6 border-border bg-muted/40 shadow-none">
          <CardContent class="px-5 py-4 text-sm leading-6 text-muted-foreground">
          {{ page.highlight }}
          </CardContent>
        </Card>
      </CardHeader>
    </Card>

    <Card
      v-for="section in page.sections"
      :key="section.title"
      class="border-border md:p-0"
    >
      <CardHeader class="p-6 pb-6 md:p-7 md:pb-6">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Section</p>
        <CardTitle class="mt-2 text-2xl tracking-tight text-card-foreground">{{ section.title }}</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent class="p-6 md:p-7">

      <div v-if="section.type === 'copy'" class="max-w-3xl space-y-4 text-base leading-7 text-muted-foreground">
        <p v-for="paragraph in section.body" :key="paragraph">{{ paragraph }}</p>
      </div>

      <div
        v-else-if="section.type === 'cards'"
        class="grid gap-4"
        :class="sectionGridClass(section.columns)"
      >
        <article
          v-for="item in section.items"
          :key="item.title"
          class="rounded-lg border border-border bg-muted/40 p-5"
        >
          <p v-if="item.eyebrow" class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {{ item.eyebrow }}
          </p>
          <h3 class="mt-3 text-lg font-semibold text-card-foreground">{{ item.title }}</h3>
          <p class="mt-3 text-sm leading-6 text-muted-foreground">{{ item.body }}</p>
          <p v-if="item.meta" class="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {{ item.meta }}
          </p>
        </article>
      </div>

      <div v-else-if="section.type === 'palette'" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in section.items"
          :key="item.name"
          class="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div class="h-28 px-5 py-4" :style="{ backgroundColor: item.hex }">
            <div class="flex h-full items-start justify-between" :class="swatchTextClass(item.dark)">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{{ item.name }}</div>
                <div class="mt-2 text-lg font-semibold">{{ item.hex }}</div>
              </div>
            </div>
          </div>
          <div class="px-5 py-4 text-sm leading-6 text-muted-foreground">
            {{ item.note }}
          </div>
        </article>
      </div>

      <div v-else-if="section.type === 'assets'" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in section.items"
          :key="item.label"
          class="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div class="flex h-52 items-center justify-center px-6 py-6" :class="item.dark ? 'bg-[#010543]' : 'bg-muted/40'">
            <img :src="item.src" :alt="item.label" class="max-h-24 w-auto max-w-full" />
          </div>
          <div class="px-5 py-4">
            <h3 class="text-lg font-semibold text-card-foreground">{{ item.label }}</h3>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ item.note }}</p>
          </div>
        </article>
      </div>

      <div v-else-if="section.type === 'ratios'" class="grid gap-5 lg:grid-cols-2">
        <article
          v-for="item in section.items"
          :key="item.label"
          class="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div class="border-b border-border px-5 py-4">
            <h3 class="text-lg font-semibold text-card-foreground">{{ item.label }}</h3>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ item.use }}</p>
            <div class="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span class="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-card-foreground">
                {{ item.aspect }}
              </span>
              <span v-if="item.pixels" class="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
                {{ item.pixels }}
              </span>
            </div>
          </div>
          <div class="p-5">
            <div
              class="relative overflow-hidden rounded-lg border border-black/5 p-4"
              :class="ratioThemeClass(item.theme)"
              :style="{ aspectRatio: item.aspect }"
            >
              <div class="pointer-events-none absolute inset-0 opacity-70" :class="item.theme === 'dark' ? 'bg-[radial-gradient(circle_at_top_right,rgba(59,181,109,0.25),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.35),transparent_36%)]' : 'bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,181,109,0.16),transparent_30%)]'"></div>

              <div class="relative flex h-full flex-col justify-between">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">{{ item.label }}</div>
                    <div class="mt-2 max-w-[70%] text-xl font-semibold leading-tight md:text-2xl">
                      Template family
                    </div>
                  </div>
                  <img
                    :src="item.theme === 'dark' ? '/logo-wordmark-white.svg' : '/logo-icon.svg'"
                    alt="Adsmagic"
                    class="h-8 w-auto opacity-90"
                  />
                </div>

                <div class="space-y-2">
                  <div class="h-3 w-3/4 rounded-full" :class="item.theme === 'dark' ? 'bg-white/75' : 'bg-slate-900/80'"></div>
                  <div class="h-3 w-2/3 rounded-full" :class="item.theme === 'dark' ? 'bg-white/45' : 'bg-slate-900/55'"></div>
                  <div class="mt-5 grid grid-cols-3 gap-2">
                    <span v-for="slot in 3" :key="slot" class="block rounded-2xl border border-current/10 bg-current/10"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <ul v-else-if="section.type === 'checklist'" class="grid gap-3 md:grid-cols-2">
        <li
          v-for="item in section.items"
          :key="item"
          class="flex gap-3 rounded-lg border border-border bg-muted/40 px-4 py-4 text-sm leading-6 text-card-foreground"
        >
          <span class="material-symbols-outlined mt-0.5 text-base text-[#3BB56D]">check_circle</span>
          <span>{{ item }}</span>
        </li>
      </ul>

      <div v-else-if="section.type === 'steps'" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(item, index) in section.items"
          :key="item.title"
          class="rounded-lg border border-border bg-muted/40 p-5"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            {{ index + 1 }}
          </div>
          <h3 class="mt-4 text-lg font-semibold text-card-foreground">{{ item.title }}</h3>
          <p class="mt-3 text-sm leading-6 text-muted-foreground">{{ item.body }}</p>
        </article>
      </div>

      <div v-else-if="section.type === 'links'" class="grid gap-4 md:grid-cols-2">
        <component
          :is="isInternalLink(item.to) ? RouterLink : 'a'"
          v-for="item in section.items"
          :key="item.label"
          :to="isInternalLink(item.to) ? item.to : undefined"
          :href="isInternalLink(item.to) ? undefined : item.to"
          class="group rounded-lg border border-border bg-muted/40 p-5 transition hover:border-primary/30 hover:bg-accent/60 hover:shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-card-foreground">{{ item.label }}</h3>
              <p class="mt-3 text-sm leading-6 text-muted-foreground">{{ item.note }}</p>
            </div>
            <span class="material-symbols-outlined text-lg text-muted-foreground transition group-hover:text-foreground">arrow_outward</span>
          </div>
        </component>
      </div>

      <div
        v-else-if="section.type === 'showcases'"
        class="grid gap-4"
        :class="sectionGridClass(section.columns)"
      >
        <BrandShowcasePreview
          v-for="item in section.items"
          :key="`${item.variant}-${item.label}`"
          :item="item"
        />
      </div>
      </CardContent>
    </Card>

    <!-- Custom page component rendered after dsContent sections -->
    <component v-if="customPage" :is="customPage" />
  </div>
</template>

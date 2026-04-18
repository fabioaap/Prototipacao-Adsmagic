<script setup lang="ts">
/**
 * BrandEditorialRenderer — Editorial-quality brandbook page layout
 *
 * Replaces the generic Card-in-Card renderer with a magazine-grade layout
 * inspired by Vercel Geist, Uber Brand, Atlassian Design, and Stripe brand pages.
 *
 * Key design decisions:
 * - Immersive hero with gradient + grain texture (no card wrapper)
 * - Section-specific visual treatments (not uniform cards)
 * - Dramatic typography hierarchy with generous whitespace
 * - Bento-style card grids with hover elevation
 * - Visual rhythm through alternating section backgrounds
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Badge from '@/components/ui/badge/Badge.vue'
import BrandShowcasePreview from './BrandShowcasePreview.vue'
import type { DsPageContent } from './dsContent'

const props = defineProps<{
  page: DsPageContent
}>()

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

function sectionGridClass(columns = 3) {
  if (columns === 1) return 'grid-cols-1'
  if (columns === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
}

function swatchTextClass(dark?: boolean) {
  return dark ? 'text-white' : 'text-foreground'
}

function ratioThemeClass(theme: string) {
  if (theme === 'dark') return 'bg-[linear-gradient(135deg,#010543,#0f1a68)] text-white'
  if (theme === 'split') return 'bg-[linear-gradient(90deg,#010543_0%,#010543_37%,#ffffff_37%,#eef2ff_100%)] text-slate-900'
  if (theme === 'editorial') return 'bg-[linear-gradient(135deg,#ffffff,#dbeafe)] text-slate-900'
  return 'bg-[linear-gradient(135deg,#ffffff,#f0fdf4)] text-slate-900'
}

function isInternalLink(target: string) {
  return target.startsWith('/')
}

/* Alternate section backgrounds for visual rhythm */
const isEvenSection = (index: number) => index % 2 === 0

/* Detect moodboard-style asset sections (visual gallery, not logo assets) */
function isVisualMoodboard(section: { type: string; title: string }) {
  const t = section.title.toLowerCase()
  return t.includes('moodboard') || t.includes('galeria') || t.includes('referência visual')
}
</script>

<template>
  <div class="brand-editorial">

    <!-- ═══ HERO — Immersive header ═══ -->
    <header class="brand-editorial__hero">
      <div class="brand-editorial__hero-bg"></div>
      <div class="brand-editorial__hero-grain"></div>
      <div class="relative z-10 px-8 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
        <div class="flex items-center gap-3 mb-8">
          <Badge :variant="toneBadgeVariant(page.tone)" class="brand-editorial__badge">
            {{ toneLabel(page.tone) }}
          </Badge>
          <Badge :variant="statusBadgeVariant(page.status)" class="brand-editorial__badge">
            {{ page.status }}
          </Badge>
        </div>

        <p class="brand-editorial__eyebrow">{{ page.eyebrow }}</p>

        <h1 class="brand-editorial__title">{{ page.title }}</h1>

        <p class="brand-editorial__lead">{{ page.lead }}</p>

        <div v-if="page.highlight" class="brand-editorial__highlight">
          <div class="brand-editorial__highlight-accent"></div>
          <p>{{ page.highlight }}</p>
        </div>
      </div>
    </header>

    <!-- ═══ SECTIONS — Each type gets distinct visual treatment ═══ -->
    <div class="brand-editorial__body">
      <section
        v-for="(section, idx) in page.sections"
        :key="section.title"
        class="brand-editorial__section"
        :class="{ 'brand-editorial__section--alt': !isEvenSection(idx) }"
      >
        <!-- Section header -->
        <div class="brand-editorial__section-header">
          <span class="brand-editorial__section-number">{{ String(idx + 1).padStart(2, '0') }}</span>
          <h2 class="brand-editorial__section-title">{{ section.title }}</h2>
          <div class="brand-editorial__section-rule"></div>
        </div>

        <!-- ── Copy ── -->
        <div v-if="section.type === 'copy'" class="brand-editorial__copy">
          <p
            v-for="(paragraph, pIdx) in section.body"
            :key="pIdx"
            :class="pIdx === 0 ? 'brand-editorial__copy-first' : ''"
          >{{ paragraph }}</p>
        </div>

        <!-- ── Cards ── -->
        <div
          v-else-if="section.type === 'cards'"
          class="brand-editorial__cards"
          :class="sectionGridClass(section.columns)"
        >
          <article
            v-for="item in section.items"
            :key="item.title"
            class="brand-editorial__card"
          >
            <div class="brand-editorial__card-accent"></div>
            <div class="relative">
              <p v-if="item.eyebrow" class="brand-editorial__card-eyebrow">{{ item.eyebrow }}</p>
              <h3 class="brand-editorial__card-title">{{ item.title }}</h3>
              <p class="brand-editorial__card-body">{{ item.body }}</p>
              <p v-if="item.meta" class="brand-editorial__card-meta">{{ item.meta }}</p>
            </div>
          </article>
        </div>

        <!-- ── Palette ── -->
        <div v-else-if="section.type === 'palette'" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="item in section.items"
            :key="item.name"
            class="brand-editorial__swatch"
          >
            <div
              class="brand-editorial__swatch-fill"
              :style="{ backgroundColor: item.hex }"
            >
              <div class="flex h-full items-end justify-between" :class="swatchTextClass(item.dark)">
                <div>
                  <div class="text-2xl font-semibold tracking-tight">{{ item.hex }}</div>
                </div>
                <div class="text-right">
                  <div class="text-xs font-medium uppercase tracking-[0.2em] opacity-60">{{ item.name }}</div>
                </div>
              </div>
            </div>
            <div class="px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              {{ item.note }}
            </div>
          </article>
        </div>

        <!-- ── Assets ── -->
        <div v-else-if="section.type === 'assets'" :class="isVisualMoodboard(section) ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'">
          <article
            v-for="item in section.items"
            :key="item.label"
            class="brand-editorial__asset"
          >
            <div
              class="brand-editorial__asset-preview"
              :class="[item.dark ? 'bg-[#010543]' : 'bg-muted/30', isVisualMoodboard(section) ? 'brand-editorial__asset-preview--moodboard' : '']"
            >
              <img :src="item.src" :alt="item.label" :class="isVisualMoodboard(section) ? 'w-full h-auto transition-transform duration-500 group-hover:scale-105' : 'max-h-24 w-auto max-w-full transition-transform duration-500 group-hover:scale-110'" />
            </div>
            <div class="px-5 py-4">
              <h3 class="text-base font-semibold text-card-foreground">{{ item.label }}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{{ item.note }}</p>
            </div>
          </article>
        </div>

        <!-- ── Ratios ── -->
        <div v-else-if="section.type === 'ratios'" class="grid gap-6 lg:grid-cols-2">
          <article
            v-for="item in section.items"
            :key="item.label"
            class="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
          >
            <div class="border-b border-border/60 px-6 py-5">
              <h3 class="text-lg font-semibold text-card-foreground">{{ item.label }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ item.use }}</p>
              <div class="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                <span class="rounded-full bg-primary/10 px-3 py-1 text-primary">{{ item.aspect }}</span>
                <span v-if="item.pixels" class="rounded-full bg-muted px-3 py-1 text-muted-foreground">{{ item.pixels }}</span>
              </div>
            </div>
            <div class="p-5">
              <div
                class="relative overflow-hidden rounded-lg border border-black/5 p-4"
                :class="ratioThemeClass(item.theme)"
                :style="{ aspectRatio: item.aspect }"
              >
                <div
                  class="pointer-events-none absolute inset-0 opacity-70"
                  :class="item.theme === 'dark' ? 'bg-[radial-gradient(circle_at_top_right,rgba(59,181,109,0.25),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.35),transparent_36%)]' : 'bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,181,109,0.16),transparent_30%)]'"
                ></div>
                <div class="relative flex h-full flex-col justify-between">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <div class="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">{{ item.label }}</div>
                      <div class="mt-2 max-w-[70%] text-xl font-semibold leading-tight md:text-2xl">Template family</div>
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

        <!-- ── Checklist ── -->
        <ul v-else-if="section.type === 'checklist'" class="brand-editorial__checklist">
          <li v-for="item in section.items" :key="item" class="brand-editorial__checklist-item">
            <span class="brand-editorial__checklist-dot"></span>
            <span>{{ item }}</span>
          </li>
        </ul>

        <!-- ── Steps ── -->
        <div v-else-if="section.type === 'steps'" class="brand-editorial__steps">
          <article
            v-for="(item, stepIdx) in section.items"
            :key="item.title"
            class="brand-editorial__step"
          >
            <div class="brand-editorial__step-indicator">
              <span class="brand-editorial__step-number">{{ stepIdx + 1 }}</span>
              <div v-if="stepIdx < section.items.length - 1" class="brand-editorial__step-line"></div>
            </div>
            <div class="brand-editorial__step-content">
              <h3 class="text-lg font-semibold text-card-foreground">{{ item.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ item.body }}</p>
            </div>
          </article>
        </div>

        <!-- ── Links ── -->
        <div v-else-if="section.type === 'links'" class="grid gap-4 md:grid-cols-2">
          <component
            :is="isInternalLink(item.to) ? RouterLink : 'a'"
            v-for="item in section.items"
            :key="item.label"
            :to="isInternalLink(item.to) ? item.to : undefined"
            :href="isInternalLink(item.to) ? undefined : item.to"
            class="brand-editorial__link"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold text-card-foreground group-hover:text-[#3BB56D] transition-colors">{{ item.label }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ item.note }}</p>
              </div>
              <span class="material-symbols-outlined text-lg text-muted-foreground/60 transition-all group-hover:text-[#3BB56D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">arrow_outward</span>
            </div>
          </component>
        </div>

        <!-- ── Showcases ── -->
        <div
          v-else-if="section.type === 'showcases'"
          class="grid gap-5"
          :class="sectionGridClass(section.columns)"
        >
          <BrandShowcasePreview
            v-for="item in section.items"
            :key="`${item.variant}-${item.label}`"
            :item="item"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   BRAND EDITORIAL RENDERER
   Inspired by Vercel Geist, Uber Brand, Atlassian Design
   ═══════════════════════════════════════════════════ */

.brand-editorial {
  --brand-navy: #010543;
  --brand-green: #3BB56D;
  --brand-indigo: #0f1a68;
}

/* ── Hero ── */
.brand-editorial__hero {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  min-height: 280px;
}

.brand-editorial__hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--brand-navy) 0%,
    var(--brand-indigo) 40%,
    #1a1a5e 70%,
    #0d1147 100%
  );
}

/* Subtle grain overlay for texture */
.brand-editorial__hero-grain {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  pointer-events: none;
}

.brand-editorial__hero::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: radial-gradient(
    ellipse at 80% 20%,
    rgba(59, 181, 109, 0.12) 0%,
    transparent 60%
  );
  pointer-events: none;
}

.brand-editorial__badge {
  backdrop-filter: blur(8px);
}

.brand-editorial__eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--brand-green);
  margin-bottom: 0.75rem;
}

.brand-editorial__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #ffffff;
  max-width: 32ch;
}

.brand-editorial__lead {
  margin-top: 1.25rem;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.65);
  max-width: 56ch;
}

.brand-editorial__highlight {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-editorial__highlight-accent {
  flex-shrink: 0;
  width: 3px;
  border-radius: 99px;
  background: var(--brand-green);
}

.brand-editorial__highlight p {
  font-size: 0.875rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
}

/* ── Section Shell ── */
.brand-editorial__body {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 2rem;
}

.brand-editorial__section {
  padding: 2.5rem 0;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}

.brand-editorial__section:last-child {
  border-bottom: none;
}

.brand-editorial__section--alt {
  /* subtle alternating background tint */
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  background: hsl(var(--muted) / 0.25);
  border-radius: 0.75rem;
}

.brand-editorial__section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.brand-editorial__section-number {
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.1em;
  color: var(--brand-green);
  opacity: 0.7;
}

.brand-editorial__section-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: hsl(var(--card-foreground));
}

.brand-editorial__section-rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, hsl(var(--border)) 0%, transparent 100%);
}

/* ── Copy ── */
.brand-editorial__copy {
  max-width: 64ch;
}

.brand-editorial__copy p {
  font-size: 1rem;
  line-height: 1.85;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.25rem;
}

.brand-editorial__copy p:last-child {
  margin-bottom: 0;
}

.brand-editorial__copy-first {
  font-size: 1.125rem !important;
  color: hsl(var(--card-foreground)) !important;
  line-height: 1.8 !important;
}

/* ── Cards ── */
.brand-editorial__cards {
  display: grid;
  gap: 1.25rem;
}

.brand-editorial__card {
  position: relative;
  overflow: hidden;
  border-radius: 0.875rem;
  border: 1px solid hsl(var(--border) / 0.6);
  background: hsl(var(--card));
  padding: 1.75rem;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-editorial__card:hover {
  border-color: hsl(var(--border));
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.06),
    0 10px 15px -3px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.brand-editorial__card-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--brand-green) 0%,
    rgba(59, 181, 109, 0.2) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.brand-editorial__card:hover .brand-editorial__card-accent {
  opacity: 1;
}

.brand-editorial__card-eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--brand-green);
  margin-bottom: 0.75rem;
}

.brand-editorial__card-title {
  font-size: 1.125rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: hsl(var(--card-foreground));
  line-height: 1.3;
}

.brand-editorial__card-body {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.brand-editorial__card-meta {
  margin-top: 1.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  opacity: 0.7;
}

/* ── Palette Swatches ── */
.brand-editorial__swatch {
  overflow: hidden;
  border-radius: 0.875rem;
  border: 1px solid hsl(var(--border) / 0.5);
  background: hsl(var(--card));
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-editorial__swatch:hover {
  box-shadow:
    0 8px 16px -4px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.brand-editorial__swatch-fill {
  height: 9rem;
  padding: 1.25rem;
  transition: height 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-editorial__swatch:hover .brand-editorial__swatch-fill {
  height: 10rem;
}

/* ── Assets ── */
.brand-editorial__asset {
  overflow: hidden;
  border-radius: 0.875rem;
  border: 1px solid hsl(var(--border) / 0.5);
  background: hsl(var(--card));
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-editorial__asset:hover {
  box-shadow:
    0 8px 16px -4px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.brand-editorial__asset-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 14rem;
  padding: 2rem;
  overflow: hidden;
}

.brand-editorial__asset-preview--moodboard {
  height: auto;
  min-height: 16rem;
  padding: 0;
}

.brand-editorial__asset-preview--moodboard img {
  border-radius: 0.75rem 0.75rem 0 0;
}

/* ── Checklist ── */
.brand-editorial__checklist {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.brand-editorial__checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 0.625rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: hsl(var(--card-foreground));
  transition: background 0.2s ease;
}

.brand-editorial__checklist-item:hover {
  background: hsl(var(--muted) / 0.35);
}

.brand-editorial__checklist-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 0.45rem;
  border-radius: 50%;
  background: var(--brand-green);
  box-shadow: 0 0 0 3px rgba(59, 181, 109, 0.15);
}

/* ── Steps ── */
.brand-editorial__steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.brand-editorial__step {
  display: flex;
  gap: 1.5rem;
  min-height: 5rem;
}

.brand-editorial__step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.brand-editorial__step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-navy), var(--brand-indigo));
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.brand-editorial__step-line {
  width: 2px;
  flex: 1;
  min-height: 2rem;
  background: linear-gradient(180deg, var(--brand-green) 0%, hsl(var(--border)) 100%);
  margin: 0.25rem 0;
}

.brand-editorial__step-content {
  padding-bottom: 2rem;
}

/* ── Links ── */
.brand-editorial__link {
  display: block;
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border) / 0.5);
  background: hsl(var(--card));
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.brand-editorial__link:hover {
  border-color: rgba(59, 181, 109, 0.3);
  background: hsl(var(--accent) / 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .brand-editorial__hero {
    border-radius: 0.75rem;
    min-height: 220px;
  }

  .brand-editorial__section--alt {
    margin-left: -0.75rem;
    margin-right: -0.75rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .brand-editorial__steps {
    gap: 0;
  }

  .brand-editorial__step {
    gap: 1rem;
  }
}
</style>

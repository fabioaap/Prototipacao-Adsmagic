<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronDown, Plus } from 'lucide-vue-next'

export interface FaqItem {
  id?: string
  question: string
  answer: string
}

const props = withDefaults(
  defineProps<{
    items: FaqItem[]
    variant?: 'minimal' | 'card'
    defaultOpenIndex?: number
  }>(),
  { variant: 'minimal', defaultOpenIndex: -1 },
)

const openIndex = ref<number>(props.defaultOpenIndex)

watch(
  () => props.defaultOpenIndex,
  (v) => { openIndex.value = v },
)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? -1 : index
}

function itemId(index: number) {
  return props.items[index]?.id ?? `faq-${index}`
}
</script>

<template>
  <div :class="['brand-faq', `brand-faq--${variant}`]">
    <article
      v-for="(faq, index) in items"
      :key="itemId(index)"
      :class="['brand-faq__item', { 'is-open': openIndex === index }]"
    >
      <button
        :id="`brand-faq-btn-${itemId(index)}`"
        type="button"
        class="brand-faq__trigger"
        :aria-expanded="openIndex === index"
        :aria-controls="`brand-faq-panel-${itemId(index)}`"
        @click="toggle(index)"
      >
        <Plus v-if="variant === 'minimal'" :size="18" class="brand-faq__icon" />
        <span>{{ faq.question }}</span>
        <ChevronDown v-if="variant === 'card'" class="brand-faq__chevron" />
      </button>
      <div
        :id="`brand-faq-panel-${itemId(index)}`"
        class="brand-faq__answer"
        role="region"
        :aria-labelledby="`brand-faq-btn-${itemId(index)}`"
        :aria-hidden="openIndex !== index"
      >
        <p>{{ faq.answer }}</p>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* ── shared ── */
.brand-faq__trigger {
  display: flex;
  width: 100%;
  align-items: center;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s;
}

.brand-faq__trigger:focus-visible {
  outline: 2px solid #3bb56d;
  outline-offset: 2px;
}

.brand-faq__answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease, opacity 200ms ease, padding 200ms ease;
}

.brand-faq__item.is-open .brand-faq__answer {
  grid-template-rows: 1fr;
}

.brand-faq__answer > p {
  overflow: hidden;
  margin: 0;
}

/* ═══════════════════════════════════════════
   Variant: minimal  (vendas-whatsapp style)
   ═══════════════════════════════════════════ */
.brand-faq--minimal .brand-faq__item {
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.brand-faq--minimal .brand-faq__item:last-child {
  border-bottom: none;
}

.brand-faq--minimal .brand-faq__trigger {
  padding: 20px 0;
  gap: 16px;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.5;
  color: #010542;
}

.brand-faq--minimal .brand-faq__icon {
  flex-shrink: 0;
  color: #97a4b6;
  transition: transform 200ms ease, color 200ms ease;
}

.brand-faq--minimal .brand-faq__item.is-open .brand-faq__icon {
  color: #3bb56d;
  transform: rotate(45deg);
}

.brand-faq--minimal .brand-faq__answer {
  opacity: 1;
  padding: 0 0 20px 34px;
}

.brand-faq--minimal .brand-faq__item:not(.is-open) .brand-faq__answer {
  opacity: 0;
  padding-bottom: 0;
}

.brand-faq--minimal .brand-faq__answer > p {
  font-size: 16px;
  line-height: 1.5;
  color: #666666;
}

/* ═══════════════════════════════════════════
   Variant: card  (agencias-performance style)
   ═══════════════════════════════════════════ */
.brand-faq--card .brand-faq__item {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #e6e6e6;
  background-color: #ffffff;
  transition: all 0.2s;
}

.brand-faq--card .brand-faq__item + .brand-faq__item {
  margin-top: 0.75rem;
}

.brand-faq--card .brand-faq__item.is-open {
  border-color: #3bb56d;
  box-shadow: 0 2px 8px rgba(59, 181, 109, 0.08);
}

.brand-faq--card .brand-faq__trigger {
  justify-content: space-between;
  padding: 1rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #010543;
}

.brand-faq--card .brand-faq__trigger:hover {
  color: #3bb56d;
}

.brand-faq--card .brand-faq__chevron {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: #637083;
  transition: transform 0.2s, color 0.2s;
}

.brand-faq--card .brand-faq__item.is-open .brand-faq__chevron {
  transform: rotate(180deg);
  color: #3bb56d;
}

.brand-faq--card .brand-faq__answer > p {
  padding: 0 1.25rem;
  font-size: 0.875rem;
  line-height: 1.7;
  color: #637083;
}

.brand-faq--card .brand-faq__item.is-open .brand-faq__answer > p {
  padding-bottom: 1rem;
}

/* ── responsive ── */
@media (max-width: 767px) {
  .brand-faq--card .brand-faq__trigger {
    min-height: 48px;
    padding: 0.875rem 1rem;
  }
}
</style>

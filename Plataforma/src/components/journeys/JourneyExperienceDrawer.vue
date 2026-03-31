<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="modelValue"
        class="journey-drawer-overlay"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="journey-drawer" role="dialog" aria-modal="true">
          <header class="journey-drawer-header">
            <div class="journey-drawer-title-row">
              <span class="journey-drawer-title">{{ journey?.name }}</span>
              <button
                type="button"
                class="journey-drawer-close"
                aria-label="Fechar"
                @click="$emit('update:modelValue', false)"
              >
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            <p v-if="journey?.summary" class="journey-drawer-summary">{{ journey.summary }}</p>
          </header>

          <div class="journey-drawer-body">
            <div v-if="!validationResult?.valid" class="journey-drawer-empty">
              <span class="material-symbols-outlined journey-drawer-empty-icon" aria-hidden="true">info</span>
              <p>{{ validationResult?.reason || 'Jornada sem experiência disponível.' }}</p>
            </div>

            <iframe
              v-else-if="iframeSrc"
              :src="iframeSrc"
              class="journey-drawer-iframe"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>

          <footer class="journey-drawer-footer">
            <button
              type="button"
              class="journey-drawer-open-btn"
              @click="$emit('open-full-page')"
            >
              <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>
              Abrir em nova aba
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { HomeJourney } from '@/data/home'
import type { ValidationResult } from '@/composables/useJourneyExperienceDrawer'

defineProps<{
  modelValue: boolean
  journey: HomeJourney | null
  validationResult: ValidationResult | null
  iframeSrc: string
  triggerEl: EventTarget | null
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'open-full-page'): void
}>()
</script>

<style scoped>
.journey-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.journey-drawer {
  width: min(560px, 100vw);
  display: flex;
  flex-direction: column;
  background: #111;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.5);
}

.journey-drawer-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.journey-drawer-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.journey-drawer-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ededed;
}

.journey-drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}
.journey-drawer-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ededed;
}

.journey-drawer-summary {
  margin-top: 8px;
  font-size: 0.8125rem;
  color: #888;
  line-height: 1.5;
}

.journey-drawer-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.journey-drawer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #555;
  font-size: 0.875rem;
  padding: 40px;
  text-align: center;
}

.journey-drawer-empty-icon {
  font-size: 2rem;
  color: #333;
}

.journey-drawer-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.journey-drawer-footer {
  padding: 12px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: flex-end;
}

.journey-drawer-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(99, 102, 241, 0.35);
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  color: #818cf8;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}
.journey-drawer-open-btn:hover {
  background: rgba(99, 102, 241, 0.18);
  border-color: rgba(99, 102, 241, 0.55);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
  font-size: 1.1em;
  line-height: 1;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
}

/* ── Transition ── */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 200ms ease;
}
.drawer-fade-enter-active .journey-drawer,
.drawer-fade-leave-active .journey-drawer {
  transition: transform 200ms ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-from .journey-drawer,
.drawer-fade-leave-to .journey-drawer {
  transform: translateX(40px);
}
</style>

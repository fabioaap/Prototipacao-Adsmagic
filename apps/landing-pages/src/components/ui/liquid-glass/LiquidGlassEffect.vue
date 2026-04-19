<script setup lang="ts">
/**
 * LiquidGlassEffect — Vue 3 port of the React liquid-glass component.
 * Wraps children in a glassmorphism container with SVG displacement filter,
 * backdrop blur, specular inner shadow and translucent overlay.
 */

interface Props {
  tag?: 'div' | 'a'
  href?: string
  target?: string
  class?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
}

withDefaults(defineProps<Props>(), {
  tag: 'div',
  target: '_blank',
})
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :target="href ? target : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :class="['liquid-glass', $props.class]"
  >
    <!-- Layer 0: backdrop-filter + SVG displacement -->
    <div class="liquid-glass__backdrop" aria-hidden="true" />

    <!-- Layer 1: translucent white overlay -->
    <div class="liquid-glass__overlay" aria-hidden="true" />

    <!-- Layer 2: inner glow (specular) -->
    <div class="liquid-glass__specular" aria-hidden="true" />

    <!-- Layer 3: content -->
    <div class="liquid-glass__content">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.liquid-glass {
  position: relative;
  display: flex;
  overflow: hidden;
  font-weight: 600;
  color: inherit;
  text-decoration: none;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.10),
    0 1px 2px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

.liquid-glass:where(a) {
  cursor: pointer;
}

/* ----- glass layers ----- */

.liquid-glass__backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
  backdrop-filter: blur(3px);
  filter: url(#glass-distortion);
  isolation: isolate;
  pointer-events: none;
}

.liquid-glass__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

.liquid-glass__specular {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  border-radius: inherit;
  box-shadow:
    inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5),
    inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.liquid-glass__content {
  position: relative;
  z-index: 3;
}
</style>

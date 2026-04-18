<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import HeaderOnlyLayout from '@/layouts/HeaderOnlyLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { useNavigationStore } from '@/stores/navigation'

const route = useRoute()
const navigationStore = useNavigationStore()
const showNavigationProgress = ref(false)
let navigationFeedbackTimer: number | null = null

const clearNavigationFeedbackTimer = () => {
  if (navigationFeedbackTimer !== null) {
    window.clearTimeout(navigationFeedbackTimer)
    navigationFeedbackTimer = null
  }
}

watch(
  () => navigationStore.isNavigating,
  (isNavigating) => {
    clearNavigationFeedbackTimer()

    if (isNavigating) {
      navigationFeedbackTimer = window.setTimeout(() => {
        showNavigationProgress.value = true
      }, 100)
      return
    }

    showNavigationProgress.value = false
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearNavigationFeedbackTimer()
})

/**
 * Layout dinâmico baseado na meta do router
 *
 * Layouts disponíveis:
 * - 'header-only': HeaderOnlyLayout (apenas header, sem sidebar)
 * - 'blank': BlankLayout (sem decoração)
 * - undefined/null: Sem layout (view renderiza diretamente)
 * 
 * Nota: DashboardLayout foi removido. Use AppLayout diretamente nas views.
 */
const currentLayout = computed(() => {
  const layout = route.meta.layout as string | undefined

  switch (layout) {
    case 'header-only':
      return HeaderOnlyLayout
    case 'blank':
      return BlankLayout
    default:
      return null
  }
})
</script>

<template>
  <div id="app" class="min-h-screen">
    <div
      class="route-progress"
      :class="{ 'is-visible': showNavigationProgress }"
      aria-hidden="true"
    />

    <!-- With Layout -->
    <component :is="currentLayout" v-if="currentLayout">
      <Suspense>
        <RouterView />
        <template #fallback>
          <div class="min-h-screen w-full bg-background flex items-center justify-center">
            <div class="flex flex-col items-center gap-3 text-center">
              <div class="h-10 w-10 rounded-full border-2 border-muted-foreground/25 border-t-primary animate-spin" />
              <p class="text-sm text-muted-foreground">Atualizando informacoes...</p>
            </div>
          </div>
        </template>
      </Suspense>
    </component>

    <!-- Without Layout -->
    <Suspense v-else>
      <RouterView />
      <template #fallback>
        <div class="min-h-screen w-full bg-background flex items-center justify-center">
          <div class="flex flex-col items-center gap-3 text-center">
            <div class="h-10 w-10 rounded-full border-2 border-muted-foreground/25 border-t-primary animate-spin" />
            <p class="text-sm text-muted-foreground">Atualizando informacoes...</p>
          </div>
        </div>
      </template>
    </Suspense>

    <!-- Toast Container - Global para todas as telas -->
    <ToastContainer />
  </div>
</template>

<style scoped>
.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 60;
  opacity: 0;
  pointer-events: none;
  transform-origin: left center;
  transform: scaleX(0.08);
  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.45));
  transition: opacity 140ms ease, transform 180ms ease;
}

.route-progress.is-visible {
  opacity: 1;
  transform: scaleX(0.9);
  animation: route-progress-run 900ms ease-in-out infinite;
}

@keyframes route-progress-run {
  0% {
    transform: scaleX(0.12);
  }
  60% {
    transform: scaleX(0.85);
  }
  100% {
    transform: scaleX(0.96);
  }
}
</style>

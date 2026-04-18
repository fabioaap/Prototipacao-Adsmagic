<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SidebarNav from './SidebarNav.vue'

const route = useRoute()
const isEmbeddedJourney = computed(() => route.query.embed === 'journey')

const selectedJourneyId = ref<string | null>(null)
const isDesktop = ref(typeof window !== 'undefined' ? window.innerWidth > 1024 : true)
const sidebarCollapsed = ref(
  typeof window !== 'undefined'
    ? window.localStorage.getItem('workspace-sidebar-collapsed') === '1'
    : false,
)

const compactSidebar = computed(() => isDesktop.value && sidebarCollapsed.value)

function onSelectJourney(id: string) {
  selectedJourneyId.value = id || null
}

function syncDesktopState() {
  isDesktop.value = window.innerWidth > 1024
}

function setSidebarCollapsed(value: boolean) {
  sidebarCollapsed.value = value
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('workspace-sidebar-collapsed', value ? '1' : '0')
  }
}

function toggleSidebar() {
  setSidebarCollapsed(!sidebarCollapsed.value)
}

function handleSidebarShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isTyping = Boolean(
    target
      && (target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.isContentEditable),
  )

  if (isTyping) return

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
    event.preventDefault()
    toggleSidebar()
  }
}

onMounted(() => {
  syncDesktopState()
  window.addEventListener('resize', syncDesktopState)
  window.addEventListener('keydown', handleSidebarShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncDesktopState)
  window.removeEventListener('keydown', handleSidebarShortcut)
})
</script>

<template>
  <div v-if="isEmbeddedJourney" class="embedded-shell">
    <main class="embedded-main">
      <RouterView />
    </main>
  </div>

  <div v-else class="shell" :class="{ 'shell--collapsed': compactSidebar }">
    <SidebarNav
      :collapsed="compactSidebar"
      :selected-journey-id="selectedJourneyId"
      @select-journey="onSelectJourney"
      @toggle-sidebar="toggleSidebar"
    />
    <main class="shell-main">
      <RouterView v-slot="{ Component }">
        <component
          :is="Component"
          :selected-journey-id="selectedJourneyId"
          @clear-selection="selectedJourneyId = null"
        />
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.shell {
  --shell-sidebar-width: 220px;

  display: grid;
  grid-template-columns: var(--shell-sidebar-width) 1fr;
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  transition: grid-template-columns 220ms ease;
}

.shell--collapsed {
  --shell-sidebar-width: 72px;
}

.shell-main {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100vh;
  min-width: 0;
}

.embedded-shell {
  min-height: 100vh;
}

.embedded-main {
  min-height: 100vh;
  padding: 16px 24px;
}

@media (max-width: 1024px) {
  .shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}
</style>

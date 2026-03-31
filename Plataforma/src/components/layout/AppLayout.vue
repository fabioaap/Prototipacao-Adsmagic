<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SidebarNav from './SidebarNav.vue'

const route = useRoute()
const isEmbeddedJourney = computed(() => route.query.embed === 'journey')

const selectedJourneyId = ref<string | null>(null)

function onSelectJourney(id: string) {
  selectedJourneyId.value = id || null
}
</script>

<template>
  <div v-if="isEmbeddedJourney" class="embedded-shell">
    <main class="embedded-main">
      <RouterView />
    </main>
  </div>

  <div v-else class="shell">
    <SidebarNav
      :selected-journey-id="selectedJourneyId"
      @select-journey="onSelectJourney"
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
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
}

.shell-main {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100vh;
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

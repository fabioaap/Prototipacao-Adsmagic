<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarNav from './SidebarNav.vue'
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="flex min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
    <SidebarNav />
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-auto px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

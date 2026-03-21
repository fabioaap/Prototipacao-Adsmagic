<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarNav from './SidebarNav.vue'
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <SidebarNav />
    <div class="flex flex-col flex-1 overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

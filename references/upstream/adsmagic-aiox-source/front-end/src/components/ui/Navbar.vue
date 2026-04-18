<script setup lang="ts">
import BrandLogo from '@/components/features/onboarding/BrandLogo.vue'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import UserMenu from '@/components/ui/UserMenu.vue'
</script>

<template>
  <nav class="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="flex h-16 items-center justify-between px-6">
      <!-- Logo à esquerda -->
      <div class="flex items-center gap-2">
        <BrandLogo :size="24" />
        <span class="text-lg font-semibold text-foreground hidden sm:block">AdsMagic</span>
      </div>

      <!-- Language Selector e User Menu à direita -->
      <div class="flex items-center gap-4">
        <LanguageSelector />
        <UserMenu />
      </div>
    </div>
  </nav>
</template>

<style scoped>
</style>

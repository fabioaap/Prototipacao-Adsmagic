<script setup lang="ts">
import { Settings, HelpCircle, Crown, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import Avatar from '@/components/ui/Avatar.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import DarkModeToggle from '@/components/ui/DarkModeToggle.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

function handleProfileSettings() {
  // TODO: Navegar para página de configurações do perfil
  console.log('Configurações do perfil')
  // router.push('/perfil/configuracoes')
}

function handleHelpCenter() {
  // TODO: Abrir help center
  console.log('Help Center')
  // window.open('https://help.adsmagic.com', '_blank')
}

function handleUpgrade() {
  const locale = route.params.locale as string || 'pt'
  router.push(`/${locale}/pricing`)
}

function handleLogout() {
  authStore.logout()
  const locale = route.params.locale as string || 'pt'
  router.push(`/${locale}/login`)
}
</script>

<template>
  <DropdownMenu align="right">
    <template #trigger>
      <div class="flex items-center gap-2 cursor-pointer">
        <Avatar :name="authStore.user?.name" :src="authStore.user?.profile?.avatar_url ?? undefined" :size="32" />
        <span class="text-sm font-medium text-foreground hidden sm:block">
          {{ authStore.user?.name }}
        </span>
      </div>
    </template>

    <!-- Menu Items -->
    <button
      @click="handleProfileSettings"
      class="flex w-full items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
      type="button"
    >
      <Settings class="h-4 w-4" />
      <span>Configurações do perfil</span>
    </button>

    <button
      @click="handleHelpCenter"
      class="flex w-full items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
      type="button"
    >
      <HelpCircle class="h-4 w-4" />
      <span>Help Center</span>
    </button>

    <button
      @click="handleUpgrade"
      class="flex w-full items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
      type="button"
    >
      <Crown class="h-4 w-4 text-yellow-500" />
      <span>Upgrade</span>
    </button>

    <!-- Divider -->
    <div class="my-1 h-px bg-border"></div>

    <!-- Dark Mode Toggle -->
    <div class="px-1 py-1">
      <DarkModeToggle />
    </div>

    <!-- Divider -->
    <div class="my-1 h-px bg-border"></div>

    <!-- Logout -->
    <button
      @click="handleLogout"
      class="flex w-full items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
      type="button"
    >
      <LogOut class="h-4 w-4" />
      <span>Sair</span>
    </button>
  </DropdownMenu>
</template>

<style scoped>
</style>

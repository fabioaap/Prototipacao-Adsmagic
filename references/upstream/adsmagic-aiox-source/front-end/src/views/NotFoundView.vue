<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const locale = (route.params.locale as string) || 'pt'

const goHome = () => {
  router.push(`/${locale}/login`)
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
    <h1 class="text-6xl font-bold text-muted-foreground/30">404</h1>
    <h2 class="mt-4 text-xl font-semibold text-foreground">
      {{ t('notFound.title') }}
    </h2>
    <p class="mt-2 max-w-md text-sm text-muted-foreground">
      {{ t('notFound.message') }}
    </p>
    <Button class="mt-6" @click="goHome">
      {{ t('notFound.backHome') }}
    </Button>
  </div>
</template>

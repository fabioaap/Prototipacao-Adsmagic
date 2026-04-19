<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'

const route = useRoute()
const { t } = useI18n()

// Base classes aligned with the shared TabsList/TabsTrigger visual pattern used in Integrations
const tabsListClass = "grid w-full grid-cols-3 rounded-control bg-muted p-1 text-muted-foreground h-10 gap-1 mb-6"
const baseTriggerClass = "inline-flex items-center justify-center whitespace-nowrap rounded-control px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
const activeTriggerClass = "bg-background text-foreground shadow-sm"
const inactiveTriggerClass = "text-muted-foreground hover:bg-background/50 hover:text-foreground"

const links = [
  { name: 'settings-general', labelKey: 'settings.links.general' },
  { name: 'settings-funnel', labelKey: 'settings.links.funnel' },
  { name: 'settings-origins', labelKey: 'settings.links.origins' }
]
</script>

<template>
  <nav :class="tabsListClass" :aria-label="t('settings.navAriaLabel', 'Settings Navigation')">
    <RouterLink
      v-for="link in links"
      :key="link.name"
      :to="{ name: link.name, params: route.params }"
      :class="cn(baseTriggerClass, route.name === link.name ? activeTriggerClass : inactiveTriggerClass)"
    >
      {{ t(link.labelKey) }}
    </RouterLink>
  </nav>
</template>


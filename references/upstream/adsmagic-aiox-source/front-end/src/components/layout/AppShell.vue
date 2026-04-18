<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import type { NavSection } from '@/components/layout/SidebarNav.vue'

type ContainerSize = 'md' | 'lg' | 'xl' | '2xl'

interface Props {
  navSections?: NavSection[]
  hideHeader?: boolean
  containerSize?: ContainerSize
  fluid?: boolean
  noPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  navSections: undefined,
  hideHeader: false,
  containerSize: '2xl',
  fluid: false,
  noPadding: false,
})
</script>

<template>
  <AppLayout :nav-sections="navSections" :hide-header="hideHeader">
    <PageContainer :size="containerSize" :fluid="fluid" :no-padding="noPadding">
      <slot />
    </PageContainer>
  </AppLayout>
</template>

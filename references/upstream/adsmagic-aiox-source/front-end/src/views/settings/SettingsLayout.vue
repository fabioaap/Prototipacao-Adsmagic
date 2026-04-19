<template>
  <AppLayout>
    <div class="page-shell section-stack-md">
      <!-- No Project Selected -->
      <div v-if="!currentProjectId" class="text-center py-12">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings class="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 class="section-title-md mb-2">{{ t('settings.noProject') }}</h2>
          <p class="text-muted-foreground mb-6">
            {{ t('settings.noProjectDescription') }}
          </p>
          <Button @click="goToProjects">
            <Settings class="h-4 w-4 mr-2" />
            {{ t('settings.goToProjects') }}
          </Button>
        </div>
      </div>

      <!-- Settings Content -->
      <template v-else>
        <!-- Shared Header -->
        <div class="page-header-section">
          <PageHeader
            :title="t('settings.title')"
            :description="t('settings.description')"
          />
        </div>

        <!-- Shared Tabs Navigation -->
        <SettingsNav />

        <!-- Tab Content (child route) -->
        <router-view />
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Settings } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SettingsNav from '@/components/settings/SettingsNav.vue'
import { useProjectsStore } from '@/stores/projects'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const projectsStore = useProjectsStore()

const currentProjectId = computed(() => {
  const routeProjectId = typeof route.params.projectId === 'string' ? route.params.projectId : ''
  if (routeProjectId) return routeProjectId
  const storeProjectId = projectsStore.currentProject?.id || ''
  if (storeProjectId) return storeProjectId
  return localStorage.getItem('current_project_id') || ''
})

const goToProjects = () => {
  const locale = route.params.locale as string || 'pt'
  router.push(`/${locale}/projects`)
}
</script>

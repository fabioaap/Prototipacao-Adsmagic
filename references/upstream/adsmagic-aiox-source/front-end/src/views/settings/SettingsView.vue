<template>
  <div class="section-stack-md">
    <!-- Settings Content -->
    <DashboardSection
        :title="t('settings.general.title')"
        :description="t('settings.general.description')"
        variant="bordered"
      >
        <SettingsGeneralTab
          :project-id="currentProjectId"
          :settings="generalSettings"
          :loading="isLoading"
          @save="handleGeneralSave"
          @archive="handleArchiveProject"
          @delete="handleDeleteProject"
        />
      </DashboardSection>

      <DashboardSection
        :title="t('settings.currency.title')"
        :description="t('settings.currency.description')"
        variant="bordered"
      >
        <SettingsCurrencyTab
          :settings="currencySettings"
          :loading="isLoading"
          @save="handleCurrencySave"
        />
      </DashboardSection>

      <DashboardSection
        :title="t('settings.notifications.title')"
        :description="t('settings.notifications.description')"
        variant="bordered"
      >
        <SettingsNotificationsTab
          :settings="notificationSettings"
          :loading="isLoading"
          @save="handleNotificationSave"
        />
      </DashboardSection>

    <!-- Error Toast -->
    <div v-if="error" class="fixed bottom-4 right-4 z-50">
      <Alert
        variant="destructive"
        :title="t('settings.errorTitle')"
        :description="error"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardSection from '@/components/ui/DashboardSection.vue'
import Alert from '@/components/ui/Alert.vue'
import SettingsGeneralTab from '@/components/settings/SettingsGeneralTab.vue'
import SettingsCurrencyTab from '@/components/settings/SettingsCurrencyTab.vue'
import SettingsNotificationsTab from '@/components/settings/SettingsNotificationsTab.vue'
import { useSettingsStore } from '@/stores/settings'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/components/ui/toast/use-toast'

// ============================================================================
// ROUTER
// ============================================================================

const route = useRoute()
const router = useRouter()

// ============================================================================
// STORES
// ============================================================================

const settingsStore = useSettingsStore()
const projectsStore = useProjectsStore()

// ============================================================================
// COMPOSABLES
// ============================================================================

const { toast } = useToast()
const { t } = useI18n()

// ============================================================================
// COMPUTED
//============================================================================

/**
 * ID do projeto atual
 */
const currentProjectId = computed(() => {
  const routeProjectId = typeof route.params.projectId === 'string' ? route.params.projectId : ''
  if (routeProjectId) {
    return routeProjectId
  }

  const storeProjectId = projectsStore.currentProject?.id || ''
  if (storeProjectId) {
    return storeProjectId
  }

  return localStorage.getItem('current_project_id') || ''
})

/**
 * Configurações gerais
 */
const generalSettings = computed(() => {
  return settingsStore.generalSettings || undefined
})

/**
 * Configurações de moeda
 */
const currencySettings = computed(() => {
  return settingsStore.currencySettings || undefined
})

/**
 * Configurações de notificação
 */
const notificationSettings = computed(() => {
  return settingsStore.notificationSettings || undefined
})

/**
 * Estado de loading
 */
const isLoading = computed(() => {
  return settingsStore.isLoading
})

/**
 * Erro atual
 */
const error = computed(() => {
  return settingsStore.error
})

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(async () => {
  if (!currentProjectId.value) return

  try {
    await settingsStore.fetchSettings(currentProjectId.value)
  } catch (err) {
    console.error('Erro ao carregar configurações:', err)
  }
})

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Redireciona se não há projeto selecionado
 */
watch(
  () => currentProjectId.value,
  (projectId) => {
    if (!projectId) {
      const locale = route.params.locale as string || 'pt'
      router.replace(`/${locale}/projects`).catch(() => {})
    }
  },
  { immediate: true }
)

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * Salva configurações gerais
 */
const handleGeneralSave = async (data: any) => {
  try {
    await settingsStore.updateGeneralSettings(data)

    toast({
      title: t('settings.toast.success'),
      description: t('settings.toast.generalSaved')
    })
  } catch (err) {
    toast({
      title: t('settings.errorTitle'),
      description: t('settings.toast.generalSaveError'),
      variant: 'destructive'
    })
  }
}

/**
 * Salva configurações de moeda
 */
const handleCurrencySave = async (data: any) => {
  try {
    await settingsStore.updateCurrencySettings(data)
    toast({
      title: t('settings.toast.success'),
      description: t('settings.toast.currencySaved')
    })
  } catch (err) {
    toast({
      title: t('settings.errorTitle'),
      description: t('settings.toast.currencySaveError'),
      variant: 'destructive'
    })
  }
}

/**
 * Salva configurações de notificação
 */
const handleNotificationSave = async (data: any) => {
  try {
    await settingsStore.updateNotificationSettings(data)
    toast({
      title: t('settings.toast.success'),
      description: t('settings.toast.notificationSaved')
    })
  } catch (err) {
    toast({
      title: t('settings.errorTitle'),
      description: t('settings.toast.notificationSaveError'),
      variant: 'destructive'
    })
  }
}

/**
 * Arquivar projeto
 */
const handleArchiveProject = async () => {
  try {
    await settingsStore.archiveProject(currentProjectId.value)
    toast({
      title: t('settings.toast.projectArchived'),
      description: t('settings.toast.projectArchivedDescription')
    })
    const locale = route.params.locale as string || 'pt'
    router.push(`/${locale}/projects`)
  } catch (err) {
    toast({
      title: t('settings.errorTitle'),
      description: t('settings.toast.archiveError'),
      variant: 'destructive'
    })
  }
}

/**
 * Deletar projeto
 */
const handleDeleteProject = async () => {
  try {
    await settingsStore.deleteProject(currentProjectId.value)
    toast({
      title: t('settings.toast.projectDeleted'),
      description: t('settings.toast.projectDeletedDescription')
    })
    const locale = route.params.locale as string || 'pt'
    router.push(`/${locale}/projects`)
  } catch (err) {
    toast({
      title: t('settings.errorTitle'),
      description: t('settings.toast.deleteError'),
      variant: 'destructive'
    })
  }
}

</script>


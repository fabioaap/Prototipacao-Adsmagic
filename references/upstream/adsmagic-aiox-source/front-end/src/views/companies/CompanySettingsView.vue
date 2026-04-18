<template>
  <div class="company-settings">
    <div class="page-shell section-stack-md">
      <div class="page-header">
        <PageHeader
          title="Configurações da Empresa"
          description="Gerencie as configurações e preferências da sua empresa"
        />
      </div>

      <div v-if="companiesStore.currentCompany" class="bg-card shadow rounded-lg mb-8">
        <div class="px-6 py-4 border-b border-border">
          <h2 class="section-title-sm">Informações da Empresa</h2>
        </div>
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
              <p class="text-foreground">{{ companiesStore.currentCompany.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted-foreground mb-1">País</label>
              <p class="text-foreground">{{ companiesStore.currentCompany.country }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted-foreground mb-1">Moeda</label>
              <p class="text-foreground">{{ companiesStore.currentCompany.currency }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted-foreground mb-1">Fuso Horário</label>
              <p class="text-foreground">{{ companiesStore.currentCompany.timezone }}</p>
            </div>
          </div>
          <div class="mt-4">
            <button
              @click="editCompany"
              class="text-primary hover:text-primary/80 font-medium"
            >
              Editar informações da empresa
            </button>
          </div>
        </div>
      </div>

      <div v-if="companiesStore.companySettings" class="bg-card shadow rounded-lg">
        <div class="px-6 py-4 border-b border-border">
          <h2 class="section-title-sm">Configurações</h2>
        </div>

        <form @submit.prevent="handleSaveSettings" class="px-6 py-4">
          <div class="space-y-6">
            <div>
              <h3 class="section-title-sm mb-4">Aparência</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="theme" class="block text-sm font-medium text-muted-foreground mb-1">
                    Tema
                  </label>
                  <Select id="theme" v-model="settingsForm.theme" :options="themeOptions" />
                </div>

                <div>
                  <label for="language" class="block text-sm font-medium text-muted-foreground mb-1">
                    Idioma
                  </label>
                  <Select id="language" v-model="settingsForm.language" :options="languageOptions" />
                </div>
              </div>
            </div>

            <div>
              <h3 class="section-title-sm mb-4">Data e Hora</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label for="date_format" class="block text-sm font-medium text-muted-foreground mb-1">
                    Formato de Data
                  </label>
                  <Select id="date_format" v-model="settingsForm.date_format" :options="dateFormatOptions" />
                </div>

                <div>
                  <label for="time_format" class="block text-sm font-medium text-muted-foreground mb-1">
                    Formato de Hora
                  </label>
                  <Select id="time_format" v-model="settingsForm.time_format" :options="timeFormatOptions" />
                </div>

                <div>
                  <label for="timezone" class="block text-sm font-medium text-muted-foreground mb-1">
                    Fuso Horário
                  </label>
                  <Select id="timezone" v-model="settingsForm.timezone" :options="timezoneOptions" />
                </div>
              </div>
            </div>

            <div>
              <h3 class="section-title-sm mb-4">Formato de Números</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="decimal_separator" class="block text-sm font-medium text-muted-foreground mb-1">
                    Separador Decimal
                  </label>
                  <Select id="decimal_separator" v-model="settingsForm.decimal_separator" :options="decimalSeparatorOptions" />
                </div>

                <div>
                  <label for="thousands_separator" class="block text-sm font-medium text-muted-foreground mb-1">
                    Separador de Milhares
                  </label>
                  <Select id="thousands_separator" v-model="settingsForm.thousands_separator" :options="thousandsSeparatorOptions" />
                </div>
              </div>
            </div>

            <div>
              <h3 class="section-title-sm mb-4">Notificações</h3>
              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    id="notifications_enabled"
                    v-model="settingsForm.notifications_enabled"
                    type="checkbox"
                    class="h-4 w-4 text-primary focus-visible:ring-ring border-input rounded"
                  />
                  <label for="notifications_enabled" class="ml-2 block text-sm text-foreground">
                    Habilitar notificações por email
                  </label>
                </div>

                <div v-if="settingsForm.notifications_enabled">
                  <label for="notification_email" class="block text-sm font-medium text-muted-foreground mb-1">
                    Email para notificações
                  </label>
                  <input
                    id="notification_email"
                    v-model="settingsForm.notification_email"
                    type="email"
                    class="w-full px-3 py-2 border border-input rounded-control shadow-sm focus:outline-none focus:ring-2 focus-visible:ring-ring focus-visible:border-ring"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 class="section-title-sm mb-4">Rastreamento</h3>
              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    id="auto_track_events"
                    v-model="settingsForm.auto_track_events"
                    type="checkbox"
                    class="h-4 w-4 text-primary focus-visible:ring-ring border-input rounded"
                  />
                  <label for="auto_track_events" class="ml-2 block text-sm text-foreground">
                    Rastrear eventos automaticamente
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    id="include_company_info"
                    v-model="settingsForm.include_company_info"
                    type="checkbox"
                    class="h-4 w-4 text-primary focus-visible:ring-ring border-input rounded"
                  />
                  <label for="include_company_info" class="ml-2 block text-sm text-foreground">
                    Incluir informações da empresa nos eventos
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    id="include_contact_info"
                    v-model="settingsForm.include_contact_info"
                    type="checkbox"
                    class="h-4 w-4 text-primary focus-visible:ring-ring border-input rounded"
                  />
                  <label for="include_contact_info" class="ml-2 block text-sm text-foreground">
                    Incluir informações de contato nos eventos
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-primary text-primary-foreground px-6 py-2 rounded-control hover:bg-primary/90 focus:outline-none focus:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Salvando...' : 'Salvar Configurações' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else-if="companiesStore.isLoading" class="bg-card shadow rounded-lg p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-muted-foreground">Carregando configurações...</p>
      </div>

      <div v-else-if="companiesStore.error" class="bg-card shadow rounded-lg p-8 text-center">
        <div class="text-destructive mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="section-title-sm mb-2">Erro ao carregar configurações</h3>
        <p class="text-muted-foreground mb-4">{{ companiesStore.error }}</p>
        <button
          @click="companiesStore.loadCompanySettings(companiesStore.currentCompanyId!)"
          class="bg-primary text-primary-foreground px-4 py-2 rounded-control hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    </div>

    <CompanyFormModal
      :is-open="showCompanyModal"
      :company="companiesStore.currentCompany"
      @close="showCompanyModal = false"
      @saved="handleCompanySaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCompaniesStore } from '@/stores/companies'
import CompanyFormModal from '@/components/companies/CompanyFormModal.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Select from '@/components/ui/Select.vue'
import type { CompanySettings } from '@/types'

interface CompanySettingsFormState {
  theme: string
  language: string
  timezone: string
  date_format: string
  time_format: string
  decimal_separator: string
  thousands_separator: string
  notifications_enabled: boolean
  notification_email: string
  auto_track_events: boolean
  include_company_info: boolean
  include_contact_info: boolean
}

const companiesStore = useCompaniesStore()

const isLoading = ref(false)
const showCompanyModal = ref(false)

const settingsForm = ref<CompanySettingsFormState>({
  theme: '',
  language: '',
  timezone: '',
  date_format: '',
  time_format: '',
  decimal_separator: '',
  thousands_separator: '',
  notifications_enabled: false,
  notification_email: '',
  auto_track_events: false,
  include_company_info: false,
  include_contact_info: false,
})

const themeOptions = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'auto', label: 'Automático' },
]

const languageOptions = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
]

const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const timeFormatOptions = [
  { value: '12h', label: '12 horas (AM/PM)' },
  { value: '24h', label: '24 horas' },
]

const timezoneOptions = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'Nova York (GMT-5)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
]

const decimalSeparatorOptions = [
  { value: ',', label: 'Vírgula (,)' },
  { value: '.', label: 'Ponto (.)' },
]

const thousandsSeparatorOptions = [
  { value: '.', label: 'Ponto (.)' },
  { value: ',', label: 'Vírgula (,)' },
  { value: ' ', label: 'Espaço ( )' },
]

// Watch for company settings changes
watch(() => companiesStore.companySettings, (settings) => {
  if (settings) {
    settingsForm.value = {
      theme: settings.theme || '',
      language: settings.language || '',
      timezone: settings.timezone || '',
      date_format: settings.date_format || '',
      time_format: settings.time_format || '',
      decimal_separator: settings.decimal_separator || '',
      thousands_separator: settings.thousands_separator || '',
      notifications_enabled: settings.notifications_enabled,
      notification_email: settings.notification_email || '',
      auto_track_events: settings.auto_track_events,
      include_company_info: settings.include_company_info,
      include_contact_info: settings.include_contact_info
    }
  }
}, { immediate: true })

onMounted(() => {
  if (companiesStore.currentCompanyId) {
    companiesStore.loadCompanySettings(companiesStore.currentCompanyId)
  }
})

const editCompany = () => {
  showCompanyModal.value = true
}

const handleCompanySaved = () => {
  showCompanyModal.value = false
  // Refresh company data
  companiesStore.fetchCompanies()
}

const handleSaveSettings = async () => {
  if (!companiesStore.currentCompanyId) return

  isLoading.value = true
  companiesStore.clearError()

  try {
    const payload: Partial<CompanySettings> = {
      ...settingsForm.value,
      theme: settingsForm.value.theme || null,
      language: settingsForm.value.language || null,
      timezone: settingsForm.value.timezone || null,
      date_format: settingsForm.value.date_format || null,
      time_format: settingsForm.value.time_format || null,
      decimal_separator: settingsForm.value.decimal_separator || null,
      thousands_separator: settingsForm.value.thousands_separator || null,
      notification_email: settingsForm.value.notification_email || null,
    }
    await companiesStore.updateCompanySettings(payload)
    // Show success message or toast
    console.log('Configurações salvas com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

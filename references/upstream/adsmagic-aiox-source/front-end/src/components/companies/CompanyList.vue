<template>
  <div class="company-list">
    <div class="header flex justify-between items-center mb-6">
      <h2 class="section-title-lg">Minhas Empresas</h2>
      <button 
        @click="$emit('create-company')" 
        class="bg-blue-600 text-white px-4 py-2 rounded-control hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Nova Empresa
      </button>
    </div>

    <div v-if="companiesStore.isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="companiesStore.error" class="text-center py-8">
      <div class="text-red-600 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="section-title-sm">{{ companiesStore.error }}</p>
        <button 
          @click="companiesStore.fetchCompanies()" 
          class="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    </div>

    <div v-else-if="!companiesStore.hasCompanies" class="text-center py-12">
      <div class="text-gray-500 mb-6">
        <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="section-title-sm mb-2">Nenhuma empresa encontrada</h3>
        <p class="text-gray-500 mb-4">Você ainda não tem empresas cadastradas.</p>
        <button 
          @click="$emit('create-company')" 
          class="bg-blue-600 text-white px-6 py-3 rounded-control hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Criar Primeira Empresa
        </button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="company in companiesStore.userCompanies"
        :key="company.id"
        class="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        :class="{ 'ring-2 ring-blue-500': company.id === companiesStore.currentCompanyId }"
        @click="selectCompany(company)"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="section-title-sm mb-1">{{ company.name }}</h3>
              <p v-if="company.description" class="text-sm text-gray-600 mb-2">
                {{ company.description }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getRoleBadgeClass(company.userRole)"
              >
                {{ getRoleLabel(company.userRole) }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ company.country }}
            </div>
            
            <div v-if="company.website" class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <a :href="company.website" target="_blank" class="text-blue-600 hover:text-blue-800">
                {{ company.website }}
              </a>
            </div>
            
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              {{ company.currency }}
            </div>
          </div>
          
          <div class="mt-4 flex justify-between items-center">
            <span class="text-xs text-gray-500">
              Criada em {{ formatDate(company.created_at) }}
            </span>
            <div class="flex space-x-2">
              <button
                @click.stop="editCompany(company)"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Editar
              </button>
              <button
                v-if="company.userRole === 'owner'"
                @click.stop="deleteCompany(company)"
                class="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Dialog de Confirmação -->
  <AlertDialog
    v-model="confirmDialog.isOpen.value"
    :title="confirmDialog.title.value"
    :description="confirmDialog.description.value"
    :confirm-text="confirmDialog.confirmText.value"
    :cancel-text="confirmDialog.cancelText.value"
    :variant="confirmDialog.variant.value"
    @confirm="confirmDialog.handleConfirm"
    @cancel="confirmDialog.handleCancel"
  />
</template>

<script setup lang="ts">
import { useCompaniesStore } from '@/stores/companies'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { Company } from '@/types'
import { formatSafeDate } from '@/utils/formatters'

interface Emits {
  (e: 'create-company'): void
  (e: 'edit-company', company: Company): void
  (e: 'delete-company', company: Company): void
}

const emit = defineEmits<Emits>()

const companiesStore = useCompaniesStore()
const confirmDialog = useConfirmDialog()

const selectCompany = (company: Company) => {
  companiesStore.setCurrentCompany(company)
}

const editCompany = (company: Company) => {
  emit('edit-company', company)
}

const deleteCompany = async (company: Company) => {
  const confirmed = await confirmDialog.confirm({
    title: 'Excluir Empresa',
    description: `Tem certeza que deseja excluir a empresa "${company.name}"?`,
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    variant: 'destructive'
  })
  
  if (confirmed) {
    emit('delete-company', company)
  }
}

const getRoleLabel = (role?: string) => {
  if (!role) return 'N/A'
  const labels = {
    owner: 'Proprietário',
    admin: 'Administrador',
    manager: 'Gerente',
    member: 'Membro',
    viewer: 'Visualizador'
  }
  return labels[role as keyof typeof labels] || role
}

const getRoleBadgeClass = (role?: string) => {
  if (!role) return 'bg-gray-100 text-gray-800'
  const classes = {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    member: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800'
  }
  return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return formatSafeDate(dateString)
}
</script>

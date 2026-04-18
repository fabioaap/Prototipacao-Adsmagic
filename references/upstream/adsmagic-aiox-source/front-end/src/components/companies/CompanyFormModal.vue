<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="section-title-sm mb-4">
                  {{ isEditing ? 'Editar Empresa' : 'Nova Empresa' }}
                </h3>

                <div class="space-y-4">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa *
                    </label>
                    <input
                      id="name"
                      v-model="formData.name"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-control shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.name }"
                    />
                    <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
                  </div>

                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      v-model="formData.description"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-control shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>

                  <div>
                    <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
                      País *
                    </label>
                    <Select
                      id="country"
                      v-model="formData.country"
                      :options="countryOptions"
                      placeholder="Selecione um país"
                      :disabled="isLoading"
                      :invalid="!!errors.country"
                    />
                    <p v-if="errors.country" class="mt-1 text-sm text-red-600">{{ errors.country }}</p>
                  </div>

                  <div>
                    <label for="currency" class="block text-sm font-medium text-gray-700 mb-1">
                      Moeda *
                    </label>
                    <Select
                      id="currency"
                      v-model="formData.currency"
                      :options="currencyOptions"
                      placeholder="Selecione uma moeda"
                      :disabled="isLoading"
                      :invalid="!!errors.currency"
                    />
                    <p v-if="errors.currency" class="mt-1 text-sm text-red-600">{{ errors.currency }}</p>
                  </div>

                  <div>
                    <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">
                      Fuso Horário *
                    </label>
                    <Select
                      id="timezone"
                      v-model="formData.timezone"
                      :options="timezoneOptions"
                      placeholder="Selecione um fuso horário"
                      :disabled="isLoading"
                      :invalid="!!errors.timezone"
                    />
                    <p v-if="errors.timezone" class="mt-1 text-sm text-red-600">{{ errors.timezone }}</p>
                  </div>

                  <div>
                    <label for="industry" class="block text-sm font-medium text-gray-700 mb-1">
                      Indústria
                    </label>
                    <Select
                      id="industry"
                      v-model="formData.industry"
                      :options="industryOptions"
                      placeholder="Selecione uma indústria"
                      :disabled="isLoading"
                    />
                  </div>

                  <div>
                    <label for="size" class="block text-sm font-medium text-gray-700 mb-1">
                      Tamanho da Empresa
                    </label>
                    <Select
                      id="size"
                      v-model="formData.size"
                      :options="companySizeOptions"
                      placeholder="Selecione o tamanho"
                      :disabled="isLoading"
                    />
                  </div>

                  <div>
                    <label for="website" class="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      id="website"
                      v-model="formData.website"
                      type="url"
                      placeholder="https://exemplo.com"
                      class="w-full px-3 py-2 border border-gray-300 rounded-control shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full inline-flex justify-center rounded-control border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Empresa') }}
            </button>
            <button
              type="button"
              @click="close"
              :disabled="isLoading"
              class="mt-3 w-full inline-flex justify-center rounded-control border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCompaniesStore } from '@/stores/companies'
import Select from '@/components/ui/Select.vue'
import type { Company, CreateCompanyDTO, UpdateCompanyDTO } from '@/types'

interface CompanyFormState {
  name: string
  description: string
  country: string
  currency: string
  timezone: string
  industry: string
  size: string
  website: string
}

interface Props {
  isOpen: boolean
  company?: Company | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved', company: Company): void
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  company: null
})

const emit = defineEmits<Emits>()

const companiesStore = useCompaniesStore()

const countryOptions = [
  { value: 'BR', label: 'Brasil' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'AR', label: 'Argentina' },
  { value: 'MX', label: 'México' },
  { value: 'ES', label: 'Espanha' },
  { value: 'PT', label: 'Portugal' },
]

const currencyOptions = [
  { value: 'BRL', label: 'Real Brasileiro (BRL)' },
  { value: 'USD', label: 'Dólar Americano (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'ARS', label: 'Peso Argentino (ARS)' },
  { value: 'MXN', label: 'Peso Mexicano (MXN)' },
]

const timezoneOptions = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'Nova York (GMT-5)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
]

const industryOptions = [
  { value: 'technology', label: 'Tecnologia' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'finance', label: 'Finanças' },
  { value: 'healthcare', label: 'Saúde' },
  { value: 'education', label: 'Educação' },
  { value: 'retail', label: 'Varejo' },
  { value: 'manufacturing', label: 'Manufatura' },
  { value: 'services', label: 'Serviços' },
  { value: 'other', label: 'Outro' },
]

const companySizeOptions = [
  { value: 'startup', label: 'Startup (1-10 funcionários)' },
  { value: 'small', label: 'Pequena (11-50 funcionários)' },
  { value: 'medium', label: 'Média (51-200 funcionários)' },
  { value: 'large', label: 'Grande (201-1000 funcionários)' },
  { value: 'enterprise', label: 'Empresa (1000+ funcionários)' },
]

const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!props.company)

const formData = ref<CompanyFormState>({
  name: '',
  description: '',
  country: '',
  currency: '',
  timezone: '',
  industry: '',
  size: '',
  website: ''
})

// Watch for company changes to populate form
watch(() => props.company, (company) => {
  if (company) {
    formData.value = {
      name: company.name,
      description: company.description || '',
      country: company.country,
      currency: company.currency,
      timezone: company.timezone,
      industry: company.industry || '',
      size: company.size || '',
      website: company.website || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    country: '',
    currency: '',
    timezone: '',
    industry: '',
    size: '',
    website: ''
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name?.trim()) {
    errors.value.name = 'Nome é obrigatório'
  }
  
  if (!formData.value.country) {
    errors.value.country = 'País é obrigatório'
  }
  
  if (!formData.value.currency) {
    errors.value.currency = 'Moeda é obrigatória'
  }
  
  if (!formData.value.timezone) {
    errors.value.timezone = 'Fuso horário é obrigatório'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  companiesStore.clearError()

  try {
    let company: Company
    
    if (isEditing.value && props.company) {
      const payload: UpdateCompanyDTO = {
        ...formData.value,
        industry: formData.value.industry || undefined,
        size: formData.value.size || undefined,
        website: formData.value.website || undefined,
        description: formData.value.description || undefined,
      }
      company = await companiesStore.updateCompany(props.company.id, payload)
    } else {
      const payload: CreateCompanyDTO = {
        ...formData.value,
        industry: formData.value.industry || undefined,
        size: formData.value.size || undefined,
        website: formData.value.website || undefined,
        description: formData.value.description || undefined,
      }
      company = await companiesStore.createCompany(payload)
    }
    
    emit('saved', company)
    close()
  } catch (error) {
    console.error('Erro ao salvar empresa:', error)
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  if (!isLoading.value) {
    resetForm()
    emit('close')
  }
}
</script>

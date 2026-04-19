<template>
  <div class="company-selector">
    <label v-if="label" class="block text-sm font-medium text-foreground mb-2">
      {{ label }}
    </label>

    <div class="relative">
      <Select
        :model-value="modelValue || ''"
        :options="companyOptions"
        :disabled="disabled || companiesStore.isLoading"
        :placeholder="companiesStore.isLoading ? 'Carregando...' : 'Selecione uma empresa'"
        @update:model-value="handleChange"
      />

      <div v-if="companiesStore.isLoading" class="absolute inset-y-0 right-10 flex items-center pr-1 pointer-events-none">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    </div>

    <p v-if="companiesStore.error" class="mt-1 text-sm text-destructive">
      {{ companiesStore.error }}
    </p>

    <p v-if="!companiesStore.hasCompanies && !companiesStore.isLoading" class="mt-1 text-sm text-muted-foreground">
      Nenhuma empresa encontrada.
      <button
        @click="$emit('create-company')"
        class="text-primary hover:text-primary/80 underline"
      >
        Criar primeira empresa
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Select from '@/components/ui/Select.vue'
import { useCompaniesStore } from '@/stores/companies'

interface Props {
  modelValue?: string
  label?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'create-company'): void
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: 'Empresa',
  disabled: false
})

const emit = defineEmits<Emits>()

const companiesStore = useCompaniesStore()

const companyOptions = computed(() =>
  companiesStore.userCompanies.map((company) => ({
    value: company.id,
    label: company.name,
  }))
)

const handleChange = (value: string) => {
  emit('update:modelValue', value)

  // Selecionar empresa automaticamente
  const company = companiesStore.userCompanies.find(c => c.id === value)
  if (company) {
    companiesStore.setCurrentCompany(company)
  }
}

onMounted(() => {
  if (!companiesStore.hasCompanies) {
    companiesStore.fetchCompanies()
  }
})
</script>

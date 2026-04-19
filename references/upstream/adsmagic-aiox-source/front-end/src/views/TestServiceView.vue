<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">🧪 Teste do Service de Contatos</h1>

    <button
      @click="runTests"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      :disabled="isRunning"
    >
      {{ isRunning ? 'Executando...' : 'Executar Testes' }}
    </button>

    <div v-if="results.length > 0" class="mt-6 space-y-4">
      <div
        v-for="(result, index) in results"
        :key="index"
        class="p-4 border rounded"
        :class="{
          'border-green-500 bg-green-50': result.success,
          'border-red-500 bg-red-50': !result.success
        }"
      >
        <h3 class="font-semibold mb-2">
          {{ result.success ? '✅' : '❌' }} {{ result.title }}
        </h3>
        <pre class="text-sm overflow-auto">{{ result.details }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getContacts, getContactById, createContact } from '@/services/api/contacts'
import type { CreateContactDTO } from '@/types'

interface TestResult {
  title: string
  success: boolean
  details: string
}

const isRunning = ref(false)
const results = ref<TestResult[]>([])

async function runTests() {
  isRunning.value = true
  results.value = []

  // Test 1: Get all contacts
  try {
    const result = await getContacts({ page: 1, pageSize: 5 })
    if (result.ok) {
      results.value.push({
        title: 'Get All Contacts',
        success: true,
        details: `Total: ${result.value.pagination.total}\nRetornados: ${result.value.data.length}\nPrimeiro: ${result.value.data[0]?.name}`
      })
    } else {
      throw result.error
    }
  } catch (error) {
    results.value.push({
      title: 'Get All Contacts',
      success: false,
      details: String(error)
    })
  }

  // Test 2: Search
  try {
    const result = await getContacts({ search: 'Leticia' })
    if (result.ok) {
      results.value.push({
        title: 'Search "Leticia"',
        success: true,
        details: `Encontrados: ${result.value.data.length}\n${result.value.data.map(c => c.name).join('\n')}`
      })
    } else {
      throw result.error
    }
  } catch (error) {
    results.value.push({
      title: 'Search "Leticia"',
      success: false,
      details: String(error)
    })
  }

  // Test 3: Filter by origin
  try {
    const result = await getContacts({ origins: ['origin-google-ads'], pageSize: 3 })
    if (result.ok) {
      results.value.push({
        title: 'Filter by Google Ads',
        success: true,
        details: `Total: ${result.value.pagination.total}\n${result.value.data.map(c => c.name).join('\n')}`
      })
    } else {
      throw result.error
    }
  } catch (error) {
    results.value.push({
      title: 'Filter by Google Ads',
      success: false,
      details: String(error)
    })
  }

  // Test 4: Get by ID
  try {
    const result = await getContactById('contact-001')
    if (result.ok && result.value) {
      results.value.push({
        title: 'Get Contact by ID',
        success: true,
        details: `Nome: ${result.value.name}\nTelefone: ${result.value.countryCode} ${result.value.phone}\nOrigem: ${result.value.origin}`
      })
    } else {
      throw new Error('Contact not found')
    }
  } catch (error) {
    results.value.push({
      title: 'Get Contact by ID',
      success: false,
      details: String(error)
    })
  }

  // Test 5: Create contact
  try {
    const newContact: CreateContactDTO = {
      name: 'Teste Automático',
      phone: '11999887766',
      countryCode: '+55',
      origin: 'origin-google-ads'
    }
    const result = await createContact(newContact)
    if (result.ok) {
      results.value.push({
        title: 'Create Contact',
        success: true,
        details: `Criado: ${result.value.name}\nID: ${result.value.id}\nStage: ${result.value.stage}`
      })
    } else {
      throw result.error
    }
  } catch (error) {
    results.value.push({
      title: 'Create Contact',
      success: false,
      details: String(error)
    })
  }

  // Test 6: Filter by stage
  try {
    const result = await getContacts({ stages: ['stage-sale'], pageSize: 5 })
    if (result.ok) {
      results.value.push({
        title: 'Filter by Sale Stage',
        success: true,
        details: `Total vendas: ${result.value.pagination.total}\n${result.value.data.map(c => c.name).join('\n')}`
      })
    } else {
      throw result.error
    }
  } catch (error) {
    results.value.push({
      title: 'Filter by Sale Stage',
      success: false,
      details: String(error)
    })
  }

  isRunning.value = false
}
</script>

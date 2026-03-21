<script setup lang="ts">
import { useContactsStore } from '@/stores/contacts'

const store = useContactsStore()

const statusLabels: Record<string, string> = {
  new: 'Novo',
  in_progress: 'Em andamento',
  converted: 'Convertido',
  lost: 'Perdido',
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-wrap gap-3 items-center">
      <input
        v-model="store.search"
        type="text"
        placeholder="Buscar por nome ou email..."
        class="flex-1 min-w-48 max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <select
        v-model="store.statusFilter"
        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
      >
        <option value="all">Todos os status</option>
        <option value="new">Novo</option>
        <option value="in_progress">Em andamento</option>
        <option value="converted">Convertido</option>
        <option value="lost">Perdido</option>
      </select>
      <span class="text-sm text-gray-500">{{ store.filtered.length }} contato(s)</span>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Nome</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Origem</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Etapa</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Valor</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="contact in store.filtered" :key="contact.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-900">{{ contact.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ contact.email }}</td>
            <td class="px-4 py-3 text-gray-600">{{ contact.origin }}</td>
            <td class="px-4 py-3 text-gray-600">{{ contact.stage }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusColors[contact.status]"
              >
                {{ statusLabels[contact.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-medium text-gray-900">{{ formatCurrency(contact.value) }}</td>
          </tr>
          <tr v-if="store.filtered.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-400">
              Nenhum contato encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

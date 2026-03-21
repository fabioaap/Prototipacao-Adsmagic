<script setup lang="ts">
import { ref } from 'vue'
import { mockLinks } from '@/data/tracking'

const copiedId = ref<string | null>(null)

function copyLink(id: string) {
  copiedId.value = id
  setTimeout(() => { copiedId.value = null }, 2000)
}
</script>

<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700">Links Rastreáveis</h3>
        <span class="text-xs text-gray-400">{{ mockLinks.length }} links</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL Curta</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campanha</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cliques</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversões</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="link in mockLinks" :key="link.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-medium text-gray-900">{{ link.name }}</td>
              <td class="px-4 py-3">
                <span class="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                  {{ link.shortUrl.replace('https://', '') }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500">{{ link.utmCampaign }}</td>
              <td class="px-4 py-3 text-right font-medium text-gray-700">{{ link.clicks.toLocaleString('pt-BR') }}</td>
              <td class="px-4 py-3 text-right font-medium text-gray-700">{{ link.conversions }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="link.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ link.active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="copyLink(link.id)"
                  class="text-xs px-2.5 py-1 rounded-md border transition-colors"
                  :class="copiedId === link.id
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700'"
                >
                  {{ copiedId === link.id ? '✓ Copiado' : 'Copiar link' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

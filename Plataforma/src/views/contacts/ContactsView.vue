<script setup lang="ts">
import { computed } from 'vue'
import { useContactsStore } from '@/stores/contacts'

const store = useContactsStore()

const mappedCount = computed(() => store.contacts.length)
const activeCount = computed(() => store.contacts.filter(contact => contact.status === 'in_progress').length)
const sourceCount = computed(() => new Set(store.contacts.map(contact => contact.origin)).size)

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
  <div class="space-y-6">
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Superficie hospedada</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Contatos do Adsmagic</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Este recorte organiza o que o time sabe hoje sobre entradas, qualificacao e estagios comerciais. Ele serve como base para leitura do AS-IS e para os proximos prototipos de CRM e pipeline.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
        <span class="font-semibold text-slate-100">{{ store.filtered.length }}</span> registro(s) visiveis
      </div>
    </section>

    <section class="rounded-[1.75rem] border border-slate-800 bg-slate-900/60 px-5 py-4">
      <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Leitura do workspace</p>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
        Esta tela nao substitui o CRM de producao. Ela hospeda um recorte navegavel das entradas atuais e das hipoteses de acompanhamento que o time quer refinar antes de consolidar o TO-BE.
      </p>
    </section>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Base mapeada</p>
        <p class="mt-2 text-2xl font-bold text-slate-50">{{ mappedCount }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">Contatos disponiveis para leitura no recorte atual.</p>
      </div>
      <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Em acompanhamento</p>
        <p class="mt-2 text-2xl font-bold text-primary-300">{{ activeCount }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">Oportunidades que ainda pedem leitura ou proximo passo.</p>
      </div>
      <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Origens ativas</p>
        <p class="mt-2 text-2xl font-bold text-slate-50">{{ sourceCount }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">Canais ja reconhecidos dentro do cenario atual.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/72 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      <input
        v-model="store.search"
        type="text"
        placeholder="Buscar por nome ou email..."
        class="min-w-48 max-w-sm flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
      />
      <select
        v-model="store.statusFilter"
        class="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-primary-400 focus:outline-none"
      >
        <option value="all">Todos os status</option>
        <option value="new">Novo</option>
        <option value="in_progress">Em andamento</option>
        <option value="converted">Convertido</option>
        <option value="lost">Perdido</option>
      </select>
      <span class="text-sm text-slate-500">Leitura mockada atualizada em tempo real</span>
    </div>

    <div class="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/72 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      <div class="border-b border-slate-800 bg-slate-900 px-4 py-3">
        <h3 class="text-sm font-semibold text-slate-100">Base atual de referencia</h3>
        <p class="mt-1 text-xs leading-5 text-slate-500">Use esta leitura para revisar origem, etapa e valor potencial antes de desenhar novos fluxos de CRM.</p>
      </div>
      <table class="w-full text-sm">
        <thead class="border-b border-slate-800 bg-slate-900">
          <tr>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Nome</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Email</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Origem</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Etapa</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Status</th>
            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Valor</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr v-for="contact in store.filtered" :key="contact.id" class="transition-colors hover:bg-slate-900/90">
            <td class="px-4 py-4 font-medium text-slate-100">{{ contact.name }}</td>
            <td class="px-4 py-4 text-slate-400">{{ contact.email }}</td>
            <td class="px-4 py-4 text-slate-300">{{ contact.origin }}</td>
            <td class="px-4 py-4 text-slate-300">{{ contact.stage }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                :class="statusColors[contact.status]"
              >
                {{ statusLabels[contact.status] }}
              </span>
            </td>
            <td class="px-4 py-4 text-right font-medium text-slate-100">{{ formatCurrency(contact.value) }}</td>
          </tr>
          <tr v-if="store.filtered.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500">
              Nenhum contato encontrado neste recorte
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

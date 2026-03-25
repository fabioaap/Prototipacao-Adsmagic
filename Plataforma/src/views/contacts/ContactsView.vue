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
  <div class="space-y-6">
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Base operacional</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Contatos e pipeline inicial</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Consulte rapidamente os leads captados, a origem de cada contato e o estágio atual dentro da jornada comercial.
        </p>
      </div>
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-400">
        <span class="font-semibold text-zinc-100">{{ store.filtered.length }}</span> contato(s) visíveis
      </div>
    </section>

    <div class="flex flex-wrap items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/72 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      <input
        v-model="store.search"
        type="text"
        placeholder="Buscar por nome ou email..."
        class="min-w-48 max-w-sm flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-primary-400 focus:outline-none"
      />
      <select
        v-model="store.statusFilter"
        class="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-primary-400 focus:outline-none"
      >
        <option value="all">Todos os status</option>
        <option value="new">Novo</option>
        <option value="in_progress">Em andamento</option>
        <option value="converted">Convertido</option>
        <option value="lost">Perdido</option>
      </select>
      <span class="text-sm text-zinc-500">Filtros ativos em tempo real</span>
    </div>

    <div class="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/72 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      <table class="w-full text-sm">
        <thead class="border-b border-zinc-800 bg-zinc-900">
          <tr>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Nome</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Email</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Origem</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Etapa</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Status</th>
            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Valor</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800">
          <tr v-for="contact in store.filtered" :key="contact.id" class="transition-colors hover:bg-zinc-900/90">
            <td class="px-4 py-4 font-medium text-zinc-100">{{ contact.name }}</td>
            <td class="px-4 py-4 text-zinc-400">{{ contact.email }}</td>
            <td class="px-4 py-4 text-zinc-300">{{ contact.origin }}</td>
            <td class="px-4 py-4 text-zinc-300">{{ contact.stage }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                :class="statusColors[contact.status]"
              >
                {{ statusLabels[contact.status] }}
              </span>
            </td>
            <td class="px-4 py-4 text-right font-medium text-zinc-100">{{ formatCurrency(contact.value) }}</td>
          </tr>
          <tr v-if="store.filtered.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-sm text-zinc-500">
              Nenhum contato encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

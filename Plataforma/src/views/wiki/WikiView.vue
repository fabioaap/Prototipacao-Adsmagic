<script setup lang="ts">
const sections = [
  {
    title: 'Contexto do protótipo',
    description: 'Registra o que está em validação agora, o que saiu de escopo e quais decisões já foram consolidadas.',
    items: ['Escopo atual da navegação', 'Hipóteses de jornada', 'Pontos abertos para refinamento'],
  },
  {
    title: 'Rituais operacionais',
    description: 'Centraliza combinados de acompanhamento para produto, marketing e comercial sem depender de telas adicionais.',
    items: ['Cadência de revisão', 'Entradas para o kanban', 'Checklist de atualização da Home'],
  },
  {
    title: 'Referências rápidas',
    description: 'Agrupa links internos e tópicos que ajudam a orientar a leitura do protótipo durante as iterações.',
    items: ['Leitura das jornadas', 'Glossário operacional', 'Próximos incrementos'],
  },
]
</script>

<template>
  <div class="space-y-8 pb-4">
    <section class="border-b border-zinc-900 pb-8">
      <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">Base de conhecimento</p>
      <h2 class="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Wiki do protótipo</h2>
      <p class="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
        Um espaço enxuto para documentar decisões, combinados e referências do ciclo atual sem espalhar contexto por telas temporárias.
      </p>
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      <article
        v-for="section in sections"
        :key="section.title"
        class="rounded-3xl border border-zinc-800 bg-zinc-900/72 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Wiki</p>
        <h3 class="mt-2 text-lg font-semibold tracking-tight text-zinc-100">{{ section.title }}</h3>
        <p class="mt-3 text-sm leading-6 text-zinc-400">{{ section.description }}</p>

        <ul class="mt-6 space-y-2">
          <li
            v-for="item in section.items"
            :key="item"
            class="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-300"
          >
            {{ item }}
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>
import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * DataTable - Organismo de tabela de dados reutilizável.
 * 
 * Tabela genérica com ordenação, paginação e ações.
 */
const meta: Meta = {
  title: 'Organisms/DataTable',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Tabela de dados reutilizável com ordenação, paginação e ações.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Tabela de dados padrão
 */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="bg-card rounded-lg border">
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="font-semibold">Lista de Dados</h3>
          <div class="flex items-center gap-2">
            <input type="text" placeholder="Buscar..." class="h-9 w-64 rounded-md border px-3 text-sm" />
            <button class="px-3 py-1.5 text-sm border rounded-md">Filtros</button>
          </div>
        </div>
        <table class="w-full">
          <thead class="border-b bg-muted/50">
            <tr>
              <th class="text-left p-4 font-medium text-sm">
                <div class="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  Nome <span class="text-muted-foreground">↕</span>
                </div>
              </th>
              <th class="text-left p-4 font-medium text-sm">E-mail</th>
              <th class="text-left p-4 font-medium text-sm">Status</th>
              <th class="text-right p-4 font-medium text-sm">Data</th>
              <th class="text-right p-4 font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="i in 5" :key="i" class="hover:bg-muted/30">
              <td class="p-4 font-medium text-sm">Item {{ i }}</td>
              <td class="p-4 text-sm text-muted-foreground">item{{ i }}@email.com</td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded-full text-xs" 
                  :class="i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                  {{ i % 2 === 0 ? 'Ativo' : 'Pendente' }}
                </span>
              </td>
              <td class="p-4 text-sm text-muted-foreground text-right">{{ i }} dias atrás</td>
              <td class="p-4">
                <div class="flex items-center justify-end gap-1">
                  <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9" aria-label="Visualizar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9" aria-label="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 text-destructive" aria-label="Excluir">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="p-4 border-t flex items-center justify-between">
          <p class="text-sm text-muted-foreground">Mostrando 1-5 de 50 itens</p>
          <div class="flex items-center gap-1">
            <button class="px-3 py-1 text-sm border rounded hover:bg-accent" disabled>Anterior</button>
            <button class="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">1</button>
            <button class="px-3 py-1 text-sm border rounded hover:bg-accent">2</button>
            <button class="px-3 py-1 text-sm border rounded hover:bg-accent">3</button>
            <span class="px-2 text-muted-foreground">...</span>
            <button class="px-3 py-1 text-sm border rounded hover:bg-accent">10</button>
            <button class="px-3 py-1 text-sm border rounded hover:bg-accent">Próximo</button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Tabela em loading
 */
export const Loading: Story = {
  render: () => ({
    template: `
      <div class="bg-card rounded-lg border">
        <div class="p-4 border-b">
          <div class="h-6 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div class="divide-y">
          <div v-for="i in 5" :key="i" class="p-4 flex gap-4">
            <div class="h-4 w-1/4 bg-muted rounded animate-pulse"></div>
            <div class="h-4 w-1/4 bg-muted rounded animate-pulse"></div>
            <div class="h-4 w-1/6 bg-muted rounded animate-pulse"></div>
            <div class="h-4 w-1/6 bg-muted rounded animate-pulse ml-auto"></div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Tabela vazia
 */
export const Empty: Story = {
  render: () => ({
    template: `
      <div class="bg-card rounded-lg border">
        <div class="p-4 border-b">
          <h3 class="font-semibold">Lista de Dados</h3>
        </div>
        <div class="p-12 text-center">
          <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📋</span>
          </div>
          <h4 class="font-medium mb-1">Nenhum dado encontrado</h4>
          <p class="text-sm text-muted-foreground mb-4">Não há registros para exibir.</p>
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            Adicionar primeiro item
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Tabela com seleção
 */
export const WithSelection: Story = {
  render: () => ({
    template: `
      <div class="bg-card rounded-lg border">
        <div class="p-4 border-b flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="font-semibold">Lista de Dados</h3>
            <span class="text-sm text-muted-foreground">(3 selecionados)</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50">
              Excluir selecionados
            </button>
            <button class="px-3 py-1.5 text-sm border rounded-md">
              Exportar
            </button>
          </div>
        </div>
        <table class="w-full">
          <thead class="border-b bg-muted/50">
            <tr>
              <th class="p-4 w-12">
                <input type="checkbox" class="rounded" checked />
              </th>
              <th class="text-left p-4 font-medium text-sm">Nome</th>
              <th class="text-left p-4 font-medium text-sm">E-mail</th>
              <th class="text-right p-4 font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="i in 5" :key="i" class="hover:bg-muted/30" :class="i <= 3 ? 'bg-primary/5' : ''">
              <td class="p-4">
                <input type="checkbox" class="rounded" :checked="i <= 3" />
              </td>
              <td class="p-4 font-medium text-sm">Item {{ i }}</td>
              <td class="p-4 text-sm text-muted-foreground">item{{ i }}@email.com</td>
              <td class="p-4">
                <div class="flex items-center justify-end gap-1">
                  <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9" aria-label="Visualizar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9" aria-label="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 text-destructive" aria-label="Excluir">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
}

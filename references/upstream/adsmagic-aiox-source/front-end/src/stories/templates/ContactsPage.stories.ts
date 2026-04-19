import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * ContactsTemplate - Template da página de Contatos.
 * 
 * Página completa com lista/kanban de contatos, filtros e modais.
 */
const meta: Meta = {
  title: 'Templates/ContactsPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template completo da página de Contatos.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Página de contatos em modo lista
 */
export const ListView: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <!-- Header -->
        <header class="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
          <div class="flex items-center justify-between h-16 px-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span class="font-semibold">AdsMagic</span>
            </div>
            <div class="flex items-center gap-4">
              <button class="px-3 py-1.5 text-sm border rounded-md">🇧🇷 PT</button>
              <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">JS</div>
            </div>
          </div>
        </header>
        
        <div class="flex">
          <!-- Sidebar -->
          <aside class="w-64 border-r bg-card min-h-[calc(100vh-4rem)]">
            <div class="p-4">
              <div class="mb-6">
                <span class="text-xs text-muted-foreground uppercase tracking-wide">Nome do projeto</span>
                <h2 class="font-semibold">E-commerce Fashion</h2>
              </div>
              
              <nav class="space-y-1">
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
                  📊 Dashboard
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-accent font-medium">
                  👥 Contatos
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
                  💰 Vendas
                </a>
              </nav>
            </div>
          </aside>
          
          <!-- Main Content -->
          <main class="flex-1 p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h1 class="text-2xl font-bold">Contatos</h1>
                <p class="text-muted-foreground">1.234 contatos no total</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 text-sm border rounded-md bg-accent">📋 Lista</button>
                <button class="px-3 py-1.5 text-sm border rounded-md">📊 Kanban</button>
                <button class="px-3 py-1.5 text-sm border rounded-md">🔍 Filtros</button>
                <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
                  + Novo Contato
                </button>
              </div>
            </div>
            
            <!-- Metrics -->
            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Total</p>
                <p class="text-2xl font-bold">1.234</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Esta semana</p>
                <p class="text-2xl font-bold text-green-600">+89</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Convertidos</p>
                <p class="text-2xl font-bold">156</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p class="text-2xl font-bold">12.6%</p>
              </div>
            </div>
            
            <!-- Search -->
            <div class="mb-4">
              <input 
                type="text" 
                placeholder="Buscar por nome, email ou telefone..." 
                class="w-full max-w-md h-10 rounded-md border px-3 text-sm"
              />
            </div>
            
            <!-- Table -->
            <div class="bg-card rounded-lg border">
              <table class="w-full">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th class="text-left p-4 font-medium text-sm">Nome</th>
                    <th class="text-left p-4 font-medium text-sm">E-mail</th>
                    <th class="text-left p-4 font-medium text-sm">Telefone</th>
                    <th class="text-left p-4 font-medium text-sm">Origem</th>
                    <th class="text-left p-4 font-medium text-sm">Estágio</th>
                    <th class="text-left p-4 font-medium text-sm">Data</th>
                    <th class="text-right p-4 font-medium text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="i in 10" :key="i" class="hover:bg-muted/30">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                          {{ String.fromCharCode(65 + i) }}{{ String.fromCharCode(66 + i) }}
                        </div>
                        <span class="font-medium">Contato {{ i }}</span>
                      </div>
                    </td>
                    <td class="p-4 text-muted-foreground">contato{{ i }}@email.com</td>
                    <td class="p-4 text-muted-foreground">(11) 9{{ i }}234-5678</td>
                    <td class="p-4">
                      <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {{ ['Meta Ads', 'Google Ads', 'Orgânico', 'WhatsApp'][i % 4] }}
                      </span>
                    </td>
                    <td class="p-4">
                      <span class="px-2 py-1 rounded-full text-xs" 
                        :class="['bg-yellow-100 text-yellow-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700'][i % 4]">
                        {{ ['Lead', 'Qualificado', 'Negociação', 'Fechado'][i % 4] }}
                      </span>
                    </td>
                    <td class="p-4 text-muted-foreground text-sm">{{ i }} dias atrás</td>
                    <td class="p-4 text-right">
                      <button class="text-sm text-primary hover:underline">Editar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Pagination -->
              <div class="p-4 border-t flex items-center justify-between">
                <p class="text-sm text-muted-foreground">
                  Mostrando 1-10 de 1.234 contatos
                </p>
                <div class="flex items-center gap-1">
                  <button class="px-3 py-1 text-sm border rounded hover:bg-accent">Anterior</button>
                  <button class="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">1</button>
                  <button class="px-3 py-1 text-sm border rounded hover:bg-accent">2</button>
                  <button class="px-3 py-1 text-sm border rounded hover:bg-accent">3</button>
                  <button class="px-3 py-1 text-sm border rounded hover:bg-accent">Próximo</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

/**
 * Página de contatos em modo kanban
 */
export const KanbanView: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16 flex items-center px-6">
          <span class="font-semibold">AdsMagic</span>
        </header>
        
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)] p-4">
            <nav class="space-y-1">
              <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-accent">👥 Contatos</a>
            </nav>
          </aside>
          
          <main class="flex-1 p-6">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-bold">Contatos - Kanban</h1>
              <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 text-sm border rounded-md">📋 Lista</button>
                <button class="px-3 py-1.5 text-sm border rounded-md bg-accent">📊 Kanban</button>
              </div>
            </div>
            
            <!-- Kanban Board -->
            <div class="flex gap-4 overflow-x-auto pb-4">
              <!-- Lead Column -->
              <div class="flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span class="font-medium text-sm">Lead</span>
                    <span class="text-xs bg-muted px-1.5 py-0.5 rounded">45</span>
                  </div>
                  <button class="text-sm text-muted-foreground">+</button>
                </div>
                <div class="space-y-2">
                  <div v-for="i in 4" :key="i" class="bg-card p-3 rounded-lg border shadow-sm">
                    <p class="font-medium text-sm">Contato Lead {{ i }}</p>
                    <p class="text-xs text-muted-foreground">contato{{ i }}@email.com</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Meta Ads</span>
                      <span class="text-xs text-muted-foreground">2h atrás</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Qualificado Column -->
              <div class="flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="font-medium text-sm">Qualificado</span>
                    <span class="text-xs bg-muted px-1.5 py-0.5 rounded">28</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div v-for="i in 3" :key="i" class="bg-card p-3 rounded-lg border shadow-sm">
                    <p class="font-medium text-sm">Contato Qualif {{ i }}</p>
                    <p class="text-xs text-muted-foreground">qualif{{ i }}@email.com</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Google</span>
                      <span class="text-xs text-muted-foreground">1d atrás</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Negociação Column -->
              <div class="flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span class="font-medium text-sm">Negociação</span>
                    <span class="text-xs bg-muted px-1.5 py-0.5 rounded">12</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div v-for="i in 2" :key="i" class="bg-card p-3 rounded-lg border shadow-sm">
                    <p class="font-medium text-sm">Cliente VIP {{ i }}</p>
                    <p class="text-xs text-muted-foreground">vip{{ i }}@email.com</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">WhatsApp</span>
                      <span class="text-xs text-muted-foreground">3d atrás</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Fechado Column -->
              <div class="flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    <span class="font-medium text-sm">Fechado</span>
                    <span class="text-xs bg-muted px-1.5 py-0.5 rounded">89</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div v-for="i in 3" :key="i" class="bg-card p-3 rounded-lg border shadow-sm border-green-200">
                    <p class="font-medium text-sm">Cliente Fechado {{ i }}</p>
                    <p class="text-xs text-muted-foreground">fechado{{ i }}@email.com</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-xs font-medium text-green-600">R$ {{ (Math.random() * 1000 + 200).toFixed(0) }}</span>
                      <span class="text-xs text-muted-foreground">{{ i }}d atrás</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

/**
 * Página sem contatos
 */
export const Empty: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16"></header>
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)]"></aside>
          <main class="flex-1 p-6">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-bold">Contatos</h1>
              <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                + Novo Contato
              </button>
            </div>
            
            <div class="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <span class="text-4xl">👥</span>
              </div>
              <h2 class="text-xl font-semibold mb-2">Nenhum contato ainda</h2>
              <p class="text-muted-foreground mb-6 max-w-md">
                Adicione seu primeiro contato ou conecte uma integração para importar contatos automaticamente.
              </p>
              <div class="flex gap-2">
                <button class="px-4 py-2 border rounded-md text-sm">
                  Importar CSV
                </button>
                <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  + Novo Contato
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

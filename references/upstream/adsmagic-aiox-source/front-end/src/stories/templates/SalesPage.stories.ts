import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * SalesTemplate - Template da página de Vendas.
 * 
 * Página completa com lista de vendas, métricas e filtros.
 */
const meta: Meta = {
  title: 'Templates/SalesPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template completo da página de Vendas.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Página de vendas completa
 */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <!-- Header -->
        <header class="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
          <div class="flex items-center justify-between h-16 px-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary rounded-lg"></div>
              <span class="font-semibold">AdsMagic</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-muted"></div>
            </div>
          </div>
        </header>
        
        <div class="flex flex-col md:flex-row">
          <!-- Sidebar -->
          <aside class="w-full md:w-64 border-b md:border-r md:border-b-0 bg-card">
            <div class="p-4">
              <div class="mb-6">
                <span class="text-xs text-muted-foreground uppercase tracking-wide">Nome do projeto</span>
                <h2 class="font-semibold">E-commerce Fashion</h2>
              </div>
              
              <nav class="flex md:flex-col gap-1 md:space-y-1 overflow-x-auto md:overflow-x-visible">
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent whitespace-nowrap">
                  📊 Dashboard
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent whitespace-nowrap">
                  👥 Contatos
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-accent font-medium whitespace-nowrap">
                  💰 Vendas
                </a>
              </nav>
            </div>
          </aside>
          
          <!-- Main Content -->
          <main class="flex-1 p-4 md:p-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 class="text-xl sm:text-2xl font-bold">Vendas</h1>
                <p class="text-sm text-muted-foreground">89 vendas no período</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button class="px-3 py-1.5 text-sm border rounded-md whitespace-nowrap">
                  📅 Últimos 30 dias
                </button>
                <button class="px-3 py-1.5 text-sm border rounded-md whitespace-nowrap">
                  🔍 Filtros
                </button>
                <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md whitespace-nowrap">
                  + Nova Venda
                </button>
              </div>
            </div>
            
            <!-- Metrics -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Total de Vendas</p>
                <p class="text-2xl font-bold text-green-600">R$ 47.500</p>
                <p class="text-xs text-green-600">+12% vs anterior</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Quantidade</p>
                <p class="text-2xl font-bold">89</p>
                <p class="text-xs text-green-600">+8 vs anterior</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Ticket Médio</p>
                <p class="text-2xl font-bold">R$ 534</p>
                <p class="text-xs text-muted-foreground">+3% vs anterior</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p class="text-2xl font-bold">7.2%</p>
                <p class="text-xs text-green-600">+0.5pp vs anterior</p>
              </div>
            </div>
            
            <!-- Tabs -->
            <div class="mb-4">
              <div class="flex gap-1 border-b">
                <button class="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
                  Concluídas (89)
                </button>
                <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  Perdidas (12)
                </button>
              </div>
            </div>
            
            <!-- Funnel -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div class="lg:col-span-2">
                <div class="bg-card rounded-lg border p-4">
                  <h3 class="font-semibold mb-4">Funil de Vendas</h3>
                  <div class="space-y-3">
                    <div class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span>Leads</span>
                        <span class="font-medium">1.234 (100%)</span>
                      </div>
                      <div class="h-8 bg-muted rounded-lg overflow-hidden">
                        <div class="h-full bg-primary" style="width: 100%"></div>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span>Qualificados</span>
                        <span class="font-medium">456 (37%)</span>
                      </div>
                      <div class="h-8 bg-muted rounded-lg overflow-hidden">
                        <div class="h-full bg-primary/80" style="width: 37%"></div>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span>Negociação</span>
                        <span class="font-medium">178 (14%)</span>
                      </div>
                      <div class="h-8 bg-muted rounded-lg overflow-hidden">
                        <div class="h-full bg-primary/60" style="width: 14%"></div>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span>Fechados</span>
                        <span class="font-medium">89 (7.2%)</span>
                      </div>
                      <div class="h-8 bg-muted rounded-lg overflow-hidden">
                        <div class="h-full bg-green-500" style="width: 7.2%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-card rounded-lg border p-4">
                <h3 class="font-semibold mb-4">Previsão de Vendas</h3>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-muted-foreground">Pipeline</p>
                    <p class="text-xl font-bold">R$ 89.500</p>
                    <p class="text-xs text-muted-foreground">23 oportunidades</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Previsão (30 dias)</p>
                    <p class="text-xl font-bold text-green-600">R$ 52.000</p>
                    <p class="text-xs text-muted-foreground">Baseado em histórico</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Table -->
            <div class="bg-card rounded-lg border overflow-x-auto">
              <table class="w-full min-w-[600px]">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th class="text-left p-3 sm:p-4 font-medium text-sm">Cliente</th>
                    <th class="text-left p-3 sm:p-4 font-medium text-sm">Origem</th>
                    <th class="text-right p-3 sm:p-4 font-medium text-sm">Valor</th>
                    <th class="text-left p-3 sm:p-4 font-medium text-sm">Data</th>
                    <th class="text-right p-3 sm:p-4 font-medium text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="i in 8" :key="i" class="hover:bg-muted/30">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-700">
                          ✓
                        </div>
                        <div>
                          <p class="font-medium text-sm">Cliente {{ i }}</p>
                          <p class="text-xs text-muted-foreground">cliente{{ i }}@email.com</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {{ ['Meta Ads', 'Google Ads', 'Orgânico', 'WhatsApp'][i % 4] }}
                      </span>
                    </td>
                    <td class="p-4 text-right font-medium text-green-600">
                      R$ {{ (Math.random() * 1000 + 200).toFixed(2) }}
                    </td>
                    <td class="p-4 text-muted-foreground text-sm">{{ i }} dias atrás</td>
                    <td class="p-4 text-right">
                      <button class="text-sm text-primary hover:underline">Ver detalhes</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

/**
 * Página sem vendas
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
              <h1 class="text-2xl font-bold">Vendas</h1>
              <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                + Nova Venda
              </button>
            </div>
            
            <div class="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <span class="text-4xl">💰</span>
              </div>
              <h2 class="text-xl font-semibold mb-2">Nenhuma venda registrada</h2>
              <p class="text-muted-foreground mb-6 max-w-md">
                Registre sua primeira venda manualmente ou configure integrações para rastrear vendas automaticamente.
              </p>
              <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                + Registrar Venda
              </button>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

/**
 * Aba de vendas perdidas
 */
export const LostSales: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16"></header>
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)]"></aside>
          <main class="flex-1 p-6">
            <h1 class="text-2xl font-bold mb-6">Vendas</h1>
            
            <!-- Tabs -->
            <div class="mb-4">
              <div class="flex gap-1 border-b">
                <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  Concluídas (89)
                </button>
                <button class="px-4 py-2 text-sm font-medium border-b-2 border-red-500 text-red-500">
                  Perdidas (12)
                </button>
              </div>
            </div>
            
            <div class="bg-card rounded-lg border">
              <table class="w-full">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th class="text-left p-4 font-medium text-sm">Cliente</th>
                    <th class="text-left p-4 font-medium text-sm">Motivo</th>
                    <th class="text-right p-4 font-medium text-sm">Valor Estimado</th>
                    <th class="text-left p-4 font-medium text-sm">Data</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="i in 5" :key="i" class="hover:bg-muted/30">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs text-red-700">
                          ✕
                        </div>
                        <span class="font-medium text-sm">Cliente Perdido {{ i }}</span>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        {{ ['Preço alto', 'Concorrência', 'Sem resposta', 'Desistiu'][i % 4] }}
                      </span>
                    </td>
                    <td class="p-4 text-right text-muted-foreground">
                      R$ {{ (Math.random() * 1000 + 200).toFixed(2) }}
                    </td>
                    <td class="p-4 text-muted-foreground text-sm">{{ i + 3 }} dias atrás</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

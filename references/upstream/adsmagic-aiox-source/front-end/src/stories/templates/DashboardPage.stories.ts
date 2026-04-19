import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * DashboardTemplate - Template da página de Dashboard.
 * 
 * Página completa com métricas, gráficos e vendas recentes.
 */
const meta: Meta = {
  title: 'Templates/DashboardPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template completo da página de Dashboard V2.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Dashboard completo
 */
export const Default: Story = {
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
        
        <div class="flex flex-col md:flex-row">
          <!-- Sidebar -->
          <aside class="w-full md:w-64 border-b md:border-r md:border-b-0 bg-card">
            <div class="p-4">
              <div class="mb-6">
                <span class="text-xs text-muted-foreground uppercase tracking-wide">Nome do projeto</span>
                <h2 class="font-semibold">E-commerce Fashion</h2>
              </div>
              
              <nav class="flex md:flex-col gap-1 md:space-y-1 overflow-x-auto md:overflow-x-visible">
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-accent font-medium whitespace-nowrap">
                  📊 Dashboard
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent whitespace-nowrap">
                  👥 Contatos
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent whitespace-nowrap">
                  💰 Vendas
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent whitespace-nowrap">
                  🔗 Links
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent whitespace-nowrap">
                  ⚙️ Integrações
                </a>
              </nav>
            </div>
          </aside>
          
          <!-- Main Content -->
          <main class="flex-1 p-4 md:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 class="text-xl sm:text-2xl font-bold">Dashboard</h1>
                <p class="text-sm text-muted-foreground">Visão geral das suas métricas</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button class="px-3 py-1.5 text-sm border rounded-md bg-card whitespace-nowrap">
                  📅 Últimos 30 dias
                </button>
                <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md whitespace-nowrap">
                  Exportar
                </button>
              </div>
            </div>
            
            <!-- Metrics Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Investimento</p>
                <p class="text-xl font-bold">R$ 14.850</p>
                <p class="text-xs text-muted-foreground">Meta Ads</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Receita</p>
                <p class="text-xl font-bold text-green-600">R$ 47.500</p>
                <p class="text-xs text-green-600">+12% vs anterior</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Ticket Médio</p>
                <p class="text-xl font-bold">R$ 534</p>
                <p class="text-xs text-muted-foreground">89 vendas</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">ROAS</p>
                <p class="text-xl font-bold text-primary">3.2x</p>
                <p class="text-xs text-green-600">+0.4x vs anterior</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">CPA</p>
                <p class="text-xl font-bold">R$ 167</p>
                <p class="text-xs text-red-500">+5% vs anterior</p>
              </div>
            </div>
            
            <div class="grid grid-cols-5 gap-4 mb-6">
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Novos Contatos</p>
                <p class="text-xl font-bold">1.234</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Vendas</p>
                <p class="text-xl font-bold">89</p>
                <p class="text-xs text-green-600">+8 vs anterior</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Taxa de Conversão</p>
                <p class="text-xl font-bold">7.2%</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Impressões</p>
                <p class="text-xl font-bold">250K</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Cliques</p>
                <p class="text-xl font-bold">8.5K</p>
              </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-2 gap-6 mb-6">
              <div class="bg-card rounded-lg border p-4">
                <h3 class="font-semibold mb-4">Vendas por Origem</h3>
                <div class="h-[200px] flex items-center justify-center bg-muted/30 rounded">
                  <div class="text-center">
                    <div class="w-32 h-32 rounded-full border-8 border-primary mx-auto mb-2"></div>
                    <p class="text-sm text-muted-foreground">Gráfico de pizza</p>
                  </div>
                </div>
              </div>
              <div class="bg-card rounded-lg border p-4">
                <h3 class="font-semibold mb-4">Receita por Origem</h3>
                <div class="h-[200px] flex items-end gap-2 p-4 bg-muted/30 rounded">
                  <div class="flex-1 bg-primary rounded-t h-[60%]"></div>
                  <div class="flex-1 bg-primary/80 rounded-t h-[80%]"></div>
                  <div class="flex-1 bg-primary/60 rounded-t h-[45%]"></div>
                  <div class="flex-1 bg-primary/40 rounded-t h-[30%]"></div>
                </div>
              </div>
            </div>
            
            <!-- Timeline Chart -->
            <div class="bg-card rounded-lg border p-4 mb-6">
              <h3 class="font-semibold mb-4">Evolução de Contatos e Vendas</h3>
              <div class="h-[200px] flex items-end gap-1 p-4 bg-muted/30 rounded">
                <div v-for="i in 30" :key="i" class="flex-1 flex flex-col gap-1">
                  <div class="bg-blue-500/30 rounded-t" :style="{ height: Math.random() * 60 + 20 + 'px' }"></div>
                  <div class="bg-green-500/30 rounded-t" :style="{ height: Math.random() * 30 + 10 + 'px' }"></div>
                </div>
              </div>
            </div>
            
            <!-- Recent Sales -->
            <div class="bg-card rounded-lg border">
              <div class="p-4 border-b flex items-center justify-between">
                <h3 class="font-semibold">Últimas Vendas</h3>
                <button class="text-sm text-primary hover:underline">Ver todas →</button>
              </div>
              <div class="divide-y">
                <div v-for="i in 5" :key="i" class="flex items-center justify-between p-4 hover:bg-accent/50">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="text-sm">👤</span>
                    </div>
                    <div>
                      <p class="font-medium text-sm">Cliente {{ i }}</p>
                      <p class="text-xs text-muted-foreground">cliente{{ i }}@email.com</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-sm">R$ {{ (Math.random() * 1000 + 200).toFixed(2) }}</p>
                    <p class="text-xs text-muted-foreground">{{ i }} dias atrás</p>
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
 * Dashboard em loading
 */
export const Loading: Story = {
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
          </div>
        </header>
        
        <div class="flex">
          <!-- Sidebar -->
          <aside class="w-64 border-r bg-card min-h-[calc(100vh-4rem)] p-4">
            <div class="space-y-2">
              <div class="h-4 bg-muted rounded animate-pulse"></div>
              <div class="h-8 bg-muted rounded animate-pulse"></div>
              <div class="space-y-1 mt-6">
                <div class="h-10 bg-muted rounded animate-pulse"></div>
                <div class="h-10 bg-muted rounded animate-pulse"></div>
                <div class="h-10 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </aside>
          
          <!-- Main Content -->
          <main class="flex-1 p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="space-y-2">
                <div class="h-8 w-48 bg-muted rounded animate-pulse"></div>
                <div class="h-4 w-64 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            
            <div class="grid grid-cols-5 gap-4 mb-6">
              <div v-for="i in 5" :key="i" class="p-4 bg-card rounded-lg border">
                <div class="h-4 w-20 bg-muted rounded animate-pulse mb-2"></div>
                <div class="h-6 w-24 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-6">
              <div class="h-[250px] bg-card rounded-lg border animate-pulse"></div>
              <div class="h-[250px] bg-card rounded-lg border animate-pulse"></div>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

/**
 * Dashboard sem dados
 */
export const Empty: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16"></header>
        
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)]"></aside>
          
          <main class="flex-1 p-6">
            <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <span class="text-4xl">📊</span>
              </div>
              <h2 class="text-xl font-semibold mb-2">Nenhum dado disponível</h2>
              <p class="text-muted-foreground mb-6 max-w-md">
                Conecte suas integrações e comece a rastrear suas campanhas para ver métricas aqui.
              </p>
              <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Configurar Integrações
              </button>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

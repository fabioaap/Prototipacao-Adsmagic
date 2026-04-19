import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * AnalyticsTemplate - Template da página de Analytics.
 * 
 * Página completa com gráficos avançados e relatórios de performance.
 */
const meta: Meta = {
  title: 'Templates/AnalyticsPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template completo da página de Analytics.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Analytics completo
 */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <!-- Header -->
        <header class="border-b h-16 flex items-center px-6">
          <span class="font-semibold">AdsMagic</span>
        </header>
        
        <div class="flex">
          <!-- Sidebar -->
          <aside class="w-64 border-r bg-card min-h-[calc(100vh-4rem)]">
            <div class="p-4">
              <nav class="space-y-1">
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
                  📊 Dashboard
                </a>
                <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-accent font-medium">
                  📈 Analytics
                </a>
              </nav>
            </div>
          </aside>
          
          <!-- Main Content -->
          <main class="flex-1 p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h1 class="text-2xl font-bold">Analytics</h1>
                <p class="text-muted-foreground">Análise detalhada de performance</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 text-sm border rounded-md">
                  📅 Últimos 30 dias
                </button>
                <button class="px-3 py-1.5 text-sm border rounded-md">
                  Comparar período
                </button>
                <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
                  Exportar PDF
                </button>
              </div>
            </div>
            
            <!-- Summary Cards -->
            <div class="grid grid-cols-6 gap-4 mb-6">
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Investimento</p>
                <p class="text-lg font-bold">R$ 14.850</p>
                <p class="text-xs text-green-600">+8% vs anterior</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Receita</p>
                <p class="text-lg font-bold text-green-600">R$ 47.500</p>
                <p class="text-xs text-green-600">+12%</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">ROAS</p>
                <p class="text-lg font-bold text-primary">3.2x</p>
                <p class="text-xs text-green-600">+0.4x</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">CPA</p>
                <p class="text-lg font-bold">R$ 167</p>
                <p class="text-xs text-red-500">+5%</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Contatos</p>
                <p class="text-lg font-bold">1.234</p>
                <p class="text-xs text-green-600">+156</p>
              </div>
              <div class="p-4 bg-card rounded-lg border">
                <p class="text-xs text-muted-foreground mb-1">Vendas</p>
                <p class="text-lg font-bold">89</p>
                <p class="text-xs text-green-600">+8</p>
              </div>
            </div>
            
            <!-- Charts Row -->
            <div class="grid grid-cols-2 gap-6 mb-6">
              <div class="bg-card rounded-lg border p-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold">Evolução Temporal</h3>
                  <div class="flex gap-2">
                    <button class="px-2 py-1 text-xs border rounded bg-accent">Contatos</button>
                    <button class="px-2 py-1 text-xs border rounded">Vendas</button>
                    <button class="px-2 py-1 text-xs border rounded">Receita</button>
                  </div>
                </div>
                <div class="h-[200px] flex items-end gap-1 p-4 bg-muted/30 rounded">
                  <div v-for="i in 30" :key="i" class="flex-1 flex flex-col gap-1">
                    <div class="bg-primary/60 rounded-t" :style="{ height: Math.random() * 100 + 50 + 'px' }"></div>
                  </div>
                </div>
              </div>
              
              <div class="bg-card rounded-lg border p-4">
                <h3 class="font-semibold mb-4">Distribuição por Origem</h3>
                <div class="flex gap-6">
                  <div class="flex-1">
                    <div class="h-[200px] flex items-center justify-center">
                      <div class="relative w-40 h-40">
                        <div class="absolute inset-0 rounded-full border-[20px] border-blue-500"></div>
                        <div class="absolute inset-0 rounded-full border-[20px] border-transparent border-t-green-500 border-r-green-500 rotate-[120deg]"></div>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1 flex flex-col justify-center space-y-2">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded bg-blue-500"></div>
                      <span class="text-sm">Meta Ads: 55%</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded bg-green-500"></div>
                      <span class="text-sm">Google Ads: 30%</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded bg-purple-500"></div>
                      <span class="text-sm">Orgânico: 15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Performance Table -->
            <div class="bg-card rounded-lg border">
              <div class="p-4 border-b">
                <h3 class="font-semibold">Performance por Origem</h3>
              </div>
              <table class="w-full">
                <thead class="bg-muted/50 border-b">
                  <tr>
                    <th class="text-left p-4 text-sm font-medium">Origem</th>
                    <th class="text-right p-4 text-sm font-medium">Investimento</th>
                    <th class="text-right p-4 text-sm font-medium">Contatos</th>
                    <th class="text-right p-4 text-sm font-medium">CPL</th>
                    <th class="text-right p-4 text-sm font-medium">Vendas</th>
                    <th class="text-right p-4 text-sm font-medium">Receita</th>
                    <th class="text-right p-4 text-sm font-medium">ROAS</th>
                    <th class="text-right p-4 text-sm font-medium">Conv. %</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr class="hover:bg-muted/30">
                    <td class="p-4 flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span class="font-medium text-sm">Meta Ads</span>
                    </td>
                    <td class="p-4 text-right text-sm">R$ 8.500</td>
                    <td class="p-4 text-right text-sm">678</td>
                    <td class="p-4 text-right text-sm">R$ 12,54</td>
                    <td class="p-4 text-right text-sm">52</td>
                    <td class="p-4 text-right text-sm text-green-600">R$ 28.400</td>
                    <td class="p-4 text-right text-sm font-medium text-primary">3.34x</td>
                    <td class="p-4 text-right text-sm">7.7%</td>
                  </tr>
                  <tr class="hover:bg-muted/30">
                    <td class="p-4 flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-green-500"></div>
                      <span class="font-medium text-sm">Google Ads</span>
                    </td>
                    <td class="p-4 text-right text-sm">R$ 4.850</td>
                    <td class="p-4 text-right text-sm">345</td>
                    <td class="p-4 text-right text-sm">R$ 14,06</td>
                    <td class="p-4 text-right text-sm">28</td>
                    <td class="p-4 text-right text-sm text-green-600">R$ 14.200</td>
                    <td class="p-4 text-right text-sm font-medium text-primary">2.93x</td>
                    <td class="p-4 text-right text-sm">8.1%</td>
                  </tr>
                  <tr class="hover:bg-muted/30">
                    <td class="p-4 flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span class="font-medium text-sm">Orgânico</span>
                    </td>
                    <td class="p-4 text-right text-sm">R$ 0</td>
                    <td class="p-4 text-right text-sm">211</td>
                    <td class="p-4 text-right text-sm">-</td>
                    <td class="p-4 text-right text-sm">9</td>
                    <td class="p-4 text-right text-sm text-green-600">R$ 4.900</td>
                    <td class="p-4 text-right text-sm font-medium text-green-600">∞</td>
                    <td class="p-4 text-right text-sm">4.3%</td>
                  </tr>
                </tbody>
                <tfoot class="bg-muted/30 border-t">
                  <tr>
                    <td class="p-4 font-semibold text-sm">Total</td>
                    <td class="p-4 text-right font-semibold text-sm">R$ 13.350</td>
                    <td class="p-4 text-right font-semibold text-sm">1.234</td>
                    <td class="p-4 text-right font-semibold text-sm">R$ 10,82</td>
                    <td class="p-4 text-right font-semibold text-sm">89</td>
                    <td class="p-4 text-right font-semibold text-sm text-green-600">R$ 47.500</td>
                    <td class="p-4 text-right font-semibold text-sm text-primary">3.56x</td>
                    <td class="p-4 text-right font-semibold text-sm">7.2%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

/**
 * Analytics em loading
 */
export const Loading: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16"></header>
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)]"></aside>
          <main class="flex-1 p-6">
            <div class="h-8 w-48 bg-muted rounded animate-pulse mb-6"></div>
            
            <div class="grid grid-cols-6 gap-4 mb-6">
              <div v-for="i in 6" :key="i" class="p-4 bg-card rounded-lg border">
                <div class="h-4 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div class="h-6 w-24 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-6 mb-6">
              <div class="h-[280px] bg-card rounded-lg border animate-pulse"></div>
              <div class="h-[280px] bg-card rounded-lg border animate-pulse"></div>
            </div>
            
            <div class="h-[300px] bg-card rounded-lg border animate-pulse"></div>
          </main>
        </div>
      </div>
    `,
  }),
}

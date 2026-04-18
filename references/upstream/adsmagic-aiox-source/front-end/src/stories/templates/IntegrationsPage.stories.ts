import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * IntegrationsTemplate - Template da página de Integrações.
 * 
 * Página completa para configuração de integrações (Meta, Google, WhatsApp).
 */
const meta: Meta = {
  title: 'Templates/IntegrationsPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template completo da página de Integrações.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Página de integrações
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
                  ⚙️ Integrações
                </a>
              </nav>
            </div>
          </aside>
          
          <!-- Main Content -->
          <main class="flex-1 p-6">
            <div class="mb-6">
              <h1 class="text-2xl font-bold">Integrações</h1>
              <p class="text-muted-foreground">Conecte suas plataformas de anúncios e atendimento</p>
            </div>
            
            <!-- Ads Platforms -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold mb-4">Plataformas de Anúncios</h2>
              <div class="grid grid-cols-3 gap-4">
                <!-- Meta Ads - Connected -->
                <div class="bg-card rounded-lg border p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold">f</span>
                      </div>
                      <div>
                        <h3 class="font-semibold">Meta Ads</h3>
                        <p class="text-xs text-muted-foreground">Facebook & Instagram</p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                      Conectado
                    </span>
                  </div>
                  <p class="text-sm text-muted-foreground mb-4">
                    Rastreie conversões e importe dados de campanhas do Meta Ads.
                  </p>
                  <div class="flex items-center justify-between">
                    <div class="text-xs text-muted-foreground">
                      Última sincronização: 2h atrás
                    </div>
                    <button class="text-sm text-primary hover:underline">
                      Configurar
                    </button>
                  </div>
                </div>
                
                <!-- Google Ads - Pending -->
                <div class="bg-card rounded-lg border p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-[#4285F4] rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold">G</span>
                      </div>
                      <div>
                        <h3 class="font-semibold">Google Ads</h3>
                        <p class="text-xs text-muted-foreground">Search & Display</p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      Pendente
                    </span>
                  </div>
                  <p class="text-sm text-muted-foreground mb-4">
                    Importe dados de campanhas do Google Ads.
                  </p>
                  <button class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                    Conectar
                  </button>
                </div>
                
                <!-- TikTok Ads - Not Connected -->
                <div class="bg-card rounded-lg border p-4 opacity-60">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-xs">TT</span>
                      </div>
                      <div>
                        <h3 class="font-semibold">TikTok Ads</h3>
                        <p class="text-xs text-muted-foreground">Em breve</p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                      Em breve
                    </span>
                  </div>
                  <p class="text-sm text-muted-foreground mb-4">
                    Rastreie conversões de campanhas do TikTok Ads.
                  </p>
                  <button class="w-full px-4 py-2 border rounded-md text-sm text-muted-foreground" disabled>
                    Indisponível
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Communication -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold mb-4">Comunicação</h2>
              <div class="grid grid-cols-3 gap-4">
                <!-- WhatsApp - Connected -->
                <div class="bg-card rounded-lg border p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span class="text-white">📱</span>
                      </div>
                      <div>
                        <h3 class="font-semibold">WhatsApp Business</h3>
                        <p class="text-xs text-muted-foreground">Atendimento</p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                      Conectado
                    </span>
                  </div>
                  <p class="text-sm text-muted-foreground mb-4">
                    Importe contatos e rastreie conversas do WhatsApp.
                  </p>
                  <div class="flex items-center justify-between">
                    <div class="text-xs text-green-600">
                      ● Online
                    </div>
                    <button class="text-sm text-primary hover:underline">
                      Configurar
                    </button>
                  </div>
                </div>
                
                <!-- Zapier -->
                <div class="bg-card rounded-lg border p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold">Z</span>
                      </div>
                      <div>
                        <h3 class="font-semibold">Zapier</h3>
                        <p class="text-xs text-muted-foreground">Automação</p>
                      </div>
                    </div>
                  </div>
                  <p class="text-sm text-muted-foreground mb-4">
                    Conecte com mais de 5.000 aplicativos via Zapier.
                  </p>
                  <button class="w-full px-4 py-2 border rounded-md text-sm">
                    Conectar
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Webhooks -->
            <div>
              <h2 class="text-lg font-semibold mb-4">Webhooks & API</h2>
              <div class="bg-card rounded-lg border p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold">Webhook de Vendas</h3>
                    <p class="text-sm text-muted-foreground">
                      Receba notificações quando uma venda for registrada
                    </p>
                  </div>
                  <button class="px-4 py-2 border rounded-md text-sm">
                    Configurar
                  </button>
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
 * Nenhuma integração conectada
 */
export const NoIntegrations: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16"></header>
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)]"></aside>
          <main class="flex-1 p-6">
            <h1 class="text-2xl font-bold mb-6">Integrações</h1>
            
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div class="flex items-start gap-3">
                <span class="text-amber-500">⚠️</span>
                <div>
                  <h3 class="font-semibold text-amber-800">Nenhuma integração conectada</h3>
                  <p class="text-sm text-amber-700">
                    Conecte pelo menos uma plataforma de anúncios para começar a rastrear suas campanhas.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="bg-card rounded-lg border p-4">
                <div class="w-10 h-10 bg-muted rounded-lg mb-3"></div>
                <h3 class="font-semibold mb-2">Plataforma {{ i }}</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  Descrição da integração disponível.
                </p>
                <button class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  Conectar
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

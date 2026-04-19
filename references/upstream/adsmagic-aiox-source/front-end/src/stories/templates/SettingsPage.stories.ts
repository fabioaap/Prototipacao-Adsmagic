import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * SettingsTemplate - Template da página de Configurações.
 * 
 * Página completa com abas para diferentes configurações do projeto.
 */
const meta: Meta = {
  title: 'Templates/SettingsPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template completo da página de Configurações.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Configurações gerais
 */
export const General: Story = {
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
                  ⚙️ Configurações
                </a>
              </nav>
            </div>
          </aside>
          
          <!-- Main Content -->
          <main class="flex-1 p-6">
            <h1 class="text-2xl font-bold mb-6">Configurações</h1>
            
            <!-- Tabs -->
            <div class="mb-6">
              <div class="flex gap-1 border-b">
                <button class="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
                  Geral
                </button>
                <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  Funil de Vendas
                </button>
                <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  Origens
                </button>
                <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  Notificações
                </button>
                <button class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  Equipe
                </button>
              </div>
            </div>
            
            <!-- General Settings -->
            <div class="max-w-2xl space-y-6">
              <div class="bg-card rounded-lg border p-6">
                <h3 class="font-semibold mb-4">Informações do Projeto</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Nome do projeto</label>
                    <input 
                      type="text" 
                      value="E-commerce Fashion"
                      class="w-full h-10 rounded-md border px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Descrição</label>
                    <textarea 
                      class="w-full h-20 rounded-md border px-3 py-2 text-sm resize-none"
                    >Projeto de rastreamento de campanhas para loja de roupas.</textarea>
                  </div>
                </div>
              </div>
              
              <div class="bg-card rounded-lg border p-6">
                <h3 class="font-semibold mb-4">Moeda e Região</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Moeda</label>
                    <select class="w-full h-10 rounded-md border px-3 text-sm">
                      <option selected>BRL - Real Brasileiro (R$)</option>
                      <option>USD - Dólar Americano ($)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Fuso horário</label>
                    <select class="w-full h-10 rounded-md border px-3 text-sm">
                      <option selected>America/Sao_Paulo (GMT-3)</option>
                      <option>America/New_York (GMT-5)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="bg-card rounded-lg border p-6 border-red-200">
                <h3 class="font-semibold mb-2 text-red-600">Zona de Perigo</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  Ações irreversíveis. Tenha cuidado ao usar estas opções.
                </p>
                <div class="flex gap-3">
                  <button class="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50">
                    Arquivar Projeto
                  </button>
                  <button class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                    Excluir Projeto
                  </button>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button class="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

/**
 * Configurações de funil de vendas
 */
export const SalesFunnel: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16"></header>
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)]"></aside>
          <main class="flex-1 p-6">
            <h1 class="text-2xl font-bold mb-6">Configurações</h1>
            
            <!-- Tabs -->
            <div class="mb-6">
              <div class="flex gap-1 border-b">
                <button class="px-4 py-2 text-sm text-muted-foreground">Geral</button>
                <button class="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
                  Funil de Vendas
                </button>
                <button class="px-4 py-2 text-sm text-muted-foreground">Origens</button>
              </div>
            </div>
            
            <div class="max-w-2xl">
              <div class="bg-card rounded-lg border p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold">Estágios do Funil</h3>
                  <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
                    + Adicionar Estágio
                  </button>
                </div>
                
                <div class="space-y-2">
                  <div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <span class="cursor-move text-muted-foreground">⋮⋮</span>
                    <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <input type="text" value="Lead" class="flex-1 bg-transparent border-0 text-sm font-medium focus:outline-none" />
                    <button class="text-muted-foreground hover:text-foreground">✏️</button>
                    <button class="text-muted-foreground hover:text-red-500">🗑️</button>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <span class="cursor-move text-muted-foreground">⋮⋮</span>
                    <div class="w-4 h-4 rounded-full bg-blue-500"></div>
                    <input type="text" value="Qualificado" class="flex-1 bg-transparent border-0 text-sm font-medium focus:outline-none" />
                    <button class="text-muted-foreground hover:text-foreground">✏️</button>
                    <button class="text-muted-foreground hover:text-red-500">🗑️</button>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <span class="cursor-move text-muted-foreground">⋮⋮</span>
                    <div class="w-4 h-4 rounded-full bg-purple-500"></div>
                    <input type="text" value="Negociação" class="flex-1 bg-transparent border-0 text-sm font-medium focus:outline-none" />
                    <button class="text-muted-foreground hover:text-foreground">✏️</button>
                    <button class="text-muted-foreground hover:text-red-500">🗑️</button>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border-2 border-green-500">
                    <span class="cursor-move text-muted-foreground">⋮⋮</span>
                    <div class="w-4 h-4 rounded-full bg-green-500"></div>
                    <input type="text" value="Fechado" class="flex-1 bg-transparent border-0 text-sm font-medium focus:outline-none" />
                    <span class="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Conversão</span>
                  </div>
                </div>
                
                <p class="text-xs text-muted-foreground mt-4">
                  💡 Arraste para reordenar. O último estágio é sempre o de conversão.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    `,
  }),
}

/**
 * Configurações de origens
 */
export const Origins: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16"></header>
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)]"></aside>
          <main class="flex-1 p-6">
            <h1 class="text-2xl font-bold mb-6">Configurações</h1>
            
            <!-- Tabs -->
            <div class="mb-6">
              <div class="flex gap-1 border-b">
                <button class="px-4 py-2 text-sm text-muted-foreground">Geral</button>
                <button class="px-4 py-2 text-sm text-muted-foreground">Funil de Vendas</button>
                <button class="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
                  Origens
                </button>
              </div>
            </div>
            
            <div class="max-w-3xl">
              <div class="bg-card rounded-lg border p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="font-semibold">Origens de Contatos</h3>
                    <p class="text-sm text-muted-foreground">Configure as origens de aquisição de contatos</p>
                  </div>
                  <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
                    + Nova Origem
                  </button>
                </div>
                
                <div class="border rounded-lg overflow-hidden">
                  <table class="w-full">
                    <thead class="bg-muted/50 border-b">
                      <tr>
                        <th class="text-left p-3 text-sm font-medium">Nome</th>
                        <th class="text-left p-3 text-sm font-medium">Tipo</th>
                        <th class="text-left p-3 text-sm font-medium">UTM Source</th>
                        <th class="text-center p-3 text-sm font-medium">Contatos</th>
                        <th class="text-right p-3 text-sm font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y">
                      <tr class="hover:bg-muted/30">
                        <td class="p-3 flex items-center gap-2">
                          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span class="font-medium text-sm">Meta Ads</span>
                        </td>
                        <td class="p-3 text-sm text-muted-foreground">Pago</td>
                        <td class="p-3"><code class="text-xs bg-muted px-1.5 py-0.5 rounded">facebook</code></td>
                        <td class="p-3 text-center text-sm">1,234</td>
                        <td class="p-3 text-right">
                          <button class="text-sm text-primary">Editar</button>
                        </td>
                      </tr>
                      <tr class="hover:bg-muted/30">
                        <td class="p-3 flex items-center gap-2">
                          <div class="w-3 h-3 rounded-full bg-green-500"></div>
                          <span class="font-medium text-sm">Google Ads</span>
                        </td>
                        <td class="p-3 text-sm text-muted-foreground">Pago</td>
                        <td class="p-3"><code class="text-xs bg-muted px-1.5 py-0.5 rounded">google</code></td>
                        <td class="p-3 text-center text-sm">567</td>
                        <td class="p-3 text-right">
                          <button class="text-sm text-primary">Editar</button>
                        </td>
                      </tr>
                      <tr class="hover:bg-muted/30">
                        <td class="p-3 flex items-center gap-2">
                          <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span class="font-medium text-sm">Orgânico</span>
                        </td>
                        <td class="p-3 text-sm text-muted-foreground">Orgânico</td>
                        <td class="p-3"><code class="text-xs bg-muted px-1.5 py-0.5 rounded">organic</code></td>
                        <td class="p-3 text-center text-sm">234</td>
                        <td class="p-3 text-right">
                          <button class="text-sm text-primary">Editar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
 * Configurações de equipe
 */
export const Team: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-background">
        <header class="border-b h-16"></header>
        <div class="flex">
          <aside class="w-64 border-r min-h-[calc(100vh-4rem)]"></aside>
          <main class="flex-1 p-6">
            <h1 class="text-2xl font-bold mb-6">Configurações</h1>
            
            <!-- Tabs -->
            <div class="mb-6">
              <div class="flex gap-1 border-b">
                <button class="px-4 py-2 text-sm text-muted-foreground">Geral</button>
                <button class="px-4 py-2 text-sm text-muted-foreground">Funil de Vendas</button>
                <button class="px-4 py-2 text-sm text-muted-foreground">Origens</button>
                <button class="px-4 py-2 text-sm text-muted-foreground">Notificações</button>
                <button class="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
                  Equipe
                </button>
              </div>
            </div>
            
            <div class="max-w-3xl">
              <div class="bg-card rounded-lg border p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="font-semibold">Membros da Equipe</h3>
                    <p class="text-sm text-muted-foreground">Gerencie quem tem acesso ao projeto</p>
                  </div>
                  <button class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
                    + Convidar Membro
                  </button>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        JS
                      </div>
                      <div>
                        <p class="font-medium text-sm">João Silva</p>
                        <p class="text-xs text-muted-foreground">joao@empresa.com</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        Admin
                      </span>
                      <span class="text-xs text-muted-foreground">Você</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                        MC
                      </div>
                      <div>
                        <p class="font-medium text-sm">Maria Costa</p>
                        <p class="text-xs text-muted-foreground">maria@empresa.com</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <select class="text-xs border rounded px-2 py-1">
                        <option>Editor</option>
                        <option>Viewer</option>
                        <option>Admin</option>
                      </select>
                      <button class="text-xs text-red-500 hover:underline">Remover</button>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-muted/30 rounded-lg opacity-60">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                        ?
                      </div>
                      <div>
                        <p class="font-medium text-sm">pedro@empresa.com</p>
                        <p class="text-xs text-yellow-600">Convite pendente</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <button class="text-xs text-primary hover:underline">Reenviar</button>
                      <button class="text-xs text-red-500 hover:underline">Cancelar</button>
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

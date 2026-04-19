import type { Meta, StoryObj } from '@storybook/vue3'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'

const meta: Meta<typeof InfoTooltip> = {
    title: 'Atoms/InfoTooltip',
    component: InfoTooltip,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Ícone de informação com tooltip que exibe uma mensagem explicativa ao passar o mouse.'
            }
        }
    },
    argTypes: {
        message: {
            control: 'text',
            description: 'Mensagem exibida no tooltip'
        },
        side: {
            control: 'select',
            options: ['top', 'bottom', 'left', 'right'],
            description: 'Posição do tooltip'
        },
        iconSize: {
            control: { type: 'number', min: 10, max: 24 },
            description: 'Tamanho do ícone em pixels'
        }
    }
}

export default meta
type Story = StoryObj<typeof InfoTooltip>

// Default
export const Default: Story = {
    args: {
        message: 'Esta é uma informação adicional sobre este campo.'
    }
}

// Lado direito de um label
export const WithLabel: Story = {
    render: () => ({
        components: { InfoTooltip },
        template: `
      <div class="flex items-center gap-1">
        <label class="text-sm font-medium">Taxa de conversão</label>
        <InfoTooltip message="Porcentagem de visitantes que realizaram uma conversão (compra, cadastro, etc.)." />
      </div>
    `
    })
}

// Em formulário
export const InForm: Story = {
    render: () => ({
        components: { InfoTooltip },
        template: `
      <div class="w-[400px] space-y-4">
        <div>
          <div class="flex items-center gap-1 mb-2">
            <label class="text-sm font-medium">Nome do projeto</label>
            <InfoTooltip message="O nome será usado para identificar este projeto em relatórios e integrações." />
          </div>
          <input 
            type="text" 
            class="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Ex: Loja Virtual Fashion"
          />
        </div>
        
        <div>
          <div class="flex items-center gap-1 mb-2">
            <label class="text-sm font-medium">Webhook URL</label>
            <InfoTooltip message="URL que receberá notificações de eventos. Deve ser HTTPS e retornar status 200." />
          </div>
          <input 
            type="url" 
            class="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="https://seu-site.com/webhook"
          />
        </div>
        
        <div>
          <div class="flex items-center gap-1 mb-2">
            <label class="text-sm font-medium">Pixel ID</label>
            <InfoTooltip message="ID do pixel de conversão do Meta Ads. Encontre em Gerenciador de Eventos > Origens de Dados." />
          </div>
          <input 
            type="text" 
            class="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="123456789012345"
          />
        </div>
      </div>
    `
    })
}

// Posições diferentes
export const Positions: Story = {
    render: () => ({
        components: { InfoTooltip },
        template: `
      <div class="flex gap-12 p-8 justify-center">
        <div class="flex flex-col items-center gap-2">
          <InfoTooltip message="Tooltip no topo" side="top" />
          <span class="text-xs text-muted-foreground">Top</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <InfoTooltip message="Tooltip à direita" side="right" />
          <span class="text-xs text-muted-foreground">Right</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <InfoTooltip message="Tooltip embaixo" side="bottom" />
          <span class="text-xs text-muted-foreground">Bottom</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <InfoTooltip message="Tooltip à esquerda" side="left" />
          <span class="text-xs text-muted-foreground">Left</span>
        </div>
      </div>
    `
    })
}

// Em métricas do dashboard
export const InMetrics: Story = {
    render: () => ({
        components: { InfoTooltip },
        template: `
      <div class="grid grid-cols-2 gap-4 w-[500px]">
        <div class="p-4 border rounded-lg">
          <div class="flex items-center gap-1 mb-2">
            <span class="text-sm text-muted-foreground">CPA</span>
            <InfoTooltip message="Custo por Aquisição: valor médio gasto para adquirir um novo cliente." />
          </div>
          <p class="text-2xl font-bold">R$ 45,00</p>
        </div>
        
        <div class="p-4 border rounded-lg">
          <div class="flex items-center gap-1 mb-2">
            <span class="text-sm text-muted-foreground">ROAS</span>
            <InfoTooltip message="Return on Ad Spend: retorno sobre o investimento em anúncios (receita/custo)." />
          </div>
          <p class="text-2xl font-bold">4.5x</p>
        </div>
        
        <div class="p-4 border rounded-lg">
          <div class="flex items-center gap-1 mb-2">
            <span class="text-sm text-muted-foreground">CTR</span>
            <InfoTooltip message="Click-Through Rate: porcentagem de pessoas que clicaram no anúncio após vê-lo." />
          </div>
          <p class="text-2xl font-bold">3.2%</p>
        </div>
        
        <div class="p-4 border rounded-lg">
          <div class="flex items-center gap-1 mb-2">
            <span class="text-sm text-muted-foreground">CPM</span>
            <InfoTooltip message="Custo por Mil impressões: valor pago a cada 1.000 vezes que o anúncio é exibido." />
          </div>
          <p class="text-2xl font-bold">R$ 28,50</p>
        </div>
      </div>
    `
    })
}

// Tamanhos de ícone
export const IconSizes: Story = {
    render: () => ({
        components: { InfoTooltip },
        template: `
      <div class="flex gap-8 items-center">
        <div class="flex flex-col items-center gap-2">
          <InfoTooltip message="Ícone pequeno" :icon-size="12" />
          <span class="text-xs text-muted-foreground">12px</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <InfoTooltip message="Ícone padrão" :icon-size="14" />
          <span class="text-xs text-muted-foreground">14px</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <InfoTooltip message="Ícone médio" :icon-size="16" />
          <span class="text-xs text-muted-foreground">16px</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <InfoTooltip message="Ícone grande" :icon-size="18" />
          <span class="text-xs text-muted-foreground">18px</span>
        </div>
      </div>
    `
    })
}

// Em tabela
export const InTable: Story = {
    render: () => ({
        components: { InfoTooltip },
        template: `
      <div class="w-[600px] border rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-muted">
            <tr>
              <th class="px-4 py-3 text-left">
                <div class="flex items-center gap-1">
                  <span class="text-sm font-medium">Origem</span>
                  <InfoTooltip message="Canal de marketing de onde o contato veio." />
                </div>
              </th>
              <th class="px-4 py-3 text-left">
                <div class="flex items-center gap-1">
                  <span class="text-sm font-medium">Contatos</span>
                </div>
              </th>
              <th class="px-4 py-3 text-left">
                <div class="flex items-center gap-1">
                  <span class="text-sm font-medium">Atribuição</span>
                  <InfoTooltip message="Método usado para atribuir conversões a este canal." />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="px-4 py-3 text-sm">Meta Ads</td>
              <td class="px-4 py-3 text-sm">1.234</td>
              <td class="px-4 py-3 text-sm">Último clique</td>
            </tr>
            <tr class="border-t">
              <td class="px-4 py-3 text-sm">Google Ads</td>
              <td class="px-4 py-3 text-sm">856</td>
              <td class="px-4 py-3 text-sm">Último clique</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
    })
}

// Em configurações
export const InSettings: Story = {
    render: () => ({
        components: { InfoTooltip },
        template: `
      <div class="w-[400px] space-y-4">
        <h3 class="font-semibold">Configurações de integração</h3>
        
        <div class="p-4 border rounded-lg space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <span class="text-sm font-medium">Sincronização automática</span>
              <InfoTooltip message="Quando ativado, os dados serão sincronizados automaticamente a cada 15 minutos." />
            </div>
            <button class="w-10 h-5 bg-primary rounded-full relative">
              <span class="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <span class="text-sm font-medium">Deduplicação</span>
              <InfoTooltip message="Remove contatos duplicados baseado em e-mail ou telefone." />
            </div>
            <button class="w-10 h-5 bg-gray-200 rounded-full relative">
              <span class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <span class="text-sm font-medium">Modo debug</span>
              <InfoTooltip message="Ativa logs detalhados para ajudar na identificação de problemas." />
            </div>
            <button class="w-10 h-5 bg-gray-200 rounded-full relative">
              <span class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>
        </div>
      </div>
    `
    })
}

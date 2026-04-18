import type { Meta, StoryObj } from '@storybook/vue3'
import Tooltip from '@/components/ui/tooltip/Tooltip.vue'
import TooltipTrigger from '@/components/ui/tooltip/TooltipTrigger.vue'
import TooltipContent from '@/components/ui/tooltip/TooltipContent.vue'
import TooltipProvider from '@/components/ui/tooltip/TooltipProvider.vue'
import Button from '@/components/ui/Button.vue'

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Tooltip para exibir informações adicionais ao passar o mouse sobre um elemento.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof Tooltip>

// Default
export const Default: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Button },
    template: `
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline">Passe o mouse</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Esta é uma dica útil!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    `
  })
}

// Posições
export const Positions: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Button },
    template: `
      <TooltipProvider>
        <div class="flex flex-wrap gap-4 p-12">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline">Top</Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Tooltip no topo</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Tooltip embaixo</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline">Left</Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Tooltip à esquerda</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline">Right</Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Tooltip à direita</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    `
  })
}

// Em ícones
export const OnIcons: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider },
    template: `
      <TooltipProvider>
        <div class="flex gap-4">
          <Tooltip>
            <TooltipTrigger as-child>
              <button class="p-2 rounded hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <button class="p-2 rounded hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <button class="p-2 rounded hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compartilhar</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <button class="p-2 rounded hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    `
  })
}

// Atalhos de teclado
export const KeyboardShortcuts: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Button },
    template: `
      <TooltipProvider>
        <div class="flex gap-4">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Salvar <kbd class="ml-1 px-1 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd></p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copiar <kbd class="ml-1 px-1 py-0.5 bg-muted rounded text-xs">Ctrl+C</kbd></p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buscar <kbd class="ml-1 px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd></p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    `
  })
}

// Conteúdo rico
export const RichContent: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Button },
    template: `
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline">Detalhes do usuário</Button>
          </TooltipTrigger>
          <TooltipContent class="w-64">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium">JS</div>
                <div>
                  <p class="font-medium">João Silva</p>
                  <p class="text-xs text-muted-foreground">Administrador</p>
                </div>
              </div>
              <p class="text-xs">Último acesso: Hoje às 14:32</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    `
  })
}

// Status
export const StatusTooltips: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider },
    template: `
      <TooltipProvider>
        <div class="flex gap-6">
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="flex items-center gap-2 cursor-help">
                <span class="w-3 h-3 rounded-full bg-green-500" />
                <span>Online</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sistema operando normalmente</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="flex items-center gap-2 cursor-help">
                <span class="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Degradado</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Performance reduzida em alguns serviços</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="flex items-center gap-2 cursor-help">
                <span class="w-3 h-3 rounded-full bg-red-500" />
                <span>Offline</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sistema indisponível</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    `
  })
}

// Informações de ajuda
export const HelpTooltips: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider },
    template: `
      <TooltipProvider>
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Taxa de conversão</label>
            <Tooltip>
              <TooltipTrigger as-child>
                <button class="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                </button>
              </TooltipTrigger>
              <TooltipContent class="max-w-xs">
                <p>Percentual de contatos que realizaram uma compra em relação ao total de contatos do período.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">CAC</label>
            <Tooltip>
              <TooltipTrigger as-child>
                <button class="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                </button>
              </TooltipTrigger>
              <TooltipContent class="max-w-xs">
                <p>Custo de Aquisição de Cliente: quanto você gasta em média para conquistar um novo cliente.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">ROAS</label>
            <Tooltip>
              <TooltipTrigger as-child>
                <button class="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                </button>
              </TooltipTrigger>
              <TooltipContent class="max-w-xs">
                <p>Return on Ad Spend: retorno sobre investimento em publicidade. Ex: ROAS de 3 significa que cada R$1 gasto retorna R$3 em vendas.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    `
  })
}

// Delay customizado
export const CustomDelay: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Button },
    template: `
      <TooltipProvider :delay-duration="0">
        <div class="flex gap-4">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline">Sem delay</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Aparece instantaneamente!</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    `
  })
}

// Em texto
export const InlineText: Story = {
  render: () => ({
    components: { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider },
    template: `
      <TooltipProvider>
        <p class="text-sm max-w-md">
          A plataforma AdsMagic utiliza 
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="underline decoration-dotted cursor-help">pixels de rastreamento</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pequenos códigos JavaScript que registram ações dos visitantes no seu site.</p>
            </TooltipContent>
          </Tooltip>
          para monitorar conversões e atribuir vendas às 
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="underline decoration-dotted cursor-help">origens de tráfego</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>De onde vieram seus visitantes: anúncios, redes sociais, busca orgânica, etc.</p>
            </TooltipContent>
          </Tooltip>
          corretas.
        </p>
      </TooltipProvider>
    `
  })
}

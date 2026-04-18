import type { Meta, StoryObj } from '@storybook/vue3'
import NotificationCenter from '@/components/ui/NotificationCenter.vue'

const meta: Meta<typeof NotificationCenter> = {
    title: 'Molecules/NotificationCenter',
    component: NotificationCenter,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Centro de notificações com dropdown mostrando alertas, avisos e mensagens do sistema.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof NotificationCenter>

// Default
export const Default: Story = {
    render: () => ({
        components: { NotificationCenter },
        template: `
      <div class="flex justify-end p-4">
        <NotificationCenter />
      </div>
    `
    })
}

// Em header
export const InHeader: Story = {
    render: () => ({
        components: { NotificationCenter },
        template: `
      <div class="flex items-center justify-between p-4 bg-background border-b w-full">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">A</div>
          <span class="font-semibold">AdsMagic</span>
        </div>
        <div class="flex items-center gap-4">
          <NotificationCenter />
          <div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-medium text-sm">JS</div>
        </div>
      </div>
    `
    })
}

// Tipos de notificações (demonstração)
export const NotificationTypes: Story = {
    render: () => ({
        template: `
      <div class="w-[400px] p-4 border rounded-lg space-y-3">
        <h3 class="font-medium text-sm mb-4">Tipos de notificação:</h3>
        
        <!-- Success -->
        <div class="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <div>
            <p class="font-medium text-sm text-green-800">Nova venda registrada</p>
            <p class="text-xs text-green-600">Contato João Silva realizou uma compra de R$ 1.250,00</p>
            <p class="text-xs text-green-500 mt-1">15min atrás</p>
          </div>
        </div>
        
        <!-- Info -->
        <div class="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div>
            <p class="font-medium text-sm text-blue-800">Meta atualizada</p>
            <p class="text-xs text-blue-600">A meta de vendas do mês foi alterada para R$ 50.000,00</p>
            <p class="text-xs text-blue-500 mt-1">2h atrás</p>
          </div>
        </div>
        
        <!-- Warning -->
        <div class="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <p class="font-medium text-sm text-yellow-800">Atenção necessária</p>
            <p class="text-xs text-yellow-600">Sua campanha está próxima do limite de orçamento</p>
            <p class="text-xs text-yellow-500 mt-1">3h atrás</p>
          </div>
        </div>
        
        <!-- Error -->
        <div class="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div>
            <p class="font-medium text-sm text-red-800">Erro na sincronização</p>
            <p class="text-xs text-red-600">Não foi possível sincronizar dados com Meta Ads</p>
            <p class="text-xs text-red-500 mt-1">30min atrás</p>
          </div>
        </div>
      </div>
    `
    })
}

// Badge de contagem
export const CountBadge: Story = {
    render: () => ({
        template: `
      <div class="flex gap-8 items-center p-8">
        <!-- Com notificações -->
        <div class="relative inline-flex">
          <button class="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <span class="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            5
          </span>
        </div>
        
        <!-- Muitas notificações -->
        <div class="relative inline-flex">
          <button class="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <span class="absolute -top-1 -right-1 px-1.5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center min-w-[20px]">
            99+
          </span>
        </div>
        
        <!-- Sem notificações -->
        <div class="relative inline-flex">
          <button class="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
        </div>
      </div>
    `
    })
}

// Lista de notificações vazia
export const EmptyState: Story = {
    render: () => ({
        template: `
      <div class="w-[350px] p-6 border rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">Notificações</h3>
          <button class="text-xs text-muted-foreground hover:text-foreground">Marcar todas como lidas</button>
        </div>
        
        <div class="py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground mx-auto mb-4"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <p class="text-sm text-muted-foreground">Nenhuma notificação</p>
          <p class="text-xs text-muted-foreground mt-1">Você está em dia!</p>
        </div>
      </div>
    `
    })
}

// Lista completa de notificações
export const FullNotificationList: Story = {
    render: () => ({
        template: `
      <div class="w-[400px] border rounded-lg overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="font-semibold">Notificações</h3>
          <button class="text-xs text-primary hover:underline">Marcar todas como lidas</button>
        </div>
        
        <div class="max-h-[400px] overflow-y-auto">
          <!-- Não lida -->
          <div class="flex items-start gap-3 p-4 bg-blue-50/50 border-l-2 border-blue-500 hover:bg-accent transition-colors cursor-pointer">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm">Nova venda registrada</p>
              <p class="text-xs text-muted-foreground truncate">Contato João Silva realizou uma compra de R$ 1.250,00</p>
              <p class="text-xs text-muted-foreground mt-1">15min atrás</p>
            </div>
          </div>
          
          <!-- Não lida -->
          <div class="flex items-start gap-3 p-4 bg-blue-50/50 border-l-2 border-blue-500 hover:bg-accent transition-colors cursor-pointer">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm">Erro na sincronização</p>
              <p class="text-xs text-muted-foreground truncate">Não foi possível sincronizar dados com Meta Ads</p>
              <p class="text-xs text-muted-foreground mt-1">30min atrás</p>
            </div>
          </div>
          
          <!-- Lida -->
          <div class="flex items-start gap-3 p-4 hover:bg-accent transition-colors cursor-pointer">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm">Meta atualizada</p>
              <p class="text-xs text-muted-foreground truncate">A meta de vendas do mês foi alterada</p>
              <p class="text-xs text-muted-foreground mt-1">2h atrás</p>
            </div>
          </div>
          
          <!-- Lida -->
          <div class="flex items-start gap-3 p-4 hover:bg-accent transition-colors cursor-pointer">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm">Integração conectada</p>
              <p class="text-xs text-muted-foreground truncate">Sua conta Meta Ads foi conectada com sucesso</p>
              <p class="text-xs text-muted-foreground mt-1">1d atrás</p>
            </div>
          </div>
        </div>
        
        <div class="p-3 border-t text-center">
          <button class="text-sm text-primary hover:underline">Ver todas as notificações</button>
        </div>
      </div>
    `
    })
}

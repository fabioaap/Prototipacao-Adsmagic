import type { Meta, StoryObj } from '@storybook/vue3'
import UserMenu from '@/components/ui/UserMenu.vue'

const meta: Meta<typeof UserMenu> = {
    title: 'Molecules/UserMenu',
    component: UserMenu,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Menu de usuário com avatar, dropdown de opções incluindo configurações, ajuda, upgrade e logout.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof UserMenu>

// Default
export const Default: Story = {
    render: () => ({
        components: { UserMenu },
        template: `
      <div class="flex justify-end p-4">
        <UserMenu />
      </div>
    `
    })
}

// Em header
export const InHeader: Story = {
    render: () => ({
        components: { UserMenu },
        template: `
      <div class="flex items-center justify-between p-4 bg-background border-b w-full">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">A</div>
          <span class="font-semibold">AdsMagic</span>
        </div>
        <div class="flex items-center gap-4">
          <!-- Notification bell -->
          <button class="p-2 hover:bg-muted rounded-lg transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <UserMenu />
        </div>
      </div>
    `
    })
}

// Menu expandido (demonstração estática)
export const ExpandedDemo: Story = {
    render: () => ({
        template: `
      <div class="flex justify-center p-8">
        <div class="relative">
          <!-- Trigger -->
          <div class="flex items-center gap-2 cursor-pointer">
            <div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-medium text-sm">JS</div>
            <span class="text-sm font-medium">João Silva</span>
          </div>
          
          <!-- Dropdown aberto -->
          <div class="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg py-1 z-50">
            <div class="px-3 py-2 border-b">
              <p class="text-sm font-medium">João Silva</p>
              <p class="text-xs text-muted-foreground">joao@empresa.com</p>
            </div>
            
            <button class="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Configurações do perfil</span>
            </button>
            
            <button class="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Help Center</span>
            </button>
            
            <button class="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5.635 17 4 22h16l-1.635-5"/></svg>
              <span>Upgrade</span>
            </button>
            
            <div class="my-1 h-px bg-border"></div>
            
            <div class="flex items-center justify-between px-3 py-2 text-sm">
              <span>Modo escuro</span>
              <button class="w-8 h-4 bg-gray-200 rounded-full relative">
                <span class="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow" />
              </button>
            </div>
            
            <div class="my-1 h-px bg-border"></div>
            
            <button class="flex w-full items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    `
    })
}

// Diferentes estados de usuário
export const UserStates: Story = {
    render: () => ({
        template: `
      <div class="space-y-6 p-4">
        <h3 class="font-medium text-sm">Estados de usuário:</h3>
        
        <!-- Usuário com avatar -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 p-2 border rounded-lg">
            <img src="https://i.pravatar.cc/32" alt="Avatar" class="w-8 h-8 rounded-full" />
            <span class="text-sm font-medium">Maria Santos</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <span class="text-xs text-muted-foreground">Com avatar de imagem</span>
        </div>
        
        <!-- Usuário com iniciais -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 p-2 border rounded-lg">
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-medium text-sm">JS</div>
            <span class="text-sm font-medium">João Silva</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <span class="text-xs text-muted-foreground">Com iniciais</span>
        </div>
        
        <!-- Usuário Pro -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 p-2 border rounded-lg">
            <div class="relative">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-medium text-sm text-white">AP</div>
              <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" class="text-white"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/></svg>
              </span>
            </div>
            <span class="text-sm font-medium">Ana Pro</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <span class="text-xs text-muted-foreground">Usuário Pro com badge</span>
        </div>
        
        <!-- Mobile (apenas avatar) -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 p-2 border rounded-lg">
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-medium text-sm">CP</div>
          </div>
          <span class="text-xs text-muted-foreground">Mobile (sem nome)</span>
        </div>
      </div>
    `
    })
}

// Com informações de conta
export const WithAccountInfo: Story = {
    render: () => ({
        template: `
      <div class="w-64 border rounded-lg shadow-lg overflow-hidden">
        <!-- Header com info do usuário -->
        <div class="p-4 bg-muted/30 border-b">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-medium">JS</div>
            <div>
              <p class="font-medium text-sm">João Silva</p>
              <p class="text-xs text-muted-foreground">joao@empresa.com</p>
            </div>
          </div>
          
          <!-- Plano atual -->
          <div class="mt-3 p-2 bg-background rounded-lg">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">Plano atual</span>
              <span class="font-medium text-primary">Starter</span>
            </div>
            <div class="mt-1 h-1.5 bg-muted rounded-full">
              <div class="h-1.5 bg-primary rounded-full" style="width: 60%"></div>
            </div>
            <p class="text-[10px] text-muted-foreground mt-1">600/1000 contatos usados</p>
          </div>
        </div>
        
        <!-- Menu items -->
        <div class="py-1">
          <button class="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Configurações
          </button>
          <button class="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/></svg>
            Fazer Upgrade
          </button>
        </div>
        
        <div class="border-t py-1">
          <button class="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair da conta
          </button>
        </div>
      </div>
    `
    })
}

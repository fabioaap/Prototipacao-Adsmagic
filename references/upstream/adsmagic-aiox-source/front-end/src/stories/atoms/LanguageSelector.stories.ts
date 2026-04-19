import type { Meta, StoryObj } from '@storybook/vue3'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'

const meta: Meta<typeof LanguageSelector> = {
    title: 'Atoms/LanguageSelector',
    component: LanguageSelector,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Seletor de idioma com dropdown para alternar entre português, inglês e espanhol.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof LanguageSelector>

// Default
export const Default: Story = {
    render: () => ({
        components: { LanguageSelector },
        template: `
      <div class="flex justify-center p-8">
        <LanguageSelector />
      </div>
    `
    })
}

// Em header
export const InHeader: Story = {
    render: () => ({
        components: { LanguageSelector },
        template: `
      <div class="flex items-center justify-between p-4 bg-background border-b w-full">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">A</div>
          <span class="font-semibold">AdsMagic</span>
        </div>
        <div class="flex items-center gap-4">
          <LanguageSelector />
          <div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-medium text-sm">JS</div>
        </div>
      </div>
    `
    })
}

// Em página de login
export const InLoginPage: Story = {
    render: () => ({
        components: { LanguageSelector },
        template: `
      <div class="min-h-[400px] flex flex-col items-center justify-center bg-muted/30 rounded-lg p-8 relative">
        <!-- Language selector no canto superior direito -->
        <div class="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        <div class="w-[350px] p-6 bg-background border rounded-lg shadow-sm">
          <div class="text-center mb-6">
            <div class="w-12 h-12 bg-primary rounded-lg mx-auto mb-3 flex items-center justify-center text-primary-foreground font-bold text-xl">A</div>
            <h1 class="text-xl font-bold">Entrar no AdsMagic</h1>
            <p class="text-sm text-muted-foreground">Faça login para continuar</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">E-mail</label>
              <input type="email" class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="seu@email.com" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Senha</label>
              <input type="password" class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="••••••••" />
            </div>
            <button class="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              Entrar
            </button>
          </div>
        </div>
      </div>
    `
    })
}

// Em footer
export const InFooter: Story = {
    render: () => ({
        components: { LanguageSelector },
        template: `
      <div class="p-6 bg-muted/30 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            © 2024 AdsMagic. Todos os direitos reservados.
          </div>
          <div class="flex items-center gap-4">
            <a href="#" class="text-sm text-muted-foreground hover:text-foreground">Termos</a>
            <a href="#" class="text-sm text-muted-foreground hover:text-foreground">Privacidade</a>
            <LanguageSelector />
          </div>
        </div>
      </div>
    `
    })
}

// Em configurações
export const InSettings: Story = {
    render: () => ({
        components: { LanguageSelector },
        template: `
      <div class="w-[400px] p-6 border rounded-lg space-y-6">
        <h2 class="text-lg font-semibold">Configurações de conta</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p class="font-medium text-sm">Idioma</p>
              <p class="text-xs text-muted-foreground">Idioma da interface</p>
            </div>
            <LanguageSelector />
          </div>
          
          <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p class="font-medium text-sm">Fuso horário</p>
              <p class="text-xs text-muted-foreground">Horário local para relatórios</p>
            </div>
            <select class="px-3 py-1.5 border rounded-lg text-sm">
              <option>Brasília (GMT-3)</option>
              <option>São Paulo (GMT-3)</option>
              <option>Lisboa (GMT+0)</option>
            </select>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p class="font-medium text-sm">Formato de moeda</p>
              <p class="text-xs text-muted-foreground">Moeda padrão para valores</p>
            </div>
            <select class="px-3 py-1.5 border rounded-lg text-sm">
              <option>BRL (R$)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
        </div>
        
        <div class="pt-4 border-t">
          <button class="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium">
            Salvar preferências
          </button>
        </div>
      </div>
    `
    })
}

// Idiomas disponíveis (demonstração)
export const AvailableLanguages: Story = {
    render: () => ({
        template: `
      <div class="space-y-4">
        <h3 class="font-medium">Idiomas suportados:</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 border rounded-lg text-center">
            <div class="text-2xl mb-2">🇧🇷</div>
            <p class="font-medium text-sm">Português</p>
            <p class="text-xs text-muted-foreground">pt-BR</p>
          </div>
          <div class="p-4 border rounded-lg text-center">
            <div class="text-2xl mb-2">🇺🇸</div>
            <p class="font-medium text-sm">English</p>
            <p class="text-xs text-muted-foreground">en</p>
          </div>
          <div class="p-4 border rounded-lg text-center">
            <div class="text-2xl mb-2">🇪🇸</div>
            <p class="font-medium text-sm">Español</p>
            <p class="text-xs text-muted-foreground">es</p>
          </div>
        </div>
        <p class="text-xs text-muted-foreground">
          * O idioma é detectado automaticamente com base nas configurações do navegador.
        </p>
      </div>
    `
    })
}

import type { Meta, StoryObj } from '@storybook/vue3'
import Navbar from '@/components/ui/Navbar.vue'

/**
 * Navbar - Barra de navegação principal da aplicação.
 * 
 * Contém logo, seletor de idioma e menu do usuário.
 * Fixa no topo com backdrop blur.
 */
const meta: Meta<typeof Navbar> = {
  title: 'Molecules/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Barra de navegação principal com logo e menus.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Navbar padrão
 */
export const Default: Story = {
  render: () => ({
    components: { Navbar },
    template: `
      <div class="min-h-[200px]">
        <Navbar />
        <div class="p-8">
          <p class="text-muted-foreground">Conteúdo da página abaixo da navbar...</p>
        </div>
      </div>
    `,
  }),
}

/**
 * Com conteúdo scrollável
 */
export const ComScroll: Story = {
  render: () => ({
    components: { Navbar },
    template: `
      <div class="h-[400px] overflow-auto">
        <Navbar />
        <div class="p-8 space-y-4">
          <p v-for="i in 20" :key="i" class="p-4 bg-muted rounded-lg">
            Conteúdo {{ i }} - Role a página para ver o efeito sticky
          </p>
        </div>
      </div>
    `,
  }),
}

/**
 * Em página de dashboard
 */
export const EmDashboard: Story = {
  render: () => ({
    components: { Navbar },
    template: `
      <div class="min-h-[500px] bg-muted/30">
        <Navbar />
        
        <div class="max-w-7xl mx-auto p-6">
          <div class="mb-6">
            <h1 class="text-2xl font-bold">Dashboard</h1>
            <p class="text-muted-foreground">Visão geral do seu projeto</p>
          </div>
          
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-sm text-muted-foreground">Leads</p>
              <p class="text-2xl font-bold">1.234</p>
            </div>
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-sm text-muted-foreground">Vendas</p>
              <p class="text-2xl font-bold">89</p>
            </div>
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-sm text-muted-foreground">Receita</p>
              <p class="text-2xl font-bold">R$ 47.500</p>
            </div>
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-sm text-muted-foreground">ROAS</p>
              <p class="text-2xl font-bold">3.2x</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="p-6 bg-card rounded-lg border h-[200px] flex items-center justify-center">
              <span class="text-muted-foreground">Gráfico de vendas</span>
            </div>
            <div class="p-6 bg-card rounded-lg border h-[200px] flex items-center justify-center">
              <span class="text-muted-foreground">Gráfico de conversão</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Em página de onboarding
 */
export const EmOnboarding: Story = {
  render: () => ({
    components: { Navbar },
    template: `
      <div class="min-h-[500px] bg-background">
        <Navbar />
        
        <div class="max-w-2xl mx-auto py-12 px-6">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold mb-2">Bem-vindo ao AdsMagic!</h1>
            <p class="text-muted-foreground">
              Vamos configurar seu primeiro projeto em poucos minutos
            </p>
          </div>
          
          <div class="bg-card rounded-lg border p-6">
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Nome do Projeto</label>
                <input 
                  type="text" 
                  class="w-full h-10 rounded-md border px-3 text-sm"
                  placeholder="Ex: Loja Virtual"
                />
              </div>
              
              <div class="space-y-2">
                <label class="text-sm font-medium">Segmento</label>
                <select class="w-full h-10 rounded-md border px-3 text-sm">
                  <option>E-commerce</option>
                  <option>Serviços</option>
                  <option>Infoprodutos</option>
                </select>
              </div>
              
              <button class="w-full bg-primary text-primary-foreground rounded-md py-2.5 text-sm font-medium">
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Em tela mobile (responsivo)
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => ({
    components: { Navbar },
    template: `
      <div class="min-h-[400px]">
        <Navbar />
        <div class="p-4">
          <h1 class="text-lg font-semibold mb-4">Dashboard</h1>
          <div class="space-y-3">
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-sm text-muted-foreground">Total de Leads</p>
              <p class="text-xl font-bold">1.234</p>
            </div>
            <div class="p-4 bg-card rounded-lg border">
              <p class="text-sm text-muted-foreground">Vendas</p>
              <p class="text-xl font-bold">89</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * ProjectsTemplate - Template da página de seleção de Projetos.
 * 
 * Página para listar e selecionar projetos disponíveis.
 */
const meta: Meta = {
  title: 'Templates/ProjectsPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template completo da página de Projetos.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Lista de projetos
 */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-muted/30">
        <!-- Header -->
        <header class="border-b bg-background h-16 flex items-center justify-between px-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span class="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span class="font-semibold">AdsMagic</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground">joao@empresa.com</span>
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">JS</div>
          </div>
        </header>
        
        <!-- Content -->
        <div class="max-w-4xl mx-auto py-8 px-4 sm:py-12 sm:px-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 class="text-xl sm:text-2xl font-bold">Seus Projetos</h1>
              <p class="text-sm text-muted-foreground">Selecione um projeto para continuar</p>
            </div>
            <button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm whitespace-nowrap">
              + Novo Projeto
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Project Card 1 -->
            <div class="bg-card rounded-xl border p-6 hover:shadow-lg transition cursor-pointer hover:border-primary">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span class="text-xl">👗</span>
                  </div>
                  <div>
                    <h3 class="font-semibold">E-commerce Fashion</h3>
                    <p class="text-xs text-muted-foreground">Criado em 10/01/2024</p>
                  </div>
                </div>
                <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Ativo</span>
              </div>
              
              <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                <div>
                  <p class="text-xs text-muted-foreground">Contatos</p>
                  <p class="text-sm sm:text-base font-semibold">1.234</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Vendas</p>
                  <p class="text-sm sm:text-base font-semibold">89</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">ROAS</p>
                  <p class="text-sm sm:text-base font-semibold text-primary">3.2x</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Meta Ads</span>
                <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Google Ads</span>
              </div>
            </div>
            
            <!-- Project Card 2 -->
            <div class="bg-card rounded-xl border p-6 hover:shadow-lg transition cursor-pointer hover:border-primary">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span class="text-xl">💊</span>
                  </div>
                  <div>
                    <h3 class="font-semibold">Clínica Estética SP</h3>
                    <p class="text-xs text-muted-foreground">Criado em 15/02/2024</p>
                  </div>
                </div>
                <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Ativo</span>
              </div>
              
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p class="text-xs text-muted-foreground">Contatos</p>
                  <p class="font-semibold">567</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Vendas</p>
                  <p class="font-semibold">34</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">ROAS</p>
                  <p class="font-semibold text-primary">4.8x</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Meta Ads</span>
                <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">WhatsApp</span>
              </div>
            </div>
            
            <!-- Project Card 3 - Archived -->
            <div class="bg-card rounded-xl border p-6 hover:shadow-lg transition cursor-pointer opacity-60">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span class="text-xl">📦</span>
                  </div>
                  <div>
                    <h3 class="font-semibold">Projeto Antigo</h3>
                    <p class="text-xs text-muted-foreground">Criado em 01/06/2023</p>
                  </div>
                </div>
                <span class="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">Arquivado</span>
              </div>
              
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p class="text-xs text-muted-foreground">Contatos</p>
                  <p class="font-semibold">234</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Vendas</p>
                  <p class="font-semibold">12</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">ROAS</p>
                  <p class="font-semibold">2.1x</p>
                </div>
              </div>
            </div>
            
            <!-- New Project Card -->
            <div class="bg-card rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition min-h-[200px]">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span class="text-2xl">+</span>
              </div>
              <h3 class="font-semibold mb-1">Criar Novo Projeto</h3>
              <p class="text-sm text-muted-foreground">
                Comece a rastrear uma nova campanha
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Sem projetos
 */
export const Empty: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-muted/30">
        <header class="border-b bg-background h-16 flex items-center px-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-lg"></div>
            <span class="font-semibold">AdsMagic</span>
          </div>
        </header>
        
        <div class="max-w-2xl mx-auto py-16 px-6 text-center">
          <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-5xl">📁</span>
          </div>
          
          <h1 class="text-2xl font-bold mb-3">Nenhum projeto ainda</h1>
          <p class="text-muted-foreground mb-8 max-w-md mx-auto">
            Crie seu primeiro projeto para começar a rastrear suas campanhas de marketing digital.
          </p>
          
          <button class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
            + Criar Primeiro Projeto
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Seleção de empresa primeiro
 */
export const SelectCompany: Story = {
  render: () => ({
    template: `
      <div class="min-h-screen bg-muted/30">
        <header class="border-b bg-background h-16 flex items-center px-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-lg"></div>
            <span class="font-semibold">AdsMagic</span>
          </div>
        </header>
        
        <div class="max-w-xl mx-auto py-16 px-6">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold mb-2">Selecione uma empresa</h1>
            <p class="text-muted-foreground">Escolha a empresa que deseja acessar</p>
          </div>
          
          <div class="space-y-3">
            <div class="bg-card rounded-xl border p-4 hover:shadow-lg transition cursor-pointer hover:border-primary">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">🏢</span>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold">Minha Empresa LTDA</h3>
                  <p class="text-xs text-muted-foreground">3 projetos • Admin</p>
                </div>
                <span class="text-muted-foreground">→</span>
              </div>
            </div>
            
            <div class="bg-card rounded-xl border p-4 hover:shadow-lg transition cursor-pointer hover:border-primary">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">🏪</span>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold">Cliente ABC</h3>
                  <p class="text-xs text-muted-foreground">1 projeto • Editor</p>
                </div>
                <span class="text-muted-foreground">→</span>
              </div>
            </div>
            
            <div class="border-2 border-dashed rounded-xl p-4 hover:border-primary transition cursor-pointer text-center">
              <p class="text-sm text-muted-foreground">
                + Criar nova empresa
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

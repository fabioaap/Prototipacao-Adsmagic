import type { Meta, StoryObj } from '@storybook/vue3'
import AppLayout from '@/components/layout/AppLayout.vue'

/**
 * AppLayout - Layout principal da aplicação.
 * 
 * Inclui sidebar de navegação, header com busca e notificações,
 * e área de conteúdo principal.
 */
const meta: Meta<typeof AppLayout> = {
  title: 'Organisms/Layout/AppLayout',
  component: AppLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Layout principal com sidebar, header e área de conteúdo.',
      },
    },
  },
  argTypes: {
    hideHeader: {
      control: 'boolean',
      description: 'Ocultar o header',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Layout padrão da aplicação
 */
export const Default: Story = {
  render: () => ({
    components: { AppLayout },
    template: `
      <AppLayout>
        <div class="p-6">
          <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
          <div class="grid grid-cols-4 gap-4">
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
        </div>
      </AppLayout>
    `,
  }),
}

/**
 * Com página de contatos
 */
export const PaginaContatos: Story = {
  render: () => ({
    components: { AppLayout },
    template: `
      <AppLayout>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold">Contatos</h1>
              <p class="text-muted-foreground">Gerencie seus contatos</p>
            </div>
            <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              + Novo Contato
            </button>
          </div>
          
          <div class="bg-card rounded-lg border">
            <table class="w-full">
              <thead class="border-b">
                <tr>
                  <th class="text-left p-4 font-medium">Nome</th>
                  <th class="text-left p-4 font-medium">E-mail</th>
                  <th class="text-left p-4 font-medium">Origem</th>
                  <th class="text-left p-4 font-medium">Estágio</th>
                  <th class="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="i in 5" :key="i" class="border-b">
                  <td class="p-4">Contato {{ i }}</td>
                  <td class="p-4 text-muted-foreground">contato{{ i }}@email.com</td>
                  <td class="p-4"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Meta Ads</span></td>
                  <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Lead</span></td>
                  <td class="p-4 text-right">
                    <button class="text-sm text-primary hover:underline">Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>
    `,
  }),
}

/**
 * Com página de configurações
 */
export const PaginaConfiguracoes: Story = {
  render: () => ({
    components: { AppLayout },
    template: `
      <AppLayout>
        <div class="p-6 max-w-3xl">
          <h1 class="text-2xl font-bold mb-6">Configurações</h1>
          
          <div class="space-y-6">
            <div class="bg-card rounded-lg border p-6">
              <h2 class="font-semibold mb-4">Perfil</h2>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-sm font-medium">Nome</label>
                    <input type="text" class="w-full h-10 rounded-md border px-3" value="João Silva" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-medium">E-mail</label>
                    <input type="email" class="w-full h-10 rounded-md border px-3" value="joao@email.com" />
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-card rounded-lg border p-6">
              <h2 class="font-semibold mb-4">Notificações</h2>
              <div class="space-y-3">
                <label class="flex items-center gap-3">
                  <input type="checkbox" checked class="rounded" />
                  <span class="text-sm">Receber e-mails de novas vendas</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" checked class="rounded" />
                  <span class="text-sm">Receber alertas de integração</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    `,
  }),
}

/**
 * Sem header (para páginas especiais)
 */
export const SemHeader: Story = {
  args: {
    hideHeader: true,
  },
  render: (args) => ({
    components: { AppLayout },
    setup() {
      return { args }
    },
    template: `
      <AppLayout :hideHeader="args.hideHeader">
        <div class="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-2">Página sem Header</h1>
            <p class="text-muted-foreground">
              O header foi ocultado para esta página
            </p>
          </div>
        </div>
      </AppLayout>
    `,
  }),
}

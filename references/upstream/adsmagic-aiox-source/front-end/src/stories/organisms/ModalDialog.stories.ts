import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * ModalDialog - Organismo de diálogo modal.
 * 
 * Modal reutilizável para confirmações, formulários e alertas.
 */
const meta: Meta = {
  title: 'Organisms/ModalDialog',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal reutilizável para diferentes contextos.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Modal de confirmação
 */
export const Confirmation: Story = {
  render: () => ({
    template: `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-card rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in">
          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 class="font-semibold text-lg">Confirmar ação</h3>
                <p class="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <p class="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir este item? Todos os dados relacionados serão permanentemente removidos.
            </p>
            
            <div class="flex justify-end gap-3">
              <button class="px-4 py-2 border rounded-md text-sm hover:bg-accent">
                Cancelar
              </button>
              <button class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Modal de formulário
 */
export const FormModal: Story = {
  render: () => ({
    template: `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-card rounded-lg shadow-xl w-full max-w-lg">
          <div class="p-6 border-b">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-lg">Novo Contato</h3>
              <button class="text-muted-foreground hover:text-foreground">✕</button>
            </div>
          </div>
          
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Nome *</label>
                <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Sobrenome</label>
                <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">E-mail *</label>
              <input type="email" class="w-full h-10 rounded-md border px-3 text-sm" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Origem</label>
              <select class="w-full h-10 rounded-md border px-3 text-sm">
                <option>Selecione...</option>
                <option>Meta Ads</option>
                <option>Google Ads</option>
                <option>Orgânico</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Observações</label>
              <textarea class="w-full h-20 rounded-md border px-3 py-2 text-sm resize-none"></textarea>
            </div>
          </div>
          
          <div class="p-6 border-t flex justify-end gap-3">
            <button class="px-4 py-2 border rounded-md text-sm">Cancelar</button>
            <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Salvar Contato
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Modal de sucesso
 */
export const Success: Story = {
  render: () => ({
    template: `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-card rounded-lg shadow-xl w-full max-w-sm text-center p-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">✓</span>
          </div>
          <h3 class="font-semibold text-lg mb-2">Sucesso!</h3>
          <p class="text-sm text-muted-foreground mb-6">
            A operação foi concluída com sucesso.
          </p>
          <button class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            Fechar
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Modal de erro
 */
export const Error: Story = {
  render: () => ({
    template: `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-card rounded-lg shadow-xl w-full max-w-sm text-center p-8">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">✕</span>
          </div>
          <h3 class="font-semibold text-lg mb-2">Erro</h3>
          <p class="text-sm text-muted-foreground mb-6">
            Algo deu errado. Por favor, tente novamente.
          </p>
          <div class="flex gap-3">
            <button class="flex-1 px-4 py-2 border rounded-md text-sm">
              Cancelar
            </button>
            <button class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Modal grande com conteúdo
 */
export const LargeContent: Story = {
  render: () => ({
    template: `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div class="p-6 border-b flex-shrink-0">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-lg">Detalhes do Contato</h3>
              <button class="text-muted-foreground hover:text-foreground">✕</button>
            </div>
          </div>
          
          <div class="p-6 overflow-y-auto flex-1">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium mb-3">Informações Pessoais</h4>
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">Nome</dt>
                    <dd class="font-medium">João Silva</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">E-mail</dt>
                    <dd class="font-medium">joao@email.com</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">Telefone</dt>
                    <dd class="font-medium">(11) 99999-9999</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 class="font-medium mb-3">Rastreamento</h4>
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">Origem</dt>
                    <dd><span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Meta Ads</span></dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">Estágio</dt>
                    <dd><span class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Qualificado</span></dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-muted-foreground">Data</dt>
                    <dd class="font-medium">10/01/2024</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div class="mt-6">
              <h4 class="font-medium mb-3">Histórico</h4>
              <div class="space-y-3">
                <div v-for="i in 5" :key="i" class="flex gap-3 text-sm">
                  <div class="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                  <div>
                    <p class="font-medium">Ação {{ i }}</p>
                    <p class="text-muted-foreground">{{ i }} dias atrás</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6 border-t flex justify-end gap-3 flex-shrink-0">
            <button class="px-4 py-2 border rounded-md text-sm">Fechar</button>
            <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Editar
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

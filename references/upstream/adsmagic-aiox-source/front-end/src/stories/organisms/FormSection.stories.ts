import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * FormSection - Organismo de seção de formulário.
 * 
 * Agrupa campos de formulário em seções lógicas.
 */
const meta: Meta = {
  title: 'Organisms/FormSection',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Seção de formulário que agrupa campos relacionados.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Seção de formulário padrão
 */
export const Default: Story = {
  render: () => ({
    template: `
      <div class="max-w-2xl bg-card rounded-lg border p-6">
        <div class="mb-6">
          <h3 class="font-semibold text-lg">Informações Pessoais</h3>
          <p class="text-sm text-muted-foreground">Preencha os dados do contato</p>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nome *</label>
              <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" placeholder="João" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Sobrenome *</label>
              <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" placeholder="Silva" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">E-mail *</label>
            <input type="email" class="w-full h-10 rounded-md border px-3 text-sm" placeholder="joao@email.com" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Telefone</label>
            <div class="flex gap-2">
              <select class="w-24 h-10 rounded-md border px-3 text-sm">
                <option>🇧🇷 +55</option>
                <option>🇺🇸 +1</option>
              </select>
              <input type="tel" class="flex-1 h-10 rounded-md border px-3 text-sm" placeholder="(11) 99999-9999" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Seção com múltiplas áreas
 */
export const MultipleSections: Story = {
  render: () => ({
    template: `
      <div class="max-w-2xl space-y-6">
        <!-- Section 1 -->
        <div class="bg-card rounded-lg border p-6">
          <div class="mb-6">
            <h3 class="font-semibold text-lg">Dados da Empresa</h3>
            <p class="text-sm text-muted-foreground">Informações da empresa</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Razão Social *</label>
              <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">CNPJ</label>
                <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Segmento</label>
                <select class="w-full h-10 rounded-md border px-3 text-sm">
                  <option>Selecione...</option>
                  <option>E-commerce</option>
                  <option>Serviços</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Section 2 -->
        <div class="bg-card rounded-lg border p-6">
          <div class="mb-6">
            <h3 class="font-semibold text-lg">Endereço</h3>
            <p class="text-sm text-muted-foreground">Endereço comercial</p>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium mb-2">Rua</label>
                <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Número</label>
                <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Cidade</label>
                <input type="text" class="w-full h-10 rounded-md border px-3 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Estado</label>
                <select class="w-full h-10 rounded-md border px-3 text-sm">
                  <option>SP</option>
                  <option>RJ</option>
                  <option>MG</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 border rounded-md text-sm">Cancelar</button>
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Salvar</button>
        </div>
      </div>
    `,
  }),
}

/**
 * Seção com validação de erro
 */
export const WithErrors: Story = {
  render: () => ({
    template: `
      <div class="max-w-2xl bg-card rounded-lg border p-6">
        <div class="mb-6">
          <h3 class="font-semibold text-lg">Informações Pessoais</h3>
          <p class="text-sm text-muted-foreground">Preencha os dados do contato</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nome *</label>
            <input type="text" class="w-full h-10 rounded-md border border-red-500 px-3 text-sm" value="J" />
            <p class="text-xs text-red-500 mt-1">Nome deve ter pelo menos 2 caracteres</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">E-mail *</label>
            <input type="email" class="w-full h-10 rounded-md border border-red-500 px-3 text-sm" value="joao@" />
            <p class="text-xs text-red-500 mt-1">E-mail inválido</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Telefone</label>
            <input type="tel" class="w-full h-10 rounded-md border px-3 text-sm" value="(11) 99999-9999" />
            <p class="text-xs text-muted-foreground mt-1">Campo opcional</p>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">⚠️ Corrija os erros acima para continuar</p>
        </div>
      </div>
    `,
  }),
}

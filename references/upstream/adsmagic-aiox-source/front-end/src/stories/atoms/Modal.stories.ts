import type { Meta, StoryObj } from '@storybook/vue3'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { ref } from 'vue'

const meta: Meta<typeof Modal> = {
    title: 'Atoms/Modal',
    component: Modal,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Componente de modal/diálogo com overlay, animações e diferentes tamanhos.'
            }
        }
    },
    argTypes: {
        open: {
            control: 'boolean',
            description: 'Controla visibilidade do modal'
        },
        title: {
            control: 'text',
            description: 'Título do modal'
        },
        showClose: {
            control: 'boolean',
            description: 'Exibir botão de fechar'
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl', 'full'],
            description: 'Tamanho do modal'
        },
        closeOnClickOutside: {
            control: 'boolean',
            description: 'Fechar ao clicar no overlay'
        }
    }
}

export default meta
type Story = StoryObj<typeof Modal>

// Default
export const Default: Story = {
    render: () => ({
        components: { Modal, Button },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <div>
        <Button @click="isOpen = true">Abrir Modal</Button>
        <Modal v-model:open="isOpen" title="Título do Modal">
          <p class="text-muted-foreground">
            Este é o conteúdo do modal. Você pode adicionar qualquer coisa aqui.
          </p>
        </Modal>
      </div>
    `
    })
}

// Formulário de contato
export const ContactForm: Story = {
    render: () => ({
        components: { Modal, Button },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <div>
        <Button @click="isOpen = true">Adicionar Contato</Button>
        <Modal v-model:open="isOpen" title="Novo Contato">
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nome completo</label>
              <input 
                type="text" 
                class="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="João Silva"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">E-mail</label>
              <input 
                type="email" 
                class="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="joao@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Telefone</label>
              <input 
                type="tel" 
                class="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Origem</label>
              <select class="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Selecione uma origem</option>
                <option>Meta Ads</option>
                <option>Google Ads</option>
                <option>Indicação</option>
              </select>
            </div>
            <div class="flex gap-3 pt-4">
              <Button variant="outline" type="button" @click="isOpen = false" class="flex-1">
                Cancelar
              </Button>
              <Button type="submit" class="flex-1">
                Salvar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    `
    })
}

// Tamanho pequeno
export const SizeSmall: Story = {
    render: () => ({
        components: { Modal, Button },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <div>
        <Button @click="isOpen = true">Modal Pequeno</Button>
        <Modal v-model:open="isOpen" title="Confirmar" size="sm">
          <p class="text-sm text-muted-foreground mb-4">
            Tem certeza que deseja continuar?
          </p>
          <div class="flex gap-3">
            <Button variant="outline" size="sm" @click="isOpen = false" class="flex-1">
              Não
            </Button>
            <Button size="sm" @click="isOpen = false" class="flex-1">
              Sim
            </Button>
          </div>
        </Modal>
      </div>
    `
    })
}

// Tamanho grande
export const SizeLarge: Story = {
    render: () => ({
        components: { Modal, Button },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <div>
        <Button @click="isOpen = true">Modal Grande</Button>
        <Modal v-model:open="isOpen" title="Configurações do Projeto" size="lg">
          <div class="space-y-6">
            <div>
              <h3 class="font-medium mb-3">Informações Gerais</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Nome</label>
                  <input type="text" class="w-full px-3 py-2 border rounded-lg text-sm" value="Loja Virtual Fashion" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">URL</label>
                  <input type="url" class="w-full px-3 py-2 border rounded-lg text-sm" value="https://lojafashion.com.br" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="font-medium mb-3">Integrações</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span class="text-sm">Meta Ads</span>
                  <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Conectado</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span class="text-sm">Google Ads</span>
                  <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Não conectado</span>
                </div>
              </div>
            </div>
            
            <div class="flex gap-3 pt-4 border-t">
              <Button variant="outline" @click="isOpen = false" class="flex-1">
                Cancelar
              </Button>
              <Button @click="isOpen = false" class="flex-1">
                Salvar alterações
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    `
    })
}

// Tamanho extra grande
export const SizeXL: Story = {
    render: () => ({
        components: { Modal, Button },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <div>
        <Button @click="isOpen = true">Modal XL</Button>
        <Modal v-model:open="isOpen" title="Relatório Detalhado" size="xl">
          <div class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Visualize os dados completos do período selecionado.
            </p>
            
            <div class="border rounded-lg overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-muted">
                  <tr>
                    <th class="px-4 py-3 text-left">Origem</th>
                    <th class="px-4 py-3 text-right">Contatos</th>
                    <th class="px-4 py-3 text-right">Vendas</th>
                    <th class="px-4 py-3 text-right">Receita</th>
                    <th class="px-4 py-3 text-right">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-t">
                    <td class="px-4 py-3">Meta Ads</td>
                    <td class="px-4 py-3 text-right">1.234</td>
                    <td class="px-4 py-3 text-right">89</td>
                    <td class="px-4 py-3 text-right">R$ 45.670,00</td>
                    <td class="px-4 py-3 text-right text-green-600">4.5x</td>
                  </tr>
                  <tr class="border-t">
                    <td class="px-4 py-3">Google Ads</td>
                    <td class="px-4 py-3 text-right">856</td>
                    <td class="px-4 py-3 text-right">52</td>
                    <td class="px-4 py-3 text-right">R$ 28.340,00</td>
                    <td class="px-4 py-3 text-right text-green-600">3.2x</td>
                  </tr>
                  <tr class="border-t">
                    <td class="px-4 py-3">Indicação</td>
                    <td class="px-4 py-3 text-right">234</td>
                    <td class="px-4 py-3 text-right">28</td>
                    <td class="px-4 py-3 text-right">R$ 15.890,00</td>
                    <td class="px-4 py-3 text-right text-muted-foreground">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="flex justify-end gap-3 pt-4">
              <Button variant="outline" @click="isOpen = false">
                Fechar
              </Button>
              <Button>
                Exportar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    `
    })
}

// Sem botão de fechar
export const WithoutCloseButton: Story = {
    render: () => ({
        components: { Modal, Button },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <div>
        <Button @click="isOpen = true">Modal sem X</Button>
        <Modal v-model:open="isOpen" title="Termos de Uso" :show-close="false" :close-on-click-outside="false">
          <div class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Para continuar, você precisa aceitar os termos de uso da plataforma.
            </p>
            <div class="h-40 overflow-y-auto p-3 bg-muted rounded-lg text-xs">
              <p class="mb-2">1. Termos gerais</p>
              <p class="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum.</p>
              <p class="mb-2">2. Privacidade</p>
              <p class="mb-2">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p class="mb-2">3. Uso dos dados</p>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            </div>
            <div class="flex gap-3">
              <Button variant="outline" @click="isOpen = false" class="flex-1">
                Não aceito
              </Button>
              <Button @click="isOpen = false" class="flex-1">
                Aceito os termos
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    `
    })
}

// Sem título
export const WithoutTitle: Story = {
    render: () => ({
        components: { Modal, Button },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <div>
        <Button @click="isOpen = true">Modal sem título</Button>
        <Modal v-model:open="isOpen">
          <div class="text-center py-4">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">Venda registrada!</h3>
            <p class="text-sm text-muted-foreground mb-6">
              A venda de R$ 2.500,00 foi atribuída com sucesso ao Meta Ads.
            </p>
            <Button @click="isOpen = false" class="w-full">
              Continuar
            </Button>
          </div>
        </Modal>
      </div>
    `
    })
}

// Carregando
export const Loading: Story = {
    render: () => ({
        components: { Modal, Button },
        setup() {
            const isOpen = ref(false)
            return { isOpen }
        },
        template: `
      <div>
        <Button @click="isOpen = true">Processar</Button>
        <Modal v-model:open="isOpen" title="Processando..." :show-close="false" :close-on-click-outside="false" size="sm">
          <div class="flex flex-col items-center py-4">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-sm text-muted-foreground">
              Aguarde enquanto processamos sua solicitação...
            </p>
          </div>
        </Modal>
      </div>
    `
    })
}

import type { Meta, StoryObj } from '@storybook/vue3'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof Drawer> = {
    title: 'Atoms/Drawer',
    component: Drawer,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Painel deslizante lateral para exibir formulários, detalhes ou configurações.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Drawer>

// Default
export const Default: Story = {
    render: () => ({
        components: { Drawer, Button },
        setup() {
            const open = { value: false }
            return { open }
        },
        template: `
      <div>
        <Button @click="open.value = true">Abrir Drawer</Button>
        <Drawer v-model:open="open.value" title="Drawer Padrão">
          <div class="p-4">
            <p>Conteúdo do drawer vai aqui.</p>
          </div>
        </Drawer>
      </div>
    `
    })
}

// Detalhes do contato
export const ContactDetails: Story = {
    render: () => ({
        components: { Drawer, Button },
        setup() {
            const open = { value: false }
            const contact = {
                name: 'João Silva',
                email: 'joao@email.com',
                phone: '(11) 99999-9999',
                origin: 'Meta Ads',
                stage: 'Qualificado',
                createdAt: '15/01/2025',
                lastActivity: 'Há 2 horas'
            }
            return { open, contact }
        },
        template: `
      <div>
        <Button @click="open.value = true">Ver Detalhes do Contato</Button>
        <Drawer v-model:open="open.value" title="Detalhes do Contato">
          <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-medium">
                JS
              </div>
              <div>
                <h2 class="text-xl font-semibold">{{ contact.name }}</h2>
                <p class="text-muted-foreground">{{ contact.email }}</p>
              </div>
            </div>
            
            <!-- Info -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-3 bg-muted rounded-lg">
                <p class="text-xs text-muted-foreground">Telefone</p>
                <p class="font-medium">{{ contact.phone }}</p>
              </div>
              <div class="p-3 bg-muted rounded-lg">
                <p class="text-xs text-muted-foreground">Origem</p>
                <p class="font-medium">{{ contact.origin }}</p>
              </div>
              <div class="p-3 bg-muted rounded-lg">
                <p class="text-xs text-muted-foreground">Etapa</p>
                <p class="font-medium">{{ contact.stage }}</p>
              </div>
              <div class="p-3 bg-muted rounded-lg">
                <p class="text-xs text-muted-foreground">Cadastro</p>
                <p class="font-medium">{{ contact.createdAt }}</p>
              </div>
            </div>
            
            <!-- Timeline -->
            <div class="space-y-3">
              <h3 class="font-medium">Histórico</h3>
              <div class="space-y-2">
                <div class="flex gap-3 text-sm">
                  <span class="text-muted-foreground">Há 2h</span>
                  <span>Visualizou página de preços</span>
                </div>
                <div class="flex gap-3 text-sm">
                  <span class="text-muted-foreground">Ontem</span>
                  <span>Clicou em anúncio Meta Ads</span>
                </div>
                <div class="flex gap-3 text-sm">
                  <span class="text-muted-foreground">15/01</span>
                  <span>Contato criado</span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-2 pt-4 border-t">
              <Button class="flex-1">WhatsApp</Button>
              <Button variant="outline" class="flex-1">Email</Button>
              <Button variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    `
    })
}

// Formulário de edição
export const EditForm: Story = {
    render: () => ({
        components: { Drawer, Button, Input, Label },
        setup() {
            const open = { value: false }
            return { open }
        },
        template: `
      <div>
        <Button @click="open.value = true">Editar Projeto</Button>
        <Drawer v-model:open="open.value" title="Editar Projeto">
          <div class="p-6 space-y-6">
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="name">Nome do projeto</Label>
                <Input id="name" value="Loja Online" />
              </div>
              <div class="space-y-2">
                <Label for="desc">Descrição</Label>
                <textarea 
                  id="desc" 
                  class="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  placeholder="Descreva seu projeto..."
                >E-commerce de produtos eletrônicos</textarea>
              </div>
              <div class="space-y-2">
                <Label for="timezone">Fuso horário</Label>
                <select id="timezone" class="w-full h-10 px-3 border rounded-md">
                  <option>América/São Paulo (GMT-3)</option>
                  <option>América/New York (GMT-5)</option>
                </select>
              </div>
              <div class="space-y-2">
                <Label for="currency">Moeda</Label>
                <select id="currency" class="w-full h-10 px-3 border rounded-md">
                  <option>BRL - Real Brasileiro</option>
                  <option>USD - Dólar Americano</option>
                </select>
              </div>
            </div>
            
            <div class="flex gap-2 pt-4 border-t">
              <Button variant="outline" class="flex-1" @click="open.value = false">Cancelar</Button>
              <Button class="flex-1">Salvar alterações</Button>
            </div>
          </div>
        </Drawer>
      </div>
    `
    })
}

// Filtros avançados
export const AdvancedFilters: Story = {
    render: () => ({
        components: { Drawer, Button, Input, Label },
        setup() {
            const open = { value: false }
            return { open }
        },
        template: `
      <div>
        <Button variant="outline" @click="open.value = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtros Avançados
        </Button>
        <Drawer v-model:open="open.value" title="Filtros Avançados">
          <div class="p-6 space-y-6">
            <!-- Status -->
            <div class="space-y-3">
              <Label class="font-medium">Status</Label>
              <div class="flex flex-wrap gap-2">
                <button class="px-3 py-1 text-sm border rounded-full bg-primary text-primary-foreground">Todos</button>
                <button class="px-3 py-1 text-sm border rounded-full hover:bg-muted">Ativos</button>
                <button class="px-3 py-1 text-sm border rounded-full hover:bg-muted">Pendentes</button>
                <button class="px-3 py-1 text-sm border rounded-full hover:bg-muted">Inativos</button>
              </div>
            </div>
            
            <!-- Origem -->
            <div class="space-y-3">
              <Label class="font-medium">Origem</Label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="rounded" checked />
                  <span class="text-sm">Meta Ads</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="rounded" checked />
                  <span class="text-sm">Google Ads</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="rounded" />
                  <span class="text-sm">Orgânico</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="rounded" />
                  <span class="text-sm">WhatsApp</span>
                </label>
              </div>
            </div>
            
            <!-- Período -->
            <div class="space-y-3">
              <Label class="font-medium">Período</Label>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <Label class="text-xs">De</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label class="text-xs">Até</Label>
                  <Input type="date" />
                </div>
              </div>
            </div>
            
            <!-- Valor -->
            <div class="space-y-3">
              <Label class="font-medium">Faixa de valor</Label>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <Label class="text-xs">Mínimo</Label>
                  <Input type="number" placeholder="R$ 0" />
                </div>
                <div>
                  <Label class="text-xs">Máximo</Label>
                  <Input type="number" placeholder="R$ 10.000" />
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-2 pt-4 border-t">
              <Button variant="outline" class="flex-1">Limpar filtros</Button>
              <Button class="flex-1">Aplicar filtros</Button>
            </div>
          </div>
        </Drawer>
      </div>
    `
    })
}

// Configurações de integração
export const IntegrationSettings: Story = {
    render: () => ({
        components: { Drawer, Button },
        setup() {
            const open = { value: false }
            return { open }
        },
        template: `
      <div>
        <Button variant="outline" @click="open.value = true">Configurar Meta Ads</Button>
        <Drawer v-model:open="open.value" title="Meta Ads - Configurações">
          <div class="p-6 space-y-6">
            <!-- Status -->
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">f</div>
              <div class="flex-1">
                <p class="font-medium">Conta conectada</p>
                <p class="text-sm text-muted-foreground">ID: 123456789</p>
              </div>
              <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Ativo</span>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-3 bg-muted rounded-lg">
                <p class="text-xs text-muted-foreground">Última sync</p>
                <p class="font-medium">Há 5 min</p>
              </div>
              <div class="p-3 bg-muted rounded-lg">
                <p class="text-xs text-muted-foreground">Contatos importados</p>
                <p class="font-medium">1.234</p>
              </div>
            </div>
            
            <!-- Options -->
            <div class="space-y-4">
              <h3 class="font-medium">Opções de sincronização</h3>
              <label class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p class="font-medium">Sync automático</p>
                  <p class="text-sm text-muted-foreground">Sincronizar a cada 15 minutos</p>
                </div>
                <input type="checkbox" class="rounded" checked />
              </label>
              <label class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p class="font-medium">Importar leads</p>
                  <p class="text-sm text-muted-foreground">Importar leads de formulários</p>
                </div>
                <input type="checkbox" class="rounded" checked />
              </label>
              <label class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p class="font-medium">Enviar conversões</p>
                  <p class="text-sm text-muted-foreground">Enviar vendas para API de Conversões</p>
                </div>
                <input type="checkbox" class="rounded" />
              </label>
            </div>
            
            <!-- Actions -->
            <div class="space-y-2 pt-4 border-t">
              <Button class="w-full">Sincronizar agora</Button>
              <Button variant="outline" class="w-full text-red-600 hover:text-red-700">
                Desconectar integração
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    `
    })
}

// Help/Ajuda
export const HelpDrawer: Story = {
    render: () => ({
        components: { Drawer, Button, Input },
        setup() {
            const open = { value: false }
            return { open }
        },
        template: `
      <div>
        <Button variant="ghost" size="icon" @click="open.value = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        </Button>
        <Drawer v-model:open="open.value" title="Central de Ajuda">
          <div class="p-6 space-y-6">
            <!-- Search -->
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <Input placeholder="Buscar na ajuda..." class="pl-10" />
            </div>
            
            <!-- Quick links -->
            <div class="space-y-2">
              <h3 class="font-medium text-sm text-muted-foreground">COMEÇAR</h3>
              <button class="w-full flex items-center gap-3 p-3 text-left hover:bg-muted rounded-lg">
                <span>📚</span>
                <div>
                  <p class="font-medium">Guia de início rápido</p>
                  <p class="text-sm text-muted-foreground">Configure sua conta em 5 minutos</p>
                </div>
              </button>
              <button class="w-full flex items-center gap-3 p-3 text-left hover:bg-muted rounded-lg">
                <span>🎥</span>
                <div>
                  <p class="font-medium">Vídeo tutoriais</p>
                  <p class="text-sm text-muted-foreground">Aprenda com demonstrações</p>
                </div>
              </button>
            </div>
            
            <div class="space-y-2">
              <h3 class="font-medium text-sm text-muted-foreground">TÓPICOS POPULARES</h3>
              <button class="w-full flex items-center gap-3 p-3 text-left hover:bg-muted rounded-lg">
                <span>🔗</span>
                <span>Como conectar Meta Ads</span>
              </button>
              <button class="w-full flex items-center gap-3 p-3 text-left hover:bg-muted rounded-lg">
                <span>📊</span>
                <span>Instalar pixel de rastreamento</span>
              </button>
              <button class="w-full flex items-center gap-3 p-3 text-left hover:bg-muted rounded-lg">
                <span>💰</span>
                <span>Atribuir vendas a campanhas</span>
              </button>
            </div>
            
            <!-- Contact -->
            <div class="p-4 bg-muted rounded-lg space-y-3">
              <p class="font-medium">Não encontrou o que procura?</p>
              <div class="flex gap-2">
                <Button size="sm" class="flex-1">💬 Chat</Button>
                <Button variant="outline" size="sm" class="flex-1">📧 Email</Button>
              </div>
            </div>
          </div>
        </Drawer>
      </div>
    `
    })
}

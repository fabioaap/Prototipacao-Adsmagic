import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Dialog from '@/components/ui/Dialog.vue'
import { DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/radix'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof Dialog> = {
  title: 'Atoms/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Modal/Dialog para exibir conteúdo que requer atenção do usuário.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof Dialog>

// Default
export const Default: Story = {
  render: () => ({
    components: { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button>Abrir Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do Dialog</DialogTitle>
            <DialogDescription>
              Esta é uma descrição do dialog. Explica o que o usuário pode fazer aqui.
            </DialogDescription>
          </DialogHeader>
          <div class="py-4">
            <p>Conteúdo do dialog vai aqui.</p>
          </div>
          <DialogFooter>
            <Button variant="outline">Cancelar</Button>
            <Button>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `
  })
}

// Formulário
export const FormDialog: Story = {
  render: () => ({
    components: { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button>Novo Contato</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Contato</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo contato. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="name" class="text-right">Nome</Label>
              <Input id="name" class="col-span-3" placeholder="João Silva" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="email" class="text-right">Email</Label>
              <Input id="email" type="email" class="col-span-3" placeholder="joao@email.com" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="phone" class="text-right">Telefone</Label>
              <Input id="phone" class="col-span-3" placeholder="(11) 99999-9999" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar contato</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `
  })
}

// Confirmação de exclusão
export const DeleteConfirmation: Story = {
  render: () => ({
    components: { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="destructive">Excluir Projeto</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2">
              <span class="text-red-500">⚠️</span>
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o projeto "Loja Online". Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div class="py-4">
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <p class="font-medium">Isso irá excluir permanentemente:</p>
              <ul class="list-disc list-inside mt-2">
                <li>1.234 contatos</li>
                <li>89 vendas registradas</li>
                <li>Todos os relatórios</li>
              </ul>
            </div>
          </div>
          <DialogFooter class="gap-2">
            <Button variant="outline">Cancelar</Button>
            <Button variant="destructive">Sim, excluir projeto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `
  })
}

// Configurações
export const SettingsDialog: Story = {
  render: () => ({
    components: { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Configurações
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurações do Projeto</DialogTitle>
            <DialogDescription>
              Personalize as configurações do seu projeto.
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="space-y-2">
              <Label for="project-name">Nome do projeto</Label>
              <Input id="project-name" value="Loja Online" />
            </div>
            <div class="space-y-2">
              <Label for="timezone">Fuso horário</Label>
              <select id="timezone" class="w-full h-10 px-3 border rounded-md">
                <option>América/São Paulo (GMT-3)</option>
                <option>América/New York (GMT-5)</option>
                <option>Europa/Lisboa (GMT+0)</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label for="currency">Moeda</Label>
              <select id="currency" class="w-full h-10 px-3 border rounded-md">
                <option>BRL - Real Brasileiro</option>
                <option>USD - Dólar Americano</option>
                <option>EUR - Euro</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">Cancelar</Button>
            <Button>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `
  })
}

// Sucesso
export const SuccessDialog: Story = {
  render: () => ({
    components: { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button>Simular Sucesso</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader class="text-center">
            <div class="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <DialogTitle class="text-center">Integração Conectada!</DialogTitle>
            <DialogDescription class="text-center">
              Sua conta do Meta Ads foi conectada com sucesso. Agora você pode importar campanhas e rastrear conversões.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter class="sm:justify-center">
            <Button>Começar a usar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `
  })
}

// Grande com scroll
export const LargeWithScroll: Story = {
  render: () => ({
    components: { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">Termos de Uso</Button>
        </DialogTrigger>
        <DialogContent class="max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Termos de Uso</DialogTitle>
            <DialogDescription>
              Leia os termos antes de prosseguir.
            </DialogDescription>
          </DialogHeader>
          <div class="overflow-y-auto max-h-[50vh] pr-4">
            <div class="space-y-4 text-sm">
              <h3 class="font-medium">1. Aceitação dos Termos</h3>
              <p>Ao acessar ou usar o serviço AdsMagic, você concorda em ficar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte dos termos, então você não pode acessar o serviço.</p>
              
              <h3 class="font-medium">2. Descrição do Serviço</h3>
              <p>O AdsMagic é uma plataforma de rastreamento de marketing que permite aos usuários monitorar conversões, atribuir vendas a origens de tráfego e analisar o desempenho de campanhas publicitárias.</p>
              
              <h3 class="font-medium">3. Conta do Usuário</h3>
              <p>Ao criar uma conta conosco, você deve nos fornecer informações precisas, completas e atuais em todos os momentos. A falha em fazê-lo constitui uma violação dos Termos, o que pode resultar em rescisão imediata da sua conta em nosso serviço.</p>
              
              <h3 class="font-medium">4. Privacidade</h3>
              <p>Sua privacidade é importante para nós. Por favor, reveja nossa Política de Privacidade, que também governa seu uso do Serviço, para entender nossas práticas.</p>
              
              <h3 class="font-medium">5. Uso Aceitável</h3>
              <p>Você concorda em não usar o serviço para qualquer finalidade ilegal ou não autorizada. Você não pode, no uso do Serviço, violar quaisquer leis em sua jurisdição.</p>
              
              <h3 class="font-medium">6. Limitação de Responsabilidade</h3>
              <p>Em nenhuma circunstância o AdsMagic, seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos.</p>
            </div>
          </div>
          <DialogFooter class="gap-2">
            <Button variant="outline">Recusar</Button>
            <Button>Aceitar e continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `
  })
}

// Compartilhar
export const ShareDialog: Story = {
  render: () => ({
    components: { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button, Input },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Compartilhar
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Compartilhar Relatório</DialogTitle>
            <DialogDescription>
              Compartilhe este relatório com sua equipe ou clientes.
            </DialogDescription>
          </DialogHeader>
          <div class="space-y-4 py-4">
            <div class="flex gap-2">
              <Input value="https://app.adsmagic.io/r/abc123xyz" readonly />
              <Button size="sm">Copiar</Button>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium">Compartilhar via</p>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" class="flex-1">
                  📧 Email
                </Button>
                <Button variant="outline" size="sm" class="flex-1">
                  📱 WhatsApp
                </Button>
                <Button variant="outline" size="sm" class="flex-1">
                  🔗 LinkedIn
                </Button>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium">Permissões</p>
              <select class="w-full h-10 px-3 border rounded-md text-sm">
                <option>Apenas visualizar</option>
                <option>Pode comentar</option>
                <option>Pode editar</option>
              </select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    `
  })
}

// Loading state
export const WithLoading: Story = {
  render: () => ({
    components: { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button },
    setup() {
      const loading = ref(false)
      const simulate = () => {
        loading.value = true
        setTimeout(() => loading.value = false, 2000)
      }
      return { loading, simulate }
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button>Processar Dados</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
            <DialogDescription>
              Clique em confirmar para iniciar a importação.
            </DialogDescription>
          </DialogHeader>
          <div class="py-4">
            <p class="text-sm text-muted-foreground">
              Serão importados 1.234 contatos do Meta Ads.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" :disabled="loading">Cancelar</Button>
            <Button @click="simulate" :disabled="loading">
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Importando...' : 'Confirmar importação' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `
  })
}

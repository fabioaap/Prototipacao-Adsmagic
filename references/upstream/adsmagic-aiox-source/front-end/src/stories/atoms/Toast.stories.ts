import type { Meta, StoryObj } from '@storybook/vue3'
import Toast from '@/components/ui/Toast.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import Button from '@/components/ui/Button.vue'
import { ref } from 'vue'

const meta: Meta<typeof Toast> = {
    title: 'Atoms/Toast',
    component: Toast,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Componente de notificação toast com diferentes variantes e suporte a descrição.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Toast>

// Default
export const Default: Story = {
    render: () => ({
        components: { Toast },
        setup() {
            const toast = {
                id: '1',
                title: 'Notificação',
                description: 'Esta é uma notificação padrão.',
                variant: 'default' as const
            }
            return { toast }
        },
        template: `
      <div class="w-[400px]">
        <Toast :toast="toast" />
      </div>
    `
    })
}

// Success
export const Success: Story = {
    render: () => ({
        components: { Toast },
        setup() {
            const toast = {
                id: '2',
                title: 'Contato cadastrado!',
                description: 'O contato João Silva foi adicionado com sucesso.',
                variant: 'success' as const
            }
            return { toast }
        },
        template: `
      <div class="w-[400px]">
        <Toast :toast="toast" />
      </div>
    `
    })
}

// Destructive (Error)
export const Destructive: Story = {
    render: () => ({
        components: { Toast },
        setup() {
            const toast = {
                id: '3',
                title: 'Erro ao salvar',
                description: 'Não foi possível conectar ao servidor. Tente novamente.',
                variant: 'destructive' as const
            }
            return { toast }
        },
        template: `
      <div class="w-[400px]">
        <Toast :toast="toast" />
      </div>
    `
    })
}

// Warning
export const Warning: Story = {
    render: () => ({
        components: { Toast },
        setup() {
            const toast = {
                id: '4',
                title: 'Atenção!',
                description: 'Suas alterações ainda não foram salvas.',
                variant: 'warning' as const
            }
            return { toast }
        },
        template: `
      <div class="w-[400px]">
        <Toast :toast="toast" />
      </div>
    `
    })
}

// Apenas título
export const TitleOnly: Story = {
    render: () => ({
        components: { Toast },
        setup() {
            const toasts = [
                { id: '1', title: 'Salvo com sucesso!', variant: 'success' as const },
                { id: '2', title: 'Erro ao processar', variant: 'destructive' as const },
                { id: '3', title: 'Ação requer atenção', variant: 'warning' as const },
                { id: '4', title: 'Informação importante', variant: 'default' as const }
            ]
            return { toasts }
        },
        template: `
      <div class="space-y-2 w-[400px]">
        <Toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
      </div>
    `
    })
}

// Todas as variantes
export const AllVariants: Story = {
    render: () => ({
        components: { Toast },
        setup() {
            const toasts = [
                {
                    id: '1',
                    title: 'Informação',
                    description: 'Sua sessão expira em 5 minutos.',
                    variant: 'default' as const
                },
                {
                    id: '2',
                    title: 'Venda registrada!',
                    description: 'R$ 2.500,00 atribuído a Meta Ads.',
                    variant: 'success' as const
                },
                {
                    id: '3',
                    title: 'Conexão perdida',
                    description: 'Verifique sua conexão com a internet.',
                    variant: 'destructive' as const
                },
                {
                    id: '4',
                    title: 'Limite próximo',
                    description: 'Você atingiu 90% do limite de contatos.',
                    variant: 'warning' as const
                }
            ]
            return { toasts }
        },
        template: `
      <div class="space-y-2 w-[400px]">
        <Toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
      </div>
    `
    })
}

// Cenários de uso comum
export const CommonScenarios: Story = {
    render: () => ({
        components: { Toast },
        setup() {
            const scenarios = [
                {
                    id: '1',
                    title: 'Integração conectada!',
                    description: 'Meta Ads foi vinculado com sucesso ao projeto.',
                    variant: 'success' as const
                },
                {
                    id: '2',
                    title: 'Token expirado',
                    description: 'Reconecte sua conta do Meta Ads.',
                    variant: 'destructive' as const
                },
                {
                    id: '3',
                    title: 'Sincronização em andamento',
                    description: 'Importando 1.250 contatos do webhook...',
                    variant: 'default' as const
                },
                {
                    id: '4',
                    title: 'Etapa sem atribuição',
                    description: '15 vendas estão sem origem definida.',
                    variant: 'warning' as const
                }
            ]
            return { scenarios }
        },
        template: `
      <div class="space-y-2 w-[400px]">
        <Toast v-for="scenario in scenarios" :key="scenario.id" :toast="scenario" />
      </div>
    `
    })
}

// Interativo - simula adição de toasts
export const Interactive: Story = {
    render: () => ({
        components: { Toast, Button },
        setup() {
            const toasts = ref<Array<{
                id: string
                title: string
                description?: string
                variant: 'default' | 'success' | 'destructive' | 'warning'
            }>>([])

            let counter = 0

            const addToast = (variant: 'default' | 'success' | 'destructive' | 'warning') => {
                const messages = {
                    default: { title: 'Informação', description: 'Mensagem informativa padrão.' },
                    success: { title: 'Sucesso!', description: 'Operação realizada com sucesso.' },
                    destructive: { title: 'Erro!', description: 'Algo deu errado. Tente novamente.' },
                    warning: { title: 'Atenção!', description: 'Esta ação requer sua atenção.' }
                }

                toasts.value.push({
                    id: String(++counter),
                    ...messages[variant],
                    variant
                })

                // Auto-remove após 5 segundos
                setTimeout(() => {
                    toasts.value = toasts.value.filter(t => t.id !== String(counter))
                }, 5000)
            }

            const removeToast = (id: string) => {
                toasts.value = toasts.value.filter(t => t.id !== id)
            }

            return { toasts, addToast, removeToast }
        },
        template: `
      <div>
        <div class="flex gap-2 mb-6">
          <Button variant="outline" size="sm" @click="addToast('default')">Info</Button>
          <Button variant="outline" size="sm" class="text-green-600" @click="addToast('success')">Sucesso</Button>
          <Button variant="outline" size="sm" class="text-red-600" @click="addToast('destructive')">Erro</Button>
          <Button variant="outline" size="sm" class="text-yellow-600" @click="addToast('warning')">Aviso</Button>
        </div>
        
        <div class="fixed top-4 right-4 flex flex-col gap-2 w-[400px]">
          <transition-group
            enter-active-class="transform transition ease-in-out duration-200"
            enter-from-class="translate-x-full opacity-0"
            enter-to-class="translate-x-0 opacity-100"
            leave-active-class="transform transition ease-in-out duration-200"
            leave-from-class="translate-x-0 opacity-100"
            leave-to-class="translate-x-full opacity-0"
          >
            <Toast 
              v-for="toast in toasts" 
              :key="toast.id" 
              :toast="toast"
              @remove="removeToast"
            />
          </transition-group>
        </div>
        
        <p class="text-sm text-muted-foreground mt-4">
          Clique nos botões acima para adicionar toasts. Eles desaparecem automaticamente após 5 segundos.
        </p>
      </div>
    `
    })
}

// Posicionamento (demonstrativo)
export const Positioning: Story = {
    render: () => ({
        components: { Toast },
        setup() {
            const toast = {
                id: '1',
                title: 'Toast posicionado',
                description: 'Os toasts aparecem no canto superior direito.',
                variant: 'success' as const
            }
            return { toast }
        },
        template: `
      <div class="relative h-[300px] w-full border rounded-lg bg-muted/20">
        <p class="p-4 text-sm text-muted-foreground">Área da aplicação</p>
        
        <!-- Simula posição do toast container -->
        <div class="absolute top-4 right-4 w-[350px]">
          <Toast :toast="toast" />
        </div>
      </div>
    `
    })
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Progress from '@/components/ui/Progress.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'

const meta: Meta<typeof Progress> = {
    title: 'Atoms/Progress',
    component: Progress,
    tags: ['autodocs'],
    argTypes: {
        modelValue: {
            control: { type: 'range', min: 0, max: 100 },
            description: 'Valor do progresso (0-100)'
        }
    },
    parameters: {
        docs: {
            description: {
                component: 'Barra de progresso para indicar conclusão de tarefas ou operações.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Progress>

// Default
export const Default: Story = {
    render: (args) => ({
        components: { Progress },
        setup() {
            return { args }
        },
        template: `<Progress v-bind="args" class="w-[300px]" />`
    }),
    args: {
        modelValue: 50
    }
}

// Valores diferentes
export const Values: Story = {
    render: () => ({
        components: { Progress },
        template: `
      <div class="space-y-4 w-[400px]">
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>0%</span>
          </div>
          <Progress :model-value="0" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>25%</span>
          </div>
          <Progress :model-value="25" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>50%</span>
          </div>
          <Progress :model-value="50" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>75%</span>
          </div>
          <Progress :model-value="75" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>100%</span>
          </div>
          <Progress :model-value="100" />
        </div>
      </div>
    `
    })
}

// Com label
export const WithLabel: Story = {
    render: () => ({
        components: { Progress },
        setup() {
            const value = ref(67)
            return { value }
        },
        template: `
      <div class="space-y-2 w-[400px]">
        <div class="flex justify-between text-sm font-medium">
          <span>Progresso do perfil</span>
          <span>{{ value }}%</span>
        </div>
        <Progress :model-value="value" />
        <p class="text-xs text-muted-foreground">Complete seu perfil para desbloquear recursos</p>
      </div>
    `
    })
}

// Upload de arquivo
export const FileUpload: Story = {
    render: () => ({
        components: { Progress },
        setup() {
            const value = ref(0)
            const uploading = ref(false)
            const fileName = ref('documento.pdf')

            const startUpload = () => {
                uploading.value = true
                value.value = 0
                const interval = setInterval(() => {
                    value.value += Math.random() * 15
                    if (value.value >= 100) {
                        value.value = 100
                        uploading.value = false
                        clearInterval(interval)
                    }
                }, 300)
            }

            return { value, uploading, fileName, startUpload }
        },
        template: `
      <div class="space-y-4 w-[400px]">
        <div class="p-4 border rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded flex items-center justify-center text-red-600">
              📄
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ fileName }}</p>
              <p class="text-sm text-muted-foreground">
                {{ uploading ? 'Enviando...' : value >= 100 ? 'Concluído!' : 'Pronto para enviar' }}
              </p>
            </div>
            <span class="text-sm font-medium">{{ Math.round(value) }}%</span>
          </div>
          <Progress :model-value="value" class="mt-3" />
        </div>
        <button 
          @click="startUpload"
          :disabled="uploading"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {{ uploading ? 'Enviando...' : 'Simular Upload' }}
        </button>
      </div>
    `
    })
}

// Múltiplos progresso
export const MultipleTasks: Story = {
    render: () => ({
        components: { Progress },
        template: `
      <div class="space-y-4 w-[400px]">
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Importar contatos</span>
            <span class="text-green-600">✓ Concluído</span>
          </div>
          <Progress :model-value="100" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Processar dados</span>
            <span>78%</span>
          </div>
          <Progress :model-value="78" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Sincronizar CRM</span>
            <span>34%</span>
          </div>
          <Progress :model-value="34" />
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Enviar notificações</span>
            <span class="text-muted-foreground">Aguardando</span>
          </div>
          <Progress :model-value="0" />
        </div>
      </div>
    `
    })
}

// Storage usage
export const StorageUsage: Story = {
    render: () => ({
        components: { Progress, Card, CardContent },
        template: `
      <Card class="w-[350px]">
        <CardContent class="pt-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">Uso de Armazenamento</h3>
              <span class="text-sm text-muted-foreground">7.5 GB / 10 GB</span>
            </div>
            <Progress :model-value="75" />
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-500" />
                <span>Imagens (4.2 GB)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500" />
                <span>Documentos (2.1 GB)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Vídeos (0.8 GB)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-gray-300" />
                <span>Outros (0.4 GB)</span>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              ⚠️ Você está usando 75% do seu espaço. Considere fazer upgrade.
            </p>
          </div>
        </CardContent>
      </Card>
    `
    })
}

// Onboarding steps
export const OnboardingSteps: Story = {
    render: () => ({
        components: { Progress },
        setup() {
            const steps = [
                { label: 'Criar conta', completed: true },
                { label: 'Verificar email', completed: true },
                { label: 'Configurar perfil', completed: true },
                { label: 'Conectar Meta Ads', completed: false },
                { label: 'Criar primeiro projeto', completed: false }
            ]
            const completedCount = steps.filter(s => s.completed).length
            const progress = (completedCount / steps.length) * 100
            return { steps, progress, completedCount }
        },
        template: `
      <div class="space-y-4 w-[400px] p-4 border rounded-lg">
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">Configuração Inicial</h3>
          <span class="text-sm font-medium">{{ completedCount }}/{{ steps.length }}</span>
        </div>
        <Progress :model-value="progress" />
        <ul class="space-y-2">
          <li v-for="step in steps" :key="step.label" class="flex items-center gap-2 text-sm">
            <span v-if="step.completed" class="text-green-600">✓</span>
            <span v-else class="text-muted-foreground">○</span>
            <span :class="step.completed ? 'line-through text-muted-foreground' : ''">
              {{ step.label }}
            </span>
          </li>
        </ul>
      </div>
    `
    })
}

// Animado
export const Animated: Story = {
    render: () => ({
        components: { Progress },
        setup() {
            const value = ref(0)
            setInterval(() => {
                value.value = value.value >= 100 ? 0 : value.value + 1
            }, 50)
            return { value }
        },
        template: `
      <div class="space-y-4 w-[400px]">
        <div class="flex justify-between text-sm">
          <span>Carregando...</span>
          <span>{{ value }}%</span>
        </div>
        <Progress :model-value="value" />
      </div>
    `
    })
}

// Cores customizadas
export const CustomColors: Story = {
    render: () => ({
        components: { Progress },
        template: `
      <div class="space-y-6 w-[400px]">
        <div class="space-y-2">
          <span class="text-sm font-medium">Sucesso (Verde)</span>
          <Progress :model-value="85" class="[&>div]:bg-green-500" />
        </div>
        <div class="space-y-2">
          <span class="text-sm font-medium">Alerta (Amarelo)</span>
          <Progress :model-value="60" class="[&>div]:bg-yellow-500" />
        </div>
        <div class="space-y-2">
          <span class="text-sm font-medium">Perigo (Vermelho)</span>
          <Progress :model-value="90" class="[&>div]:bg-red-500" />
        </div>
        <div class="space-y-2">
          <span class="text-sm font-medium">Info (Azul)</span>
          <Progress :model-value="45" class="[&>div]:bg-blue-500" />
        </div>
      </div>
    `
    })
}

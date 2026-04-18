import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof RadioGroup> = {
    title: 'Atoms/RadioGroup',
    component: RadioGroup,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Grupo de radio buttons para seleção única entre múltiplas opções.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof RadioGroup>

// Default
export const Default: Story = {
    render: () => ({
        components: { RadioGroup, RadioGroupItem, Label },
        setup() {
            const value = ref('option1')
            return { value }
        },
        template: `
      <RadioGroup v-model="value">
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="r1" value="option1" />
          <Label for="r1">Opção 1</Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="r2" value="option2" />
          <Label for="r2">Opção 2</Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="r3" value="option3" />
          <Label for="r3">Opção 3</Label>
        </div>
      </RadioGroup>
    `
    })
}

// Horizontal
export const Horizontal: Story = {
    render: () => ({
        components: { RadioGroup, RadioGroupItem, Label },
        setup() {
            const value = ref('medio')
            return { value }
        },
        template: `
      <RadioGroup v-model="value" class="flex gap-6">
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="h1" value="pequeno" />
          <Label for="h1">Pequeno</Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="h2" value="medio" />
          <Label for="h2">Médio</Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="h3" value="grande" />
          <Label for="h3">Grande</Label>
        </div>
      </RadioGroup>
    `
    })
}

// Com descrições
export const WithDescriptions: Story = {
    render: () => ({
        components: { RadioGroup, RadioGroupItem, Label },
        setup() {
            const value = ref('basic')
            return { value }
        },
        template: `
      <RadioGroup v-model="value" class="space-y-4">
        <div class="flex items-start space-x-3">
          <RadioGroupItem id="basic" value="basic" class="mt-1" />
          <div>
            <Label for="basic" class="font-medium">Plano Basic</Label>
            <p class="text-sm text-muted-foreground">Ideal para começar. Até 100 contatos.</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <RadioGroupItem id="pro" value="pro" class="mt-1" />
          <div>
            <Label for="pro" class="font-medium">Plano Pro</Label>
            <p class="text-sm text-muted-foreground">Para equipes em crescimento. Contatos ilimitados.</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <RadioGroupItem id="enterprise" value="enterprise" class="mt-1" />
          <div>
            <Label for="enterprise" class="font-medium">Enterprise</Label>
            <p class="text-sm text-muted-foreground">Recursos avançados e suporte dedicado.</p>
          </div>
        </div>
      </RadioGroup>
    `
    })
}

// Cartões de seleção
export const SelectionCards: Story = {
    render: () => ({
        components: { RadioGroup, RadioGroupItem, Label },
        setup() {
            const value = ref('monthly')
            return { value }
        },
        template: `
      <RadioGroup v-model="value" class="grid grid-cols-2 gap-4">
        <Label
          for="monthly"
          :class="[
            'flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-accent',
            value === 'monthly' ? 'border-primary bg-accent' : 'border-muted'
          ]"
        >
          <RadioGroupItem id="monthly" value="monthly" class="sr-only" />
          <span class="text-xl font-bold">R$ 49</span>
          <span class="text-sm text-muted-foreground">/mês</span>
          <span class="mt-2 text-xs">Mensal</span>
        </Label>
        <Label
          for="yearly"
          :class="[
            'flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-accent',
            value === 'yearly' ? 'border-primary bg-accent' : 'border-muted'
          ]"
        >
          <RadioGroupItem id="yearly" value="yearly" class="sr-only" />
          <span class="text-xl font-bold">R$ 470</span>
          <span class="text-sm text-muted-foreground">/ano</span>
          <span class="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Economize 20%</span>
        </Label>
      </RadioGroup>
    `
    })
}

// Métodos de pagamento
export const PaymentMethods: Story = {
    render: () => ({
        components: { RadioGroup, RadioGroupItem, Label },
        setup() {
            const value = ref('card')
            return { value }
        },
        template: `
      <RadioGroup v-model="value" class="space-y-3">
        <Label
          for="card"
          :class="[
            'flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent',
            value === 'card' ? 'border-primary ring-1 ring-primary' : ''
          ]"
        >
          <div class="flex items-center gap-3">
            <RadioGroupItem id="card" value="card" />
            <div>
              <span class="font-medium">💳 Cartão de Crédito</span>
              <p class="text-sm text-muted-foreground">Visa, Mastercard, Elo</p>
            </div>
          </div>
        </Label>
        <Label
          for="pix"
          :class="[
            'flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent',
            value === 'pix' ? 'border-primary ring-1 ring-primary' : ''
          ]"
        >
          <div class="flex items-center gap-3">
            <RadioGroupItem id="pix" value="pix" />
            <div>
              <span class="font-medium">🔑 PIX</span>
              <p class="text-sm text-muted-foreground">Pagamento instantâneo</p>
            </div>
          </div>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">5% OFF</span>
        </Label>
        <Label
          for="boleto"
          :class="[
            'flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent',
            value === 'boleto' ? 'border-primary ring-1 ring-primary' : ''
          ]"
        >
          <div class="flex items-center gap-3">
            <RadioGroupItem id="boleto" value="boleto" />
            <div>
              <span class="font-medium">📄 Boleto Bancário</span>
              <p class="text-sm text-muted-foreground">Prazo de 3 dias úteis</p>
            </div>
          </div>
        </Label>
      </RadioGroup>
    `
    })
}

// Prioridades
export const Priorities: Story = {
    render: () => ({
        components: { RadioGroup, RadioGroupItem, Label },
        setup() {
            const value = ref('medium')
            return { value }
        },
        template: `
      <div class="space-y-2">
        <Label class="font-medium">Prioridade do Ticket</Label>
        <RadioGroup v-model="value" class="flex gap-4">
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="low" value="low" />
            <Label for="low" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-green-500" />
              Baixa
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="medium" value="medium" />
            <Label for="medium" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-yellow-500" />
              Média
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="high" value="high" />
            <Label for="high" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-red-500" />
              Alta
            </Label>
          </div>
        </RadioGroup>
      </div>
    `
    })
}

// Disabled
export const Disabled: Story = {
    render: () => ({
        components: { RadioGroup, RadioGroupItem, Label },
        setup() {
            const value = ref('option1')
            return { value }
        },
        template: `
      <RadioGroup v-model="value" disabled>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="d1" value="option1" />
          <Label for="d1" class="opacity-50">Opção 1 (selecionada)</Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="d2" value="option2" />
          <Label for="d2" class="opacity-50">Opção 2</Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="d3" value="option3" />
          <Label for="d3" class="opacity-50">Opção 3</Label>
        </div>
      </RadioGroup>
    `
    })
}

// Formulário
export const InForm: Story = {
    render: () => ({
        components: { RadioGroup, RadioGroupItem, Label },
        setup() {
            const gender = ref('')
            const contact = ref('email')
            return { gender, contact }
        },
        template: `
      <form class="space-y-6 max-w-md">
        <div class="space-y-3">
          <Label class="font-medium">Gênero</Label>
          <RadioGroup v-model="gender" class="flex gap-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="male" value="male" />
              <Label for="male">Masculino</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="female" value="female" />
              <Label for="female">Feminino</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="other" value="other" />
              <Label for="other">Outro</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div class="space-y-3">
          <Label class="font-medium">Preferência de contato</Label>
          <RadioGroup v-model="contact">
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="email-contact" value="email" />
              <Label for="email-contact">E-mail</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="phone-contact" value="phone" />
              <Label for="phone-contact">Telefone</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="whatsapp-contact" value="whatsapp" />
              <Label for="whatsapp-contact">WhatsApp</Label>
            </div>
          </RadioGroup>
        </div>
        
        <p class="text-sm text-muted-foreground">
          Gênero: {{ gender || 'não selecionado' }} | Contato: {{ contact }}
        </p>
      </form>
    `
    })
}

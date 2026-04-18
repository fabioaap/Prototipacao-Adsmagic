import type { Meta, StoryObj } from '@storybook/vue3'
import Radio from '@/components/ui/Radio.vue'
import { ref } from 'vue'

const meta: Meta<typeof Radio> = {
    title: 'Atoms/Radio',
    component: Radio,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Componente de radio button individual que pode ser usado standalone ou dentro de um RadioGroup.'
            }
        }
    },
    argTypes: {
        value: {
            control: 'text',
            description: 'Valor do radio quando selecionado'
        },
        label: {
            control: 'text',
            description: 'Label exibida ao lado do radio'
        },
        disabled: {
            control: 'boolean',
            description: 'Radio desabilitado'
        }
    }
}

export default meta
type Story = StoryObj<typeof Radio>

// Default
export const Default: Story = {
    render: () => ({
        components: { Radio },
        setup() {
            const selected = ref('')
            return { selected }
        },
        template: `
      <div class="space-y-2">
        <Radio v-model="selected" value="option1" label="Opção 1" />
        <Radio v-model="selected" value="option2" label="Opção 2" />
        <Radio v-model="selected" value="option3" label="Opção 3" />
        <p class="text-xs text-muted-foreground mt-2">Selecionado: {{ selected || 'Nenhum' }}</p>
      </div>
    `
    })
}

// Origens de contato
export const ContactOrigins: Story = {
    render: () => ({
        components: { Radio },
        setup() {
            const origin = ref('meta-ads')
            return { origin }
        },
        template: `
      <div>
        <label class="block text-sm font-medium mb-3">Origem do contato</label>
        <div class="space-y-2">
          <Radio v-model="origin" value="meta-ads" label="Meta Ads" />
          <Radio v-model="origin" value="google-ads" label="Google Ads" />
          <Radio v-model="origin" value="indicacao" label="Indicação" />
          <Radio v-model="origin" value="organico" label="Orgânico" />
        </div>
      </div>
    `
    })
}

// Status do contato
export const ContactStatus: Story = {
    render: () => ({
        components: { Radio },
        setup() {
            const status = ref('novo')
            return { status }
        },
        template: `
      <div>
        <label class="block text-sm font-medium mb-3">Status</label>
        <div class="space-y-2">
          <Radio v-model="status" value="novo" label="Novo" />
          <Radio v-model="status" value="em-andamento" label="Em andamento" />
          <Radio v-model="status" value="qualificado" label="Qualificado" />
          <Radio v-model="status" value="convertido" label="Convertido" />
        </div>
      </div>
    `
    })
}

// Período de relatório
export const ReportPeriod: Story = {
    render: () => ({
        components: { Radio },
        setup() {
            const period = ref('7d')
            return { period }
        },
        template: `
      <div>
        <label class="block text-sm font-medium mb-3">Período do relatório</label>
        <div class="flex gap-4">
          <Radio v-model="period" value="7d" label="7 dias" />
          <Radio v-model="period" value="30d" label="30 dias" />
          <Radio v-model="period" value="90d" label="90 dias" />
          <Radio v-model="period" value="custom" label="Personalizado" />
        </div>
      </div>
    `
    })
}

// Desabilitado
export const Disabled: Story = {
    render: () => ({
        components: { Radio },
        setup() {
            const selected = ref('option1')
            return { selected }
        },
        template: `
      <div class="space-y-2">
        <Radio v-model="selected" value="option1" label="Opção disponível" />
        <Radio v-model="selected" value="option2" label="Opção desabilitada" disabled />
        <Radio v-model="selected" value="option3" label="Outra opção desabilitada" disabled />
      </div>
    `
    })
}

// Tipo de atribuição
export const AttributionType: Story = {
    render: () => ({
        components: { Radio },
        setup() {
            const attribution = ref('ultimo-clique')
            return { attribution }
        },
        template: `
      <div class="w-[400px] p-4 border rounded-lg">
        <label class="block text-sm font-medium mb-1">Modelo de atribuição</label>
        <p class="text-xs text-muted-foreground mb-4">
          Como as conversões serão atribuídas aos canais de marketing.
        </p>
        <div class="space-y-3">
          <div class="flex items-start gap-2">
            <Radio v-model="attribution" value="ultimo-clique" />
            <div>
              <span class="text-sm font-medium">Último clique</span>
              <p class="text-xs text-muted-foreground">100% do crédito vai para o último canal antes da conversão.</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <Radio v-model="attribution" value="primeiro-clique" />
            <div>
              <span class="text-sm font-medium">Primeiro clique</span>
              <p class="text-xs text-muted-foreground">100% do crédito vai para o primeiro canal de contato.</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <Radio v-model="attribution" value="linear" />
            <div>
              <span class="text-sm font-medium">Linear</span>
              <p class="text-xs text-muted-foreground">Crédito dividido igualmente entre todos os canais.</p>
            </div>
          </div>
        </div>
      </div>
    `
    })
}

// Forma de pagamento
export const PaymentMethod: Story = {
    render: () => ({
        components: { Radio },
        setup() {
            const payment = ref('cartao')
            return { payment }
        },
        template: `
      <div class="w-[400px]">
        <label class="block text-sm font-medium mb-3">Forma de pagamento</label>
        <div class="space-y-2">
          <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors" :class="payment === 'cartao' && 'border-primary bg-primary/5'">
            <Radio v-model="payment" value="cartao" />
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <span class="text-sm">Cartão de crédito</span>
            </div>
          </label>
          <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors" :class="payment === 'pix' && 'border-primary bg-primary/5'">
            <Radio v-model="payment" value="pix" />
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.71 7.29L12 4.99l2.29 2.3"/><path d="M14.29 16.71L12 19.01l-2.29-2.3"/><path d="M16.71 9.71L19.01 12l-2.3 2.29"/><path d="M7.29 14.29L4.99 12l2.3-2.29"/><circle cx="12" cy="12" r="2"/></svg>
              <span class="text-sm">Pix</span>
            </div>
          </label>
          <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors" :class="payment === 'boleto' && 'border-primary bg-primary/5'">
            <Radio v-model="payment" value="boleto" />
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
              <span class="text-sm">Boleto</span>
            </div>
          </label>
        </div>
      </div>
    `
    })
}

// Prioridade
export const Priority: Story = {
    render: () => ({
        components: { Radio },
        setup() {
            const priority = ref('medium')
            return { priority }
        },
        template: `
      <div>
        <label class="block text-sm font-medium mb-3">Prioridade</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <Radio v-model="priority" value="low" />
            <span class="text-sm text-muted-foreground">Baixa</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <Radio v-model="priority" value="medium" />
            <span class="text-sm text-yellow-600">Média</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <Radio v-model="priority" value="high" />
            <span class="text-sm text-red-600">Alta</span>
          </label>
        </div>
      </div>
    `
    })
}

import type { Meta, StoryObj } from '@storybook/vue3'
import CountrySelect from '@/components/ui/CountrySelect.vue'
import { ref } from 'vue'

/**
 * CountrySelect - Seletor de país com bandeiras e DDI.
 * 
 * Dropdown pesquisável para seleção de país, exibindo
 * bandeira, nome e código DDI.
 */
const meta: Meta<typeof CountrySelect> = {
  title: 'Molecules/CountrySelect',
  component: CountrySelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Seletor de país com busca, bandeiras e códigos DDI.',
      },
    },
  },
  argTypes: {
    modelValue: {
      description: 'País selecionado',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder do campo',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Seletor de país padrão
 */
export const Default: Story = {
  render: () => ({
    components: { CountrySelect },
    setup() {
      const country = ref(null)
      return { country }
    },
    template: `
      <div class="w-[300px]">
        <CountrySelect v-model="country" />
      </div>
    `,
  }),
}

/**
 * Com país selecionado (Brasil)
 */
export const BrasilSelecionado: Story = {
  render: () => ({
    components: { CountrySelect },
    setup() {
      const country = ref({
        code: 'BR',
        name: 'Brazil',
        namePt: 'Brasil',
        flag: '🇧🇷',
        ddi: '+55',
      })
      return { country }
    },
    template: `
      <div class="w-[300px]">
        <CountrySelect v-model="country" />
      </div>
    `,
  }),
}

/**
 * Seletor desabilitado
 */
export const Desabilitado: Story = {
  render: () => ({
    components: { CountrySelect },
    setup() {
      const country = ref({
        code: 'BR',
        name: 'Brazil',
        namePt: 'Brasil',
        flag: '🇧🇷',
        ddi: '+55',
      })
      return { country }
    },
    template: `
      <div class="w-[300px]">
        <CountrySelect v-model="country" disabled />
      </div>
    `,
  }),
}

/**
 * Em formulário de contato
 */
export const EmFormularioContato: Story = {
  render: () => ({
    components: { CountrySelect },
    setup() {
      const country = ref(null)
      return { country }
    },
    template: `
      <div class="w-[400px] p-6 bg-card rounded-lg border space-y-4">
        <h3 class="font-semibold">Novo Contato</h3>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Nome</label>
          <input 
            type="text" 
            class="w-full h-10 rounded-md border px-3 text-sm"
            placeholder="Nome do contato"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">País</label>
            <CountrySelect v-model="country" />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Telefone</label>
            <input 
              type="tel" 
              class="w-full h-10 rounded-md border px-3 text-sm"
              :placeholder="country?.ddi || '+__'"
            />
          </div>
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">E-mail</label>
          <input 
            type="email" 
            class="w-full h-10 rounded-md border px-3 text-sm"
            placeholder="email@exemplo.com"
          />
        </div>
        
        <button class="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
          Salvar Contato
        </button>
      </div>
    `,
  }),
}

/**
 * Em formulário de cadastro
 */
export const EmFormularioCadastro: Story = {
  render: () => ({
    components: { CountrySelect },
    setup() {
      const country = ref(null)
      return { country }
    },
    template: `
      <div class="w-[420px] bg-background rounded-lg shadow-lg border">
        <div class="p-6 border-b text-center">
          <h2 class="text-xl font-semibold">Criar Conta</h2>
          <p class="text-sm text-muted-foreground">
            Preencha seus dados para continuar
          </p>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nome</label>
              <input 
                type="text" 
                class="w-full h-10 rounded-md border px-3 text-sm"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Sobrenome</label>
              <input 
                type="text" 
                class="w-full h-10 rounded-md border px-3 text-sm"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">País</label>
            <CountrySelect v-model="country" />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Telefone</label>
            <div class="flex gap-2">
              <div class="w-20 h-10 rounded-md border flex items-center justify-center text-sm bg-muted">
                {{ country?.ddi || '+__' }}
              </div>
              <input 
                type="tel" 
                class="flex-1 h-10 rounded-md border px-3 text-sm"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">E-mail</label>
            <input 
              type="email" 
              class="w-full h-10 rounded-md border px-3 text-sm"
            />
          </div>
        </div>
        
        <div class="p-6 border-t">
          <button class="w-full bg-primary text-primary-foreground rounded-md py-2.5 text-sm font-medium">
            Continuar
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Em configurações de empresa
 */
export const ConfiguracoesEmpresa: Story = {
  render: () => ({
    components: { CountrySelect },
    setup() {
      const country = ref({
        code: 'BR',
        name: 'Brazil',
        namePt: 'Brasil',
        flag: '🇧🇷',
        ddi: '+55',
      })
      return { country }
    },
    template: `
      <div class="w-[500px] bg-card rounded-lg border">
        <div class="p-4 border-b">
          <h3 class="font-semibold">Dados da Empresa</h3>
        </div>
        
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nome da Empresa</label>
              <input 
                type="text" 
                class="w-full h-10 rounded-md border px-3 text-sm"
                value="Minha Empresa Ltda"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">CNPJ</label>
              <input 
                type="text" 
                class="w-full h-10 rounded-md border px-3 text-sm"
                value="12.345.678/0001-90"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">País</label>
              <CountrySelect v-model="country" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Estado</label>
              <select class="w-full h-10 rounded-md border px-3 text-sm">
                <option>São Paulo</option>
                <option>Rio de Janeiro</option>
                <option>Minas Gerais</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Cidade</label>
            <input 
              type="text" 
              class="w-full h-10 rounded-md border px-3 text-sm"
              value="São Paulo"
            />
          </div>
        </div>
        
        <div class="p-4 border-t flex justify-end gap-2">
          <button class="px-4 py-2 text-sm border rounded-md">Cancelar</button>
          <button class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
            Salvar
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Comparação de estados
 */
export const Estados: Story = {
  render: () => ({
    components: { CountrySelect },
    setup() {
      const empty = ref(null)
      const filled = ref({
        code: 'PT',
        name: 'Portugal',
        namePt: 'Portugal',
        flag: '🇵🇹',
        ddi: '+351',
      })
      const disabled = ref({
        code: 'US',
        name: 'United States',
        namePt: 'Estados Unidos',
        flag: '🇺🇸',
        ddi: '+1',
      })
      return { empty, filled, disabled }
    },
    template: `
      <div class="space-y-6 w-[300px]">
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">Vazio</span>
          <CountrySelect v-model="empty" />
        </div>
        
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">Preenchido</span>
          <CountrySelect v-model="filled" />
        </div>
        
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">Desabilitado</span>
          <CountrySelect v-model="disabled" disabled />
        </div>
      </div>
    `,
  }),
}

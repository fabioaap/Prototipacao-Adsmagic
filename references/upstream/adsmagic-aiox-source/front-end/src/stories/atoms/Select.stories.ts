import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Select from '@/components/ui/Select.vue'
import SelectTrigger from '@/components/ui/SelectTrigger.vue'
import SelectValue from '@/components/ui/SelectValue.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof Select> = {
    title: 'Atoms/Select',
    component: Select,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Select dropdown para seleção de opções. Construído com Radix Vue para acessibilidade.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Select>

// Default
export const Default: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem },
        template: `
      <Select>
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opção 1</SelectItem>
          <SelectItem value="option2">Opção 2</SelectItem>
          <SelectItem value="option3">Opção 3</SelectItem>
        </SelectContent>
      </Select>
    `
    })
}

// Com valor selecionado
export const WithValue: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem },
        setup() {
            const value = ref('option2')
            return { value }
        },
        template: `
      <Select v-model="value">
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opção 1</SelectItem>
          <SelectItem value="option2">Opção 2</SelectItem>
          <SelectItem value="option3">Opção 3</SelectItem>
        </SelectContent>
      </Select>
    `
    })
}

// Disabled
export const Disabled: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem },
        template: `
      <Select disabled>
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Desabilitado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opção 1</SelectItem>
        </SelectContent>
      </Select>
    `
    })
}

// Com Label
export const WithLabel: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label },
        template: `
      <div class="space-y-2">
        <Label for="status">Status</Label>
        <Select>
          <SelectTrigger id="status" class="w-[200px]">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `
    })
}

// Países
export const Countries: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label },
        template: `
      <div class="space-y-2">
        <Label>País</Label>
        <Select>
          <SelectTrigger class="w-[250px]">
            <SelectValue placeholder="Selecione seu país" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="br">🇧🇷 Brasil</SelectItem>
            <SelectItem value="us">🇺🇸 Estados Unidos</SelectItem>
            <SelectItem value="pt">🇵🇹 Portugal</SelectItem>
            <SelectItem value="es">🇪🇸 Espanha</SelectItem>
            <SelectItem value="fr">🇫🇷 França</SelectItem>
            <SelectItem value="de">🇩🇪 Alemanha</SelectItem>
            <SelectItem value="it">🇮🇹 Itália</SelectItem>
            <SelectItem value="jp">🇯🇵 Japão</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `
    })
}

// Prioridades
export const Priorities: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label },
        template: `
      <div class="space-y-2">
        <Label>Prioridade</Label>
        <Select>
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">🟢 Baixa</SelectItem>
            <SelectItem value="medium">🟡 Média</SelectItem>
            <SelectItem value="high">🟠 Alta</SelectItem>
            <SelectItem value="urgent">🔴 Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `
    })
}

// Categorias
export const Categories: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label },
        template: `
      <div class="space-y-2">
        <Label>Categoria</Label>
        <Select>
          <SelectTrigger class="w-[280px]">
            <SelectValue placeholder="Escolha uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tech">💻 Tecnologia</SelectItem>
            <SelectItem value="design">🎨 Design</SelectItem>
            <SelectItem value="marketing">📢 Marketing</SelectItem>
            <SelectItem value="sales">💼 Vendas</SelectItem>
            <SelectItem value="support">🎧 Suporte</SelectItem>
            <SelectItem value="finance">💰 Financeiro</SelectItem>
            <SelectItem value="hr">👥 RH</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `
    })
}

// Formulário completo
export const FormExample: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label },
        template: `
      <form class="space-y-4 max-w-sm">
        <div class="space-y-2">
          <Label>Tipo de Projeto</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Website</SelectItem>
              <SelectItem value="mobile">App Mobile</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="api">API/Backend</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div class="space-y-2">
          <Label>Prazo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1w">1 semana</SelectItem>
              <SelectItem value="2w">2 semanas</SelectItem>
              <SelectItem value="1m">1 mês</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div class="space-y-2">
          <Label>Orçamento</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Faixa de orçamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5k">Até R$ 5.000</SelectItem>
              <SelectItem value="10k">R$ 5.000 - R$ 10.000</SelectItem>
              <SelectItem value="25k">R$ 10.000 - R$ 25.000</SelectItem>
              <SelectItem value="50k">R$ 25.000 - R$ 50.000</SelectItem>
              <SelectItem value="100k">Acima de R$ 50.000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    `
    })
}

// Com erro
export const WithError: Story = {
    render: () => ({
        components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label },
        template: `
      <div class="space-y-2">
        <Label class="text-destructive">Campo obrigatório</Label>
        <Select>
          <SelectTrigger class="w-[200px] border-destructive">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Opção 1</SelectItem>
            <SelectItem value="option2">Opção 2</SelectItem>
          </SelectContent>
        </Select>
        <p class="text-sm text-destructive">Por favor, selecione uma opção.</p>
      </div>
    `
    })
}

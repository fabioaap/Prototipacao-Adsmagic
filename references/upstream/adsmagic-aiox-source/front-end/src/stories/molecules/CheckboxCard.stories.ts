import type { Meta, StoryObj } from '@storybook/vue3'
import CheckboxCard from '@/components/ui/CheckboxCard.vue'
import { ref } from 'vue'

/**
 * CheckboxCard - Card com checkbox para seleção de opções.
 * 
 * Combina visual de card com funcionalidade de checkbox,
 * ideal para seleção de configurações ou preferências.
 */
const meta: Meta<typeof CheckboxCard> = {
  title: 'Molecules/CheckboxCard',
  component: CheckboxCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card clicável com checkbox para seleção de opções.',
      },
    },
  },
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'Estado de seleção',
    },
    title: {
      control: 'text',
      description: 'Título do card',
    },
    description: {
      control: 'text',
      description: 'Descrição do card',
    },
    icon: {
      control: 'text',
      description: 'Ícone a exibir',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * CheckboxCard padrão
 */
export const Default: Story = {
  args: {
    title: 'Meta Ads',
    description: 'Integre sua conta do Meta Ads para rastrear campanhas do Facebook e Instagram.',
    modelValue: false,
  },
  render: (args) => ({
    components: { CheckboxCard },
    setup() {
      const selected = ref(args.modelValue)
      return { selected, args }
    },
    template: `
      <CheckboxCard 
        v-model="selected"
        :title="args.title"
        :description="args.description"
        class="w-[320px]"
      />
    `,
  }),
}

/**
 * Card selecionado
 */
export const Selecionado: Story = {
  args: {
    title: 'Google Ads',
    description: 'Conecte sua conta do Google Ads para importar dados de campanhas.',
    modelValue: true,
  },
  render: (args) => ({
    components: { CheckboxCard },
    setup() {
      const selected = ref(args.modelValue)
      return { selected, args }
    },
    template: `
      <CheckboxCard 
        v-model="selected"
        :title="args.title"
        :description="args.description"
        class="w-[320px]"
      />
    `,
  }),
}

/**
 * Card desabilitado
 */
export const Desabilitado: Story = {
  args: {
    title: 'TikTok Ads',
    description: 'Em breve: integração com TikTok Ads.',
    disabled: true,
  },
  render: (args) => ({
    components: { CheckboxCard },
    setup() {
      const selected = ref(false)
      return { selected, args }
    },
    template: `
      <CheckboxCard 
        v-model="selected"
        :title="args.title"
        :description="args.description"
        :disabled="args.disabled"
        class="w-[320px]"
      />
    `,
  }),
}

/**
 * Seleção de integrações
 */
export const SelecaoIntegracoes: Story = {
  render: () => ({
    components: { CheckboxCard },
    setup() {
      const metaAds = ref(true)
      const googleAds = ref(false)
      const whatsapp = ref(true)
      return { metaAds, googleAds, whatsapp }
    },
    template: `
      <div class="space-y-4 w-[350px]">
        <h3 class="font-semibold">Selecione as integrações</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Escolha quais plataformas deseja conectar
        </p>
        
        <CheckboxCard 
          v-model="metaAds"
          title="Meta Ads"
          description="Facebook e Instagram Ads"
        />
        
        <CheckboxCard 
          v-model="googleAds"
          title="Google Ads"
          description="Campanhas de pesquisa e display"
        />
        
        <CheckboxCard 
          v-model="whatsapp"
          title="WhatsApp Business"
          description="Receba contatos via WhatsApp"
        />
        
        <div class="pt-4 border-t">
          <p class="text-sm text-muted-foreground">
            Selecionados: {{ [metaAds, googleAds, whatsapp].filter(Boolean).length }} de 3
          </p>
        </div>
      </div>
    `,
  }),
}

/**
 * Seleção de origens de contato
 */
export const SelecaoOrigens: Story = {
  render: () => ({
    components: { CheckboxCard },
    setup() {
      const origens = ref({
        site: true,
        whatsapp: true,
        instagram: false,
        telefone: false,
        indicacao: false,
      })
      return { origens }
    },
    template: `
      <div class="w-[400px] bg-card rounded-lg border p-6">
        <h3 class="font-semibold mb-2">Origens de Contato</h3>
        <p class="text-sm text-muted-foreground mb-6">
          Selecione as origens que você utiliza para captar contatos
        </p>
        
        <div class="grid grid-cols-2 gap-3">
          <CheckboxCard 
            v-model="origens.site"
            title="Site"
            description="Formulário do site"
          />
          
          <CheckboxCard 
            v-model="origens.whatsapp"
            title="WhatsApp"
            description="Mensagens diretas"
          />
          
          <CheckboxCard 
            v-model="origens.instagram"
            title="Instagram"
            description="DM e comentários"
          />
          
          <CheckboxCard 
            v-model="origens.telefone"
            title="Telefone"
            description="Ligações recebidas"
          />
        </div>
        
        <button class="w-full mt-6 bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
          Salvar Configurações
        </button>
      </div>
    `,
  }),
}

/**
 * Seleção de notificações
 */
export const SelecaoNotificacoes: Story = {
  render: () => ({
    components: { CheckboxCard },
    setup() {
      const notifs = ref({
        email: true,
        push: true,
        sms: false,
      })
      return { notifs }
    },
    template: `
      <div class="w-[380px] bg-card rounded-lg border p-6">
        <h3 class="font-semibold mb-4">Preferências de Notificação</h3>
        
        <div class="space-y-3">
          <CheckboxCard 
            v-model="notifs.email"
            title="E-mail"
            description="Receba alertas por e-mail"
          />
          
          <CheckboxCard 
            v-model="notifs.push"
            title="Notificações Push"
            description="Alertas no navegador"
          />
          
          <CheckboxCard 
            v-model="notifs.sms"
            title="SMS"
            description="Mensagens de texto (custo adicional)"
            disabled
          />
        </div>
      </div>
    `,
  }),
}

/**
 * Em wizard de configuração
 */
export const EmWizard: Story = {
  render: () => ({
    components: { CheckboxCard },
    setup() {
      const plano = ref({
        basico: false,
        pro: true,
        enterprise: false,
      })
      return { plano }
    },
    template: `
      <div class="w-[500px] bg-background rounded-lg shadow-lg border">
        <div class="p-6 border-b">
          <div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span class="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
            <span>Passo 2 de 4</span>
          </div>
          <h2 class="text-xl font-semibold">Escolha seu plano</h2>
          <p class="text-sm text-muted-foreground mt-1">
            Selecione o plano que melhor atende suas necessidades
          </p>
        </div>
        
        <div class="p-6 space-y-4">
          <CheckboxCard 
            v-model="plano.basico"
            title="Básico"
            description="Até 500 contatos/mês, 1 usuário"
          />
          
          <CheckboxCard 
            v-model="plano.pro"
            title="Profissional"
            description="Até 5.000 contatos/mês, 5 usuários, integrações ilimitadas"
          />
          
          <CheckboxCard 
            v-model="plano.enterprise"
            title="Enterprise"
            description="Contatos ilimitados, usuários ilimitados, suporte dedicado"
          />
        </div>
        
        <div class="p-6 border-t flex justify-between">
          <button class="px-4 py-2 text-sm border rounded-md">
            Voltar
          </button>
          <button class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
            Continuar
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * Estados interativos
 */
export const EstadosInterativos: Story = {
  render: () => ({
    components: { CheckboxCard },
    setup() {
      const states = ref({
        default: false,
        selected: true,
        disabled: false,
      })
      return { states }
    },
    template: `
      <div class="space-y-6">
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">Não selecionado</span>
          <CheckboxCard 
            v-model="states.default"
            title="Opção A"
            description="Clique para selecionar esta opção"
            class="w-[300px]"
          />
        </div>
        
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">Selecionado</span>
          <CheckboxCard 
            v-model="states.selected"
            title="Opção B"
            description="Esta opção está selecionada"
            class="w-[300px]"
          />
        </div>
        
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">Desabilitado</span>
          <CheckboxCard 
            v-model="states.disabled"
            title="Opção C"
            description="Esta opção não está disponível"
            disabled
            class="w-[300px]"
          />
        </div>
      </div>
    `,
  }),
}

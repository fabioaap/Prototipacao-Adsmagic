import type { Meta, StoryObj } from '@storybook/vue3'
import WhatsAppStatus from '@/components/ui/WhatsAppStatus.vue'

/**
 * WhatsAppStatus - Indicador de status da conexão WhatsApp.
 * 
 * Exibe o estado da integração com WhatsApp Business,
 * permitindo conectar ou desconectar.
 */
const meta: Meta<typeof WhatsAppStatus> = {
  title: 'Molecules/WhatsAppStatus',
  component: WhatsAppStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Botão com dropdown mostrando status da conexão WhatsApp.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Status desconectado (padrão)
 */
export const Default: Story = {
  render: () => ({
    components: { WhatsAppStatus },
    template: `
      <div class="min-h-[200px] flex items-start justify-center pt-8">
        <WhatsAppStatus />
      </div>
    `,
  }),
}

/**
 * No header da aplicação
 */
export const NoHeader: Story = {
  render: () => ({
    components: { WhatsAppStatus },
    template: `
      <div class="min-h-[200px]">
        <div class="w-full border-b bg-background">
          <div class="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span class="font-semibold">AdsMagic</span>
            </div>
            
            <div class="flex items-center gap-3">
              <WhatsAppStatus />
              <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span class="text-sm">JS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Em barra de ferramentas
 */
export const EmToolbar: Story = {
  render: () => ({
    components: { WhatsAppStatus },
    template: `
      <div class="min-h-[200px]">
        <div class="w-full max-w-3xl p-4 bg-muted/50 rounded-lg">
          <div class="flex items-center gap-3">
            <button class="px-3 py-1.5 text-sm border rounded-md bg-card">
              Meta Ads
            </button>
            <button class="px-3 py-1.5 text-sm border rounded-md bg-card">
              Google Ads
            </button>
            <WhatsAppStatus />
            <div class="flex-1"></div>
            <button class="px-3 py-1.5 text-sm text-primary hover:underline">
              + Nova Integração
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Card de integrações
 */
export const CardIntegracoes: Story = {
  render: () => ({
    components: { WhatsAppStatus },
    template: `
      <div class="w-[400px] bg-card rounded-lg border">
        <div class="p-4 border-b">
          <h3 class="font-semibold">Canais de Contato</h3>
          <p class="text-sm text-muted-foreground">
            Gerencie suas integrações de comunicação
          </p>
        </div>
        
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" class="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
              </div>
              <div>
                <span class="font-medium text-sm">WhatsApp</span>
                <p class="text-xs text-muted-foreground">Receba leads via WhatsApp</p>
              </div>
            </div>
            <WhatsAppStatus />
          </div>
          
          <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg opacity-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-sm">IG</span>
              </div>
              <div>
                <span class="font-medium text-sm">Instagram</span>
                <p class="text-xs text-muted-foreground">Em breve</p>
              </div>
            </div>
            <span class="text-xs bg-muted px-2 py-1 rounded">Em breve</span>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * Estados visuais
 */
export const Estados: Story = {
  render: () => ({
    components: { WhatsAppStatus },
    template: `
      <div class="space-y-6">
        <div class="space-y-2">
          <span class="text-xs text-muted-foreground uppercase tracking-wider">
            Desconectado
          </span>
          <WhatsAppStatus />
        </div>
        
        <div class="p-4 bg-muted/30 rounded-lg">
          <p class="text-sm text-muted-foreground mb-2">
            Nota: O componente tem apenas estado visual para "Desconectado" como padrão.
            O estado "Conectado" é gerenciado internamente quando o usuário conecta.
          </p>
        </div>
      </div>
    `,
  }),
}

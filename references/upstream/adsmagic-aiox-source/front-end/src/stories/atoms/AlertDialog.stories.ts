import type { Meta, StoryObj } from '@storybook/vue3'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import Button from '@/components/ui/Button.vue'

const meta: Meta<typeof AlertDialog> = {
  title: 'Atoms/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Diálogo modal de alerta para ações importantes que requerem confirmação do usuário.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof AlertDialog>

// Default - Excluir contato
export const Default: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <Button variant="destructive" @click="open = true">Excluir Contato</Button>
        <AlertDialog
          v-model="open"
          title="Excluir contato?"
          description="Esta ação não pode ser desfeita. O contato será permanentemente removido do sistema junto com todo seu histórico de interações."
          variant="destructive"
          confirm-text="Excluir"
          cancel-text="Cancelar"
          @confirm="open = false"
          @cancel="open = false"
        />
      </div>
    `
  })
}

// Desconectar integração
export const DisconnectIntegration: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <Button variant="outline" @click="open = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          Desconectar
        </Button>
        <AlertDialog
          v-model="open"
          title="Desconectar Meta Ads?"
          description="Ao desconectar, o AdsMagic deixará de receber dados de conversão desta conta. Campanhas ativas não serão afetadas, mas a atribuição de novas vendas será interrompida."
          variant="destructive"
          confirm-text="Desconectar"
          cancel-text="Cancelar"
          @confirm="open = false"
          @cancel="open = false"
        />
      </div>
    `
  })
}

// Arquivar projeto
export const ArchiveProject: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <Button variant="outline" @click="open = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m3 3 18 18"/><path d="M10.5 10.677a2 2 0 0 0 2.823 2.823"/><path d="M13.36 17.002a4 4 0 0 0-5.412-5.88"/><path d="M17.994 13.41a4 4 0 0 0-1.587-4.773"/><path d="M21 21H3"/><path d="M21 17a9 9 0 0 0-17.977-.898"/></svg>
          Arquivar Projeto
        </Button>
        <AlertDialog
          v-model="open"
          title="Arquivar Loja Virtual Fashion?"
          description="O projeto será movido para a lista de arquivados. Você poderá restaurá-lo a qualquer momento. Os dados de contatos e vendas serão preservados."
          variant="warning"
          confirm-text="Arquivar"
          cancel-text="Cancelar"
          @confirm="open = false"
          @cancel="open = false"
        />
      </div>
    `
  })
}

// Sair sem salvar
export const UnsavedChanges: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <Button variant="ghost" @click="open = true">← Voltar</Button>
        <AlertDialog
          v-model="open"
          title="Alterações não salvas"
          description="Você tem alterações não salvas neste formulário. Se sair agora, todas as informações inseridas serão perdidas."
          variant="warning"
          confirm-text="Descartar alterações"
          cancel-text="Continuar editando"
          @confirm="open = false"
          @cancel="open = false"
        />
      </div>
    `
  })
}

// Excluir em massa
export const BulkDelete: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <Button variant="destructive" @click="open = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          Excluir 15 selecionados
        </Button>
        <AlertDialog
          v-model="open"
          title="Excluir 15 contatos?"
          description="Esta ação não pode ser desfeita. Os seguintes dados serão removidos permanentemente: 15 registros de contatos, histórico de interações associado e atribuições de vendas vinculadas."
          variant="destructive"
          confirm-text="Excluir 15 contatos"
          cancel-text="Cancelar"
          @confirm="open = false"
          @cancel="open = false"
        />
      </div>
    `
  })
}

// Confirmar pagamento
export const ConfirmPayment: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <Button @click="open = true">Confirmar Assinatura</Button>
        <AlertDialog
          v-model="open"
          title="Confirmar assinatura Pro?"
          description="Você está prestes a assinar o plano Pro (R$ 197,00/mês). A cobrança será feita imediatamente no cartão terminando em **4242. Você pode cancelar a qualquer momento."
          variant="warning"
          confirm-text="Confirmar Pagamento"
          cancel-text="Cancelar"
          @confirm="open = false"
          @cancel="open = false"
        />
      </div>
    `
  })
}

// Logout
export const Logout: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <Button variant="ghost" class="text-destructive hover:text-destructive" @click="open = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sair
        </Button>
        <AlertDialog
          v-model="open"
          title="Sair da conta?"
          description="Você será desconectado do AdsMagic. Certifique-se de que salvou todas as alterações antes de sair."
          variant="destructive"
          confirm-text="Sair"
          cancel-text="Cancelar"
          @confirm="open = false"
          @cancel="open = false"
        />
      </div>
    `
  })
}

// Com ícone de aviso
export const WithWarningIcon: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <Button variant="destructive" @click="open = true">Resetar dados</Button>
        <AlertDialog
          v-model="open"
          title="Ação irreversível"
          description="Você está prestes a resetar todos os dados de teste. Esta ação apagará permanentemente todos os contatos, vendas e integrações do ambiente de desenvolvimento."
          variant="destructive"
          confirm-text="Resetar tudo"
          cancel-text="Cancelar"
          @confirm="open = false"
          @cancel="open = false"
        />
      </div>
    `
  })
}

// Com loading
export const WithLoading: Story = {
  render: () => ({
    components: { AlertDialog, Button },
    data() {
      return {
        open: false,
        loading: false
      }
    },
    methods: {
      async handleConfirm() {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.open = false
        }, 2000)
      }
    },
    template: `
      <div>
        <Button variant="destructive" @click="open = true">Processar</Button>
        <AlertDialog
          v-model="open"
          title="Confirmar processamento?"
          description="Esta operação pode levar alguns segundos. Aguarde até que seja concluída."
          variant="warning"
          confirm-text="Processar"
          cancel-text="Cancelar"
          :loading="loading"
          @confirm="handleConfirm"
          @cancel="open = false"
        />
      </div>
    `
  })
}

import type { Meta, StoryObj } from '@storybook/vue3'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import Button from '@/components/ui/Button.vue'

const meta: Meta<typeof DropdownMenu> = {
    title: 'Atoms/DropdownMenu',
    component: DropdownMenu,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Menu dropdown para exibir lista de ações ou opções contextuais.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof DropdownMenu>

// Default
export const Default: Story = {
    render: () => ({
        components: { DropdownMenu, Button },
        setup() {
            const items = [
                { label: 'Editar', action: () => console.log('Editar') },
                { label: 'Duplicar', action: () => console.log('Duplicar') },
                { label: 'Excluir', action: () => console.log('Excluir'), destructive: true }
            ]
            return { items }
        },
        template: `
      <DropdownMenu :items="items">
        <template #trigger>
          <Button variant="outline">Opções</Button>
        </template>
      </DropdownMenu>
    `
    })
}

// Ações de contato
export const ContactActions: Story = {
    render: () => ({
        components: { DropdownMenu, Button },
        setup() {
            const items = [
                { label: '👤 Ver perfil', action: () => { } },
                { label: '✏️ Editar contato', action: () => { } },
                { label: '📧 Enviar email', action: () => { } },
                { label: '📱 WhatsApp', action: () => { } },
                { label: '🏷️ Adicionar tag', action: () => { } },
                { divider: true },
                { label: '📁 Arquivar', action: () => { } },
                { label: '🗑️ Excluir', action: () => { }, destructive: true }
            ]
            return { items }
        },
        template: `
      <DropdownMenu :items="items">
        <template #trigger>
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </Button>
        </template>
      </DropdownMenu>
    `
    })
}

// Ações de projeto
export const ProjectActions: Story = {
    render: () => ({
        components: { DropdownMenu, Button },
        setup() {
            const items = [
                { label: '📊 Ver dashboard', action: () => { } },
                { label: '⚙️ Configurações', action: () => { } },
                { label: '👥 Gerenciar equipe', action: () => { } },
                { label: '📤 Exportar dados', action: () => { } },
                { divider: true },
                { label: '📋 Duplicar projeto', action: () => { } },
                { label: '📁 Arquivar', action: () => { } },
                { label: '🗑️ Excluir projeto', action: () => { }, destructive: true }
            ]
            return { items }
        },
        template: `
      <DropdownMenu :items="items">
        <template #trigger>
          <Button variant="outline">
            Ações do Projeto
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="m6 9 6 6 6-6"/></svg>
          </Button>
        </template>
      </DropdownMenu>
    `
    })
}

// Menu de usuário
export const UserMenu: Story = {
    render: () => ({
        components: { DropdownMenu },
        setup() {
            const items = [
                { label: '👤 Meu perfil', action: () => { } },
                { label: '⚙️ Configurações', action: () => { } },
                { label: '💳 Faturamento', action: () => { } },
                { label: '🏢 Trocar empresa', action: () => { } },
                { divider: true },
                { label: '📚 Documentação', action: () => { } },
                { label: '💬 Suporte', action: () => { } },
                { divider: true },
                { label: '🚪 Sair', action: () => { }, destructive: true }
            ]
            return { items }
        },
        template: `
      <DropdownMenu :items="items" align="end">
        <template #trigger>
          <button class="flex items-center gap-2 p-1 rounded-full hover:bg-muted">
            <div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-medium text-sm">
              JS
            </div>
          </button>
        </template>
      </DropdownMenu>
    `
    })
}

// Exportar
export const ExportMenu: Story = {
    render: () => ({
        components: { DropdownMenu, Button },
        setup() {
            const items = [
                { label: '📊 Excel (.xlsx)', action: () => { } },
                { label: '📄 CSV (.csv)', action: () => { } },
                { label: '📑 PDF', action: () => { } },
                { divider: true },
                { label: '📧 Enviar por email', action: () => { } },
                { label: '🔗 Gerar link', action: () => { } }
            ]
            return { items }
        },
        template: `
      <DropdownMenu :items="items">
        <template #trigger>
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar
          </Button>
        </template>
      </DropdownMenu>
    `
    })
}

// Filtros rápidos
export const QuickFilters: Story = {
    render: () => ({
        components: { DropdownMenu, Button },
        setup() {
            const items = [
                { label: 'Todos', action: () => { }, selected: true },
                { label: 'Ativos', action: () => { } },
                { label: 'Pendentes', action: () => { } },
                { label: 'Inativos', action: () => { } },
                { divider: true },
                { label: 'Personalizados...', action: () => { } }
            ]
            return { items }
        },
        template: `
      <DropdownMenu :items="items">
        <template #trigger>
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtrar: Todos
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="m6 9 6 6 6-6"/></svg>
          </Button>
        </template>
      </DropdownMenu>
    `
    })
}

// Ações em lote
export const BulkActions: Story = {
    render: () => ({
        components: { DropdownMenu, Button },
        setup() {
            const items = [
                { label: '✏️ Editar selecionados', action: () => { } },
                { label: '🏷️ Adicionar tags', action: () => { } },
                { label: '📤 Exportar', action: () => { } },
                { label: '📧 Enviar email', action: () => { } },
                { divider: true },
                { label: '📁 Arquivar', action: () => { } },
                { label: '🗑️ Excluir selecionados', action: () => { }, destructive: true }
            ]
            return { items }
        },
        template: `
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <span class="text-sm font-medium text-blue-800">
          12 itens selecionados
        </span>
        <div class="flex gap-2">
          <Button variant="outline" size="sm">Limpar seleção</Button>
          <DropdownMenu :items="items">
            <template #trigger>
              <Button size="sm">
                Ações
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="m6 9 6 6 6-6"/></svg>
              </Button>
            </template>
          </DropdownMenu>
        </div>
      </div>
    `
    })
}

// Com ícones inline
export const WithInlineIcons: Story = {
    render: () => ({
        components: { DropdownMenu, Button },
        setup() {
            const items = [
                {
                    label: 'Novo contato',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',
                    action: () => { }
                },
                {
                    label: 'Nova venda',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
                    action: () => { }
                },
                {
                    label: 'Novo projeto',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
                    action: () => { }
                }
            ]
            return { items }
        },
        template: `
      <DropdownMenu :items="items">
        <template #trigger>
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Criar novo
          </Button>
        </template>
      </DropdownMenu>
    `
    })
}

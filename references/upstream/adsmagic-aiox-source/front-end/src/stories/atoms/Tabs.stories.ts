import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const meta: Meta<typeof Tabs> = {
    title: 'Atoms/Tabs',
    component: Tabs,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Componente de abas para organizar conteúdo em seções navegáveis.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof Tabs>

// Default
export const Default: Story = {
    render: () => ({
        components: { Tabs, TabsList, TabsTrigger, TabsContent },
        template: `
      <Tabs default-value="tab1" class="w-[400px]">
        <TabsList>
          <TabsTrigger value="tab1">Aba 1</TabsTrigger>
          <TabsTrigger value="tab2">Aba 2</TabsTrigger>
          <TabsTrigger value="tab3">Aba 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" class="p-4">
          <p>Conteúdo da primeira aba.</p>
        </TabsContent>
        <TabsContent value="tab2" class="p-4">
          <p>Conteúdo da segunda aba.</p>
        </TabsContent>
        <TabsContent value="tab3" class="p-4">
          <p>Conteúdo da terceira aba.</p>
        </TabsContent>
      </Tabs>
    `
    })
}

// Conta e configurações
export const AccountSettings: Story = {
    render: () => ({
        components: { Tabs, TabsList, TabsTrigger, TabsContent, Card, CardHeader, CardTitle, CardContent, Button, Input, Label },
        template: `
      <Tabs default-value="account" class="w-[500px]">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="password">Senha</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="name">Nome</Label>
                <Input id="name" value="João Silva" />
              </div>
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input id="email" value="joao@empresa.com" />
              </div>
              <Button>Salvar alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Senha</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="current">Senha atual</Label>
                <Input id="current" type="password" />
              </div>
              <div class="space-y-2">
                <Label for="new">Nova senha</Label>
                <Input id="new" type="password" />
              </div>
              <Button>Atualizar senha</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    `
    })
}

// Dashboard tabs
export const DashboardTabs: Story = {
    render: () => ({
        components: { Tabs, TabsList, TabsTrigger, TabsContent },
        template: `
      <Tabs default-value="overview" class="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" class="p-4 border rounded-lg mt-4">
          <h3 class="font-semibold mb-2">Visão Geral</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="p-4 bg-muted rounded-lg">
              <p class="text-sm text-muted-foreground">Contatos</p>
              <p class="text-2xl font-bold">1,234</p>
            </div>
            <div class="p-4 bg-muted rounded-lg">
              <p class="text-sm text-muted-foreground">Vendas</p>
              <p class="text-2xl font-bold">R$ 45.231</p>
            </div>
            <div class="p-4 bg-muted rounded-lg">
              <p class="text-sm text-muted-foreground">Conversão</p>
              <p class="text-2xl font-bold">3.2%</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="analytics" class="p-4 border rounded-lg mt-4">
          <h3 class="font-semibold mb-2">Análises</h3>
          <p class="text-muted-foreground">Gráficos e métricas detalhadas.</p>
        </TabsContent>
        <TabsContent value="reports" class="p-4 border rounded-lg mt-4">
          <h3 class="font-semibold mb-2">Relatórios</h3>
          <p class="text-muted-foreground">Relatórios disponíveis para download.</p>
        </TabsContent>
        <TabsContent value="notifications" class="p-4 border rounded-lg mt-4">
          <h3 class="font-semibold mb-2">Notificações</h3>
          <p class="text-muted-foreground">Configure suas preferências de notificação.</p>
        </TabsContent>
      </Tabs>
    `
    })
}

// Com ícones
export const WithIcons: Story = {
    render: () => ({
        components: { Tabs, TabsList, TabsTrigger, TabsContent },
        template: `
      <Tabs default-value="general" class="w-[500px]">
        <TabsList class="w-full">
          <TabsTrigger value="general" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Geral
          </TabsTrigger>
          <TabsTrigger value="integrations" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
            Integrações
          </TabsTrigger>
          <TabsTrigger value="billing" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Faturamento
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" class="mt-4 p-4 border rounded-lg">
          <h3 class="font-medium mb-2">Configurações Gerais</h3>
          <p class="text-sm text-muted-foreground">Configure preferências básicas da conta.</p>
        </TabsContent>
        <TabsContent value="integrations" class="mt-4 p-4 border rounded-lg">
          <h3 class="font-medium mb-2">Integrações</h3>
          <p class="text-sm text-muted-foreground">Gerencie conexões com serviços externos.</p>
        </TabsContent>
        <TabsContent value="billing" class="mt-4 p-4 border rounded-lg">
          <h3 class="font-medium mb-2">Faturamento</h3>
          <p class="text-sm text-muted-foreground">Visualize e gerencie seu plano.</p>
        </TabsContent>
      </Tabs>
    `
    })
}

// Vertical
export const Vertical: Story = {
    render: () => ({
        components: { Tabs, TabsList, TabsTrigger, TabsContent },
        template: `
      <Tabs default-value="profile" orientation="vertical" class="flex gap-4 w-full">
        <TabsList class="flex-col h-auto w-48">
          <TabsTrigger value="profile" class="w-full justify-start">Perfil</TabsTrigger>
          <TabsTrigger value="notifications" class="w-full justify-start">Notificações</TabsTrigger>
          <TabsTrigger value="security" class="w-full justify-start">Segurança</TabsTrigger>
          <TabsTrigger value="billing" class="w-full justify-start">Faturamento</TabsTrigger>
          <TabsTrigger value="team" class="w-full justify-start">Equipe</TabsTrigger>
        </TabsList>
        <div class="flex-1">
          <TabsContent value="profile" class="mt-0 p-4 border rounded-lg">
            <h3 class="font-medium mb-2">Perfil</h3>
            <p class="text-sm text-muted-foreground">Gerencie suas informações pessoais.</p>
          </TabsContent>
          <TabsContent value="notifications" class="mt-0 p-4 border rounded-lg">
            <h3 class="font-medium mb-2">Notificações</h3>
            <p class="text-sm text-muted-foreground">Configure como receber notificações.</p>
          </TabsContent>
          <TabsContent value="security" class="mt-0 p-4 border rounded-lg">
            <h3 class="font-medium mb-2">Segurança</h3>
            <p class="text-sm text-muted-foreground">Gerencie senha e autenticação.</p>
          </TabsContent>
          <TabsContent value="billing" class="mt-0 p-4 border rounded-lg">
            <h3 class="font-medium mb-2">Faturamento</h3>
            <p class="text-sm text-muted-foreground">Visualize faturas e métodos de pagamento.</p>
          </TabsContent>
          <TabsContent value="team" class="mt-0 p-4 border rounded-lg">
            <h3 class="font-medium mb-2">Equipe</h3>
            <p class="text-sm text-muted-foreground">Gerencie membros da equipe.</p>
          </TabsContent>
        </div>
      </Tabs>
    `
    })
}

// Integrações
export const Integrations: Story = {
    render: () => ({
        components: { Tabs, TabsList, TabsTrigger, TabsContent, Button },
        template: `
      <Tabs default-value="connected" class="w-full">
        <TabsList>
          <TabsTrigger value="connected">Conectadas (2)</TabsTrigger>
          <TabsTrigger value="available">Disponíveis (5)</TabsTrigger>
        </TabsList>
        <TabsContent value="connected" class="mt-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">f</div>
                <div>
                  <p class="font-medium">Meta Ads</p>
                  <p class="text-sm text-muted-foreground">Última sync: há 5 min</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Gerenciar</Button>
            </div>
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
                <div>
                  <p class="font-medium">WhatsApp</p>
                  <p class="text-sm text-muted-foreground">Última sync: há 1 hora</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Gerenciar</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="available" class="mt-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
                <div>
                  <p class="font-medium">Google Ads</p>
                  <p class="text-sm text-muted-foreground">Importe campanhas do Google</p>
                </div>
              </div>
              <Button size="sm">Conectar</Button>
            </div>
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
                <div>
                  <p class="font-medium">HubSpot</p>
                  <p class="text-sm text-muted-foreground">Sincronize com seu CRM</p>
                </div>
              </div>
              <Button size="sm">Conectar</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    `
    })
}

// Com badges
export const WithBadges: Story = {
    render: () => ({
        components: { Tabs, TabsList, TabsTrigger, TabsContent },
        template: `
      <Tabs default-value="all" class="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Todos
            <span class="ml-2 px-1.5 py-0.5 bg-muted text-xs rounded">42</span>
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativos
            <span class="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">35</span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes
            <span class="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">5</span>
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inativos
            <span class="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">2</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" class="mt-4 p-4 border rounded-lg">
          Exibindo todos os 42 itens...
        </TabsContent>
        <TabsContent value="active" class="mt-4 p-4 border rounded-lg">
          Exibindo 35 itens ativos...
        </TabsContent>
        <TabsContent value="pending" class="mt-4 p-4 border rounded-lg">
          Exibindo 5 itens pendentes...
        </TabsContent>
        <TabsContent value="inactive" class="mt-4 p-4 border rounded-lg">
          Exibindo 2 itens inativos...
        </TabsContent>
      </Tabs>
    `
    })
}

// Disabled tab
export const DisabledTab: Story = {
    render: () => ({
        components: { Tabs, TabsList, TabsTrigger, TabsContent },
        template: `
      <Tabs default-value="tab1" class="w-[400px]">
        <TabsList>
          <TabsTrigger value="tab1">Ativa</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Desabilitada</TabsTrigger>
          <TabsTrigger value="tab3">Outra ativa</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" class="p-4">
          <p>Esta aba está ativa e acessível.</p>
        </TabsContent>
        <TabsContent value="tab2" class="p-4">
          <p>Você não deveria ver isso.</p>
        </TabsContent>
        <TabsContent value="tab3" class="p-4">
          <p>Esta aba também está acessível.</p>
        </TabsContent>
      </Tabs>
    `
    })
}

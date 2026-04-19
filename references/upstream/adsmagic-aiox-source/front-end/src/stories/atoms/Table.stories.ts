import type { Meta, StoryObj } from '@storybook/vue3'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Avatar from '@/components/ui/Avatar.vue'

const meta: Meta<typeof Table> = {
  title: 'Atoms/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente de tabela para exibir dados tabulares de forma organizada.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof Table>

// Default
export const Default: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell },
    template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>João Silva</TableCell>
            <TableCell>joao@email.com</TableCell>
            <TableCell>(11) 99999-9999</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Maria Santos</TableCell>
            <TableCell>maria@email.com</TableCell>
            <TableCell>(11) 88888-8888</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Pedro Costa</TableCell>
            <TableCell>pedro@email.com</TableCell>
            <TableCell>(11) 77777-7777</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

// Contatos
export const ContactsTable: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Avatar, AvatarFallback },
    setup() {
      const contacts = [
        { name: 'João Silva', email: 'joao@email.com', origin: 'Meta Ads', stage: 'Qualificado', date: '15/01/2025' },
        { name: 'Maria Santos', email: 'maria@email.com', origin: 'Google Ads', stage: 'Novo', date: '14/01/2025' },
        { name: 'Pedro Costa', email: 'pedro@email.com', origin: 'Orgânico', stage: 'Convertido', date: '13/01/2025' },
        { name: 'Ana Oliveira', email: 'ana@email.com', origin: 'Meta Ads', stage: 'Em negociação', date: '12/01/2025' }
      ]
      return { contacts }
    },
    template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[250px]">Contato</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead>Data</TableHead>
            <TableHead class="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="contact in contacts" :key="contact.email">
            <TableCell>
              <div class="flex items-center gap-3">
                <Avatar class="h-8 w-8">
                  <AvatarFallback>{{ contact.name.split(' ').map(n => n[0]).join('') }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-medium">{{ contact.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ contact.email }}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{{ contact.origin }}</TableCell>
            <TableCell>
              <Badge :variant="contact.stage === 'Convertido' ? 'default' : 'secondary'">
                {{ contact.stage }}
              </Badge>
            </TableCell>
            <TableCell>{{ contact.date }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="sm">Ver</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

// Com seleção
export const WithSelection: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Checkbox },
    setup() {
      const items = [
        { id: 1, name: 'Item 1', status: 'Ativo', price: 'R$ 100' },
        { id: 2, name: 'Item 2', status: 'Ativo', price: 'R$ 200' },
        { id: 3, name: 'Item 3', status: 'Inativo', price: 'R$ 150' },
        { id: 4, name: 'Item 4', status: 'Ativo', price: 'R$ 300' }
      ]
      return { items }
    },
    template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Preço</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in items" :key="item.id">
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell class="font-medium">{{ item.name }}</TableCell>
            <TableCell>{{ item.status }}</TableCell>
            <TableCell class="text-right">{{ item.price }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

// Vendas
export const SalesTable: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge },
    setup() {
      const sales = [
        { id: '#001', customer: 'João Silva', value: 'R$ 450,00', origin: 'Meta Ads', date: '15/01/2025', status: 'Pago' },
        { id: '#002', customer: 'Maria Santos', value: 'R$ 1.200,00', origin: 'Google Ads', date: '14/01/2025', status: 'Pago' },
        { id: '#003', customer: 'Pedro Costa', value: 'R$ 89,90', origin: 'Orgânico', date: '13/01/2025', status: 'Pendente' },
        { id: '#004', customer: 'Ana Oliveira', value: 'R$ 2.500,00', origin: 'Meta Ads', date: '12/01/2025', status: 'Pago' },
        { id: '#005', customer: 'Carlos Mendes', value: 'R$ 350,00', origin: 'WhatsApp', date: '11/01/2025', status: 'Cancelado' }
      ]
      return { sales }
    },
    template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="sale in sales" :key="sale.id">
            <TableCell class="font-medium">{{ sale.id }}</TableCell>
            <TableCell>{{ sale.customer }}</TableCell>
            <TableCell class="font-medium">{{ sale.value }}</TableCell>
            <TableCell>{{ sale.origin }}</TableCell>
            <TableCell>{{ sale.date }}</TableCell>
            <TableCell>
              <Badge 
                :variant="sale.status === 'Pago' ? 'default' : sale.status === 'Pendente' ? 'secondary' : 'destructive'"
              >
                {{ sale.status }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

// Projetos
export const ProjectsTable: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button },
    setup() {
      const projects = [
        { name: 'Loja Online', contacts: 1234, sales: 45231, conversion: '3.2%', status: 'Ativo' },
        { name: 'App Delivery', contacts: 892, sales: 28450, conversion: '4.1%', status: 'Ativo' },
        { name: 'Curso Digital', contacts: 2341, sales: 89000, conversion: '2.8%', status: 'Pausado' },
        { name: 'SaaS B2B', contacts: 156, sales: 156000, conversion: '8.5%', status: 'Ativo' }
      ]
      return { projects }
    },
    template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projeto</TableHead>
            <TableHead class="text-right">Contatos</TableHead>
            <TableHead class="text-right">Vendas</TableHead>
            <TableHead class="text-right">Conversão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="project in projects" :key="project.name">
            <TableCell class="font-medium">{{ project.name }}</TableCell>
            <TableCell class="text-right">{{ project.contacts.toLocaleString() }}</TableCell>
            <TableCell class="text-right font-medium">R$ {{ project.sales.toLocaleString() }}</TableCell>
            <TableCell class="text-right">{{ project.conversion }}</TableCell>
            <TableCell>
              <Badge :variant="project.status === 'Ativo' ? 'default' : 'secondary'">
                {{ project.status }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="sm">Acessar</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

// Striped
export const Striped: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell },
    setup() {
      const data = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        value: `R$ ${(Math.random() * 1000).toFixed(2)}`,
        date: new Date(2025, 0, 15 - i).toLocaleDateString('pt-BR')
      }))
      return { data }
    },
    template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow 
            v-for="(item, index) in data" 
            :key="item.id"
            :class="index % 2 === 0 ? 'bg-muted/50' : ''"
          >
            <TableCell>{{ item.id }}</TableCell>
            <TableCell>{{ item.name }}</TableCell>
            <TableCell>{{ item.value }}</TableCell>
            <TableCell>{{ item.date }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

// Compacta
export const Compact: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell },
    template: `
      <Table class="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead class="py-2">Origem</TableHead>
            <TableHead class="py-2 text-right">Contatos</TableHead>
            <TableHead class="py-2 text-right">Vendas</TableHead>
            <TableHead class="py-2 text-right">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="py-2">Meta Ads</TableCell>
            <TableCell class="py-2 text-right">523</TableCell>
            <TableCell class="py-2 text-right">R$ 12.450</TableCell>
            <TableCell class="py-2 text-right text-green-600">+12%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="py-2">Google Ads</TableCell>
            <TableCell class="py-2 text-right">312</TableCell>
            <TableCell class="py-2 text-right">R$ 8.900</TableCell>
            <TableCell class="py-2 text-right text-green-600">+8%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="py-2">Orgânico</TableCell>
            <TableCell class="py-2 text-right">198</TableCell>
            <TableCell class="py-2 text-right">R$ 5.200</TableCell>
            <TableCell class="py-2 text-right text-red-600">-3%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="py-2">WhatsApp</TableCell>
            <TableCell class="py-2 text-right">87</TableCell>
            <TableCell class="py-2 text-right">R$ 2.100</TableCell>
            <TableCell class="py-2 text-right text-green-600">+25%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

// Vazia
export const Empty: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button },
    template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colspan="3" class="h-32 text-center">
              <div class="flex flex-col items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <p>Nenhum contato encontrado</p>
                <Button size="sm">Adicionar contato</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

// Loading
export const Loading: Story = {
  render: () => ({
    components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell },
    template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="i in 4" :key="i">
            <TableCell>
              <div class="h-4 w-32 bg-muted rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div class="h-4 w-48 bg-muted rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div class="h-4 w-20 bg-muted rounded animate-pulse" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `
  })
}

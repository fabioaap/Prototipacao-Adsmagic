<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import Badge from '@/components/ui/Badge.vue'
import Table from '@/components/ui/TableLegacy.vue'
import Pagination from '@/components/ui/Pagination.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import Avatar from '@/components/ui/Avatar.vue'

const total = 25
const page = 1
const pageSize = 10
</script>

<template>
  <div class="space-y-6">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Padrões Oficiais</CardTitle>
          <CardDescription>Fonte de verdade para novos desenvolvimentos</CardDescription>
        </CardHeader>
        <CardContent class="space-y-2 text-sm text-muted-foreground">
          <p><strong class="text-foreground">Busca:</strong> <code>SearchInput</code> para listas/tabelas e <code>SearchBar</code> apenas no header global.</p>
          <p><strong class="text-foreground">Modal:</strong> usar <code>Modal</code>/<code>Dialog</code>, sem <code>ModalV2</code> em novas telas.</p>
          <p><strong class="text-foreground">Seções/KPIs:</strong> <code>DashboardSection</code>, <code>StatGrid</code> e <code>MetricCard</code> em <code>@/components/ui/*</code>.</p>
          <p><strong class="text-foreground">Compatibilidade:</strong> evitar novos imports de <code>@/components/ui/aesthetic/*</code> e <code>@/components/ui/radix/*</code>.</p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Botões</CardTitle>
          <CardDescription>Variantes principais</CardDescription>
        </CardHeader>
        <CardContent class="flex gap-3 flex-wrap">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </CardContent>
        <CardFooter>
          <Tooltip text="Apenas exemplos"><span class="text-sm text-muted-foreground">Interativos</span></Tooltip>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Variantes e cores</CardDescription>
        </CardHeader>
        <CardContent class="flex gap-2 flex-wrap">
          <Badge>Default</Badge>
          <Badge color="success">Success</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="info">Info</Badge>
          <Badge color="destructive">Destructive</Badge>
          <Badge variant="solid" color="success">Solid</Badge>
          <Badge variant="outline" color="info">Outline</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabela e Paginação</CardTitle>
          <CardDescription>Estrutura base</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <template #head>
              <th class="text-left px-4 py-2">Coluna A</th>
              <th class="text-left px-4 py-2">Coluna B</th>
            </template>
            <tr>
              <td class="px-4 py-2">A1</td>
              <td class="px-4 py-2">B1</td>
            </tr>
            <tr>
              <td class="px-4 py-2">A2</td>
              <td class="px-4 py-2">B2</td>
            </tr>
          </Table>
        </CardContent>
        <CardFooter>
          <Pagination :page="page" :page-size="pageSize" :total="total" />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dropdown e Tooltip</CardTitle>
          <CardDescription>Interações leve</CardDescription>
        </CardHeader>
        <CardContent class="flex items-center gap-4">
          <DropdownMenu>
            <template #trigger>
              <Button variant="outline">Abrir menu</Button>
            </template>
            <button class="w-full text-left px-4 py-2 hover:bg-accent">Item 1</button>
            <button class="w-full text-left px-4 py-2 hover:bg-accent">Item 2</button>
          </DropdownMenu>
          <Tooltip text="Dica no hover"><Button>Com Tooltip</Button></Tooltip>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Com imagem ou iniciais</CardDescription>
        </CardHeader>
        <CardContent class="flex items-center gap-4">
          <Avatar name="Ana Maria" />
          <Avatar src="https://avatars.githubusercontent.com/u/1?v=4" :size="40" />
        </CardContent>
      </Card>
  </div>
</template>

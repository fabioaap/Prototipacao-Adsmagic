<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Pencil,
  Trash2,
  Archive,
  FileDown,
  FolderOpen,
  Copy,
  MoreHorizontal,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useFormat } from '@/composables/useFormat'
import { formatSafeDate } from '@/utils/formatters'
import type { Project } from '@/types/project'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'

interface Props {
  projects: Project[]
  isLoading?: boolean
  selectable?: boolean
}

interface Emits {
  (e: 'project-click', project: Project): void
  (e: 'edit', project: Project): void
  (e: 'delete', project: Project): void
  (e: 'archive', project: Project): void
  (e: 'duplicate', project: Project): void
  (e: 'bulk-delete', projectIds: string[]): void
  (e: 'bulk-archive', projectIds: string[]): void
  (e: 'bulk-export', projectIds: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  selectable: true,
})

const emit = defineEmits<Emits>()

// ============================================================================
// SELECTION STATE
// ============================================================================

const selectedProjects = ref<Set<string>>(new Set())

const allSelected = computed(() => {
  return props.projects.length > 0 &&
    props.projects.every(p => selectedProjects.value.has(p.id))
})

const someSelected = computed(() => {
  return props.projects.some(p => selectedProjects.value.has(p.id)) &&
    !allSelected.value
})

const handleSelectAll = () => {
  if (allSelected.value) {
    props.projects.forEach(p => selectedProjects.value.delete(p.id))
  } else {
    props.projects.forEach(p => selectedProjects.value.add(p.id))
  }
}

const handleSelectProject = (project: Project, selected: boolean) => {
  if (selected) {
    selectedProjects.value.add(project.id)
  } else {
    selectedProjects.value.delete(project.id)
  }
}

const handleBulkDelete = () => {
  emit('bulk-delete', Array.from(selectedProjects.value))
  selectedProjects.value.clear()
}

const handleBulkArchive = () => {
  emit('bulk-archive', Array.from(selectedProjects.value))
  selectedProjects.value.clear()
}

const handleBulkExport = () => {
  emit('bulk-export', Array.from(selectedProjects.value))
}

// ============================================================================
// DROPDOWN ACTION HANDLERS
// ============================================================================

const onViewDetails = (project: Project, close?: () => void) => {
  emit('project-click', project)
  close?.()
}

const onEdit = (project: Project, close?: () => void) => {
  emit('edit', project)
  close?.()
}

const onDuplicate = (project: Project, close?: () => void) => {
  emit('duplicate', project)
  close?.()
}

const onArchive = (project: Project, close?: () => void) => {
  emit('archive', project)
  close?.()
}

const onDelete = (project: Project, close?: () => void) => {
  emit('delete', project)
  close?.()
}

// ============================================================================
// I18N & FORMATTING
// ============================================================================

const { t } = useI18n()
const { formatCurrency, formatNumber, formatPercentage } = useFormat()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getComparisonIcon(value: number) {
  if (value > 0) return TrendingUp
  if (value < 0) return TrendingDown
  return Minus
}

function getComparisonClass(value: number): string {
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

function handleRowClick(project: Project) {
  emit('project-click', project)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Bulk Actions Bar -->
    <div
      v-if="selectedProjects.size > 0"
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted rounded-lg"
    >
      <span class="text-sm font-medium">
        {{ selectedProjects.size }} {{ t('projects.bulk.selected') || 'projeto(s) selecionado(s)' }}
      </span>
      
      <div class="flex flex-wrap items-center gap-2">
        <!-- Exportar selecionados -->
        <Button
          variant="outline"
          size="sm"
          class="h-9 rounded-lg px-3"
          @click="handleBulkExport"
        >
          <FileDown class="h-4 w-4 mr-1" />
          {{ t('common.export') || 'Exportar' }}
        </Button>
        
        <!-- Arquivar -->
        <Button
          variant="outline"
          size="sm"
          class="h-9 rounded-lg px-3"
          @click="handleBulkArchive"
        >
          <Archive class="h-4 w-4 mr-1" />
          {{ t('projects.actions.archive') || 'Arquivar' }}
        </Button>
        
        <!-- Excluir -->
        <Button
          variant="destructive"
          size="sm"
          class="h-9 rounded-lg px-3"
          @click="handleBulkDelete"
        >
          <Trash2 class="h-4 w-4 mr-1" />
          {{ t('projects.actions.delete') || 'Excluir' }}
        </Button>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <!-- Checkbox Header -->
            <TableHead v-if="props.selectable" class="w-12">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                @change="handleSelectAll"
              />
            </TableHead>
            <TableHead>{{ t('projects.table.project') }}</TableHead>
            <TableHead>{{ t('projects.table.status') }}</TableHead>
            <TableHead class="text-right">{{ t('projects.table.investment') }}</TableHead>
            <TableHead class="text-right">{{ t('projects.table.contacts') }}</TableHead>
            <TableHead class="text-right">{{ t('projects.table.sales') }}</TableHead>
            <TableHead class="text-right">{{ t('projects.table.conversionRate') }}</TableHead>
            <TableHead class="text-right">{{ t('projects.table.averageTicket') }}</TableHead>
            <TableHead class="text-right">{{ t('projects.table.revenue') }}</TableHead>
            <TableHead class="text-center">{{ t('projects.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="!isLoading">
          <TableRow
            v-for="project in projects"
            :key="project.id"
            class="cursor-pointer"
            @click="handleRowClick(project)"
          >
            <!-- Checkbox -->
            <TableCell v-if="props.selectable" class="w-12" @click.stop>
              <input
                type="checkbox"
                :checked="selectedProjects.has(project.id)"
                class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                @change="handleSelectProject(project, ($event.target as HTMLInputElement).checked)"
              />
            </TableCell>
          
            <!-- Nome do Projeto -->
            <TableCell>
              <div class="flex items-center gap-2">
                <div class="flex flex-col">
                  <span class="font-medium text-foreground">{{ project.name }}</span>
                  <span class="text-xs text-muted-foreground">
                    {{ t('projects.table.createdAt') }} {{ formatSafeDate(project.createdAt) }}
                  </span>
                </div>
              </div>
            </TableCell>

            <!-- Status WhatsApp -->
            <TableCell>
              <Badge
                :color="project.whatsappStatus === 'connected' ? 'success' : 'default'"
                :variant="project.whatsappStatus === 'connected' ? 'solid' : 'soft'"
                class="whitespace-nowrap"
              >
                {{ project.whatsappStatus === 'connected' ? t('projects.status.connected') : t('projects.status.disconnected') }}
              </Badge>
            </TableCell>

            <!-- Investimento -->
            <TableCell class="text-right">
              <div class="flex flex-col items-end gap-1">
                <span class="font-medium">{{ formatCurrency(project.metrics?.investment || 0) }}</span>
                <div
                  v-if="project.comparison?.investment !== 0"
                  :class="['flex items-center gap-1 text-xs', getComparisonClass(project.comparison?.investment || 0)]"
                >
                  <component :is="getComparisonIcon(project.comparison?.investment || 0)" class="h-3 w-3" />
                  <span>{{ Math.abs(project.comparison?.investment || 0).toFixed(1) }}%</span>
                </div>
              </div>
            </TableCell>

            <!-- Contatos -->
            <TableCell class="text-right">
              <div class="flex flex-col items-end gap-1">
                <span class="font-medium">{{ formatNumber(project.metrics?.contacts || 0) }}</span>
                <div
                  v-if="project.comparison?.contacts !== 0"
                  :class="['flex items-center gap-1 text-xs', getComparisonClass(project.comparison?.contacts || 0)]"
                >
                  <component :is="getComparisonIcon(project.comparison?.contacts || 0)" class="h-3 w-3" />
                  <span>{{ Math.abs(project.comparison?.contacts || 0).toFixed(1) }}%</span>
                </div>
              </div>
            </TableCell>

            <!-- Vendas -->
            <TableCell class="text-right">
              <div class="flex flex-col items-end gap-1">
                <span class="font-medium">{{ formatNumber(project.metrics?.sales || 0) }}</span>
                <div
                  v-if="project.comparison?.sales !== 0"
                  :class="['flex items-center gap-1 text-xs', getComparisonClass(project.comparison?.sales || 0)]"
                >
                  <component :is="getComparisonIcon(project.comparison?.sales || 0)" class="h-3 w-3" />
                  <span>{{ Math.abs(project.comparison?.sales || 0).toFixed(1) }}%</span>
                </div>
              </div>
            </TableCell>

            <!-- Taxa de Vendas -->
            <TableCell class="text-right">
              <div class="flex flex-col items-end gap-1">
                <span class="font-medium">{{ formatPercentage(project.metrics?.conversionRate || 0) }}</span>
                <div
                  v-if="project.comparison?.conversionRate !== 0"
                  :class="[
                    'flex items-center gap-1 text-xs',
                    getComparisonClass(project.comparison?.conversionRate || 0),
                  ]"
                >
                  <component
                    :is="getComparisonIcon(project.comparison?.conversionRate || 0)"
                    class="h-3 w-3"
                  />
                  <span>{{ Math.abs(project.comparison?.conversionRate || 0).toFixed(1) }}%</span>
                </div>
              </div>
            </TableCell>

            <!-- Ticket Médio -->
            <TableCell class="text-right">
              <div class="flex flex-col items-end gap-1">
                <span class="font-medium">{{ formatCurrency(project.metrics?.averageTicket || 0) }}</span>
                <div
                  v-if="project.comparison?.averageTicket !== 0"
                  :class="[
                    'flex items-center gap-1 text-xs',
                    getComparisonClass(project.comparison?.averageTicket || 0),
                  ]"
                >
                  <component
                    :is="getComparisonIcon(project.comparison?.averageTicket || 0)"
                    class="h-3 w-3"
                  />
                  <span>{{ Math.abs(project.comparison?.averageTicket || 0).toFixed(1) }}%</span>
                </div>
              </div>
            </TableCell>

            <!-- Receita -->
            <TableCell class="text-right">
              <div class="flex flex-col items-end gap-1">
                <span class="font-medium">{{ formatCurrency(project.metrics?.revenue || 0) }}</span>
                <div
                  v-if="project.comparison?.revenue !== 0"
                  :class="['flex items-center gap-1 text-xs', getComparisonClass(project.comparison?.revenue || 0)]"
                >
                  <component :is="getComparisonIcon(project.comparison?.revenue || 0)" class="h-3 w-3" />
                  <span>{{ Math.abs(project.comparison?.revenue || 0).toFixed(1) }}%</span>
                </div>
              </div>
            </TableCell>

            <!-- Ações -->
            <TableCell class="text-center" @click.stop>
            <div class="flex items-center justify-center">
              <DropdownMenu align="right">
                <template #trigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0"
                  >
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </template>
                <template #default="{ close }">
                  <!-- DEBUG: Verificar se close está definida -->
                  <!-- {{ console.log('[DEBUG] close type:', typeof close) }} -->
                  <button
                    type="button"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    @click="onViewDetails(project, close)"
                  >
                    <Eye class="h-4 w-4" />
                    <span>{{ t('projects.actions.viewDetails') }}</span>
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    @click="onEdit(project, close)"
                  >
                    <Pencil class="h-4 w-4" />
                    <span>{{ t('projects.actions.edit') }}</span>
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    @click="onDuplicate(project, close)"
                  >
                    <Copy class="h-4 w-4" />
                    <span>{{ t('projects.actions.duplicate') || 'Duplicar' }}</span>
                  </button>
                  <button
                    v-if="project.status !== 'archived'"
                    type="button"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    @click="onArchive(project, close)"
                  >
                    <Archive class="h-4 w-4" />
                    <span>{{ t('projects.actions.archive') }}</span>
                  </button>
                  <div class="border-t my-1" />
                  <button
                    type="button"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                    @click="onDelete(project, close)"
                  >
                    <Trash2 class="h-4 w-4" />
                    <span>{{ t('projects.actions.delete') }}</span>
                  </button>
                </template>
              </DropdownMenu>
            </div>
          </TableCell>
          </TableRow>
        </TableBody>

        <!-- Loading State -->
        <TableBody v-else aria-busy="true">
          <TableRow v-for="i in 5" :key="i">
            <TableCell :colspan="props.selectable ? 10 : 9">
              <div class="h-12 bg-muted/30 animate-pulse rounded"></div>
            </TableCell>
          </TableRow>
        </TableBody>

        <!-- Empty State -->
        <TableBody v-if="!isLoading && projects.length === 0">
          <TableRow>
            <TableCell :colspan="props.selectable ? 10 : 9" class="py-12 text-center">
              <div class="flex flex-col items-center gap-4">
                <!-- Ilustração -->
                <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <FolderOpen class="w-8 h-8 text-muted-foreground" />
                </div>
                <div class="space-y-1">
                  <p class="text-lg font-medium text-foreground">{{ t('projects.table.emptyTitle') }}</p>
                  <p class="text-sm text-muted-foreground max-w-md">
                    {{ t('projects.table.emptyDescription') }}
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

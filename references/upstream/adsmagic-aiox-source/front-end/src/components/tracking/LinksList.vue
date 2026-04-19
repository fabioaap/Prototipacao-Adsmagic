<script setup lang="ts">
import { ref, computed } from 'vue'
import { ExternalLink, Copy, Eye, Edit, Trash2, Check } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import ToolbarMetricPill from '@/components/ui/ToolbarMetricPill.vue'
import QRCodeModal from '@/components/tracking/QRCodeModal.vue'
import type { Link } from '@/types/models'
import { useTrackingStore } from '@/stores/tracking'
import { useFormat } from '@/composables/useFormat'
import { MoreVertical } from '@/composables/useIcons'

interface Props {
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
  /**
   * Número de itens por página
   */
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  itemsPerPage: 10,
})

const emit = defineEmits<{
  linkViewDetails: [link: Link]
  linkEdit: [link: Link]
  linkDelete: [link: Link]
  linkCopy: [link: Link]
  export: []
}>()

const trackingStore = useTrackingStore()
const { formatDate, formatNumber } = useFormat()

// Estado local
const searchQuery = ref('')
const currentPage = ref(1)
const isQRCodeModalOpen = ref(false)
const selectedLinkForQR = ref<Link | null>(null)
const copiedLinkId = ref<string | null>(null)

// Links filtrados por busca e origem
const filteredLinks = computed(() => {
  let links = trackingStore.links

  // Filtro por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    links = links.filter((link: Link) => {
      const trackingUrl = link.trackingUrl || link.url
      return (
        link.name.toLowerCase().includes(query) ||
        trackingUrl.toLowerCase().includes(query)
      )
    })
  }

  return links
})

// Paginação
const totalPages = computed(() => {
  return Math.ceil(filteredLinks.value.length / props.itemsPerPage)
})

const paginatedLinks = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredLinks.value.slice(start, end)
})

// Handle search
const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Handle actions
const handleViewDetails = (link: Link) => {
  emit('linkViewDetails', link)
}

const handleEdit = (link: Link) => {
  emit('linkEdit', link)
}

const handleDelete = (link: Link) => {
  emit('linkDelete', link)
}

const handleCopy = async (link: Link) => {
  try {
    await navigator.clipboard.writeText(link.trackingUrl || link.url)
    copiedLinkId.value = link.id
    setTimeout(() => {
      copiedLinkId.value = null
    }, 2000)
    emit('linkCopy', link)
  } catch (error) {
    console.error('Erro ao copiar link:', error)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header Actions -->
    <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
      <!-- Search -->
      <div class="flex-1 min-w-0 w-full">
        <SearchInput
          :model-value="searchQuery"
          placeholder="Pesquisar pelo nome do link"
          @update:model-value="handleSearch"
        />
      </div>

      <div class="flex w-full flex-col gap-2 sm:flex-row sm:w-auto sm:items-center sm:flex-shrink-0">
        <!-- Results Count -->
        <ToolbarMetricPill
          class="w-full justify-center sm:w-auto"
          label="Resultados:"
          :value="filteredLinks.length"
        />

        <div
          v-if="$slots.actions"
          class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center [&>*]:w-full sm:[&>*]:w-auto"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="border border-border rounded-[14px] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nome
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contatos
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Vendas
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ticket médio
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Data de criação
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <template v-if="props.loading">
              <tr v-for="i in props.itemsPerPage" :key="i">
                <td class="px-4 py-3" colspan="6">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div class="flex-1 space-y-2">
                      <div class="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div class="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else-if="filteredLinks.length === 0">
              <td :colspan="6" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center justify-center">
                  <ExternalLink class="h-12 w-12 text-muted-foreground mb-4" />
                  <p class="text-muted-foreground mb-2">
                    {{ searchQuery ? 'Nenhum link encontrado' : 'Nenhum link criado' }}
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data -->
            <tr
              v-else
              v-for="link in paginatedLinks"
              :key="link.id"
              class="border-b border-border transition-colors hover:bg-muted/50"
            >
              <!-- Link Info -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ExternalLink class="h-5 w-5 text-primary" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-sm truncate">
                      {{ link.name }}
                    </p>
                    <p class="text-xs text-muted-foreground truncate">
                      {{ link.trackingUrl || link.url }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Contacts -->
              <td class="px-4 py-3 text-left">
                <span class="font-medium text-sm">
                  {{ formatNumber(link.stats.contacts) }}
                </span>
              </td>

              <!-- Sales -->
              <td class="px-4 py-3 text-left">
                <span class="font-medium text-sm">
                  {{ formatNumber(link.stats.sales) }}
                </span>
              </td>

              <!-- Average Ticket -->
              <td class="px-4 py-3 text-left">
                <span class="text-sm font-medium">
                  {{ link.stats.sales > 0 ? `R$ ${(link.stats.revenue / link.stats.sales).toFixed(2)}` : 'R$ 0,00' }}
                </span>
              </td>

              <!-- Created Date -->
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ formatDate(link.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Ver estatísticas"
                    @click="handleViewDetails(link)"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Copiar link"
                    @click="handleCopy(link)"
                  >
                    <Check v-if="copiedLinkId === link.id" class="h-4 w-4 text-green-500" />
                    <Copy v-else class="h-4 w-4" />
                  </Button>
                  <DropdownMenu align="right">
                    <template #trigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Mais ações"
                        aria-label="Mais ações"
                      >
                        <MoreVertical class="h-4 w-4" />
                      </Button>
                    </template>
                    <template #default="{ close }">
                      <button
                        type="button"
                        class="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                        @click="handleEdit(link); close()"
                      >
                        <Edit class="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <div class="border-t my-1" />
                      <button
                        type="button"
                        class="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                        @click="handleDelete(link); close()"
                      >
                        <Trash2 class="h-4 w-4" />
                        <span>Excluir</span>
                      </button>
                    </template>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between"
    >
      <p class="text-sm text-muted-foreground">
        Mostrando {{ (currentPage - 1) * props.itemsPerPage + 1 }} a
        {{ Math.min(currentPage * props.itemsPerPage, filteredLinks.length) }}
        de {{ filteredLinks.length }} links
      </p>

      <Pagination
        :page="currentPage"
        :page-size="props.itemsPerPage"
        :total="filteredLinks.length"
        @update:page="handlePageChange"
      />
    </div>

    <!-- QR Code Modal (G10.1) -->
    <QRCodeModal
      v-model:open="isQRCodeModalOpen"
      :link="selectedLinkForQR"
    />
  </div>
</template>

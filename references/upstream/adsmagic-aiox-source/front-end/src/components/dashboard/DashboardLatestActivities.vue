<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFormat } from '@/composables/useFormat'
import { DollarSign, Users, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { formatCurrency, formatDate } = useFormat()

// Dados mock para últimas vendas
const latestSales = computed(() => [
  {
    id: '1',
    contactName: 'Exklusiva Negócios',
    value: 1500,
    date: '2025-10-18T10:30:00Z',
    origin: 'Google Ads',
    originColor: 'bg-blue-500'
  },
  {
    id: '2',
    contactName: 'João Silva Investimentos',
    value: 2300,
    date: '2025-10-17T14:15:00Z',
    origin: 'Meta Ads',
    originColor: 'bg-blue-600'
  },
  {
    id: '3',
    contactName: 'Maria Santos',
    value: 800,
    date: '2025-10-17T09:45:00Z',
    origin: 'Organic',
    originColor: 'bg-green-500'
  },
  {
    id: '4',
    contactName: 'Carlos Oliveira',
    value: 3200,
    date: '2025-10-16T16:20:00Z',
    origin: 'TikTok Ads',
    originColor: 'bg-black'
  },
  {
    id: '5',
    contactName: 'Ana Costa',
    value: 1200,
    date: '2025-10-16T11:30:00Z',
    origin: 'Direct',
    originColor: 'bg-gray-600'
  },
  {
    id: '6',
    contactName: 'Pedro Lima',
    value: 950,
    date: '2025-10-15T13:45:00Z',
    origin: 'Google Ads',
    originColor: 'bg-blue-500'
  }
])

// Dados mock para novos contatos
const latestContacts = computed(() => [
  {
    id: '1',
    name: 'Exklusiva Negócios Imobiliários',
    phone: '16996262607',
    origin: 'Google Ads',
    originColor: 'bg-blue-500',
    stage: 'Qualificado',
    stageColor: 'bg-green-500',
    date: '2025-10-18T12:09:00Z'
  },
  {
    id: '2',
    name: 'João Silva Investimentos',
    phone: '11987654321',
    origin: 'Meta Ads',
    originColor: 'bg-blue-600',
    stage: 'Contato Iniciado',
    stageColor: 'bg-yellow-500',
    date: '2025-10-18T09:15:00Z'
  },
  {
    id: '3',
    name: 'Maria Santos',
    phone: '11999887766',
    origin: 'Organic',
    originColor: 'bg-green-500',
    stage: 'Negociação',
    stageColor: 'bg-orange-500',
    date: '2025-10-17T15:30:00Z'
  },
  {
    id: '4',
    name: 'Carlos Oliveira',
    phone: '11988776655',
    origin: 'TikTok Ads',
    originColor: 'bg-black',
    stage: 'Proposta Enviada',
    stageColor: 'bg-purple-500',
    date: '2025-10-17T10:20:00Z'
  },
  {
    id: '5',
    name: 'Ana Costa',
    phone: '11977665544',
    origin: 'Direct',
    originColor: 'bg-gray-600',
    stage: 'Qualificado',
    stageColor: 'bg-green-500',
    date: '2025-10-16T14:45:00Z'
  },
  {
    id: '6',
    name: 'Pedro Lima',
    phone: '11966554433',
    origin: 'Google Ads',
    originColor: 'bg-blue-500',
    stage: 'Contato Iniciado',
    stageColor: 'bg-yellow-500',
    date: '2025-10-16T08:30:00Z'
  }
])

// Função para formatar data relativa
const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Agora mesmo'
  if (diffInHours < 24) return `Há ${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 7) return `Há ${diffInDays} dias`
  
  return formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Função para obter iniciais do nome
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Navegação
const goToSales = () => {
  const locale = route.params.locale as string || 'pt'
  const projectId = route.params.projectId as string
  router.push(`/${locale}/projects/${projectId}/sales`)
}

const goToContacts = () => {
  const locale = route.params.locale as string || 'pt'
  const projectId = route.params.projectId as string
  router.push(`/${locale}/projects/${projectId}/contacts`)
}

const openSaleDetails = (saleId: string) => {
  // TODO: Implementar drawer de venda
  console.log('Open sale drawer:', saleId)
}

const openContactDetails = (contactId: string) => {
  // TODO: Implementar drawer de contato
  console.log('Open contact drawer:', contactId)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
    <!-- Últimas Vendas -->
    <div class="rounded-lg border border-border bg-card">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border p-4 sm:p-6">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <DollarSign class="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="section-title-sm">Últimas Vendas</h3>
            <p class="text-xs sm:text-sm text-muted-foreground">{{ latestSales.length }} vendas recentes</p>
          </div>
        </div>
      </div>

      <!-- Lista de Vendas -->
      <div class="p-4 sm:p-6">
        <div class="space-y-4">
          <div
            v-for="sale in latestSales"
            :key="sale.id"
            @click="openSaleDetails(sale.id)"
            class="flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <!-- Avatar -->
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <span class="text-sm font-medium text-green-600 dark:text-green-400">$</span>
            </div>

            <!-- Informações -->
            <div class="flex-1 min-w-0">
              <p class="truncate section-kicker">
                {{ sale.contactName }}
              </p>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{{ formatRelativeDate(sale.date) }}</span>
                <span>•</span>
                <span 
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-white"
                  :class="sale.originColor"
                >
                  {{ sale.origin }}
                </span>
              </div>
            </div>

            <!-- Valor -->
            <div class="text-right">
              <p class="section-kicker">
                {{ formatCurrency(sale.value) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Rodapé -->
        <div class="mt-6 border-t border-border pt-4">
          <button
            @click="goToSales"
            class="flex w-full items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            Ver todas as vendas
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Novos Contatos -->
    <div class="rounded-lg border border-border bg-card">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border p-4 sm:p-6">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Users class="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="section-title-sm">Novos Contatos</h3>
            <p class="text-xs sm:text-sm text-muted-foreground">{{ latestContacts.length }} contatos recentes</p>
          </div>
        </div>
      </div>

      <!-- Lista de Contatos -->
      <div class="p-4 sm:p-6">
        <div class="space-y-4">
          <div
            v-for="contact in latestContacts"
            :key="contact.id"
            @click="openContactDetails(contact.id)"
            class="flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <!-- Avatar -->
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <span class="section-kicker">
                {{ getInitials(contact.name) }}
              </span>
            </div>

            <!-- Informações -->
            <div class="flex-1 min-w-0">
              <p class="truncate section-kicker">
                {{ contact.name }}
              </p>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{{ formatRelativeDate(contact.date) }}</span>
                <span>•</span>
                <span 
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-white"
                  :class="contact.originColor"
                >
                  {{ contact.origin }}
                </span>
              </div>
            </div>

            <!-- Etapa -->
            <div class="text-right">
              <span 
                class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
                :class="contact.stageColor"
              >
                {{ contact.stage }}
              </span>
            </div>
          </div>
        </div>

        <!-- Rodapé -->
        <div class="mt-6 border-t border-border pt-4">
          <button
            @click="goToContacts"
            class="flex w-full items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            Ver todos os contatos
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

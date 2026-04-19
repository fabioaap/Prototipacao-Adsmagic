<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardMetricCard from './DashboardMetricCard.vue'
import { ChevronDown, ChevronUp, DollarSign, TrendingUp, Target, MousePointer } from 'lucide-vue-next'

// Estado do collapse (salvo no localStorage)
const isExpanded = ref(false)

// Dados mock para métricas financeiras
const financialData = computed(() => {
  return {
    adSpend: 1219.51, // Gastos anúncios
    averageTicket: 769.23, // Ticket médio
    costPerSale: 93.81, // Custo por venda
    costPerClick: 3.16 // Custo por clique
  }
})

// Carrega estado do localStorage
onMounted(() => {
  const saved = localStorage.getItem('dashboard-financial-expanded')
  if (saved !== null) {
    isExpanded.value = JSON.parse(saved)
  }
})

// Salva estado no localStorage
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  localStorage.setItem('dashboard-financial-expanded', JSON.stringify(isExpanded.value))
}
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <!-- Header clicável -->
    <button
      @click="toggleExpanded"
      class="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <DollarSign class="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 class="section-title-sm">Métricas Financeiras</h3>
          <p class="text-sm text-muted-foreground">
            Gastos, ticket médio e custos por conversão
          </p>
        </div>
      </div>
      
      <component 
        :is="isExpanded ? ChevronUp : ChevronDown" 
        class="h-5 w-5 text-muted-foreground transition-transform"
      />
    </button>

    <!-- Conteúdo colapsável -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isExpanded" class="border-t border-border p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <!-- Gastos em Anúncios -->
          <DashboardMetricCard
            title="Gastos em Anúncios"
            :value="`R$ ${financialData.adSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`"
            :icon="DollarSign"
            :change="8.5"
            change-label="vs. mês anterior"
            variant="destructive"
            format="currency"
          />

          <!-- Ticket Médio -->
          <DashboardMetricCard
            title="Ticket Médio"
            :value="`R$ ${financialData.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`"
            :icon="TrendingUp"
            :change="12.3"
            change-label="vs. mês anterior"
            variant="success"
            format="currency"
          />

          <!-- Custo por Venda -->
          <DashboardMetricCard
            title="Custo por Venda"
            :value="`R$ ${financialData.costPerSale.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`"
            :icon="Target"
            :change="-5.2"
            change-label="vs. mês anterior"
            variant="warning"
            format="currency"
          />

          <!-- Custo por Clique -->
          <DashboardMetricCard
            title="Custo por Clique"
            :value="`R$ ${financialData.costPerClick.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`"
            :icon="MousePointer"
            :change="2.1"
            change-label="vs. mês anterior"
            variant="info"
            format="currency"
          />
        </div>

        <!-- Informações adicionais -->
        <div class="mt-6 rounded-lg bg-muted/50 p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 class="section-kicker mb-2">Fonte dos Dados</h4>
              <p class="text-xs text-muted-foreground">
                Gastos agregados das APIs do Meta Ads e Google Ads
              </p>
            </div>
            <div>
              <h4 class="section-kicker mb-2">Cálculos</h4>
              <p class="text-xs text-muted-foreground">
                Ticket médio = Receita ÷ Vendas | Custo/Venda = Gastos ÷ Vendas
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

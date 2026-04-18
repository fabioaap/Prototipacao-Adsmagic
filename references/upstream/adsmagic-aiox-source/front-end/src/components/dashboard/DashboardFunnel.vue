<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

// Dados mock para o funil (baseado na especificação)
const funnelData = computed(() => {
  return {
    impressions: 8896,
    clicks: 386,
    contacts: 103,
    sales: 13,
    ctr: 4.34, // Click-through rate
    contactRate: 26.7, // Cliques → Contatos
    conversionRate: 12.6 // Contatos → Vendas
  }
})

// Larguras proporcionais das barras
const barWidths = computed(() => {
  const max = funnelData.value.impressions
  return {
    impressions: 100,
    clicks: (funnelData.value.clicks / max) * 100,
    contacts: (funnelData.value.contacts / max) * 100,
    sales: (funnelData.value.sales / max) * 100
  }
})

// Ícones de tendência
const getTrendIcon = (rate: number) => {
  if (rate > 0) return TrendingUp
  if (rate < 0) return TrendingDown
  return Minus
}

const getTrendColor = (rate: number) => {
  if (rate > 0) return 'text-green-600'
  if (rate < 0) return 'text-red-600'
  return 'text-gray-500'
}
</script>

<template>
  <div class="rounded-lg border border-border bg-card p-6">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="section-title-sm">Funil de Conversão</h3>
      <p class="text-sm text-muted-foreground">
        Visualização do funil de conversão com percentuais entre cada etapa
      </p>
    </div>

    <!-- Funil Visual -->
    <div class="space-y-4">
      <!-- Etapas do funil -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Impressões -->
        <div class="text-center">
          <div class="mb-2 text-2xl font-bold text-foreground">
            {{ funnelData.impressions.toLocaleString() }}
          </div>
          <div class="section-kicker">Impressões</div>
        </div>

        <!-- Cliques -->
        <div class="text-center">
          <div class="mb-2 text-2xl font-bold text-foreground">
            {{ funnelData.clicks.toLocaleString() }}
          </div>
          <div class="section-kicker">Cliques</div>
          <div class="flex items-center justify-center gap-1 text-xs">
            <component :is="getTrendIcon(funnelData.ctr)" class="h-3 w-3" :class="getTrendColor(funnelData.ctr)" />
            <span :class="getTrendColor(funnelData.ctr)">
              {{ funnelData.ctr }}%
            </span>
          </div>
        </div>

        <!-- Contatos -->
        <div class="text-center">
          <div class="mb-2 text-2xl font-bold text-foreground">
            {{ funnelData.contacts.toLocaleString() }}
          </div>
          <div class="section-kicker">Contatos</div>
          <div class="flex items-center justify-center gap-1 text-xs">
            <component :is="getTrendIcon(funnelData.contactRate)" class="h-3 w-3" :class="getTrendColor(funnelData.contactRate)" />
            <span :class="getTrendColor(funnelData.contactRate)">
              {{ funnelData.contactRate }}%
            </span>
          </div>
        </div>

        <!-- Vendas -->
        <div class="text-center">
          <div class="mb-2 text-2xl font-bold text-foreground">
            {{ funnelData.sales.toLocaleString() }}
          </div>
          <div class="section-kicker">Vendas</div>
          <div class="flex items-center justify-center gap-1 text-xs">
            <component :is="getTrendIcon(funnelData.conversionRate)" class="h-3 w-3" :class="getTrendColor(funnelData.conversionRate)" />
            <span :class="getTrendColor(funnelData.conversionRate)">
              {{ funnelData.conversionRate }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Barras visuais progressivas -->
      <div class="space-y-3">
        <!-- Impressões -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>Impressões</span>
            <span>{{ funnelData.impressions.toLocaleString() }}</span>
          </div>
          <div class="h-3 w-full rounded-full bg-muted">
            <div 
              class="h-3 rounded-full bg-blue-500 transition-all duration-500"
              :style="{ width: `${barWidths.impressions}%` }"
            ></div>
          </div>
        </div>

        <!-- Cliques -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>Cliques</span>
            <span>{{ funnelData.clicks.toLocaleString() }} ({{ funnelData.ctr }}%)</span>
          </div>
          <div class="h-3 w-full rounded-full bg-muted">
            <div 
              class="h-3 rounded-full bg-green-500 transition-all duration-500"
              :style="{ width: `${barWidths.clicks}%` }"
            ></div>
          </div>
        </div>

        <!-- Contatos -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>Contatos</span>
            <span>{{ funnelData.contacts.toLocaleString() }} ({{ funnelData.contactRate }}%)</span>
          </div>
          <div class="h-3 w-full rounded-full bg-muted">
            <div 
              class="h-3 rounded-full bg-yellow-500 transition-all duration-500"
              :style="{ width: `${barWidths.contacts}%` }"
            ></div>
          </div>
        </div>

        <!-- Vendas -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>Vendas</span>
            <span>{{ funnelData.sales.toLocaleString() }} ({{ funnelData.conversionRate }}%)</span>
          </div>
          <div class="h-3 w-full rounded-full bg-muted">
            <div 
              class="h-3 rounded-full bg-emerald-600 transition-all duration-500"
              :style="{ width: `${barWidths.sales}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Resumo de performance -->
      <div class="mt-6 rounded-lg bg-muted/50 p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="text-center">
            <div class="text-sm text-muted-foreground">Taxa de Cliques</div>
            <div class="section-title-sm">{{ funnelData.ctr }}%</div>
            <div class="text-xs text-muted-foreground">dos que viram clicaram</div>
          </div>
          <div class="text-center">
            <div class="text-sm text-muted-foreground">Taxa de Contatos</div>
            <div class="section-title-sm">{{ funnelData.contactRate }}%</div>
            <div class="text-xs text-muted-foreground">dos cliques viraram contatos</div>
          </div>
          <div class="text-center">
            <div class="text-sm text-muted-foreground">Taxa de Conversão</div>
            <div class="section-title-sm">{{ funnelData.conversionRate }}%</div>
            <div class="text-xs text-muted-foreground">dos contatos viraram vendas</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

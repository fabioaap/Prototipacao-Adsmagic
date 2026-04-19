<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { BarChart3, Plus, Settings, Link } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const handleConfigureIntegrations = () => {
  const locale = route.params.locale as string || 'pt'
  const projectId = route.params.projectId as string
  router.push(`/${locale}/projects/${projectId}/integrations`)
}

const handleAddFirstSale = () => {
  const locale = route.params.locale as string || 'pt'
  const projectId = route.params.projectId as string
  router.push(`/${locale}/projects/${projectId}/sales`)
}

const handleCreateTrackingLink = () => {
  const locale = route.params.locale as string || 'pt'
  const projectId = route.params.projectId as string
  router.push(`/${locale}/projects/${projectId}/tracking`)
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <!-- Ícone principal -->
    <div class="mb-8">
      <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <BarChart3 class="h-12 w-12 text-muted-foreground" />
      </div>
    </div>

    <!-- Título -->
    <h2 class="mb-4 section-title-lg">
      Nenhum dado disponível ainda
    </h2>

    <!-- Descrição -->
    <p class="mb-8 max-w-md text-muted-foreground">
      Seus dados aparecerão aqui quando:
    </p>

    <!-- Lista de ações -->
    <div class="mb-8 space-y-3 text-left">
      <div class="flex items-center gap-3">
        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Settings class="h-3 w-3 text-primary" />
        </div>
        <span class="text-sm text-muted-foreground">
          Integrar Meta Ads ou Google Ads
        </span>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Plus class="h-3 w-3 text-primary" />
        </div>
        <span class="text-sm text-muted-foreground">
          Adicionar sua primeira venda
        </span>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Link class="h-3 w-3 text-primary" />
        </div>
        <span class="text-sm text-muted-foreground">
          Contatos começarem a interagir
        </span>
      </div>
    </div>

    <!-- Botões de ação -->
    <div class="flex flex-col gap-3 sm:flex-row">
      <button
        @click="handleConfigureIntegrations"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Settings class="h-4 w-4" />
        Configurar integrações
      </button>

      <button
        @click="handleAddFirstSale"
        class="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 section-kicker transition-colors hover:bg-muted"
      >
        <Plus class="h-4 w-4" />
        Adicionar primeira venda
      </button>
    </div>

    <!-- Link adicional -->
    <div class="mt-6">
      <button
        @click="handleCreateTrackingLink"
        class="text-sm text-muted-foreground underline hover:text-foreground"
      >
        Criar link de rastreamento
      </button>
    </div>
  </div>
</template>

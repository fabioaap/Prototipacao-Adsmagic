<script setup lang="ts">
import { computed } from 'vue'
import { FileSearch, Link2, Database } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

interface Props {
  /**
   * Type of empty state
   */
  type: 'no_data' | 'no_integration' | 'no_results'
  
  /**
   * Custom title (optional)
   */
  title?: string
  
  /**
   * Custom description (optional)
   */
  description?: string
  
  /**
   * CTA button text (optional)
   */
  ctaText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  description: undefined,
  ctaText: undefined
})

const emit = defineEmits<{
  ctaClick: []
}>()

// Get icon for type
const icon = computed(() => {
  const icons = {
    no_data: Database,
    no_integration: Link2,
    no_results: FileSearch
  }
  return icons[props.type]
})

// Get default title
const defaultTitle = computed(() => {
  const titles = {
    no_data: 'Nenhum dado disponível',
    no_integration: 'Nenhuma integração conectada',
    no_results: 'Nenhum resultado encontrado'
  }
  return props.title || titles[props.type]
})

// Get default description
const defaultDescription = computed(() => {
  const descriptions = {
    no_data: 'Não há dados suficientes para este período. Tente selecionar um período maior ou adicionar novos contatos e vendas.',
    no_integration: 'Conecte suas contas de anúncios (Meta, Google, TikTok) para visualizar métricas de aquisição e investimento.',
    no_results: 'Nenhum resultado corresponde aos filtros aplicados. Tente ajustar os filtros ou selecionar outro período.'
  }
  return props.description || descriptions[props.type]
})

// Get default CTA
const defaultCTA = computed(() => {
  const ctas = {
    no_data: 'Criar primeiro contato',
    no_integration: 'Conectar integração',
    no_results: 'Limpar filtros'
  }
  return props.ctaText || ctas[props.type]
})

function handleClick() {
  emit('ctaClick')
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center py-12 px-4 text-center"
    role="status"
    aria-live="polite"
  >
    <div
      class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
    >
      <component
        :is="icon"
        class="h-8 w-8 text-muted-foreground"
        aria-hidden="true"
      />
    </div>

    <h3 class="section-title-sm mb-2">
      {{ defaultTitle }}
    </h3>

    <p class="text-sm text-muted-foreground max-w-md mb-6">
      {{ defaultDescription }}
    </p>

    <Button
      @click="handleClick"
      variant="default"
      size="default"
    >
      {{ defaultCTA }}
    </Button>
  </div>
</template>

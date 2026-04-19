<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, RefreshCw } from 'lucide-vue-next'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import type { GoogleConversionAction } from '@/types/models'

interface Props {
  open: boolean
  loading?: boolean
  saving?: boolean
  error?: string | null
  accountId?: string
  conversionActions: GoogleConversionAction[]
  selectedIds: string[]
  enhancedConversionsForLeadsEnabled?: boolean | null
  enhancedConversionsForLeadsCheckedAt?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  saving: false,
  error: null,
  accountId: '',
  enhancedConversionsForLeadsEnabled: null,
  enhancedConversionsForLeadsCheckedAt: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:selectedIds': [value: string[]]
  retry: []
  save: []
}>()

const selectedSet = computed(() => new Set(props.selectedIds))
const selectedNonEnabledCount = computed(() => props.conversionActions
  .filter((action) => selectedSet.value.has(action.id) && action.status && action.status !== 'ENABLED')
  .length)

const toggleAction = (actionId: string, checked: boolean): void => {
  const next = new Set(props.selectedIds)

  if (checked) {
    next.add(actionId)
  } else {
    next.delete(actionId)
  }

  emit('update:selectedIds', [...next])
}
</script>

<template>
  <Drawer
    :open="props.open"
    size="xl"
    title="Google Ads: Conversion Actions"
    description="Selecione os IDs de conversão usados no envio de eventos offline."
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div class="p-6 space-y-4">
        <div
          v-if="props.error"
          class="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {{ props.error }}
        </div>

        <div v-if="props.accountId" class="text-xs text-muted-foreground">
          Conta Google Ads: <span class="font-mono">{{ props.accountId }}</span>
        </div>

        <div
          v-if="props.enhancedConversionsForLeadsEnabled === false"
          class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          Enhanced conversions for leads está desativado nesta conta.
          Eventos sem gclid/gbraid/wbraid serão cancelados.
        </div>

        <div
          v-else-if="props.enhancedConversionsForLeadsEnabled === true"
          class="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
        >
          Enhanced conversions for leads habilitado.
          Eventos sem click IDs podem ser enviados com identificadores hash.
        </div>

        <div
          v-if="props.enhancedConversionsForLeadsCheckedAt"
          class="text-[11px] text-muted-foreground"
        >
          Última checagem:
          {{ new Date(props.enhancedConversionsForLeadsCheckedAt).toLocaleString() }}
        </div>

        <div
          v-if="selectedNonEnabledCount > 0"
          class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          {{ selectedNonEnabledCount }} conversion action selecionada não está habilitada.
          Remova da seleção para evitar falhas de envio.
        </div>

        <div v-if="props.loading" class="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 class="h-4 w-4 animate-spin mr-2" />
          Carregando conversion actions...
        </div>

        <div v-else-if="props.conversionActions.length === 0" class="rounded-surface border p-4 text-sm text-muted-foreground">
          Nenhuma conversion action encontrada para esta conta.
        </div>

        <div v-else class="space-y-2">
          <article
            v-for="action in props.conversionActions"
            :key="action.id"
            class="rounded-surface border p-3 bg-card"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">{{ action.name }}</p>
                <p class="text-xs text-muted-foreground font-mono mt-1">ID: {{ action.id }}</p>
                <div class="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span
                    v-if="action.status"
                    :class="action.status === 'ENABLED' ? 'text-emerald-700' : 'text-amber-700'"
                  >
                    {{ action.status }}
                  </span>
                  <span v-if="action.type">{{ action.type }}</span>
                  <span v-if="action.category">{{ action.category }}</span>
                </div>
              </div>

              <Checkbox
                :model-value="selectedSet.has(action.id)"
                @update:model-value="toggleAction(action.id, $event)"
              />
            </div>
          </article>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          :disabled="props.loading || props.saving"
          @click="emit('retry')"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Recarregar
        </Button>

        <Button
          :disabled="props.loading || props.saving"
          :loading="props.saving"
          @click="emit('save')"
        >
          {{ props.saving ? 'Salvando...' : 'Salvar seleção' }}
        </Button>
      </div>
    </template>
  </Drawer>
</template>

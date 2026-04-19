<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, RefreshCw, Eye, EyeOff, CheckCircle } from 'lucide-vue-next'
import { ref } from 'vue'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Alert from '@/components/ui/Alert.vue'
import Badge from '@/components/ui/Badge.vue'
import type { MetaPixel } from '@/types/models'

interface Props {
  open: boolean
  loading?: boolean
  saving?: boolean
  error?: string | null
  fetchError?: string | null
  accountId?: string
  pixels: MetaPixel[]
  selectedPixelId: string
  pixelAccessToken: string
  pixelAccessTokenSet?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  saving: false,
  error: null,
  fetchError: null,
  accountId: '',
  pixelAccessTokenSet: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:selectedPixelId': [value: string]
  'update:pixelAccessToken': [value: string]
  retry: []
  save: []
}>()

const showToken = ref(false)

const hasSelectedPixel = computed(() => props.selectedPixelId.length > 0)
const tokenStatusLabel = computed(() => {
  if (props.pixelAccessToken) return null
  if (props.pixelAccessTokenSet) return 'Token configurado'
  return null
})
</script>

<template>
  <Drawer
    :open="props.open"
    size="xl"
    title="Meta Ads: Gerenciar Pixels"
    description="Selecione o pixel e configure o token de acesso para envio de eventos offline via Conversions API."
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
          Conta Meta Ads: <span class="font-mono">{{ props.accountId }}</span>
        </div>

        <div v-if="props.loading" class="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 class="h-4 w-4 animate-spin mr-2" />
          Carregando pixels...
        </div>

        <div v-else-if="props.fetchError" class="space-y-3">
          <div class="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Erro ao buscar pixels: {{ props.fetchError }}
          </div>
          <Button variant="outline" size="sm" @click="emit('retry')">
            <RefreshCw class="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>

        <div v-else-if="props.pixels.length === 0" class="rounded-surface border p-4 text-sm text-muted-foreground">
          Nenhum pixel encontrado para esta conta.
        </div>

        <div v-else class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Selecione um pixel</p>
          <article
            v-for="pixel in props.pixels"
            :key="pixel.id"
            class="rounded-surface border p-3 bg-card cursor-pointer transition-colors"
            :class="props.selectedPixelId === pixel.id ? 'ring-2 ring-primary border-primary' : 'hover:bg-muted/50'"
            @click="emit('update:selectedPixelId', pixel.id)"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">{{ pixel.name }}</p>
                <p class="text-xs text-muted-foreground font-mono mt-1">ID: {{ pixel.id }}</p>
              </div>

              <div
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                :class="props.selectedPixelId === pixel.id ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'"
              >
                <svg
                  v-if="props.selectedPixelId === pixel.id"
                  class="h-3 w-3"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <circle cx="6" cy="6" r="3" fill="currentColor" />
                </svg>
              </div>
            </div>
          </article>
        </div>

        <div v-if="!props.loading && props.pixels.length > 0" class="space-y-3 pt-2 border-t">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Token de Acesso CAPI (Pixel)</label>
              <Badge v-if="tokenStatusLabel" variant="secondary" class="text-[11px]">
                <CheckCircle class="h-3 w-3 mr-1" />
                {{ tokenStatusLabel }}
              </Badge>
            </div>

            <div class="relative">
              <Input
                :model-value="props.pixelAccessToken"
                :type="showToken ? 'text' : 'password'"
                placeholder="Cole o token de acesso do pixel aqui..."
                :disabled="props.saving"
                @update:model-value="emit('update:pixelAccessToken', $event as string)"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                @click="showToken = !showToken"
              >
                <EyeOff v-if="showToken" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <Alert variant="info">
            <template #default>
              <div class="text-xs">
                Gere este token no Meta Events Manager &rarr; Configurações do Pixel &rarr; Gerar Token de Acesso.
                O token é diferente do token OAuth da integração.
              </div>
            </template>
          </Alert>
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
          :disabled="props.loading || props.saving || !hasSelectedPixel"
          :loading="props.saving"
          @click="emit('save')"
        >
          {{ props.saving ? 'Salvando...' : 'Salvar configuração' }}
        </Button>
      </div>
    </template>
  </Drawer>
</template>

<template>
  <div class="space-y-6">
    <section v-if="connectedIntegrations.length > 0" class="space-y-3">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 class="section-title-sm">Conectadas</h3>
          <p class="text-sm text-muted-foreground">
            Acompanhe status, sincronização e contas ativas em uma visão operacional.
          </p>
        </div>
        <div class="text-xs text-muted-foreground">
          {{ connectedIntegrations.length }} ativa(s)
        </div>
      </div>

      <div class="overflow-hidden rounded-lg border bg-card">
        <article
          v-for="integration in connectedIntegrations"
          :key="integration.id"
          class="border-b border-border last:border-b-0"
        >
          <div class="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0 flex-1 space-y-3">
              <div class="flex items-start gap-3">
                <div :class="platformIconWrapperClass(integration.platform)">
                  <MetaAdsLogoIcon v-if="integration.platform === 'meta'" :size="20" />
                  <GoogleAdsLogoIcon v-else-if="integration.platform === 'google'" :size="20" />
                  <BrandIcons v-else :name="toBrandIconName(integration.platform)" class="h-5 w-5" />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h4 class="text-sm font-semibold text-foreground">
                      {{ getPlatformName(integration.platform) }}
                    </h4>
                    <IntegrationStatusBadge
                      :status="normalizeBadgeStatus(integration.status)"
                      :last-sync="integration.lastSync"
                      :show-tooltip="false"
                    />
                  </div>

                  <p class="mt-1 text-sm text-muted-foreground">
                    {{ getPlatformDescription(integration.platform) }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span
                  v-if="integration.connection?.accountName"
                  class="rounded-full border border-border bg-muted/40 px-2.5 py-1"
                >
                  Conta: {{ integration.connection.accountName }}
                </span>
                <span
                  v-if="integration.connection?.email"
                  class="rounded-full border border-border bg-muted/40 px-2.5 py-1"
                >
                  {{ integration.connection.email }}
                </span>
                <span
                  v-if="integration.lastSync"
                  class="rounded-full border border-border bg-muted/40 px-2.5 py-1"
                >
                  Sincronizado {{ formatRelativeTime(integration.lastSync) }}
                </span>
                <span
                  v-if="integration.connection?.connectedAt"
                  class="rounded-full border border-border bg-muted/40 px-2.5 py-1"
                >
                  Conectado em {{ formatDate(integration.connection.connectedAt, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
                </span>
              </div>

              <div
                v-if="getMetricsSummary(integration.platform).length > 0"
                class="flex flex-wrap gap-2"
              >
                <span
                  v-for="summary in getMetricsSummary(integration.platform)"
                  :key="summary"
                  class="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {{ summary }}
                </span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 lg:justify-end">
              <Button
                v-if="supportsSync(integration.status)"
                variant="outline"
                size="sm"
                :disabled="loading"
                :loading="integration.platform === 'whatsapp' ? whatsappConnecting : false"
                @click="emitAction(integration.platform as IntegrationPlatformKey, 'sync')"
              >
                Sincronizar
              </Button>

              <Button
                variant="outline"
                size="sm"
                @click="emitAction(integration.platform as IntegrationPlatformKey, 'view-details')"
              >
                Ver detalhes
              </Button>

              <Button
                variant="ghost"
                size="sm"
                :disabled="loading"
                @click="emitAction(integration.platform as IntegrationPlatformKey, 'disconnect')"
              >
                Desconectar
              </Button>
            </div>
          </div>

        </article>
      </div>
    </section>

    <section v-if="attentionIntegrations.length > 0" class="space-y-3">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 class="section-title-sm">Requer atenção</h3>
          <p class="text-sm text-muted-foreground">
            Integrações com erro, pendência de autorização ou sincronização em andamento.
          </p>
        </div>
        <div class="text-xs text-muted-foreground">
          {{ attentionIntegrations.length }} item(ns)
        </div>
      </div>

      <div class="overflow-hidden rounded-lg border bg-card">
        <article
          v-for="integration in attentionIntegrations"
          :key="integration.id"
          class="flex flex-col gap-4 border-b border-border px-5 py-4 last:border-b-0 lg:flex-row lg:items-start lg:justify-between"
        >
          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex items-start gap-3">
              <div :class="platformIconWrapperClass(integration.platform)">
                <MetaAdsLogoIcon v-if="integration.platform === 'meta'" :size="20" />
                <GoogleAdsLogoIcon v-else-if="integration.platform === 'google'" :size="20" />
                <BrandIcons v-else :name="toBrandIconName(integration.platform)" class="h-5 w-5" />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="text-sm font-semibold text-foreground">
                    {{ getPlatformName(integration.platform) }}
                  </h4>
                  <IntegrationStatusBadge
                    :status="normalizeBadgeStatus(integration.status)"
                    :last-sync="integration.lastSync"
                    :show-tooltip="false"
                  />
                </div>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ getAttentionMessage(integration) }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button
              size="sm"
              :disabled="loading"
              @click="handleAttentionAction(integration)"
            >
              {{ getAttentionActionLabel(integration) }}
            </Button>

            <Button
              variant="outline"
              size="sm"
              @click="emitAction(integration.platform as IntegrationPlatformKey, 'view-details')"
            >
              Ver detalhes
            </Button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="availableIntegrations.length > 0" class="space-y-3">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 class="section-title-sm">Disponíveis para conectar</h3>
          <p class="text-sm text-muted-foreground">
            Catálogo das plataformas ainda não configuradas neste projeto.
          </p>
        </div>
        <div class="text-xs text-muted-foreground">
          {{ availableIntegrations.length }} disponível(is)
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="integration in availableIntegrations"
          :key="integration.id"
          :class="[
            'flex h-full flex-col rounded-lg border bg-card p-5',
            isComingSoon(integration.platform) && 'opacity-60',
          ]"
        >
          <div class="flex items-start gap-3">
            <div :class="platformIconWrapperClass(integration.platform)">
              <MetaAdsLogoIcon v-if="integration.platform === 'meta'" :size="20" />
              <GoogleAdsLogoIcon v-else-if="integration.platform === 'google'" :size="20" />
              <BrandIcons v-else :name="toBrandIconName(integration.platform)" class="h-5 w-5" />
            </div>

            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-semibold text-foreground">
                {{ getPlatformName(integration.platform) }}
              </h4>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ getPlatformDescription(integration.platform) }}
              </p>
            </div>
          </div>

          <div class="mt-4 flex-1">
            <div
              v-if="isComingSoon(integration.platform)"
              class="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700"
            >
              Em breve
            </div>
            <div
              v-else
              class="inline-flex rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
            >
              Pronto para configuração
            </div>
          </div>

          <div class="mt-5 flex items-center justify-between gap-2">
            <span class="text-xs text-muted-foreground">
              {{ isComingSoon(integration.platform) ? 'Disponível em breve' : 'OAuth e vínculo da conta' }}
            </span>
            <Button
              size="sm"
              :disabled="loading || isComingSoon(integration.platform)"
              @click="emitAction(integration.platform as IntegrationPlatformKey, 'connect')"
            >
              Conectar
            </Button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BrandIcons from '@/components/icons/BrandIcons.vue'
import GoogleAdsLogoIcon from '@/components/icons/GoogleAdsLogoIcon.vue'
import MetaAdsLogoIcon from '@/components/icons/MetaAdsLogoIcon.vue'
import IntegrationStatusBadge from '@/components/integrations/IntegrationStatusBadge.vue'
import Button from '@/components/ui/Button.vue'
import { useFormat } from '@/composables/useFormat'
import type { Integration } from '@/types/models'
import type {
  AdMetricsLoadingMap,
  AdMetricsMap,
  IntegrationActionPayload,
  IntegrationActionKey,
  IntegrationPlatformKey,
} from '@/types/integrations'

interface Props {
  platformIntegrations: Record<IntegrationPlatformKey, Integration | null>
  loading: boolean
  whatsappConnecting: boolean
  adMetrics: AdMetricsMap
  metricsLoading: AdMetricsLoadingMap
}

const props = defineProps<Props>()

const emit = defineEmits<{
  action: [payload: IntegrationActionPayload]
}>()

const { formatCurrency, formatDate, formatNumber, formatPercentage, formatRelativeTime } = useFormat()

const orderedPlatforms: IntegrationPlatformKey[] = ['whatsapp', 'meta', 'google', 'tiktok']

const orderedIntegrations = computed(() =>
  orderedPlatforms
    .map((platform) => props.platformIntegrations[platform])
    .filter((integration): integration is Integration => Boolean(integration))
)

const connectedIntegrations = computed(() =>
  orderedIntegrations.value.filter((integration) => integration.status === 'connected' || integration.status === 'syncing')
)

const attentionIntegrations = computed(() =>
  orderedIntegrations.value.filter((integration) => integration.status === 'error' || integration.status === 'pending')
)

const availableIntegrations = computed(() =>
  orderedIntegrations.value.filter((integration) => integration.status === 'disconnected')
)

const getPlatformName = (platform: Integration['platform']) => {
  const nameMap: Record<Integration['platform'], string> = {
    whatsapp: 'WhatsApp Business',
    facebook_messenger: 'Facebook Messenger',
    telegram: 'Telegram',
    instagram_direct: 'Instagram Direct',
    meta: 'Meta Ads',
    google: 'Google Ads',
    tiktok: 'TikTok Ads',
    linkedin: 'LinkedIn',
    discord: 'Discord',
    slack: 'Slack',
  }

  return nameMap[platform] ?? platform
}

const getPlatformDescription = (platform: Integration['platform']) => {
  const descriptionMap: Record<Integration['platform'], string> = {
    whatsapp: 'Conecte sua conta WhatsApp Business para enviar mensagens automáticas.',
    facebook_messenger: 'Conecte o Messenger para centralizar conversas e atendimento.',
    telegram: 'Conecte o Telegram para capturar e responder contatos.',
    instagram_direct: 'Conecte o Instagram Direct para ampliar canais de atendimento.',
    meta: 'Conecte Facebook e Instagram para rastrear conversões e campanhas.',
    google: 'Conecte o Google Ads para sincronizar conversões e métricas de mídia.',
    tiktok: 'Conecte o TikTok Ads para acompanhar campanhas e atribuição.',
    linkedin: 'Conecte o LinkedIn para registrar leads e campanhas B2B.',
    discord: 'Conecte o Discord para fluxos comunitários e notificações.',
    slack: 'Conecte o Slack para alertas e automações internas.',
  }

  return descriptionMap[platform] ?? 'Configure esta integração para ativar o fluxo correspondente.'
}

const toBrandIconName = (platform: Integration['platform']) => {
  const iconMap: Partial<Record<Integration['platform'], 'whatsapp' | 'meta' | 'google' | 'tiktok' | 'linkedin' | 'telegram'>> = {
    whatsapp: 'whatsapp',
    facebook_messenger: 'meta',
    instagram_direct: 'meta',
    meta: 'meta',
    google: 'google',
    tiktok: 'tiktok',
    linkedin: 'linkedin',
    telegram: 'telegram',
  }

  return iconMap[platform] ?? 'meta'
}

const platformIconWrapperClass = (platform: Integration['platform']) => {
  const classMap: Partial<Record<Integration['platform'], string>> = {
    whatsapp: 'flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700',
    facebook_messenger: 'flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700',
    instagram_direct: 'flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-pink-700',
    meta: 'flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700',
    google: 'flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700',
    tiktok: 'flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800',
    linkedin: 'flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700',
    telegram: 'flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700',
  }

  return classMap[platform] ?? 'flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground'
}

const comingSoonPlatforms: IntegrationPlatformKey[] = ['tiktok']

const isComingSoon = (platform: Integration['platform']) =>
  comingSoonPlatforms.includes(platform as IntegrationPlatformKey)

const normalizeBadgeStatus = (status: Integration['status']) => {
  if (status === 'pending') return 'syncing'
  return status
}

const supportsSync = (status: Integration['status']) => status === 'connected' || status === 'syncing'

const getMetricsSummary = (platform: Integration['platform']) => {
  if (platform !== 'meta' && platform !== 'google' && platform !== 'tiktok') return []

  const metrics = props.adMetrics[platform]
  if (!metrics) return []

  return [
    `${formatCurrency(metrics.spend)} em mídia`,
    `${formatNumber(metrics.clicks)} cliques`,
    `${formatPercentage(metrics.ctr)} CTR`,
  ]
}

const getAttentionMessage = (integration: Integration) => {
  if (integration.status === 'error') {
    return integration.error?.message || 'A conexão precisa ser revisada antes de continuar enviando dados.'
  }

  return 'A autorização ainda não foi concluída ou a sincronização inicial está em andamento.'
}

const getAttentionActionLabel = (integration: Integration) => {
  if (integration.status === 'error') return 'Reconectar'
  return 'Retomar configuração'
}

const handleAttentionAction = (integration: Integration) => {
  if (integration.status === 'error') {
    emitAction(integration.platform as IntegrationPlatformKey, 'reconnect')
    return
  }

  if (integration.status === 'pending' || integration.status === 'syncing') {
    emitAction(integration.platform as IntegrationPlatformKey, 'reconnect')
    return
  }

  emitAction(integration.platform as IntegrationPlatformKey, 'view-details')
}

const emitAction = (
  platform: IntegrationPlatformKey,
  action: IntegrationActionKey
) => {
  emit('action', { platform, action })
}
</script>

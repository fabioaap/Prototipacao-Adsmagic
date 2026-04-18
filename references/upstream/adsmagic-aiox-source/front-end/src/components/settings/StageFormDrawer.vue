<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Save, Plus, Trash2 } from 'lucide-vue-next'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Alert from '@/components/ui/Alert.vue'
import FormField from '@/components/ui/FormField.vue'
import { useStagesStore } from '@/stores/stages'
import { createStageSchema } from '@/schemas'
import type {
  Stage,
  Origin,
  GoogleConversionAction,
  StageEventRoute,
  StageEventRouteChannel,
} from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'
import { integrationsService } from '@/services/api/integrations'
import { getOrigins } from '@/services/api/origins'
import { z } from 'zod'

interface Props {
  /**
   * Controla a abertura do drawer
   */
  open: boolean
  /**
   * Etapa a ser editada (opcional)
   */
  stage?: Stage | null
}

const props = withDefaults(defineProps<Props>(), {
  stage: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [stage: Stage]
}>()

const stagesStore = useStagesStore()
const { toast } = useToast()

interface StageEventRouteForm {
  id: string
  channel: StageEventRouteChannel
  eventType: string
  sourceOriginId: string
  integrationId: string
  integrationAccountId: string
  conversionActionId: string
  conversionActionName: string
  value: string
  currency: string
  priority: string
  isActive: boolean
}

interface StageEventConfigForm {
  routes: StageEventRouteForm[]
  defaultValue: string
  defaultCurrency: string
}

interface FormData {
  name: string
  trackingPhrase: string
  type: 'normal' | 'sale' | 'lost'
  eventConfig: StageEventConfigForm
}

interface GoogleAccountOption {
  id: string
  externalAccountId: string
  label: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asScalarString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
  }
  return fallback
}

function asRouteChannel(value: unknown): StageEventRouteChannel {
  if (value === 'meta' || value === 'google' || value === 'tiktok') {
    return value
  }
  return 'google'
}

function parseNumberString(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const parsed = Number(trimmed)
  if (Number.isNaN(parsed)) return undefined

  return parsed
}

function createRouteId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `route-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }
}

function createEmptyRoute(
  defaults?: Partial<Pick<StageEventRouteForm, 'integrationId' | 'integrationAccountId' | 'currency'>>
): StageEventRouteForm {
  return {
    id: createRouteId(),
    channel: 'google',
    eventType: 'lead',
    sourceOriginId: '',
    integrationId: defaults?.integrationId || '',
    integrationAccountId: defaults?.integrationAccountId || '',
    conversionActionId: '',
    conversionActionName: '',
    value: '',
    currency: defaults?.currency || 'BRL',
    priority: '0',
    isActive: true,
  }
}

function normalizeLegacyPlatformConfigToRoute(
  channel: StageEventRouteChannel,
  rawPlatformConfig: unknown,
  fallbackCurrency: string
): StageEventRouteForm | null {
  if (!isRecord(rawPlatformConfig)) return null

  const active = asBoolean(rawPlatformConfig.active)
  const eventType = asString(rawPlatformConfig.eventType).trim()

  if (!active || !eventType) return null

  return {
    ...createEmptyRoute({ currency: fallbackCurrency }),
    channel,
    eventType,
  }
}

function normalizeEventConfig(rawEventConfig: Stage['eventConfig'] | undefined): StageEventConfigForm {
  if (!rawEventConfig || !isRecord(rawEventConfig)) {
    return {
      routes: [],
      defaultValue: '',
      defaultCurrency: 'BRL',
    }
  }

  const defaultCurrency = asString(rawEventConfig.defaultCurrency).trim() || 'BRL'
  const defaultValue = asScalarString(rawEventConfig.defaultValue)

  const routesRaw = rawEventConfig.routes
  const parsedRoutes: StageEventRouteForm[] = []

  if (Array.isArray(routesRaw)) {
    for (const routeRaw of routesRaw) {
      if (!isRecord(routeRaw)) continue

      const normalizedRoute: StageEventRouteForm = {
        id: asString(routeRaw.id).trim() || createRouteId(),
        channel: asRouteChannel(routeRaw.channel || routeRaw.platform),
        eventType: asString(routeRaw.eventType || routeRaw.event_type).trim() || 'lead',
        sourceOriginId: asString(routeRaw.sourceOriginId || routeRaw.source_origin_id).trim(),
        integrationId: asString(routeRaw.integrationId || routeRaw.integration_id).trim(),
        integrationAccountId: asString(routeRaw.integrationAccountId || routeRaw.integration_account_id).trim(),
        conversionActionId: asString(routeRaw.conversionActionId || routeRaw.conversion_action_id).trim(),
        conversionActionName: asString(routeRaw.conversionActionName || routeRaw.conversion_action_name).trim(),
        value: asScalarString(routeRaw.value),
        currency: asString(routeRaw.currency).trim() || defaultCurrency,
        priority: asScalarString(routeRaw.priority || 0),
        isActive: asBoolean(routeRaw.isActive, true),
      }

      parsedRoutes.push(normalizedRoute)
    }
  }

  // Compatibilidade com formato antigo (meta/google/tiktok)
  if (parsedRoutes.length === 0) {
    const maybeMeta = normalizeLegacyPlatformConfigToRoute('meta', rawEventConfig.meta, defaultCurrency)
    const maybeGoogle = normalizeLegacyPlatformConfigToRoute('google', rawEventConfig.google, defaultCurrency)
    const maybeTikTok = normalizeLegacyPlatformConfigToRoute('tiktok', rawEventConfig.tiktok, defaultCurrency)

    if (maybeMeta) parsedRoutes.push(maybeMeta)
    if (maybeGoogle) parsedRoutes.push(maybeGoogle)
    if (maybeTikTok) parsedRoutes.push(maybeTikTok)
  }

  return {
    routes: parsedRoutes,
    defaultValue,
    defaultCurrency,
  }
}

// Estado local
const loading = ref(false)
const loadingSupportData = ref(false)
const errors = ref<Record<string, string>>({})
const supportDataError = ref<string | null>(null)

const origins = ref<Origin[]>([])
const googleIntegrationId = ref('')
const googleAccounts = ref<GoogleAccountOption[]>([])
const conversionActionsByAccount = ref<Record<string, GoogleConversionAction[]>>({})
const googleEnhancedLeadsByAccount = ref<Record<string, boolean | undefined>>({})

const formData = ref<FormData>({
  name: '',
  trackingPhrase: '',
  type: 'normal',
  eventConfig: {
    routes: [],
    defaultValue: '',
    defaultCurrency: 'BRL',
  },
})

const routeChannelOptions = [
  { value: 'google', label: 'Google Ads' },
  { value: 'meta', label: 'Meta Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
]

const isEditing = computed(() => !!props.stage)
const drawerTitle = computed(() => isEditing.value ? 'Editar Etapa' : 'Criar Etapa')
const drawerDescription = computed(() => isEditing.value
  ? 'Atualize as informações básicas e as regras de eventos offline desta etapa.'
  : 'Defina as informações básicas e as regras de eventos offline para a nova etapa.'
)

const originOptions = computed(() => {
  const base = [{ value: '', label: 'Qualquer origem' }]
  const dynamic = origins.value
    .filter((origin) => origin.isActive)
    .map((origin) => ({ value: origin.id, label: origin.name }))

  return [...base, ...dynamic]
})

const googleAccountOptions = computed(() => {
  return googleAccounts.value.map((account) => ({
    value: account.id,
    label: account.label,
  }))
})

function getCurrentProjectId(): string {
  return localStorage.getItem('current_project_id') || ''
}

function initializeForm() {
  if (props.stage) {
    formData.value = {
      name: props.stage.name,
      trackingPhrase: props.stage.trackingPhrase || '',
      type: props.stage.type,
      eventConfig: normalizeEventConfig(props.stage.eventConfig),
    }
    return
  }

  formData.value = {
    name: '',
    trackingPhrase: '',
    type: 'normal',
    eventConfig: {
      routes: [],
      defaultValue: '',
      defaultCurrency: 'BRL',
    },
  }
}

async function ensureGoogleConversionActionsLoaded(accountId: string): Promise<void> {
  if (!accountId || conversionActionsByAccount.value[accountId]) {
    return
  }

  if (!googleIntegrationId.value) {
    return
  }

  const account = googleAccounts.value.find((item) => item.id === accountId)
  if (!account) {
    return
  }

  try {
    const response = await integrationsService.getGoogleConversionActions(
      googleIntegrationId.value,
      account.externalAccountId,
    )

    conversionActionsByAccount.value = {
      ...conversionActionsByAccount.value,
      [accountId]: response.conversionActions,
    }

    googleEnhancedLeadsByAccount.value = {
      ...googleEnhancedLeadsByAccount.value,
      [accountId]: typeof response.enhancedConversionsForLeadsEnabled === 'boolean'
        ? response.enhancedConversionsForLeadsEnabled
        : undefined,
    }
  } catch (error) {
    console.error('[StageFormDrawer] Erro ao carregar conversion actions:', error)
  }
}

async function loadSupportData() {
  loadingSupportData.value = true
  supportDataError.value = null
  googleIntegrationId.value = ''
  googleAccounts.value = []
  conversionActionsByAccount.value = {}
  googleEnhancedLeadsByAccount.value = {}

  try {
    const originsResult = await getOrigins()
    if (originsResult.ok) {
      origins.value = originsResult.value
    } else {
      throw originsResult.error
    }

    const projectId = getCurrentProjectId()
    if (!projectId) {
      return
    }

    const integrations = await integrationsService.getIntegrations(projectId)
    const googleIntegration = integrations.find(
      (integration) => integration.platform === 'google' && integration.status === 'connected'
    )

    if (!googleIntegration) {
      return
    }

    googleIntegrationId.value = googleIntegration.id

    const accountsResponse = await integrationsService.getIntegrationAccounts(googleIntegration.id)
    const activeGoogleAccounts = accountsResponse.accounts
      .filter((account) => account.status === 'active')
      .map((account) => ({
        id: account.id,
        externalAccountId: account.external_account_id,
        label: `${account.external_account_name || account.account_name} (${account.external_account_id})`,
      }))

    googleAccounts.value = activeGoogleAccounts

    const routesToPreload = [...new Set(
      formData.value.eventConfig.routes
        .filter((route) => route.channel === 'google' && route.integrationAccountId)
        .map((route) => route.integrationAccountId)
    )]

    for (const accountId of routesToPreload) {
      await ensureGoogleConversionActionsLoaded(accountId)
    }
  } catch (error) {
    console.error('[StageFormDrawer] Erro ao carregar dados de suporte:', error)
    supportDataError.value = 'Não foi possível carregar origens/contas de integração.'
  } finally {
    loadingSupportData.value = false
  }
}

function addRoute() {
  const defaultGoogleAccount = googleAccounts.value[0]?.id || ''
  const route = createEmptyRoute({
    integrationId: googleIntegrationId.value,
    integrationAccountId: defaultGoogleAccount,
    currency: formData.value.eventConfig.defaultCurrency || 'BRL',
  })

  formData.value.eventConfig.routes.push(route)

  if (route.channel === 'google' && route.integrationAccountId) {
    ensureGoogleConversionActionsLoaded(route.integrationAccountId)
  }
}

function removeRoute(routeId: string) {
  formData.value.eventConfig.routes = formData.value.eventConfig.routes.filter((route) => route.id !== routeId)
}

function getConversionActionOptions(route: StageEventRouteForm) {
  const list = conversionActionsByAccount.value[route.integrationAccountId] || []

  return list.map((action) => ({
    value: action.id,
    label: `${action.name} (${action.id})`,
  }))
}

function isGoogleEnhancedLeadsDisabled(route: StageEventRouteForm): boolean {
  if (!route.integrationAccountId) {
    return false
  }

  return googleEnhancedLeadsByAccount.value[route.integrationAccountId] === false
}

function handleChannelChange(route: StageEventRouteForm, channel: string) {
  route.channel = asRouteChannel(channel)

  if (route.channel === 'google') {
    route.integrationId = googleIntegrationId.value || route.integrationId
    route.integrationAccountId = route.integrationAccountId || googleAccounts.value[0]?.id || ''
    if (route.integrationAccountId) {
      ensureGoogleConversionActionsLoaded(route.integrationAccountId)
    }
    return
  }

  route.integrationAccountId = ''
  route.conversionActionId = ''
  route.conversionActionName = ''
}

function handleGoogleAccountChange(route: StageEventRouteForm, accountId: string) {
  route.integrationAccountId = accountId
  route.integrationId = googleIntegrationId.value || route.integrationId
  route.conversionActionId = ''
  route.conversionActionName = ''
  ensureGoogleConversionActionsLoaded(accountId)
}

function handleConversionActionChange(route: StageEventRouteForm, conversionActionId: string) {
  route.conversionActionId = conversionActionId

  const selected = (conversionActionsByAccount.value[route.integrationAccountId] || [])
    .find((action) => action.id === conversionActionId)

  route.conversionActionName = selected?.name || ''
}

function normalizeRoutesForSave(routes: StageEventRouteForm[]): StageEventRoute[] {
  return routes
    .map((route) => {
      const normalizedRoute: StageEventRoute = {
        id: route.id,
        channel: route.channel,
        eventType: route.eventType.trim(),
        isActive: route.isActive,
        priority: parseNumberString(route.priority),
        value: parseNumberString(route.value),
        currency: route.currency.trim() || undefined,
        sourceOriginId: route.sourceOriginId || undefined,
        integrationId: route.integrationId || undefined,
        integrationAccountId: route.integrationAccountId || undefined,
        conversionActionId: route.conversionActionId || undefined,
        conversionActionName: route.conversionActionName || undefined,
      }

      return normalizedRoute
    })
    .filter((route) => route.eventType.length > 0)
}

function validateRoutes(): boolean {
  const issues: string[] = []

  for (const [index, route] of formData.value.eventConfig.routes.entries()) {
    const normalizedEventType = route.eventType.trim()

    if (!normalizedEventType) {
      issues.push(`Rota ${index + 1}: informe o tipo do evento.`)
      continue
    }

    if (normalizedEventType.length > 50) {
      issues.push(`Rota ${index + 1}: tipo do evento deve ter no máximo 50 caracteres.`)
      continue
    }

    if (!route.isActive) {
      continue
    }

    if (route.channel === 'google') {
      if (!route.integrationAccountId) {
        issues.push(`Rota ${index + 1}: selecione a conta do Google Ads.`)
      }

      if (!route.conversionActionId) {
        issues.push(`Rota ${index + 1}: selecione a conversion action do Google Ads.`)
      }
    }
  }

  if (issues.length > 0) {
    errors.value.routeConfig = issues[0] || 'Configuração de rota inválida.'
    return false
  }

  delete errors.value.routeConfig
  return true
}

const handleClose = () => {
  emit('update:open', false)
}

const validateForm = (): boolean => {
  if (!validateRoutes()) {
    return false
  }

  try {
    createStageSchema.parse({
      name: formData.value.name,
      trackingPhrase: formData.value.trackingPhrase,
      type: formData.value.type,
      eventConfig: {
        routes: normalizeRoutesForSave(formData.value.eventConfig.routes),
        defaultValue: parseNumberString(formData.value.eventConfig.defaultValue),
        defaultCurrency: formData.value.eventConfig.defaultCurrency,
      },
    })
    errors.value = {}
    return true
  } catch (err) {
    if (err instanceof z.ZodError) {
      errors.value = {}
      err.issues.forEach((issue) => {
        const field = issue.path[0]?.toString()
        if (field) {
          errors.value[field] = issue.message
        }
      })
    }
    return false
  }
}

const handleSave = async () => {
  if (!validateForm()) {
    toast({
      title: 'Erro de validação',
      description: 'Por favor, corrija os erros no formulário.',
      variant: 'destructive',
    })
    return
  }

  loading.value = true

  try {
    const normalizedRoutes = normalizeRoutesForSave(formData.value.eventConfig.routes)
    const defaultValue = parseNumberString(formData.value.eventConfig.defaultValue)
    const defaultCurrency = formData.value.eventConfig.defaultCurrency.trim()

    const payload = {
      name: formData.value.name,
      trackingPhrase: formData.value.trackingPhrase,
      type: formData.value.type,
      eventConfig: {
        routes: normalizedRoutes,
        defaultValue,
        defaultCurrency: defaultCurrency || 'BRL',
      },
    }

    let savedStage: Stage

    if (isEditing.value && props.stage) {
      savedStage = await stagesStore.updateStage(props.stage.id, payload)
    } else {
      savedStage = await stagesStore.createStage(payload)
    }

    toast({
      title: 'Sucesso!',
      description: `Etapa ${isEditing.value ? 'atualizada' : 'criada'} com sucesso.`,
    })

    emit('success', savedStage)
    handleClose()
  } catch (error) {
    console.error('Erro ao salvar etapa:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível salvar a etapa. Tente novamente.',
      variant: 'destructive',
    })
  } finally {
    loading.value = false
  }
}

watch(() => props.open, async (isOpen) => {
  if (!isOpen) return

  errors.value = {}
  initializeForm()
  await loadSupportData()
})
</script>

<template>
  <Drawer
    :open="props.open"
    size="xl"
    :title="drawerTitle"
    :description="drawerDescription"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <form id="stage-form" class="space-y-6 p-6" @submit.prevent="handleSave">
        <section class="space-y-4">
            <h3 class="section-kicker">Informações Básicas</h3>

            <FormField
              label="Nome da Etapa"
              :error="errors.name"
              required
            >
              <Input
                v-model="formData.name"
                placeholder="Ex: Interessado, Proposta Enviada..."
                :disabled="loading"
                :variant="errors.name ? 'invalid' : 'default'"
              />
            </FormField>

            <FormField
              label="Frase de Rastreamento"
              helper-text="Quando um contato enviar uma mensagem contendo esta frase, ele será movido automaticamente para esta etapa."
            >
              <Input
                v-model="formData.trackingPhrase"
                placeholder="Frase que move contatos para esta etapa..."
                :disabled="loading"
              />
            </FormField>
        </section>

        <section class="space-y-4">
            <FormField label="Tipo da Etapa">

              <Select
                v-model="formData.type"
                :disabled="loading"
                :options="[
                  { value: 'normal', label: 'Normal - Etapa comum do funil' },
                  { value: 'sale', label: 'Venda - Etapa de venda realizada' },
                  { value: 'lost', label: 'Perdida - Etapa de venda perdida' }
                ]"
                placeholder="Selecione o tipo da etapa"
              />
            </FormField>

            <Alert variant="warning">
              <template #default>
                <div class="text-sm">
                  <p class="font-medium mb-1">Regras importantes:</p>
                  <ul class="list-disc list-inside space-y-1 text-xs">
                    <li>Apenas 1 etapa pode ser marcada como "Venda"</li>
                    <li>Apenas 1 etapa pode ser marcada como "Perdida"</li>
                    <li>Se já existir uma etapa do mesmo tipo, ela será alterada automaticamente</li>
                  </ul>
                </div>
              </template>
            </Alert>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="section-kicker">Eventos por Etapa/Origem</h3>
              <p class="mt-1 text-xs text-muted-foreground">
                Configure regras para disparar eventos offline quando um contato entrar nesta etapa.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="loading || loadingSupportData"
              @click="addRoute"
            >
              <Plus class="h-4 w-4" />
              Adicionar regra
            </Button>
          </div>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Valor Padrão">
              <Input
                v-model="formData.eventConfig.defaultValue"
                type="number"
                placeholder="0"
                :disabled="loading"
              />
            </FormField>

            <FormField label="Moeda Padrão">
              <Input
                v-model="formData.eventConfig.defaultCurrency"
                placeholder="BRL"
                :disabled="loading"
              />
            </FormField>
          </div>

          <Alert v-if="loadingSupportData" variant="info">
              <div class="text-sm">Carregando origens e integrações...</div>
          </Alert>

          <Alert v-if="supportDataError" variant="destructive">
            <div class="text-sm">{{ supportDataError }}</div>
          </Alert>

          <Alert v-if="errors.routeConfig" variant="destructive">
            <div class="text-sm">{{ errors.routeConfig }}</div>
          </Alert>

            <div
              v-if="formData.eventConfig.routes.length === 0"
              class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
            >
              Nenhuma regra configurada para esta etapa.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(route, index) in formData.eventConfig.routes"
                :key="route.id"
                class="rounded-lg border p-4 space-y-4 bg-muted/20"
              >
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">Regra {{ index + 1 }}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    :disabled="loading"
                    @click="removeRoute(route.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="space-y-2">
                    <Label>Canal</Label>
                    <Select
                      :model-value="route.channel"
                      :options="routeChannelOptions"
                      :disabled="loading"
                      @update:model-value="handleChannelChange(route, $event)"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>Origem</Label>
                    <Select
                      :model-value="route.sourceOriginId"
                      :options="originOptions"
                      :disabled="loading"
                      @update:model-value="route.sourceOriginId = $event"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>Tipo do Evento</Label>
                    <Input
                      v-model="route.eventType"
                      maxlength="50"
                      :disabled="loading"
                      placeholder="lead, purchase, generate_lead..."
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>Prioridade</Label>
                    <Input
                      v-model="route.priority"
                      type="number"
                      :disabled="loading"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <Checkbox
                    :model-value="route.isActive"
                    :disabled="loading"
                    @update:model-value="route.isActive = $event"
                  />
                  <span class="text-sm">Regra ativa</span>
                </div>

                <div v-if="route.channel === 'google'" class="space-y-3">
                  <Alert v-if="!googleIntegrationId" variant="warning">
                    <div class="text-sm">
                      Integração Google Ads não conectada neste projeto.
                    </div>
                  </Alert>

                  <Alert v-if="isGoogleEnhancedLeadsDisabled(route)" variant="warning">
                    <div class="text-sm">
                      Esta conta está com enhanced conversions for leads desativado.
                      Sem gclid/gbraid/wbraid, o evento será cancelado.
                    </div>
                  </Alert>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-2">
                      <Label>Conta Google Ads</Label>
                      <Select
                        :model-value="route.integrationAccountId"
                        :options="googleAccountOptions"
                        :disabled="loading || !googleIntegrationId"
                        placeholder="Selecione a conta"
                        @update:model-value="handleGoogleAccountChange(route, $event)"
                      />
                    </div>

                    <div class="space-y-2">
                      <Label>Conversion Action</Label>
                      <Select
                        :model-value="route.conversionActionId"
                        :options="getConversionActionOptions(route)"
                        :disabled="loading || !route.integrationAccountId"
                        placeholder="Selecione a conversion action"
                        @update:model-value="handleConversionActionChange(route, $event)"
                      />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="space-y-2">
                    <Label>Valor (opcional)</Label>
                    <Input
                      v-model="route.value"
                      type="number"
                      :disabled="loading"
                      placeholder="Usa valor padrão da etapa"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>Moeda (opcional)</Label>
                    <Input
                      v-model="route.currency"
                      :disabled="loading"
                      placeholder="BRL"
                    />
                  </div>
                </div>
              </div>
            </div>
        </section>
      </form>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          :disabled="loading"
          @click="handleClose"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="stage-form"
          :disabled="loading"
        >
          <Save class="h-4 w-4" />
          {{ isEditing ? 'Atualizar' : 'Criar' }} Etapa
        </Button>
      </div>
    </template>
  </Drawer>
</template>

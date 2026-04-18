<template>
  <div class="space-y-6">
    <!-- Enable Notifications -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Notificações por Email</h3>
        <p class="text-sm text-muted-foreground">
          Configure como e quando receber notificações por email
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <Switch
          v-model="formData.enabled"
          :disabled="loading"
        />
        <Label for="notifications-enabled">
          {{ formData.enabled ? 'Notificações ativadas' : 'Notificações desativadas' }}
        </Label>
      </div>
    </div>

    <!-- Email Configuration -->
    <div v-if="formData.enabled" class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Configuração de Email</h3>
        <p class="text-sm text-muted-foreground">
          Defina o email que receberá as notificações
        </p>
      </div>

      <div class="space-y-2">
        <Label for="email">Email de Destino</Label>
        <Input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="seu@email.com"
          :disabled="loading"
        />
        <p class="text-xs text-muted-foreground">
          Este email receberá todas as notificações selecionadas
        </p>
      </div>
    </div>

    <!-- Event Selection -->
    <div v-if="formData.enabled" class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Eventos para Notificar</h3>
        <p class="text-sm text-muted-foreground">
          Escolha quais eventos devem gerar notificações
        </p>
      </div>

      <NotificationEventsList
        v-model:selected-events="formData.events"
        :disabled="loading"
      />
    </div>

    <!-- Digest Settings -->
    <div v-if="formData.enabled" class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Resumos Periódicos</h3>
        <p class="text-sm text-muted-foreground">
          Configure a frequência dos resumos de atividade
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Frequency -->
        <div class="space-y-2">
          <Label for="digestFrequency">Frequência do Resumo</Label>
          <Select
            v-model="formData.digestFrequency"
            :disabled="loading"
            :options="[
              { value: 'never', label: 'Nunca' },
              { value: 'daily', label: 'Diário' },
              { value: 'weekly', label: 'Semanal' },
              { value: 'monthly', label: 'Mensal' }
            ]"
            placeholder="Selecione a frequência"
          />
        </div>

        <!-- Time -->
        <div v-if="formData.digestFrequency !== 'never'" class="space-y-2">
          <Label for="digestTime">Horário de Envio</Label>
          <Input
            id="digestTime"
            v-model="formData.digestTime"
            type="time"
            :disabled="loading"
          />
          <p class="text-xs text-muted-foreground">
            Horário no fuso: {{ formData.timezone }}
          </p>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="formData.enabled" class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Preview da Notificação</h3>
        <p class="text-sm text-muted-foreground">
          Veja como será o email de notificação
        </p>
      </div>

      <div class="border rounded-lg p-4 bg-muted/50">
        <div class="space-y-3">
          <!-- Email Header -->
          <div class="flex items-center space-x-2 pb-3 border-b">
            <Mail class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">Email de Notificação</span>
          </div>

          <!-- Subject -->
          <div>
            <Label class="text-xs text-muted-foreground">Assunto:</Label>
            <p class="text-sm font-medium">
              {{ notificationSubject }}
            </p>
          </div>

          <!-- Content Preview -->
          <div>
            <Label class="text-xs text-muted-foreground">Conteúdo:</Label>
            <div class="text-sm space-y-1 mt-1">
              <p>Olá!</p>
              <p>{{ notificationContent }}</p>
              <p class="text-xs text-muted-foreground mt-2">
                Enviado em {{ formatDateTime(new Date()) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex items-center justify-end pt-4 border-t">
      <Button
        @click="handleSave"
        :disabled="loading || !hasChanges"
        :loading="loading"
      >
        <Save class="h-4 w-4" />
        Salvar Alterações
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Save, Mail } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Switch from '@/components/ui/Switch.vue'
import Select from '@/components/ui/Select.vue'
import NotificationEventsList from '@/components/settings/NotificationEventsList.vue'
import type { NotificationSettings } from '@/types/models'
import { useFormat } from '@/composables/useFormat'

interface Props {
  /**
   * Configurações atuais (opcional)
   */
  settings?: NotificationSettings
  /**
   * Se true, indica loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  save: [data: NotificationSettings]
}>()

// ============================================================================
// STATE
// ============================================================================

const formData = ref<NotificationSettings>({
  enabled: props.settings?.enabled || false,
  email: props.settings?.email || '',
  events: props.settings?.events || [],
  digestFrequency: props.settings?.digestFrequency || 'never',
  digestTime: props.settings?.digestTime || '09:00',
  timezone: props.settings?.timezone || 'America/Sao_Paulo'
})

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatDateTime } = useFormat()

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Verifica se há mudanças não salvas
 */
const hasChanges = computed(() => {
  if (!props.settings) return true
  
  return (
    formData.value.enabled !== props.settings.enabled ||
    formData.value.email !== props.settings.email ||
    JSON.stringify(formData.value.events.sort()) !== JSON.stringify(props.settings.events.sort()) ||
    formData.value.digestFrequency !== props.settings.digestFrequency ||
    formData.value.digestTime !== props.settings.digestTime ||
    formData.value.timezone !== props.settings.timezone
  )
})

/**
 * Assunto do email de notificação
 */
const notificationSubject = computed(() => {
  if (formData.value.digestFrequency === 'never') {
    return 'Notificação do Adsmagic'
  }
  
  const frequencyMap = {
    daily: 'Resumo Diário',
    weekly: 'Resumo Semanal',
    monthly: 'Resumo Mensal'
  }
  
  return `${frequencyMap[formData.value.digestFrequency]} - Adsmagic`
})

/**
 * Conteúdo do email de notificação
 */
const notificationContent = computed(() => {
  if (formData.value.digestFrequency === 'never') {
    return 'Uma nova atividade foi registrada no seu projeto.'
  }
  
  const frequencyMap = {
    daily: 'Aqui está o resumo das atividades de hoje no seu projeto.',
    weekly: 'Aqui está o resumo das atividades desta semana no seu projeto.',
    monthly: 'Aqui está o resumo das atividades deste mês no seu projeto.'
  }
  
  return frequencyMap[formData.value.digestFrequency]
})

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Sincroniza formData com props quando settings mudam
 */
watch(
  () => props.settings,
  (newSettings) => {
    if (newSettings) {
      formData.value = { ...newSettings }
    }
  },
  { immediate: true }
)

// ============================================================================
// HANDLERS
// ============================================================================

const handleSave = () => {
  emit('save', { ...formData.value })
}
</script>

<template>
  <Modal
    v-model:open="isOpen"
    :title="editMode ? 'Editar Teste A/B' : 'Novo Teste A/B'"
    description="Compare duas versões de landing page para otimizar suas conversões."
    size="2xl"
  >
    <template #content>
      <div class="max-h-[70vh] overflow-y-auto">
        <form id="ab-test-form" @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Nome do Teste -->
        <div class="space-y-2">
          <Label for="test-name">Nome do Teste</Label>
          <Input
            id="test-name"
            v-model="formData.name"
            placeholder="Ex: Homepage vs Landing Page Promo"
            required
          />
        </div>

        <!-- Variante A -->
        <div class="p-4 border rounded-lg space-y-4 bg-blue-50/50 dark:bg-blue-900/10">
          <div class="flex items-center gap-2">
            <Badge variant="secondary" class="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Variante A
            </Badge>
            <span class="text-sm text-muted-foreground">(Controle)</span>
          </div>
          
          <div class="space-y-2">
            <Label for="url-a">URL de Destino</Label>
            <Input
              id="url-a"
              v-model="formData.urlA"
              type="url"
              placeholder="https://seusite.com/pagina-a"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="name-a">Nome da Variante (opcional)</Label>
            <Input
              id="name-a"
              v-model="formData.nameA"
              placeholder="Ex: Página Original"
            />
          </div>
        </div>

        <!-- Variante B -->
        <div class="p-4 border rounded-lg space-y-4 bg-green-50/50 dark:bg-green-900/10">
          <div class="flex items-center gap-2">
            <Badge variant="secondary" class="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Variante B
            </Badge>
            <span class="text-sm text-muted-foreground">(Tratamento)</span>
          </div>
          
          <div class="space-y-2">
            <Label for="url-b">URL de Destino</Label>
            <Input
              id="url-b"
              v-model="formData.urlB"
              type="url"
              placeholder="https://seusite.com/pagina-b"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="name-b">Nome da Variante (opcional)</Label>
            <Input
              id="name-b"
              v-model="formData.nameB"
              placeholder="Ex: Nova Landing Page"
            />
          </div>
        </div>

        <!-- Distribuição de Tráfego -->
        <div class="space-y-4">
          <Label>Distribuição de Tráfego</Label>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Variante A</span>
                <span class="text-sm font-bold">{{ formData.splitPercentage }}%</span>
              </div>
              <div class="h-2 bg-blue-200 dark:bg-blue-800 rounded-full" />
            </div>
            <input
              type="range"
              v-model.number="formData.splitPercentage"
              min="10"
              max="90"
              step="5"
              class="w-24"
            />
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-green-600 dark:text-green-400">Variante B</span>
                <span class="text-sm font-bold">{{ 100 - formData.splitPercentage }}%</span>
              </div>
              <div class="h-2 bg-green-200 dark:bg-green-800 rounded-full" />
            </div>
          </div>
        </div>

        <!-- Meta de Conversão -->
        <div class="space-y-2">
          <Label for="goal">Meta de Conversão</Label>
          <Select 
            v-model="formData.conversionGoal"
            :options="[]"
            placeholder="Selecionar meta"
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a meta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="click">Clique no link</SelectItem>
              <SelectItem value="contact">Contato criado</SelectItem>
              <SelectItem value="sale">Venda realizada</SelectItem>
              <SelectItem value="custom">Evento customizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Duração do Teste -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="min-visits">Visitas Mínimas por Variante</Label>
            <Input
              id="min-visits"
              v-model.number="formData.minVisitsPerVariant"
              type="number"
              min="100"
              placeholder="100"
            />
          </div>
          <div class="space-y-2">
            <Label for="max-days">Duração Máxima (dias)</Label>
            <Input
              id="max-days"
              v-model.number="formData.maxDurationDays"
              type="number"
              min="7"
              max="90"
              placeholder="30"
            />
          </div>
        </div>

        <!-- Configurações Avançadas -->
        <Collapsible v-model:open="showAdvanced">
          <CollapsibleTrigger class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronRight class="h-4 w-4 transition-transform" :class="{ 'rotate-90': showAdvanced }" />
            Configurações Avançadas
          </CollapsibleTrigger>
          <CollapsibleContent class="mt-4 space-y-4">
            <!-- Nível de Confiança -->
            <div class="space-y-2">
              <Label>Nível de Confiança Estatística</Label>
              <div class="flex items-center gap-2">
                <Button
                  v-for="level in [90, 95, 99]"
                  :key="level"
                  type="button"
                  :variant="formData.confidenceLevel === level ? 'default' : 'outline'"
                  size="sm"
                  @click="formData.confidenceLevel = level as 90 | 95 | 99"
                >
                  {{ level }}%
                </Button>
              </div>
              <p class="text-xs text-muted-foreground">
                Maior confiança = mais precisão, mas requer mais tráfego.
              </p>
            </div>

            <!-- Auto-pausar -->
            <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p class="font-medium">Auto-pausar quando houver vencedor</p>
                <p class="text-sm text-muted-foreground">
                  Encerra automaticamente quando uma variante vence com significância estatística.
                </p>
              </div>
              <Switch v-model:checked="formData.autoPauseOnWinner" />
            </div>

            <!-- UTM Tags -->
            <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p class="font-medium">Adicionar UTM Tags automaticamente</p>
                <p class="text-sm text-muted-foreground">
                  Adiciona utm_content=variant_a ou utm_content=variant_b aos links.
                </p>
              </div>
              <Switch v-model:checked="formData.addUtmTags" />
            </div>
          </CollapsibleContent>
        </Collapsible>

        </form>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" @click="isOpen = false">
          Cancelar
        </Button>
        <Button type="submit" form="ab-test-form" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
          {{ editMode ? 'Salvar Alterações' : 'Criar Teste A/B' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronRight, Loader2 } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Switch from '@/components/ui/Switch.vue'
import Select from '@/components/ui/Select.vue'
import SelectTrigger from '@/components/ui/SelectTrigger.vue'
import SelectValue from '@/components/ui/SelectValue.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import Modal from '@/components/ui/Modal.vue'
import Collapsible from '@/components/ui/Collapsible.vue'
import CollapsibleTrigger from '@/components/ui/CollapsibleTrigger.vue'
import CollapsibleContent from '@/components/ui/CollapsibleContent.vue'

// ============================================================================
// TYPES
// ============================================================================

export interface ABTest {
  id: string
  name: string
  urlA: string
  urlB: string
  nameA: string
  nameB: string
  splitPercentage: number
  conversionGoal: 'click' | 'contact' | 'sale' | 'custom'
  minVisitsPerVariant: number
  maxDurationDays: number
  confidenceLevel: 90 | 95 | 99
  autoPauseOnWinner: boolean
  addUtmTags: boolean
  status: 'draft' | 'running' | 'paused' | 'completed'
  createdAt: string
  stats?: {
    variantA: {
      visits: number
      conversions: number
      conversionRate: number
    }
    variantB: {
      visits: number
      conversions: number
      conversionRate: number
    }
    winner: 'A' | 'B' | null
    confidence: number
  }
}

interface FormData {
  name: string
  urlA: string
  urlB: string
  nameA: string
  nameB: string
  splitPercentage: number
  conversionGoal: 'click' | 'contact' | 'sale' | 'custom'
  minVisitsPerVariant: number
  maxDurationDays: number
  confidenceLevel: 90 | 95 | 99
  autoPauseOnWinner: boolean
  addUtmTags: boolean
}

// ============================================================================
// PROPS & EMITS
// ============================================================================

interface Props {
  modelValue?: boolean
  test?: ABTest | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  test: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', test: ABTest): void
}>()

// ============================================================================
// STORES
// ============================================================================

const toast = useToastStore()

// ============================================================================
// STATE
// ============================================================================

const isOpen = ref(props.modelValue)
const isSaving = ref(false)
const showAdvanced = ref(false)
const editMode = ref(!!props.test)

const defaultFormData: FormData = {
  name: '',
  urlA: '',
  urlB: '',
  nameA: 'Variante A',
  nameB: 'Variante B',
  splitPercentage: 50,
  conversionGoal: 'contact',
  minVisitsPerVariant: 100,
  maxDurationDays: 30,
  confidenceLevel: 95,
  autoPauseOnWinner: true,
  addUtmTags: true
}

const formData = ref<FormData>({ ...defaultFormData })

// ============================================================================
// WATCHERS
// ============================================================================

watch(() => props.modelValue, (val) => {
  isOpen.value = val
})

watch(isOpen, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.test, (test) => {
  editMode.value = !!test
  if (test) {
    formData.value = {
      name: test.name,
      urlA: test.urlA,
      urlB: test.urlB,
      nameA: test.nameA,
      nameB: test.nameB,
      splitPercentage: test.splitPercentage,
      conversionGoal: test.conversionGoal,
      minVisitsPerVariant: test.minVisitsPerVariant,
      maxDurationDays: test.maxDurationDays,
      confidenceLevel: test.confidenceLevel,
      autoPauseOnWinner: test.autoPauseOnWinner,
      addUtmTags: test.addUtmTags
    }
  } else {
    formData.value = { ...defaultFormData }
  }
}, { immediate: true })

// ============================================================================
// HANDLERS
// ============================================================================

async function handleSubmit() {
  if (!formData.value.name || !formData.value.urlA || !formData.value.urlB) {
    toast.addToast({
      title: 'Erro',
      description: 'Preencha todos os campos obrigatórios',
      variant: 'destructive'
    })
    return
  }

  if (formData.value.urlA === formData.value.urlB) {
    toast.addToast({
      title: 'Erro',
      description: 'As URLs das variantes devem ser diferentes',
      variant: 'destructive'
    })
    return
  }

  isSaving.value = true
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500))

    const savedTest: ABTest = {
      id: props.test?.id || `ab-${Date.now()}`,
      ...formData.value,
      status: props.test?.status || 'draft',
      createdAt: props.test?.createdAt || new Date().toISOString(),
      stats: props.test?.stats
    }

    emit('saved', savedTest)
    toast.addToast({
      title: 'Sucesso',
      description: editMode.value ? 'Teste A/B atualizado!' : 'Teste A/B criado!',
      variant: 'success'
    })
    isOpen.value = false
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao salvar teste A/B',
      variant: 'destructive'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

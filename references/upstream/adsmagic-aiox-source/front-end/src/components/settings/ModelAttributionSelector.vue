<template>
  <div class="space-y-4">
    <RadioGroup
      :model-value="modelValue"
      @update:model-value="handleUpdate"
      :disabled="disabled"
      class="space-y-3"
    >
      <!-- First Touch -->
      <div class="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <RadioGroupItem
          value="first_touch"
          id="first_touch"
          class="mt-1"
        />
        <div class="flex-1 min-w-0">
          <Label
            for="first_touch"
            class="flex items-center space-x-2 cursor-pointer"
          >
            <Target class="h-5 w-5 text-blue-600" />
            <span class="font-medium">First Touch (Primeira Origem)</span>
          </Label>
          <p class="text-sm text-muted-foreground mt-1">
            Atribui conversão à primeira origem de contato. Ideal para entender qual canal trouxe o lead inicialmente.
          </p>
          <div class="mt-2 text-xs text-muted-foreground">
            <strong>Exemplo:</strong> Lead veio do Facebook → depois clicou no Google → Atribui ao Facebook
          </div>
        </div>
      </div>

      <!-- Last Touch -->
      <div class="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <RadioGroupItem
          value="last_touch"
          id="last_touch"
          class="mt-1"
        />
        <div class="flex-1 min-w-0">
          <Label
            for="last_touch"
            class="flex items-center space-x-2 cursor-pointer"
          >
            <MousePointer class="h-5 w-5 text-green-600" />
            <span class="font-medium">Last Touch (Última Origem)</span>
          </Label>
          <p class="text-sm text-muted-foreground mt-1">
            Atribui conversão à última origem antes da venda. Ideal para entender qual canal "fechou" a venda.
          </p>
          <div class="mt-2 text-xs text-muted-foreground">
            <strong>Exemplo:</strong> Lead veio do Facebook → depois clicou no Google → Atribui ao Google
          </div>
        </div>
      </div>

      <!-- Conversion -->
      <div class="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <RadioGroupItem
          value="conversion"
          id="conversion"
          class="mt-1"
        />
        <div class="flex-1 min-w-0">
          <Label
            for="conversion"
            class="flex items-center space-x-2 cursor-pointer"
          >
            <TrendingUp class="h-5 w-5 text-purple-600" />
            <span class="font-medium">Conversão (Origem na Venda)</span>
          </Label>
          <p class="text-sm text-muted-foreground mt-1">
            Atribui conversão à origem quando o contato estava na etapa de venda. Ideal para entender qual canal estava ativo no momento da conversão.
          </p>
          <div class="mt-2 text-xs text-muted-foreground">
            <strong>Exemplo:</strong> Lead na etapa de venda clicou em email → Atribui ao Email
          </div>
        </div>
      </div>
    </RadioGroup>

    <!-- Help Text -->
    <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-start space-x-2">
        <Info class="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p class="text-sm font-medium text-blue-600">Dica de Uso</p>
          <p class="text-xs text-blue-600/80 mt-1">
            O modelo de atribuição afeta como as conversões são contabilizadas nos relatórios. 
            Você pode alterar esta configuração a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Target, 
  MousePointer, 
  TrendingUp, 
  Info 
} from 'lucide-vue-next'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'
import Label from '@/components/ui/Label.vue'

interface Props {
  /**
   * Valor selecionado
   */
  modelValue: 'first_touch' | 'last_touch' | 'conversion'
  /**
   * Se true, componente está desabilitado
   */
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ============================================================================
// HANDLERS
// ============================================================================

const handleUpdate = (value: string | number | boolean) => {
  emit('update:modelValue', value as string)
}
</script>

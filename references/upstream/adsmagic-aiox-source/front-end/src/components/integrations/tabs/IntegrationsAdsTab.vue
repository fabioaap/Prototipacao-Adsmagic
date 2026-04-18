<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div
      v-for="template in templates"
      :key="template.platform"
      class="bg-card border rounded-lg p-6"
      :data-testid="`ads-card-${template.platform}`"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
            <BrandIcons
              :name="template.platform"
              class="h-5 w-5"
            />
          </div>
          <div>
            <h3 class="section-title-sm">{{ template.title }}</h3>
            <p class="text-sm text-muted-foreground">Parâmetros para URL final</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          :disabled="!template.copyEnabled"
          :data-testid="`copy-${template.platform}`"
          @click="emit('copy-template', { template: template.template, title: template.title })"
        >
          <Copy class="h-4 w-4 mr-2" />
          Copiar
        </Button>
      </div>

      <div class="bg-muted/50 p-4 rounded-lg">
        <pre class="text-xs whitespace-pre-wrap break-all"><code>{{ template.template }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import BrandIcons from '@/components/icons/BrandIcons.vue'
import Button from '@/components/ui/Button.vue'
import type { AdTrackingTemplate } from '@/types/integrations'

interface Props {
  templates: readonly AdTrackingTemplate[]
}

defineProps<Props>()

const emit = defineEmits<{
  'copy-template': [payload: { template: string; title: string }]
}>()
</script>

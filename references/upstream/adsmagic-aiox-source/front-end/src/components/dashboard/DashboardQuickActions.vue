<script setup lang="ts">
import { Plus, TrendingUp, Link2, Settings } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

interface QuickAction {
  label: string
  icon: any
  variant?: 'default' | 'outline' | 'secondary'
  action: () => void
}

interface Props {
  actions?: QuickAction[]
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
})

const emit = defineEmits<{
  action: [actionLabel: string]
}>()

const defaultActions: QuickAction[] = [
  {
    label: 'Novo Contato',
    icon: Plus,
    variant: 'default',
    action: () => emit('action', 'new-contact'),
  },
  {
    label: 'Nova Venda',
    icon: TrendingUp,
    variant: 'default',
    action: () => emit('action', 'new-sale'),
  },
  {
    label: 'Novo Link',
    icon: Link2,
    variant: 'outline',
    action: () => emit('action', 'new-link'),
  },
  {
    label: 'Gerenciar Etapas',
    icon: Settings,
    variant: 'outline',
    action: () => emit('action', 'manage-stages'),
  },
]

const displayActions = props.actions.length > 0 ? props.actions : defaultActions
</script>

<template>
  <Card class="p-6">
    <h3 class="section-title-sm mb-4">Ações Rápidas</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Button
        v-for="action in displayActions"
        :key="action.label"
        :variant="action.variant || 'default'"
        size="default"
        class="justify-start"
        @click="action.action"
      >
        <component :is="action.icon" class="h-4 w-4 mr-2" />
        {{ action.label }}
      </Button>
    </div>
  </Card>
</template>

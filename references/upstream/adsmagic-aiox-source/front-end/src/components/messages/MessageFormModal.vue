<script setup lang="ts">
import { ref, watch } from 'vue'
import { useOriginsStore } from '@/stores/origins'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import type { Message, CreateMessageDTO, UpdateMessageDTO } from '@/types'

interface Props {
  open: boolean
  message?: Message | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'submit', data: CreateMessageDTO | UpdateMessageDTO): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const originsStore = useOriginsStore()

const form = ref({
  name: '',
  originId: '',
})

watch(
  () => props.message,
  (message) => {
    if (message) {
      form.value = {
        name: message.name,
        originId: message.originId,
      }
    } else {
      form.value = {
        name: '',
        originId: '',
      }
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  emit('submit', form.value)
  emit('update:open', false)
}
</script>

<template>
  <Modal
    :open="open"
    :title="message ? 'Editar Mensagem' : 'Nova Mensagem'"
    :description="message ? 'Atualize as informações da mensagem' : 'Crie uma nova mensagem/conversa'"
    @update:open="(val) => emit('update:open', val)"
  >
    <div class="space-y-4 py-4">
      <div>
        <label class="text-sm font-medium mb-1.5 block">Nome</label>
        <Input v-model="form.name" placeholder="Ex: Campanha WhatsApp" />
      </div>
      <div>
        <label class="text-sm font-medium mb-1.5 block">Origem</label>
        <Select
          v-model="form.originId"
          :options="originsStore.origins.map((origin) => ({ value: origin.id, label: origin.name }))"
          placeholder="Selecione uma origem"
        />
      </div>
    </div>
    <template #footer>
      <Button variant="outline" @click="emit('update:open', false)">
        Cancelar
      </Button>
      <Button @click="handleSubmit">
        {{ message ? 'Salvar' : 'Criar' }}
      </Button>
    </template>
  </Modal>
</template>

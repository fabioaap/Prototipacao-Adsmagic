<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { Mail, Phone, MapPin, Calendar, Building2, Tag, FileText, Edit2, Trash2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Drawer from '@/components/ui/Drawer.vue'
import ActivityTimeline from '@/components/contacts/ActivityTimeline.vue'
import StageBadge from '@/components/ui/StageBadge.vue'
import type { Contact } from '@/types/models'
import { useStagesStore } from '@/stores/stages'
import { useOriginsStore } from '@/stores/origins'
import { formatSafeDate } from '@/utils/formatters'

interface Props {
  /**
   * Se true, exibe o drawer
   */
  open: boolean
  /**
   * Contato a ser exibido
   */
  contact: Contact | null
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  contact: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [contact: Contact]
  delete: [contact: Contact]
}>()

const stagesStore = useStagesStore()
const originsStore = useOriginsStore()

// Ref para o componente de timeline
const timelineRef = ref<InstanceType<typeof ActivityTimeline> | null>(null)

// Recarregar timeline quando o drawer abre
watch(() => props.open, (isOpen) => {
  if (isOpen && props.contact && timelineRef.value) {
    timelineRef.value.reload()
  }
})

// Get stage data
const stage = computed(() => {
  if (!props.contact) return null
  return stagesStore.stages.find(s => s.id === props.contact?.stage)
})

// Get origin data
const origin = computed(() => {
  if (!props.contact) return null
  return originsStore.origins.find(o => o.id === props.contact?.origin)
})

// Avatar fallback (iniciais)
const avatarFallback = computed(() => {
  if (!props.contact) return ''
  return props.contact.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// Handle edit
const handleEdit = () => {
  if (props.contact) {
    emit('edit', props.contact)
  }
}

// Handle delete
const handleDelete = () => {
  if (props.contact) {
    emit('delete', props.contact)
  }
}
</script>

<template>
  <Drawer
    :open="props.open && !!props.contact"
    title="Detalhes do Contato"
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div v-if="props.contact" class="p-4 sm:p-6 space-y-6">
        <!-- Avatar & Name -->
        <div class="flex items-center gap-4">
          <div class="relative flex-shrink-0">
            <img
              v-if="props.contact.avatar"
              :src="props.contact.avatar"
              :alt="props.contact.name"
              class="h-16 w-16 rounded-full object-cover"
            />
            <div
              v-else
              class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xl"
            >
              {{ avatarFallback }}
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="section-title-md truncate">
              {{ props.contact.name }}
            </h3>
            <p v-if="props.contact.company" class="text-sm text-muted-foreground truncate">
              {{ props.contact.company }}
            </p>
          </div>
        </div>

        <!-- Stage Badge -->
        <div>
          <StageBadge v-if="stage" :stage="stage" size="lg" />
        </div>

        <!-- Contact Info -->
        <div class="space-y-4">
          <h4 class="section-kicker uppercase tracking-wide">
            Informações de Contato
          </h4>

          <!-- Email -->
          <div v-if="props.contact.email" class="flex items-start gap-3">
            <Mail class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <p class="text-xs text-muted-foreground mb-1">Email</p>
              <a
                :href="`mailto:${props.contact.email}`"
                class="text-sm text-primary hover:underline break-all"
              >
                {{ props.contact.email }}
              </a>
            </div>
          </div>

          <!-- Phone -->
          <div v-if="props.contact.phone" class="flex items-start gap-3">
            <Phone class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-xs text-muted-foreground mb-1">Telefone</p>
              <a
                :href="`tel:+${props.contact.countryCode}${props.contact.phone}`"
                class="text-sm text-primary hover:underline"
              >
                +{{ props.contact.countryCode }} {{ props.contact.phone }}
              </a>
            </div>
          </div>

          <!-- Location -->
          <div v-if="props.contact.location" class="flex items-start gap-3">
            <MapPin class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-xs text-muted-foreground mb-1">Localização</p>
              <p class="text-sm">{{ props.contact.location }}</p>
            </div>
          </div>

          <!-- Company -->
          <div v-if="props.contact.company" class="flex items-start gap-3">
            <Building2 class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-xs text-muted-foreground mb-1">Empresa</p>
              <p class="text-sm">{{ props.contact.company }}</p>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="space-y-4">
          <h4 class="section-kicker uppercase tracking-wide">
            Informações Adicionais
          </h4>

          <!-- Origin -->
          <div v-if="origin" class="flex items-start gap-3">
            <Tag class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-xs text-muted-foreground mb-1">Origem</p>
              <p class="text-sm">{{ origin.name }}</p>
            </div>
          </div>

          <!-- Created At -->
          <div class="flex items-start gap-3">
            <Calendar class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-xs text-muted-foreground mb-1">Data de Criação</p>
              <p class="text-sm">{{ formatSafeDate(props.contact.createdAt) }}</p>
            </div>
          </div>

          <!-- Updated At -->
          <div class="flex items-start gap-3">
            <Calendar class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-xs text-muted-foreground mb-1">Última Atualização</p>
              <p class="text-sm">{{ formatSafeDate(props.contact.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Activity History -->
        <ActivityTimeline
          v-if="props.contact"
          ref="timelineRef"
          :contact-id="props.contact.id"
          :initial-limit="5"
          :auto-load="true"
        />

        <!-- Notes -->
        <div v-if="props.contact.notes" class="space-y-4">
          <h4 class="section-kicker uppercase tracking-wide">
            Notas
          </h4>

          <div class="flex items-start gap-3">
            <FileText class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm whitespace-pre-wrap">{{ props.contact.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          class="w-full sm:flex-1"
          @click="handleEdit"
        >
          <Edit2 class="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button
          variant="destructive"
          class="w-full sm:flex-1"
          @click="handleDelete"
        >
          <Trash2 class="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </div>
    </template>
  </Drawer>
</template>

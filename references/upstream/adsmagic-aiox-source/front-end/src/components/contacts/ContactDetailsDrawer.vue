<script setup lang="ts">
import { computed, ref } from 'vue'
import { Mail, Phone, MapPin, Calendar, Building2, Tag, FileText, Edit2, Trash2 } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import Drawer from '@/components/ui/Drawer.vue'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import ActivityTimeline from '@/components/contacts/ActivityTimeline.vue'
import ConversationHistory from '@/components/contacts/ConversationHistory.vue'
import { cn } from '@/lib/utils'
import type { Contact } from '@/types/models'
import { useStagesStore } from '@/stores/stages'
import { useOriginsStore } from '@/stores/origins'
import { formatSafeDate } from '@/utils/formatters'
import { useI18n } from 'vue-i18n'

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

const { t } = useI18n()
const stagesStore = useStagesStore()
const originsStore = useOriginsStore()
const activeTab = ref('details')


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

// Stage badge color
const stageBadgeClass = computed(() => {
  if (!stage.value) return 'bg-muted text-muted-foreground'

  return cn(
    'inline-flex items-center text-sm px-3 py-1 rounded-full font-medium',
    stage.value.color
  )
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
    :title="t('contacts.tabs.details')"
    size="lg"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div v-if="props.contact" class="flex flex-col h-full">
        <!-- Avatar & Name (always visible above tabs) -->
        <div class="p-4 sm:px-6 sm:pt-6 pb-2">
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
          <div class="mt-3">
            <span v-if="stage" :class="stageBadgeClass">
              {{ stage.name }}
            </span>
          </div>
        </div>

        <!-- Tabs -->
        <Tabs v-model="activeTab" class="flex-1 flex flex-col min-h-0">
          <TabsList class="mx-4 sm:mx-6">
            <TabsTrigger value="details">
              {{ t('contacts.tabs.details') }}
            </TabsTrigger>
            <TabsTrigger value="conversations">
              {{ t('contacts.tabs.conversations') }}
            </TabsTrigger>
          </TabsList>

          <!-- Details Tab -->
          <TabsContent value="details" class="flex-1 overflow-y-auto">
            <div class="p-4 sm:px-6 space-y-6">
              <!-- Contact Info -->
              <div class="space-y-4">
                <h4 class="section-kicker uppercase tracking-wide">
                  {{ t('contacts.contactInfo', 'Informações de Contato') }}
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
                    <p class="text-xs text-muted-foreground mb-1">{{ t('contacts.phone', 'Telefone') }}</p>
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
                    <p class="text-xs text-muted-foreground mb-1">{{ t('contacts.location', 'Localização') }}</p>
                    <p class="text-sm">{{ props.contact.location }}</p>
                  </div>
                </div>

                <!-- Company -->
                <div v-if="props.contact.company" class="flex items-start gap-3">
                  <Building2 class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <p class="text-xs text-muted-foreground mb-1">{{ t('contacts.company', 'Empresa') }}</p>
                    <p class="text-sm">{{ props.contact.company }}</p>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="space-y-4">
                <h4 class="section-kicker uppercase tracking-wide">
                  {{ t('contacts.additionalInfo', 'Informações Adicionais') }}
                </h4>

                <!-- Origin -->
                <div v-if="origin" class="flex items-start gap-3">
                  <Tag class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <p class="text-xs text-muted-foreground mb-1">{{ t('contacts.origin', 'Origem') }}</p>
                    <p class="text-sm">{{ origin.name }}</p>
                  </div>
                </div>

                <!-- Created At -->
                <div class="flex items-start gap-3">
                  <Calendar class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <p class="text-xs text-muted-foreground mb-1">{{ t('contacts.createdAt', 'Data de Criação') }}</p>
                    <p class="text-sm">{{ formatSafeDate(props.contact.createdAt) }}</p>
                  </div>
                </div>

                <!-- Updated At -->
                <div class="flex items-start gap-3">
                  <Calendar class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <p class="text-xs text-muted-foreground mb-1">{{ t('contacts.updatedAt', 'Última Atualização') }}</p>
                    <p class="text-sm">{{ formatSafeDate(props.contact.updatedAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- Activity History -->
              <ActivityTimeline
                v-if="props.contact"
                :contact-id="props.contact.id"
                :initial-limit="5"
                :auto-load="true"
              />

              <!-- Notes -->
              <div v-if="props.contact.notes" class="space-y-4">
                <h4 class="section-kicker uppercase tracking-wide">
                  {{ t('contacts.notes', 'Notas') }}
                </h4>

                <div class="flex items-start gap-3">
                  <FileText class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <p class="text-sm whitespace-pre-wrap">{{ props.contact.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Conversations Tab -->
          <TabsContent value="conversations" class="flex-1 min-h-0">
            <ConversationHistory :contact-id="props.contact?.id ?? null" />
          </TabsContent>
        </Tabs>
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
          {{ t('common.edit', 'Editar') }}
        </Button>
        <Button
          variant="destructive"
          class="w-full sm:flex-1"
          @click="handleDelete"
        >
          <Trash2 class="h-4 w-4 mr-2" />
          {{ t('common.delete', 'Excluir') }}
        </Button>
      </div>
    </template>
  </Drawer>
</template>

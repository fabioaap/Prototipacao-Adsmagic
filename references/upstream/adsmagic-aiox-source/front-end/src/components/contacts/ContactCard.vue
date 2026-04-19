<script setup lang="ts">
import { computed } from 'vue'
import { GripVertical, Mail, Phone, MapPin, Calendar, MoreVertical } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { Contact } from '@/types/models'
import { useStagesStore } from '@/stores/stages'
import { useOriginsStore } from '@/stores/origins'
import { formatSafeDate } from '@/utils/formatters'

interface Props {
  /**
   * Contato a ser exibido
   */
  contact: Contact
  /**
   * Se true, mostra o handle de drag
   */
  draggable?: boolean
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
  /**
   * Se true, aplica hover effect
   */
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  draggable: false,
  loading: false,
  hoverable: true,
})

const emit = defineEmits<{
  click: [contact: Contact]
  edit: [contact: Contact]
  delete: [contact: Contact]
  viewDetails: [contact: Contact]
}>()

const stagesStore = useStagesStore()
const originsStore = useOriginsStore()

// Get stage data
const stage = computed(() => {
  return stagesStore.stages.find(s => s.id === props.contact.stage)
})

// Get origin data
const origin = computed(() => {
  return originsStore.origins.find(o => o.id === props.contact.origin)
})

// Avatar fallback (iniciais)
const avatarFallback = computed(() => {
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
    'text-xs px-2 py-0.5 rounded-full font-medium',
    stage.value.color
  )
})

// Handle card click
const handleClick = () => {
  emit('click', props.contact)
}

// Handle actions
const handleViewDetails = (e: Event) => {
  e.stopPropagation()
  emit('viewDetails', props.contact)
}
</script>

<template>
  <div
    :class="cn(
      'relative rounded-lg border border-border bg-card p-4 transition-all group',
      {
        'hover:shadow-md hover:border-primary/50 cursor-pointer': props.hoverable,
        'opacity-50': props.loading,
      }
    )"
    @click="handleClick"
  >
    <!-- Drag Handle -->
    <div
      v-if="props.draggable"
      class="drag-handle absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-60 group-hover:opacity-100 transition-opacity z-10"
      @click.stop
    >
      <GripVertical class="h-4 w-4 text-muted-foreground" />
    </div>

    <!-- Loading State -->
    <div v-if="props.loading" class="space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-32 bg-muted animate-pulse rounded" />
          <div class="h-3 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div class="space-y-2">
        <div class="h-3 w-full bg-muted animate-pulse rounded" />
        <div class="h-3 w-3/4 bg-muted animate-pulse rounded" />
      </div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-3">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <img
            v-if="props.contact.avatar"
            :src="props.contact.avatar"
            :alt="props.contact.name"
            class="h-10 w-10 rounded-full object-cover"
          />
          <div
            v-else
            class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary section-kicker"
          >
            {{ avatarFallback }}
          </div>
        </div>

        <!-- Name & Company -->
        <div class="flex-1 min-w-0">
          <h4 class="section-kicker truncate">
            {{ props.contact.name }}
          </h4>
          <p v-if="props.contact.company" class="text-xs text-muted-foreground truncate">
            {{ props.contact.company }}
          </p>
        </div>

        <!-- Actions Menu -->
        <button
          class="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors"
          @click="handleViewDetails"
        >
          <MoreVertical class="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <!-- Contact Info -->
      <div class="space-y-1.5 text-xs text-muted-foreground">
        <div v-if="props.contact.email" class="flex items-center gap-2 truncate">
          <Mail class="h-3 w-3 flex-shrink-0" />
          <span class="truncate">{{ props.contact.email }}</span>
        </div>
        <div v-if="props.contact.phone" class="flex items-center gap-2">
          <Phone class="h-3 w-3 flex-shrink-0" />
          <span>{{ props.contact.phone }}</span>
        </div>
        <div v-if="props.contact.location" class="flex items-center gap-2 truncate">
          <MapPin class="h-3 w-3 flex-shrink-0" />
          <span class="truncate">{{ props.contact.location }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between gap-2 pt-2 border-t border-border">
        <!-- Stage Badge -->
        <span v-if="stage" :class="stageBadgeClass">
          {{ stage.name }}
        </span>

        <!-- Origin & Date -->
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span v-if="origin" class="truncate">
            {{ origin.name }}
          </span>
          <span class="flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            {{ formatSafeDate(props.contact.createdAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

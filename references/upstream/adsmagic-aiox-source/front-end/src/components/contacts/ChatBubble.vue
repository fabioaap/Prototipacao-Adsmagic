<script setup lang="ts">
import { computed } from 'vue'
import { Check, CheckCheck, Image, Mic, Video, File, MapPin, Play, Download } from '@/composables/useIcons'
import type { ConversationMessage } from '@/types'

interface Props {
  message: ConversationMessage
}

const props = defineProps<Props>()

const isOutbound = computed(() => props.message.direction === 'outbound')

const timeLabel = computed(() => {
  const date = new Date(props.message.sentAt)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

const statusIcon = computed(() => {
  if (!isOutbound.value) return null
  switch (props.message.status) {
    case 'sent': return Check
    case 'delivered': return CheckCheck
    case 'read': return CheckCheck
    case 'failed': return null
    default: return null
  }
})

const statusColor = computed(() => {
  if (props.message.status === 'read') return 'text-blue-500'
  if (props.message.status === 'failed') return 'text-destructive'
  return 'text-muted-foreground'
})

const mediaIcon = computed(() => {
  switch (props.message.contentType) {
    case 'image': return Image
    case 'video': return Video
    case 'audio': return Mic
    case 'document': return File
    case 'location': return MapPin
    default: return null
  }
})

const contentTypeLabel = computed(() => {
  switch (props.message.contentType) {
    case 'image': return 'Imagem'
    case 'video': return 'Vídeo'
    case 'audio': return 'Áudio'
    case 'document': return 'Documento'
    case 'location': return 'Localização'
    case 'contact': return 'Contato'
    default: return 'Mídia'
  }
})
</script>

<template>
  <div
    class="flex w-full mb-1"
    :class="isOutbound ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[75%] rounded-2xl px-3 py-2 text-sm break-words"
      :class="[
        isOutbound
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-muted text-foreground rounded-bl-md'
      ]"
    >
      <!-- Image content -->
      <div v-if="message.contentType === 'image' && message.mediaUrl" class="mb-1">
        <img
          :src="message.mediaUrl"
          :alt="message.caption || 'Imagem'"
          class="rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
          loading="lazy"
        />
      </div>

      <!-- Video content -->
      <div v-else-if="message.contentType === 'video' && message.mediaUrl" class="mb-1">
        <a
          :href="message.mediaUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 p-2 rounded-lg bg-black/10"
        >
          <Play class="h-8 w-8 flex-shrink-0" />
          <span class="text-xs">Vídeo</span>
        </a>
      </div>

      <!-- Audio content -->
      <div v-else-if="message.contentType === 'audio' && message.mediaUrl" class="mb-1">
        <audio controls class="max-w-full h-8">
          <source :src="message.mediaUrl" :type="message.mimeType || 'audio/ogg'" />
        </audio>
      </div>

      <!-- Document content -->
      <div v-else-if="message.contentType === 'document' && message.mediaUrl" class="mb-1">
        <a
          :href="message.mediaUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 p-2 rounded-lg"
          :class="isOutbound ? 'bg-primary-foreground/10' : 'bg-background/50'"
        >
          <File class="h-5 w-5 flex-shrink-0" />
          <span class="text-xs truncate flex-1">{{ message.fileName || 'Documento' }}</span>
          <Download class="h-4 w-4 flex-shrink-0 opacity-60" />
        </a>
      </div>

      <!-- Location content -->
      <div v-else-if="message.contentType === 'location'" class="mb-1">
        <div class="flex items-center gap-2 p-2 rounded-lg" :class="isOutbound ? 'bg-primary-foreground/10' : 'bg-background/50'">
          <MapPin class="h-5 w-5 flex-shrink-0" />
          <span class="text-xs">Localização compartilhada</span>
        </div>
      </div>

      <!-- Fallback: tipo de mídia sem conteúdo disponível -->
      <div
        v-else-if="mediaIcon && !message.mediaUrl"
        class="flex items-center gap-2 p-2 rounded-lg opacity-70 mb-1"
        :class="isOutbound ? 'bg-primary-foreground/10' : 'bg-background/50'"
      >
        <component :is="mediaIcon" class="h-5 w-5 flex-shrink-0" />
        <span class="text-xs italic">{{ contentTypeLabel }}</span>
      </div>

      <!-- Text content / Caption -->
      <p
        v-if="message.contentText || message.caption"
        class="whitespace-pre-wrap"
      >{{ message.contentText || message.caption }}</p>

      <!-- Timestamp + Status -->
      <div
        class="flex items-center justify-end gap-1 mt-0.5"
        :class="isOutbound ? 'text-primary-foreground/60' : 'text-muted-foreground'"
      >
        <span class="text-[10px]">{{ timeLabel }}</span>
        <component
          :is="statusIcon"
          v-if="statusIcon && isOutbound"
          class="h-3 w-3"
          :class="statusColor"
        />
        <span
          v-if="message.status === 'failed' && isOutbound"
          class="text-[10px] text-destructive"
        >!</span>
      </div>
    </div>
  </div>
</template>

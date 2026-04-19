<script setup lang="ts">
import { ref, watch } from 'vue'
import { Download } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import QRCode from 'qrcode'
import type { Link } from '@/types/models'

interface Props {
  open: boolean
  link?: Link | null
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  link: null
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const qrCodeCanvas = ref<HTMLCanvasElement | null>(null)
const isGenerating = ref(false)

// Gerar QR Code sempre que o modal abrir ou o link mudar
watch([() => props.open, () => props.link], async ([isOpen, link]) => {
  if (isOpen && link && qrCodeCanvas.value) {
    await generateQRCode(link.trackingUrl || link.url)
  }
}, { immediate: true })

// Função para gerar QR Code
const generateQRCode = async (url: string) => {
  if (!qrCodeCanvas.value) return
  
  isGenerating.value = true
  try {
    await QRCode.toCanvas(qrCodeCanvas.value, url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error)
  } finally {
    isGenerating.value = false
  }
}

// Baixar QR Code como imagem
const handleDownload = () => {
  if (!qrCodeCanvas.value || !props.link) return
  
  try {
    const link = document.createElement('a')
    link.download = `qrcode-${props.link.name.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = qrCodeCanvas.value.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('Erro ao baixar QR Code:', error)
  }
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Modal 
    :model-value="props.open" 
    @update:model-value="handleClose"
    size="sm"
    :show-close="true"
  >
    <template #header>
      <div>
        <h2 class="section-title-md">QR Code</h2>
        <p class="text-sm text-muted-foreground">
          {{ link?.name }}
        </p>
      </div>
    </template>

    <template #content>
      <div class="flex flex-col items-center gap-4">
        <div
          v-if="isGenerating"
          class="h-[300px] w-[300px] bg-muted rounded-lg animate-pulse flex items-center justify-center"
        >
          <p class="text-sm text-muted-foreground">Gerando QR Code...</p>
        </div>
        <div
          v-else
          class="bg-white p-4 rounded-lg border border-border shadow-sm"
        >
          <canvas ref="qrCodeCanvas" />
        </div>
        
        <div class="w-full p-3 bg-muted rounded-lg">
          <p class="text-xs text-muted-foreground text-center break-all">
            {{ link?.trackingUrl || link?.url }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3 w-full">
        <Button
          variant="outline"
          class="flex-1"
          @click="handleClose"
        >
          Fechar
        </Button>
        <Button
          class="flex-1"
          :disabled="isGenerating"
          @click="handleDownload"
        >
          <Download class="h-4 w-4 mr-2" />
          Baixar PNG
        </Button>
      </div>
    </template>
  </Modal>
</template>

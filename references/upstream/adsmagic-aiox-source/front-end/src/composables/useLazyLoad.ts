import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable para lazy loading com scroll infinito
 * @param loadMore Função a ser chamada quando o usuário chega perto do fim
 * @param threshold Distância do fim para ativar o carregamento (em pixels)
 * @returns Referência do container e estado de loading
 */
export function useLazyLoad(loadMore: () => void, threshold = 100) {
  const containerRef = ref<HTMLElement | null>(null)
  const isLoading = ref(false)

  const handleScroll = () => {
    if (!containerRef.value || isLoading.value) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom < threshold) {
      isLoading.value = true
      loadMore()
      setTimeout(() => {
        isLoading.value = false
      }, 500)
    }
  }

  onMounted(() => {
    containerRef.value?.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('scroll', handleScroll)
  })

  return { containerRef, isLoading }
}

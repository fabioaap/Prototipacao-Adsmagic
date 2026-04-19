import { ref, type ComputedRef } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'

type TagVerificationStatus = 'pending' | 'verified' | 'expired' | 'failed'

interface StartTagVerificationResult {
  verificationId: string
  status: TagVerificationStatus
  verificationUrl: string
}

interface GetTagVerificationStatusResult {
  status: TagVerificationStatus
}

interface UseTagVerificationOptions {
  currentProjectId: ComputedRef<string>
  getDefaultSiteUrl: () => string
  startTagVerification: (siteUrl: string) => Promise<StartTagVerificationResult>
  getTagVerificationStatus: (verificationId: string) => Promise<GetTagVerificationStatusResult>
  checkTagInstallation: (projectId: string) => Promise<boolean>
}

export const useTagVerification = ({
  currentProjectId,
  getDefaultSiteUrl,
  startTagVerification,
  getTagVerificationStatus,
  checkTagInstallation,
}: UseTagVerificationOptions) => {
  const { toast } = useToast()

  const isTagVerificationModalOpen = ref(false)
  const tagVerificationSiteUrl = ref('')
  const isTagVerificationSubmitting = ref(false)
  const isTagVerificationPolling = ref(false)
  const activeTagVerificationId = ref<string | null>(null)
  const activeTagVerificationStatus = ref<TagVerificationStatus | null>(null)
  const cancelTagVerificationPolling = ref(false)
  const hasPollingTimedOut = ref(false)

  const parseAndValidateSiteUrl = (rawUrl: string): string => {
    const trimmed = rawUrl.trim()
    const parsed = new URL(trimmed)

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('A URL precisa começar com http:// ou https://')
    }

    return parsed.toString()
  }

  const sleep = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms)
    })

  const openTagVerificationModal = () => {
    tagVerificationSiteUrl.value = getDefaultSiteUrl()
    activeTagVerificationId.value = null
    activeTagVerificationStatus.value = null
    cancelTagVerificationPolling.value = false
    hasPollingTimedOut.value = false
    isTagVerificationModalOpen.value = true
  }

  const closeTagVerificationModal = () => {
    isTagVerificationModalOpen.value = false
    isTagVerificationSubmitting.value = false
    isTagVerificationPolling.value = false
    cancelTagVerificationPolling.value = true
  }

  const pollTagVerificationStatus = async (
    verificationId: string
  ): Promise<TagVerificationStatus> => {
    const maxAttempts = 45

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (cancelTagVerificationPolling.value) {
        return 'pending'
      }

      const status = await getTagVerificationStatus(verificationId)
      activeTagVerificationStatus.value = status.status

      if (status.status !== 'pending') {
        return status.status
      }

      await sleep(2000)
    }

    return 'pending'
  }

  const handleStartTagVerification = async () => {
    let popup: Window | null = null
    let popupNavigated = false

    try {
      if (!currentProjectId.value) {
        throw new Error('Projeto não selecionado')
      }

      const validatedSiteUrl = parseAndValidateSiteUrl(tagVerificationSiteUrl.value)
      popup = window.open('', '_blank')
      if (!popup) {
        throw new Error('Permita pop-ups para abrir o site e concluir a verificação')
      }

      isTagVerificationSubmitting.value = true
      cancelTagVerificationPolling.value = false

      const startResult = await startTagVerification(validatedSiteUrl)

      activeTagVerificationId.value = startResult.verificationId
      activeTagVerificationStatus.value = startResult.status

      if (popup.closed) {
        throw new Error('A janela de verificação foi fechada. Inicie novamente para continuar.')
      }

      popup.opener = null
      popup.location.replace(startResult.verificationUrl)
      popupNavigated = true

      isTagVerificationPolling.value = true
      const finalStatus = await pollTagVerificationStatus(startResult.verificationId)

      if (cancelTagVerificationPolling.value) {
        return
      }

      if (finalStatus === 'verified') {
        const installed = await checkTagInstallation(currentProjectId.value)
        toast({
          title: 'Verificação concluída',
          description: installed
            ? 'Tag instalada e validada com sucesso'
            : 'Verificação finalizou, mas a tag ainda não foi marcada como instalada',
        })
        closeTagVerificationModal()
        return
      }

      if (finalStatus === 'expired') {
        toast({
          title: 'Verificação expirada',
          description: 'A janela de validação expirou. Inicie uma nova verificação.',
          variant: 'destructive',
        })
        return
      }

      if (finalStatus === 'failed') {
        toast({
          title: 'Verificação falhou',
          description: 'Não foi possível validar a tag para a URL informada.',
          variant: 'destructive',
        })
        return
      }

      hasPollingTimedOut.value = true
      toast({
        title: 'Verificação pendente',
        description: 'Verifique se a tag está instalada corretamente no site e tente novamente.',
      })
    } catch (error) {
      if (popup && !popup.closed && !popupNavigated) {
        popup.close()
      }

      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível iniciar a verificação da tag',
        variant: 'destructive',
      })
    } finally {
      isTagVerificationSubmitting.value = false
      isTagVerificationPolling.value = false
    }
  }

  const handleCheckTagInstallation = () => {
    openTagVerificationModal()
  }

  const cancelPolling = () => {
    cancelTagVerificationPolling.value = true
  }

  return {
    isTagVerificationModalOpen,
    tagVerificationSiteUrl,
    isTagVerificationSubmitting,
    isTagVerificationPolling,
    activeTagVerificationStatus,
    hasPollingTimedOut,
    openTagVerificationModal,
    closeTagVerificationModal,
    handleStartTagVerification,
    handleCheckTagInstallation,
    cancelPolling,
  }
}

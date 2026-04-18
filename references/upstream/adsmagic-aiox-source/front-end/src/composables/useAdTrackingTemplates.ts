import { useToast } from '@/components/ui/toast/use-toast'
import type { AdTrackingTemplate } from '@/types/integrations'

const AD_TRACKING_TEMPLATES: readonly AdTrackingTemplate[] = [
  {
    platform: 'google',
    title: 'Google Ads',
    template:
      '{lpurl}?utm_source=google&campaign_id={campaignid}&adgroup_id={adgroupid}&ad_id={creative}&utm_term={placement}::{keyword}&keyword={keyword}&device={device}&network={network}',
    copyEnabled: true,
  },
  {
    platform: 'meta',
    title: 'Meta Ads',
    template:
      'utm_source=meta&campaign_id={{campaign.id}}&adgroup_id={{adset.id}}&ad_id={{ad.id}}&utm_term={{placement}}',
    copyEnabled: true,
  },
  {
    platform: 'tiktok',
    title: 'TikTok Ads',
    template: 'Em breve',
    copyEnabled: false,
  },
]

export const useAdTrackingTemplates = () => {
  const { toast } = useToast()

  const copyAdTrackingTemplate = async (
    template: string,
    platformLabel: string
  ): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(template)
      toast({
        title: 'Copiado!',
        description: `Parâmetros de ${platformLabel} copiados para a área de transferência`,
      })
      return true
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar os parâmetros',
        variant: 'destructive',
      })
      return false
    }
  }

  return {
    adTrackingTemplates: AD_TRACKING_TEMPLATES,
    copyAdTrackingTemplate,
  }
}

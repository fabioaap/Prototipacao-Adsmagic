import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { OriginClassifier } from '../services/OriginClassifier.ts'
import {
  resolveEffectiveClickIds,
  buildSourceDataFromLink,
  type LinkAccessClickSignals,
} from '../services/WhatsAppProtocolAttributionService.ts'

function classifyFromResolvedClickIds(access: LinkAccessClickSignals) {
  const resolution = resolveEffectiveClickIds(access)
  const classification = OriginClassifier.classify({
    gclid: resolution.clickIds.gclid ?? null,
    gbraid: resolution.clickIds.gbraid ?? null,
    wbraid: resolution.clickIds.wbraid ?? null,
    fbclid: resolution.clickIds.fbclid ?? null,
    ttclid: resolution.clickIds.ttclid ?? null,
  })

  return { resolution, classification }
}

Deno.test('resolveEffectiveClickIds should prefer landing_page click IDs when present', () => {
  const { resolution } = classifyFromResolvedClickIds({
    landing_page: 'https://adsmagic.com.br/?fbclid=fb-123',
    fbclid: 'fb-raw',
    gclid: 'gclid-raw',
    msclkid: null,
    gbraid: null,
    wbraid: null,
    yclid: null,
    ttclid: null,
  })

  assertEquals(resolution.strategy, 'landing_page_click_ids')
  assertEquals(resolution.clickIds.fbclid, 'fb-123')
  assertEquals(resolution.clickIds.gclid, undefined)
})

Deno.test('classification should be Meta Ads when landing_page has fbclid and raw also has gclid', () => {
  const { classification } = classifyFromResolvedClickIds({
    landing_page: 'https://adsmagic.com.br/?fbclid=fb-123',
    fbclid: 'fb-raw',
    gclid: 'gclid-raw',
    msclkid: null,
    gbraid: null,
    wbraid: null,
    yclid: null,
    ttclid: null,
  })

  assertEquals(classification.sourceApp, 'facebook')
  assertEquals(classification.originName, 'Meta Ads')
})

Deno.test('classification should be Google Ads when landing_page has gclid and raw also has fbclid', () => {
  const { classification } = classifyFromResolvedClickIds({
    landing_page: 'https://adsmagic.com.br/?gclid=g-123',
    fbclid: 'fb-raw',
    gclid: 'gclid-raw',
    msclkid: null,
    gbraid: null,
    wbraid: null,
    yclid: null,
    ttclid: null,
  })

  assertEquals(classification.sourceApp, 'google')
  assertEquals(classification.originName, 'Google Ads')
})

Deno.test('resolveEffectiveClickIds should fallback to raw click IDs when landing_page has no click IDs', () => {
  const { resolution, classification } = classifyFromResolvedClickIds({
    landing_page: 'https://adsmagic.com.br/?utm_source=facebook&utm_medium=paid_social',
    fbclid: null,
    gclid: 'gclid-raw',
    msclkid: null,
    gbraid: null,
    wbraid: null,
    yclid: null,
    ttclid: null,
  })

  assertEquals(resolution.strategy, 'fallback_no_click_ids_in_landing_page')
  assertEquals(resolution.clickIds.gclid, 'gclid-raw')
  assertEquals(classification.sourceApp, 'google')
})

Deno.test('resolveEffectiveClickIds should fallback to raw click IDs when landing_page is invalid', () => {
  const { resolution, classification } = classifyFromResolvedClickIds({
    landing_page: '://invalid-url',
    fbclid: 'fb-raw',
    gclid: null,
    msclkid: null,
    gbraid: null,
    wbraid: null,
    yclid: null,
    ttclid: null,
  })

  assertEquals(resolution.strategy, 'fallback_invalid_landing_page')
  assertEquals(resolution.clickIds.fbclid, 'fb-raw')
  assertEquals(classification.sourceApp, 'facebook')
})

Deno.test('buildSourceDataFromLink should preserve campaign, adgroup and ad IDs from link_access columns', () => {
  const result = buildSourceDataFromLink({
    id: 'access-1',
    project_id: 'project-1',
    link_id: 'link-1',
    contact_id: null,
    whatsapp_protocol: 'WA-TEST-1',
    created_at: '2026-02-28T19:26:47.340503+00:00',
    device: 'desktop',
    campaign_id: '23508479679',
    adgroup_id: ' 178673421106 ',
    ad_id: ' 750806118392 ',
    utm_source: 'google',
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    fbclid: null,
    gclid: null,
    msclkid: null,
    gbraid: null,
    wbraid: null,
    yclid: null,
    ttclid: null,
    referrer: null,
    landing_page: 'https://r.adsmagic.com.br/link?utm_source=google&campaign_id=23508479679',
  })

  assertEquals(result.sourceData.campaign?.campaign_id, '23508479679')
  assertEquals(result.sourceData.campaign?.adgroup_id, '178673421106')
  assertEquals(result.sourceData.campaign?.ad_id, '750806118392')
  assertEquals(result.sourceData.metadata?.source_type, 'ad')
  assertEquals(result.sourceData.metadata?.source_app, 'google')
})

Deno.test('buildSourceDataFromLink should fallback to landing_page campaign params when adgroup/ad columns are missing', () => {
  const result = buildSourceDataFromLink({
    id: 'access-2',
    project_id: 'project-1',
    link_id: 'link-1',
    contact_id: null,
    whatsapp_protocol: 'WA-TEST-2',
    created_at: '2026-02-28T19:26:47.340503+00:00',
    device: 'desktop',
    campaign_id: '23508479679',
    adgroup_id: null,
    ad_id: null,
    utm_source: 'google',
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    fbclid: null,
    gclid: null,
    msclkid: null,
    gbraid: null,
    wbraid: null,
    yclid: null,
    ttclid: null,
    referrer: null,
    landing_page: 'https://r.adsmagic.com.br/link?utm_source=google&campaign_id=23508479679&adgroup_id=178673421106&ad_id=%20750806118392',
  })

  assertEquals(result.sourceData.campaign?.campaign_id, '23508479679')
  assertEquals(result.sourceData.campaign?.adgroup_id, '178673421106')
  assertEquals(result.sourceData.campaign?.ad_id, '750806118392')
  assertEquals(result.sourceData.metadata?.source_type, 'ad')
  assertEquals(result.sourceData.metadata?.source_app, 'google')
})

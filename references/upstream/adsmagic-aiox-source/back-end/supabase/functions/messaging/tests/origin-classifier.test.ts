import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { OriginClassifier } from '../services/OriginClassifier.ts'

Deno.test('OriginClassifier should classify Google Ads when gclid is present', () => {
  const result = OriginClassifier.classify({
    gclid: 'test-gclid',
    utmSource: 'facebook',
  })

  assertEquals(result.originName, 'Google Ads')
  assertEquals(result.sourceApp, 'google')
  assertEquals(result.sourceType, 'ad')
})

Deno.test('OriginClassifier should classify Meta Ads when fbclid is present', () => {
  const result = OriginClassifier.classify({
    fbclid: 'test-fbclid',
    utmSource: 'google',
  })

  assertEquals(result.originName, 'Meta Ads')
  assertEquals(result.sourceApp, 'facebook')
  assertEquals(result.sourceType, 'ad')
})

Deno.test('OriginClassifier should classify TikTok Ads when ttclid is present', () => {
  const result = OriginClassifier.classify({
    ttclid: 'test-ttclid',
  })

  assertEquals(result.originName, 'TikTok Ads')
  assertEquals(result.sourceApp, 'tiktok')
  assertEquals(result.sourceType, 'ad')
})

Deno.test('OriginClassifier should classify Google Ads when campaign signals exist without utm_medium', () => {
  const result = OriginClassifier.classify({
    utmSource: 'google',
    campaignId: '23508479679',
    adgroupId: '178673421106',
    adId: '750806118392',
    utmMedium: null,
  })

  assertEquals(result.originName, 'Google Ads')
  assertEquals(result.sourceApp, 'google')
  assertEquals(result.sourceType, 'ad')
})

Deno.test('OriginClassifier should classify Meta Ads when campaign signals exist without paid medium', () => {
  const result = OriginClassifier.classify({
    utmSource: 'facebook',
    campaignId: 'campaign-1',
    adId: 'ad-1',
    utmMedium: 'social',
  })

  assertEquals(result.originName, 'Meta Ads')
  assertEquals(result.sourceApp, 'facebook')
  assertEquals(result.sourceType, 'ad')
})

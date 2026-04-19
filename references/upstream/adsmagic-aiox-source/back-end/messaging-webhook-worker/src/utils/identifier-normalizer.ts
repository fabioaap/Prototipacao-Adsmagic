/**
 * Identifier normalizer — ported from Deno Edge Function (pure logic, no DB)
 */

export interface IIdentifierNormalizer {
  normalize(input: string): ContactIdentifier
}

export interface ContactIdentifier {
  normalizedPhone?: { phone: string; countryCode: string }
  originalJid?: string
  originalLid?: string
  originalPhone?: string
  primaryType: 'phone' | 'jid' | 'lid'
  canonicalId: string
}

const PATTERNS = {
  JID_INDIVIDUAL: /^(\d{9,15})@s\.whatsapp\.net$/,
  JID_GROUP: /^(\d{9,15})-(\d+)@g\.us$/,
  JID_BROADCAST: /^(\d{9,15})-(\d+)@broadcast$/,
  LID: /^(\d{10,20})@lid$/,
  PHONE_PURE: /^\d{9,15}$/,
} as const

const MIN_NATIONAL_NUMBER_LENGTH = 8
const MAX_NATIONAL_NUMBER_LENGTH = 14

const COUNTRY_CALLING_CODES = new Set<string>([
  '1','7','20','27','30','31','32','33','34','36','39',
  '40','41','43','44','45','46','47','48','49','51','52',
  '53','54','55','56','57','58','60','61','62','63','64',
  '65','66','81','82','84','86','90','91','92','93','94',
  '95','98','211','212','213','216','218','220','221','222',
  '223','224','225','226','227','228','229','230','231','232',
  '233','234','235','236','237','238','239','240','241','242',
  '243','244','245','246','248','249','250','251','252','253',
  '254','255','256','257','258','260','261','262','263','264',
  '265','266','267','268','269','290','291','297','298','299',
  '350','351','352','353','354','355','356','357','358','359',
  '370','371','372','373','374','375','376','377','378','380',
  '381','382','383','385','386','387','389','420','421','423',
  '500','501','502','503','504','505','506','507','508','509',
  '590','591','592','593','594','595','596','597','598','599',
  '670','672','673','674','675','676','677','678','679','680',
  '681','682','683','685','686','687','688','689','690','691',
  '692','850','852','853','855','856','880','886','960','961',
  '962','963','964','965','966','967','968','970','971','972',
  '973','974','975','976','977','992','993','994','995','996',
  '998',
])

function splitCountryAndPhoneDigits(digits: string): { countryCode: string; phone: string } | null {
  if (!PATTERNS.PHONE_PURE.test(digits)) return null

  const candidates: Array<{ countryCode: string; phone: string; known: boolean }> = []

  for (let ccLength = 1; ccLength <= 3; ccLength++) {
    const countryCode = digits.slice(0, ccLength)
    const phone = digits.slice(ccLength)
    if (!countryCode || !phone) continue
    if (phone.length < MIN_NATIONAL_NUMBER_LENGTH || phone.length > MAX_NATIONAL_NUMBER_LENGTH) continue
    candidates.push({ countryCode, phone, known: COUNTRY_CALLING_CODES.has(countryCode) })
  }

  if (candidates.length === 0) return null

  const knownCandidates = candidates.filter(c => c.known)
  if (knownCandidates.length > 0) {
    knownCandidates.sort((a, b) => b.countryCode.length - a.countryCode.length)
    return knownCandidates[0]
  }

  candidates.sort((a, b) => {
    const scoreA = Math.abs(a.phone.length - 10.5)
    const scoreB = Math.abs(b.phone.length - 10.5)
    if (scoreA !== scoreB) return scoreA - scoreB
    return b.countryCode.length - a.countryCode.length
  })
  return candidates[0]
}

function normalizeIndividualJid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.JID_INDIVIDUAL)
  if (!match) return null
  const phoneParts = splitCountryAndPhoneDigits(match[1])
  if (!phoneParts) return null
  return {
    normalizedPhone: { countryCode: phoneParts.countryCode, phone: phoneParts.phone },
    originalJid: input,
    primaryType: 'jid',
    canonicalId: `${phoneParts.countryCode}${phoneParts.phone}`,
  }
}

function normalizeGroupJid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.JID_GROUP)
  if (!match) return null
  const phoneParts = splitCountryAndPhoneDigits(match[1])
  if (!phoneParts) return null
  return {
    normalizedPhone: { countryCode: phoneParts.countryCode, phone: phoneParts.phone },
    originalJid: input,
    primaryType: 'jid',
    canonicalId: `${phoneParts.countryCode}${phoneParts.phone}`,
  }
}

function normalizeLid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.LID)
  if (!match) return null
  const lidNumber = match[1]
  if (lidNumber.length < 10 || lidNumber.length > 20) return null
  return { originalLid: input, primaryType: 'lid', canonicalId: `lid:${lidNumber}` }
}

function normalizePhone(input: string): ContactIdentifier | null {
  const cleaned = input.replace(/@.*$/, '').replace(/[^\d]/g, '')
  const phoneParts = splitCountryAndPhoneDigits(cleaned)
  if (!phoneParts) return null
  return {
    normalizedPhone: { countryCode: phoneParts.countryCode, phone: phoneParts.phone },
    originalPhone: input,
    primaryType: 'phone',
    canonicalId: `${phoneParts.countryCode}${phoneParts.phone}`,
  }
}

export function normalizeIdentifier(input: string): ContactIdentifier {
  if (!input || typeof input !== 'string') {
    throw new Error('Contact identifier input must be a non-empty string')
  }
  const normalizers = [normalizeIndividualJid, normalizeGroupJid, normalizeLid, normalizePhone]
  for (const normalizer of normalizers) {
    const result = normalizer(input)
    if (result) return result
  }
  throw new Error(`Formato de identificador não reconhecido: ${input}`)
}

export function generateCanonicalIdentifier(identifier: ContactIdentifier): string {
  if (identifier.primaryType === 'phone' && identifier.normalizedPhone) {
    return `phone:${identifier.normalizedPhone.countryCode}:${identifier.normalizedPhone.phone}`
  }
  if (identifier.primaryType === 'jid' && identifier.originalJid) {
    return `jid:${identifier.originalJid}`
  }
  if (identifier.primaryType === 'lid' && identifier.originalLid) {
    const lidNumber = identifier.originalLid.replace('@lid', '')
    return `lid:${lidNumber}`
  }
  return identifier.canonicalId
}

export function extractPhoneNumber(input: string): { phone: string; countryCode: string } {
  const identifier = normalizeIdentifier(input)
  if (!identifier.normalizedPhone) {
    throw new Error(`No phone number found in identifier: ${input}`)
  }
  return { phone: identifier.normalizedPhone.phone, countryCode: identifier.normalizedPhone.countryCode }
}

export const normalizeContactIdentifier = normalizeIdentifier

export interface WebhookContactIdentifierData {
  chatid?: string
  sender_lid?: string
  sender_pn?: string
  sender?: string
}

function enrichIdentifierWithWebhookData(
  normalized: ContactIdentifier,
  webhookData: WebhookContactIdentifierData
): ContactIdentifier {
  if (webhookData.sender_lid) normalized.originalLid = webhookData.sender_lid
  if (webhookData.sender_pn && webhookData.chatid && webhookData.sender_pn !== webhookData.chatid) {
    normalized.originalJid = normalized.originalJid || webhookData.chatid
  }
  return normalized
}

const WEBHOOK_FIELD_PRIORITIES = ['chatid', 'sender_pn', 'sender_lid', 'sender'] as const

export function normalizeWebhookIdentifier(webhookData: WebhookContactIdentifierData): ContactIdentifier {
  for (const field of WEBHOOK_FIELD_PRIORITIES) {
    const value = webhookData[field]
    if (value) {
      const normalized = normalizeIdentifier(value)
      if (field === 'chatid') return enrichIdentifierWithWebhookData(normalized, webhookData)
      return normalized
    }
  }
  throw new Error('No contact identifier found in webhook data')
}

export const normalizeWebhookContactIdentifier = normalizeWebhookIdentifier

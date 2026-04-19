/**
 * Utilitário para normalização de identificadores de contato WhatsApp
 * 
 * REFATORADO de phone-normalizer.ts para suportar JID e LID além de telefone.
 * 
 * Arquitetura seguindo SOLID:
 * - DRY: Reutiliza lógica existente de normalização de telefone
 * - SRP: Cada função normaliza um tipo específico
 * - OCP: Extensível via Strategy Pattern para novos formatos
 * - DIP: Interface IIdentifierNormalizer permite diferentes implementações
 * - KISS: Código simples e direto, sem wrappers deprecated desnecessários
 * 
 * Suporta múltiplos formatos:
 * - Número de telefone: "5511999999999", "+5511999999999"
 * - JID: "5511999999999@s.whatsapp.net", "5511999999999-1234567890@g.us"
 * - LID: "213709100187796@lid"
 * 
 * Funções principais:
 * - normalizeIdentifier(): Normaliza qualquer formato (telefone, JID, LID)
 * - extractPhoneNumber(): Extrai telefone de telefone ou JID (refatorada para usar normalizeIdentifier() internamente)
 */

/**
 * Interface para normalização de identificadores (DIP)
 * Permite diferentes estratégias de normalização por broker
 */
export interface IIdentifierNormalizer {
  normalize(input: string): ContactIdentifier
}

/**
 * Identificador normalizado de contato
 */
export interface ContactIdentifier {
  normalizedPhone?: {
    phone: string
    countryCode: string
  }
  originalJid?: string
  originalLid?: string
  originalPhone?: string
  primaryType: 'phone' | 'jid' | 'lid'
  canonicalId: string
}

/**
 * Constantes para padrões regex (evita magic strings)
 */
const PATTERNS = {
  JID_INDIVIDUAL: /^(\d{9,15})@s\.whatsapp\.net$/,
  JID_GROUP: /^(\d{9,15})-(\d+)@g\.us$/,
  JID_BROADCAST: /^(\d{9,15})-(\d+)@broadcast$/,
  LID: /^(\d{10,20})@lid$/,
  PHONE_PURE: /^\d{9,15}$/,
} as const

const MIN_NATIONAL_NUMBER_LENGTH = 8
const MAX_NATIONAL_NUMBER_LENGTH = 14

// ITU-T E.164 country calling codes (1-3 dígitos) para split determinístico.
const COUNTRY_CALLING_CODES = new Set<string>([
  '1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39',
  '40', '41', '43', '44', '45', '46', '47', '48', '49', '51', '52',
  '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64',
  '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94',
  '95', '98', '211', '212', '213', '216', '218', '220', '221', '222',
  '223', '224', '225', '226', '227', '228', '229', '230', '231', '232',
  '233', '234', '235', '236', '237', '238', '239', '240', '241', '242',
  '243', '244', '245', '246', '248', '249', '250', '251', '252', '253',
  '254', '255', '256', '257', '258', '260', '261', '262', '263', '264',
  '265', '266', '267', '268', '269', '290', '291', '297', '298', '299',
  '350', '351', '352', '353', '354', '355', '356', '357', '358', '359',
  '370', '371', '372', '373', '374', '375', '376', '377', '378', '380',
  '381', '382', '383', '385', '386', '387', '389', '420', '421', '423',
  '500', '501', '502', '503', '504', '505', '506', '507', '508', '509',
  '590', '591', '592', '593', '594', '595', '596', '597', '598', '599',
  '670', '672', '673', '674', '675', '676', '677', '678', '679', '680',
  '681', '682', '683', '685', '686', '687', '688', '689', '690', '691',
  '692', '850', '852', '853', '855', '856', '880', '886', '960', '961',
  '962', '963', '964', '965', '966', '967', '968', '970', '971', '972',
  '973', '974', '975', '976', '977', '992', '993', '994', '995', '996',
  '998',
])

function splitCountryAndPhoneDigits(
  digits: string
): { countryCode: string; phone: string } | null {
  if (!PATTERNS.PHONE_PURE.test(digits)) return null

  const candidates: Array<{ countryCode: string; phone: string; known: boolean }> = []

  for (let ccLength = 1; ccLength <= 3; ccLength++) {
    const countryCode = digits.slice(0, ccLength)
    const phone = digits.slice(ccLength)
    if (!countryCode || !phone) continue
    if (phone.length < MIN_NATIONAL_NUMBER_LENGTH || phone.length > MAX_NATIONAL_NUMBER_LENGTH) {
      continue
    }

    candidates.push({
      countryCode,
      phone,
      known: COUNTRY_CALLING_CODES.has(countryCode),
    })
  }

  if (candidates.length === 0) return null

  const knownCandidates = candidates.filter((candidate) => candidate.known)
  if (knownCandidates.length > 0) {
    // Mais específico: prioriza código de país mais longo quando válido.
    knownCandidates.sort((a, b) => b.countryCode.length - a.countryCode.length)
    return knownCandidates[0]
  }

  // Fallback quando código não está na lista: privilegia tamanho nacional típico (10-11).
  candidates.sort((a, b) => {
    const scoreA = Math.abs(a.phone.length - 10.5)
    const scoreB = Math.abs(b.phone.length - 10.5)
    if (scoreA !== scoreB) return scoreA - scoreB
    return b.countryCode.length - a.countryCode.length
  })

  return candidates[0]
}

/**
 * Normaliza JID individual (SRP: função única responsabilidade)
 * 
 * @param input - JID no formato "5511999999999@s.whatsapp.net"
 * @returns Identificador normalizado ou null
 */
function normalizeIndividualJid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.JID_INDIVIDUAL)
  if (!match) return null

  const phoneParts = splitCountryAndPhoneDigits(match[1])
  if (!phoneParts) return null

  return {
    normalizedPhone: {
      countryCode: phoneParts.countryCode,
      phone: phoneParts.phone,
    },
    originalJid: input,
    primaryType: 'jid',
    canonicalId: `${phoneParts.countryCode}${phoneParts.phone}`,
  }
}

/**
 * Normaliza JID de grupo (SRP: função única responsabilidade)
 * 
 * @param input - JID no formato "5511999999999-1234567890@g.us"
 * @returns Identificador normalizado ou null
 */
function normalizeGroupJid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.JID_GROUP)
  if (!match) return null

  const phoneParts = splitCountryAndPhoneDigits(match[1])
  if (!phoneParts) return null

  return {
    normalizedPhone: {
      countryCode: phoneParts.countryCode,
      phone: phoneParts.phone,
    },
    originalJid: input,
    primaryType: 'jid',
    canonicalId: `${phoneParts.countryCode}${phoneParts.phone}`,
  }
}

/**
 * Normaliza LID (SRP: função única responsabilidade)
 * 
 * @param input - LID no formato "213709100187796@lid"
 * @returns Identificador normalizado ou null
 */
function normalizeLid(input: string): ContactIdentifier | null {
  const match = input.match(PATTERNS.LID)
  if (!match) return null
  
  const lidNumber = match[1]
  
  // ⚠️ CORREÇÃO: Validação adicional de tamanho (já validado no regex)
  // Regex já garante 10-20 dígitos, mas manter validação explícita
  if (lidNumber.length < 10 || lidNumber.length > 20) {
    return null  // LID inválido
  }
  
  return {
    originalLid: input,
    primaryType: 'lid',
    canonicalId: `lid:${lidNumber}`,
  }
}

/**
 * Normaliza número de telefone puro (SRP: função única responsabilidade)
 * 
 * @param input - Telefone no formato "5511999999999" ou "+5511999999999"
 * @returns Identificador normalizado ou null
 */
function normalizePhone(input: string): ContactIdentifier | null {
  const cleaned = input
    .replace(/@.*$/, '')
    .replace(/[^\d]/g, '')
  const phoneParts = splitCountryAndPhoneDigits(cleaned)
  if (!phoneParts) return null

  return {
    normalizedPhone: {
      countryCode: phoneParts.countryCode,
      phone: phoneParts.phone,
    },
    originalPhone: input,
    primaryType: 'phone',
    canonicalId: `${phoneParts.countryCode}${phoneParts.phone}`,
  }
}

/**
 * Normaliza identificador de contato WhatsApp
 * 
 * Segue Strategy Pattern: tenta cada normalizador em ordem
 * 
 * @param input - Identificador em qualquer formato (telefone, JID, ou LID)
 * @returns Identificador normalizado
 * @throws {Error} Se input for inválido
 */
export function normalizeIdentifier(input: string): ContactIdentifier {
  if (!input || typeof input !== 'string') {
    throw new Error('Contact identifier input must be a non-empty string')
  }
  
  // Tentar cada normalizador específico (Strategy Pattern)
  const normalizers: Array<(input: string) => ContactIdentifier | null> = [
    normalizeIndividualJid,
    normalizeGroupJid,
    normalizeLid,
    normalizePhone,
  ]
  
  for (const normalizer of normalizers) {
    const result = normalizer(input)
    if (result) return result
  }
  
  // ⚠️ CORREÇÃO: Não criar identificador para formato desconhecido
  // Lançar erro em vez de criar identificador inválido
  throw new Error(
    `Formato de identificador não reconhecido: ${input}. ` +
    `Formatos suportados: telefone (8-15 dígitos), ` +
    `JID (ex: 5511999999999@s.whatsapp.net ou 5511999999999-1234567890@g.us), ` +
    `LID (ex: 213709100187796@lid)`
  )
}

/**
 * Gera identificador canônico no formato usado no banco de dados
 * 
 * Formato:
 * - Telefone: `phone:${countryCode}:${phone}`
 * - JID: `jid:${jid}`
 * - LID: `lid:${lidNumber}`
 * 
 * @param identifier - Identificador normalizado
 * @returns Identificador canônico no formato do banco
 */
export function generateCanonicalIdentifier(identifier: ContactIdentifier): string {
  if (identifier.primaryType === 'phone' && identifier.normalizedPhone) {
    return `phone:${identifier.normalizedPhone.countryCode}:${identifier.normalizedPhone.phone}`
  }
  
  if (identifier.primaryType === 'jid' && identifier.originalJid) {
    return `jid:${identifier.originalJid}`
  }
  
  if (identifier.primaryType === 'lid' && identifier.originalLid) {
    // Remove sufixo @lid para o formato canônico
    const lidNumber = identifier.originalLid.replace('@lid', '')
    return `lid:${lidNumber}`
  }
  
  // Fallback: usar canonicalId se disponível
  return identifier.canonicalId
}

/**
 * Extrai número de telefone e código do país de uma string
 * 
 * REFATORADA: Agora usa normalizeIdentifier() internamente para suportar telefone, JID e LID.
 * 
 * Suporta múltiplos formatos:
 * - Número: "5511999999999", "+5511999999999"
 * - JID: "5511999999999@s.whatsapp.net" (extrai telefone do JID)
 * - LID: Não suportado (LID não contém telefone)
 * 
 * @param input - Identificador em qualquer formato (telefone ou JID)
 * @returns Número normalizado e código do país
 * @throws {Error} Se não encontrar número de telefone no identificador
 */
export function extractPhoneNumber(input: string): { phone: string; countryCode: string } {
  // Reutiliza normalizeIdentifier() internamente (DRY)
  const identifier = normalizeIdentifier(input)
  
  if (!identifier.normalizedPhone) {
    throw new Error(`No phone number found in identifier: ${input}`)
  }
  
  return {
    phone: identifier.normalizedPhone.phone,
    countryCode: identifier.normalizedPhone.countryCode,
  }
}

// Alias para compatibilidade (mantém nome antigo funcionando)
export const normalizeContactIdentifier = normalizeIdentifier

/**
 * Interface para dados de webhook contendo identificadores
 */
export interface WebhookContactIdentifierData {
  chatid?: string
  sender_lid?: string
  sender_pn?: string
  sender?: string
}

/**
 * Enriquece identificador normalizado com dados adicionais do webhook
 * 
 * @param normalized - Identificador já normalizado
 * @param webhookData - Dados adicionais do webhook
 * @returns Identificador enriquecido
 */
function enrichIdentifierWithWebhookData(
  normalized: ContactIdentifier,
  webhookData: WebhookContactIdentifierData
): ContactIdentifier {
  if (webhookData.sender_lid) {
    normalized.originalLid = webhookData.sender_lid
  }
  
  // Se sender_pn é diferente do chatid, pode ser JID alternativo
  if (webhookData.sender_pn && webhookData.chatid && webhookData.sender_pn !== webhookData.chatid) {
    // Preservar JID principal e adicionar alternativo
    normalized.originalJid = normalized.originalJid || webhookData.chatid
  }
  
  return normalized
}

/**
 * Prioridade dos campos do webhook para normalização
 * Ordem: chatid (prioridade 1) > sender_pn (prioridade 2) > sender_lid (prioridade 3) > sender (prioridade 4)
 */
const WEBHOOK_FIELD_PRIORITIES = [
  'chatid',     // Prioridade 1: sempre presente, JID padrão
  'sender_pn',  // Prioridade 2: JID alternativo
  'sender_lid', // Prioridade 3: LID
  'sender',     // Prioridade 4: pode ser JID ou LID
] as const

/**
 * Normaliza múltiplos identificadores do webhook
 * 
 * Segue SRP: função única responsabilidade de orquestrar normalização
 * 
 * @param webhookData - Dados do webhook contendo múltiplos identificadores
 * @returns Identificador normalizado com priorização correta
 * @throws {Error} Se nenhum identificador for encontrado
 */
export function normalizeWebhookIdentifier(
  webhookData: WebhookContactIdentifierData
): ContactIdentifier {
  // Buscar primeiro campo disponível conforme prioridade
  for (const field of WEBHOOK_FIELD_PRIORITIES) {
    const value = webhookData[field]
    if (value) {
      const normalized = normalizeIdentifier(value)
      
      // Se chatid (prioridade 1), enriquecer com dados adicionais
      if (field === 'chatid') {
        return enrichIdentifierWithWebhookData(normalized, webhookData)
      }
      
      return normalized
    }
  }
  
  throw new Error('No contact identifier found in webhook data')
}

// Alias para compatibilidade
export const normalizeWebhookContactIdentifier = normalizeWebhookIdentifier

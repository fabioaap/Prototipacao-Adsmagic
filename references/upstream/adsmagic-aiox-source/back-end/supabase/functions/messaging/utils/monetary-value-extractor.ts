// Extrator de valor monetário em pt-BR a partir de texto livre.
//
// Suporta formatos como:
//   "R$ 240"          -> 240
//   "R$240,00"        -> 240
//   "R$ 1.240,50"     -> 1240.5
//   "R$ 1240.50"      -> 1240.5
//   "BRL 240"         -> 240
//   "240 reais"       -> 240
//
// Quando há múltiplas ocorrências, retorna a de maior valor — protege contra
// matches espúrios e prioriza o "valor principal" da mensagem.

export interface ExtractedMonetaryValue {
  value: number
  currency: string
  rawMatch: string
}

// Padrões aceitos:
//   1) prefixo R$/BRL seguido de número:  R$\s*1.240,50
//   2) número seguido de "reais":         240 reais
// Ordem importa: alternativas mais específicas primeiro para que o regex
// não pare em um match curto (ex.: "124" dentro de "1240.50").
const NUMBER_PATTERN = [
  '\\d{1,3}(?:\\.\\d{3})+,\\d{1,2}',  // 1.240,50
  '\\d{1,3}(?:\\.\\d{3})+',           // 1.240
  '\\d+,\\d{1,2}',                    // 240,50
  '\\d+\\.\\d{1,2}',                  // 1240.50
  '\\d+',                             // 240
].join('|')

const PREFIX_REGEX = new RegExp(
  `(?:r\\$|brl)\\s*(${NUMBER_PATTERN})`,
  'gi'
)

const SUFFIX_REGEX = new RegExp(
  `(${NUMBER_PATTERN})\\s*reais\\b`,
  'gi'
)

export function extractMonetaryValue(text: string): ExtractedMonetaryValue | null {
  if (!text || typeof text !== 'string') {
    return null
  }

  const candidates: ExtractedMonetaryValue[] = []

  for (const match of text.matchAll(PREFIX_REGEX)) {
    const parsed = parseBrazilianNumber(match[1])
    if (parsed !== null) {
      candidates.push({
        value: parsed,
        currency: 'BRL',
        rawMatch: match[0],
      })
    }
  }

  for (const match of text.matchAll(SUFFIX_REGEX)) {
    const parsed = parseBrazilianNumber(match[1])
    if (parsed !== null) {
      candidates.push({
        value: parsed,
        currency: 'BRL',
        rawMatch: match[0],
      })
    }
  }

  if (candidates.length === 0) {
    return null
  }

  return candidates.reduce((best, current) =>
    current.value > best.value ? current : best
  )
}

function parseBrazilianNumber(raw: string): number | null {
  if (!raw) return null

  const trimmed = raw.trim()
  let normalized: string

  // Caso 1: contém vírgula → vírgula é decimal, ponto é milhar.
  if (trimmed.includes(',')) {
    normalized = trimmed.replace(/\./g, '').replace(',', '.')
  } else {
    // Caso 2: só pontos. Se houver mais de um, são separadores de milhar.
    // Se houver exatamente um e a parte fracionária tiver 1 ou 2 dígitos,
    // tratamos como decimal estilo en-US (ex.: "1240.50").
    const parts = trimmed.split('.')
    if (parts.length === 1) {
      normalized = trimmed
    } else if (parts.length === 2 && parts[1].length <= 2) {
      normalized = trimmed
    } else {
      normalized = parts.join('')
    }
  }

  const value = Number(normalized)
  if (!Number.isFinite(value) || value <= 0) {
    return null
  }
  return value
}

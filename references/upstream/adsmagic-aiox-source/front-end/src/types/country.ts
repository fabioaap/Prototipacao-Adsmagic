/**
 * Tipos relacionados a países e códigos de telefone
 */

export interface Country {
  /** Código ISO 3166-1 alpha-2 (ex: 'BR', 'US') */
  code: string
  /** Nome do país */
  name: string
  /** Nome do país em português */
  namePt: string
  /** Código de discagem direta internacional (DDI) */
  ddi: string
  /** Emoji da bandeira do país */
  flag: string
  /** Número máximo de dígitos no número de telefone */
  maxDigits: number
}

export interface CountrySelectProps {
  modelValue?: Country
  disabled?: boolean
  placeholder?: string
}

export interface CountrySelectEmits {
  'update:modelValue': [country: Country]
}

/**
 * Lista de países com DDI mais comuns
 * Prioriza países de língua portuguesa e principais mercados
 */
export const COUNTRIES: Country[] = [
  // Brasil - sempre primeiro
  {
    code: 'BR',
    name: 'Brazil',
    namePt: 'Brasil',
    ddi: '+55',
    flag: '🇧🇷',
    maxDigits: 11
  },
  // Outros países de língua portuguesa
  {
    code: 'PT',
    name: 'Portugal',
    namePt: 'Portugal',
    ddi: '+351',
    flag: '🇵🇹',
    maxDigits: 9
  },
  {
    code: 'AO',
    name: 'Angola',
    namePt: 'Angola',
    ddi: '+244',
    flag: '🇦🇴',
    maxDigits: 9
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    namePt: 'Moçambique',
    ddi: '+258',
    flag: '🇲🇿',
    maxDigits: 9
  },
  // Principais mercados globais
  {
    code: 'US',
    name: 'United States',
    namePt: 'Estados Unidos',
    ddi: '+1',
    flag: '🇺🇸',
    maxDigits: 10
  },
  {
    code: 'CA',
    name: 'Canada',
    namePt: 'Canadá',
    ddi: '+1',
    flag: '🇨🇦',
    maxDigits: 10
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    namePt: 'Reino Unido',
    ddi: '+44',
    flag: '🇬🇧',
    maxDigits: 10
  },
  {
    code: 'DE',
    name: 'Germany',
    namePt: 'Alemanha',
    ddi: '+49',
    flag: '🇩🇪',
    maxDigits: 11
  },
  {
    code: 'FR',
    name: 'France',
    namePt: 'França',
    ddi: '+33',
    flag: '🇫🇷',
    maxDigits: 10
  },
  {
    code: 'ES',
    name: 'Spain',
    namePt: 'Espanha',
    ddi: '+34',
    flag: '🇪🇸',
    maxDigits: 9
  },
  {
    code: 'IT',
    name: 'Italy',
    namePt: 'Itália',
    ddi: '+39',
    flag: '🇮🇹',
    maxDigits: 10
  },
  {
    code: 'JP',
    name: 'Japan',
    namePt: 'Japão',
    ddi: '+81',
    flag: '🇯🇵',
    maxDigits: 11
  },
  {
    code: 'CN',
    name: 'China',
    namePt: 'China',
    ddi: '+86',
    flag: '🇨🇳',
    maxDigits: 11
  },
  {
    code: 'IN',
    name: 'India',
    namePt: 'Índia',
    ddi: '+91',
    flag: '🇮🇳',
    maxDigits: 10
  },
  {
    code: 'AU',
    name: 'Australia',
    namePt: 'Austrália',
    ddi: '+61',
    flag: '🇦🇺',
    maxDigits: 9
  },
  {
    code: 'AR',
    name: 'Argentina',
    namePt: 'Argentina',
    ddi: '+54',
    flag: '🇦🇷',
    maxDigits: 10
  },
  {
    code: 'MX',
    name: 'Mexico',
    namePt: 'México',
    ddi: '+52',
    flag: '🇲🇽',
    maxDigits: 10
  },
  {
    code: 'CL',
    name: 'Chile',
    namePt: 'Chile',
    ddi: '+56',
    flag: '🇨🇱',
    maxDigits: 9
  },
  {
    code: 'CO',
    name: 'Colombia',
    namePt: 'Colômbia',
    ddi: '+57',
    flag: '🇨🇴',
    maxDigits: 10
  },
  {
    code: 'PE',
    name: 'Peru',
    namePt: 'Peru',
    ddi: '+51',
    flag: '🇵🇪',
    maxDigits: 9
  },
  {
    code: 'UY',
    name: 'Uruguay',
    namePt: 'Uruguai',
    ddi: '+598',
    flag: '🇺🇾',
    maxDigits: 8
  },
  {
    code: 'ZA',
    name: 'South Africa',
    namePt: 'África do Sul',
    ddi: '+27',
    flag: '🇿🇦',
    maxDigits: 9
  },
  {
    code: 'RU',
    name: 'Russia',
    namePt: 'Rússia',
    ddi: '+7',
    flag: '🇷🇺',
    maxDigits: 10
  },
  {
    code: 'KR',
    name: 'South Korea',
    namePt: 'Coreia do Sul',
    ddi: '+82',
    flag: '🇰🇷',
    maxDigits: 11
  },
  {
    code: 'NL',
    name: 'Netherlands',
    namePt: 'Holanda',
    ddi: '+31',
    flag: '🇳🇱',
    maxDigits: 9
  },
  {
    code: 'BE',
    name: 'Belgium',
    namePt: 'Bélgica',
    ddi: '+32',
    flag: '🇧🇪',
    maxDigits: 9
  },
  {
    code: 'CH',
    name: 'Switzerland',
    namePt: 'Suíça',
    ddi: '+41',
    flag: '🇨🇭',
    maxDigits: 9
  },
  {
    code: 'AT',
    name: 'Austria',
    namePt: 'Áustria',
    ddi: '+43',
    flag: '🇦🇹',
    maxDigits: 11
  },
  {
    code: 'SE',
    name: 'Sweden',
    namePt: 'Suécia',
    ddi: '+46',
    flag: '🇸🇪',
    maxDigits: 9
  },
  {
    code: 'NO',
    name: 'Norway',
    namePt: 'Noruega',
    ddi: '+47',
    flag: '🇳🇴',
    maxDigits: 8
  },
  {
    code: 'DK',
    name: 'Denmark',
    namePt: 'Dinamarca',
    ddi: '+45',
    flag: '🇩🇰',
    maxDigits: 8
  },
  {
    code: 'FI',
    name: 'Finland',
    namePt: 'Finlândia',
    ddi: '+358',
    flag: '🇫🇮',
    maxDigits: 10
  },
  {
    code: 'IE',
    name: 'Ireland',
    namePt: 'Irlanda',
    ddi: '+353',
    flag: '🇮🇪',
    maxDigits: 9
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    namePt: 'Nova Zelândia',
    ddi: '+64',
    flag: '🇳🇿',
    maxDigits: 9
  },
  {
    code: 'SG',
    name: 'Singapore',
    namePt: 'Singapura',
    ddi: '+65',
    flag: '🇸🇬',
    maxDigits: 8
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    namePt: 'Hong Kong',
    ddi: '+852',
    flag: '🇭🇰',
    maxDigits: 8
  },
  {
    code: 'TW',
    name: 'Taiwan',
    namePt: 'Taiwan',
    ddi: '+886',
    flag: '🇹🇼',
    maxDigits: 9
  },
  {
    code: 'TH',
    name: 'Thailand',
    namePt: 'Tailândia',
    ddi: '+66',
    flag: '🇹🇭',
    maxDigits: 9
  },
  {
    code: 'MY',
    name: 'Malaysia',
    namePt: 'Malásia',
    ddi: '+60',
    flag: '🇲🇾',
    maxDigits: 10
  },
  {
    code: 'PH',
    name: 'Philippines',
    namePt: 'Filipinas',
    ddi: '+63',
    flag: '🇵🇭',
    maxDigits: 10
  },
  {
    code: 'ID',
    name: 'Indonesia',
    namePt: 'Indonésia',
    ddi: '+62',
    flag: '🇮🇩',
    maxDigits: 11
  },
  {
    code: 'VN',
    name: 'Vietnam',
    namePt: 'Vietnã',
    ddi: '+84',
    flag: '🇻🇳',
    maxDigits: 9
  }
]

/**
 * País padrão (Brasil)
 */
export const DEFAULT_COUNTRY = COUNTRIES[0]

/**
 * Busca país por código ISO
 */
export function findCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(country => country.code === code)
}

/**
 * Busca país por DDI
 */
export function findCountryByDDI(ddi: string): Country | undefined {
  return COUNTRIES.find(country => country.ddi === ddi)
}

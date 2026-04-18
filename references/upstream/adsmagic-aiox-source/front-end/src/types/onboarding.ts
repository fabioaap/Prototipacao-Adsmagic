/**
 * Tipos e schemas para o fluxo de onboarding
 */

import { z } from 'zod'

// ============================================================================
// ENUMS E CONSTANTES
// ============================================================================

/**
 * Tipos de empresa disponíveis no onboarding
 */
export const COMPANY_TYPES = [
  { id: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { id: 'saas', label: 'SaaS', icon: '💻' },
  { id: 'agency', label: 'Agência', icon: '🎯' },
  { id: 'restaurant', label: 'Restaurante', icon: '🍽️' },
  { id: 'retail', label: 'Varejo', icon: '🏪' },
  { id: 'healthcare', label: 'Saúde', icon: '🏥' },
  { id: 'education', label: 'Educação', icon: '🎓' },
  { id: 'realestate', label: 'Imobiliária', icon: '🏠' },
] as const

/**
 * Opções de quantidade de franquias
 */
export const FRANCHISE_COUNTS = [
  { id: '1', label: '1', value: 1 },
  { id: '2-5', label: '2-5', value: { min: 2, max: 5 } },
  { id: '6-10', label: '6-10', value: { min: 6, max: 10 } },
  { id: '11-20', label: '11-20', value: { min: 11, max: 20 } },
  { id: '21-50', label: '21-50', value: { min: 21, max: 50 } },
  { id: '51-100', label: '51-100', value: { min: 51, max: 100 } },
  { id: '100+', label: '100+', value: { min: 101, max: null } },
] as const

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

/**
 * Tipo de empresa selecionada
 */
export type CompanyType = typeof COMPANY_TYPES[number]['id']

/**
 * Quantidade de franquias selecionada
 */
export type FranchiseCount = typeof FRANCHISE_COUNTS[number]['id']

/**
 * Opção de tipo de empresa
 */
export type CompanyTypeOption = typeof COMPANY_TYPES[number]

/**
 * Opção de quantidade de franquias
 */
export type FranchiseCountOption = typeof FRANCHISE_COUNTS[number]

/**
 * Dados completos do onboarding
 */
export interface OnboardingData {
  companyType: CompanyType
  franchiseCount: FranchiseCount
  franchiseName: string
  completedAt?: Date
}

/**
 * Estado do wizard de onboarding
 */
export interface OnboardingState {
  currentStep: number
  companyType: CompanyType | null
  franchiseCount: FranchiseCount | null
  franchiseName: string
  isCompleted: boolean
}

/**
 * Status do onboarding do usuário
 */
export interface OnboardingStatus {
  isCompleted: boolean
  completedAt?: Date
  data?: OnboardingData
}

// ============================================================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ============================================================================

/**
 * Schema para validação de tipo de empresa
 */
export const companyTypeSchema = z.enum([
  'ecommerce',
  'saas', 
  'agency',
  'restaurant',
  'retail',
  'healthcare',
  'education',
  'realestate'
])

/**
 * Schema para validação de quantidade de franquias
 */
export const franchiseCountSchema = z.enum([
  '1',
  '2-5',
  '6-10', 
  '11-20',
  '21-50',
  '51-100',
  '100+'
])

/**
 * Schema para validação do nome da franquia
 */
export const franchiseNameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(50, 'Nome deve ter no máximo 50 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/, 'Nome contém caracteres inválidos')

/**
 * Schema para validação dos dados completos do onboarding
 */
export const onboardingDataSchema = z.object({
  companyType: companyTypeSchema,
  franchiseCount: franchiseCountSchema,
  franchiseName: franchiseNameSchema,
  completedAt: z.date().optional(),
})

/**
 * Schema para validação do status do onboarding
 */
export const onboardingStatusSchema = z.object({
  isCompleted: z.boolean(),
  completedAt: z.date().optional(),
  data: onboardingDataSchema.optional(),
})

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Busca opção de tipo de empresa por ID
 */
export function getCompanyTypeOption(id: CompanyType): CompanyTypeOption | undefined {
  return COMPANY_TYPES.find(type => type.id === id)
}

/**
 * Busca opção de quantidade de franquias por ID
 */
export function getFranchiseCountOption(id: FranchiseCount): FranchiseCountOption | undefined {
  return FRANCHISE_COUNTS.find(count => count.id === id)
}

/**
 * Valida se os dados do onboarding estão completos
 */
export function isOnboardingDataComplete(data: Partial<OnboardingData>): data is OnboardingData {
  return !!(
    data.companyType &&
    data.franchiseCount &&
    data.franchiseName &&
    data.franchiseName.trim().length >= 2
  )
}

/**
 * Cria dados de onboarding padrão
 */
export function createDefaultOnboardingData(): Partial<OnboardingData> {
  return {
    companyType: undefined,
    franchiseCount: undefined,
    franchiseName: '',
  }
}

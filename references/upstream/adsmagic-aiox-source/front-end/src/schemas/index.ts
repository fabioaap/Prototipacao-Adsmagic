/**
 * Schemas - Centralized Export Point
 *
 * Este arquivo exporta todos os schemas Zod do projeto
 * para facilitar imports consistentes em toda a aplicação.
 *
 * Uso:
 * ```typescript
 * import { createContactSchema, validateCreateContact } from '@/schemas'
 * ```
 *
 * @module schemas
 */

// Contact schemas (frontend form validation)
export {
  createContactSchema,
  updateContactSchema,
  contactFiltersSchema,
  validateCreateContact,
  validateUpdateContact,
  validateContactFilters
} from './contact'
export type {
  CreateContactFormData,
  UpdateContactFormData,
  ContactFiltersFormData
} from './contact'

// Contact schemas (backend API validation)
export {
  backendCreateContactSchema,
  backendUpdateContactSchema,
  backendListContactsQuerySchema,
  validateBackendCreateContact,
  validateBackendUpdateContact,
  validateBackendListContactsQuery,
  isValidUUID
} from './contacts.backend.schema'
export type {
  BackendCreateContactData,
  BackendUpdateContactData,
  BackendListContactsQueryData
} from './contacts.backend.schema'

// Sale schemas
export {
  createSaleSchema,
  markSaleLostSchema,
  updateSaleSchema,
  saleFiltersSchema,
  validateCreateSale,
  validateMarkSaleLost,
  validateUpdateSale,
  validateSaleFilters
} from './sale'
export type {
  CreateSaleFormData,
  MarkSaleLostFormData,
  UpdateSaleFormData,
  SaleFiltersFormData
} from './sale'

// Stage schemas
export {
  createStageSchema,
  updateStageSchema,
  reorderStagesSchema,
  validateCreateStage,
  validateUpdateStage,
  validateReorderStages
} from './stage'
export type {
  CreateStageFormData,
  UpdateStageFormData,
  ReorderStagesFormData
} from './stage'

// Origin schemas
export {
  createOriginSchema,
  updateOriginSchema,
  validateCreateOrigin,
  validateUpdateOrigin
} from './origin'
export type {
  CreateOriginFormData,
  UpdateOriginFormData
} from './origin'

// Link schemas
export {
  createLinkSchema,
  updateLinkSchema,
  validateCreateLink,
  validateUpdateLink
} from './link'
export type {
  CreateLinkFormData,
  UpdateLinkFormData
} from './link'

// Tracking schemas
export {
  createTrackingLinkSchema,
  updateTrackingLinkSchema,
  validateCreateTrackingLink,
  validateUpdateTrackingLink
} from './tracking'
export type {
  CreateTrackingLinkFormData,
  UpdateTrackingLinkFormData
} from './tracking'

/**
 * Guia de uso dos schemas:
 *
 * ## 1. Validação em componentes
 *
 * ```typescript
 * import { validateCreateContact, type CreateContactFormData } from '@/schemas'
 *
 * const formData: CreateContactFormData = {
 *   name: 'João Silva',
 *   phone: '11987654321',
 *   countryCode: '55',
 *   origin: 'origin-google',
 *   stage: 'stage-new'
 * }
 *
 * const result = validateCreateContact(formData)
 *
 * if (result.success) {
 *   // Dados válidos - pode enviar para API
 *   await createContact(result.data)
 * } else {
 *   // Mostra erros para o usuário
 *   result.error.errors.forEach(err => {
 *     console.log(err.path, err.message)
 *   })
 * }
 * ```
 *
 * ## 2. Integração com formulários reativos
 *
 * ```typescript
 * import { ref, computed } from 'vue'
 * import { createContactSchema } from '@/schemas'
 * import { useI18n } from 'vue-i18n'
 *
 * const formData = ref({
 *   name: '',
 *   phone: '',
 *   // ...
 * })
 *
 * const { t } = useI18n()
 *
 * const errors = computed(() => {
 *   const result = createContactSchema.safeParse(formData.value)
 *   if (result.success) return {}
 *
 *   const errorMap: Record<string, string> = {}
 *   result.error.errors.forEach(err => {
 *     const field = err.path.join('.')
 *     errorMap[field] = t(err.message)
 *   })
 *   return errorMap
 * })
 * ```
 *
 * ## 3. Mensagens de erro i18n
 *
 * Todas as mensagens de erro são chaves i18n que devem ser traduzidas:
 *
 * ```json
 * {
 *   "validation": {
 *     "contact": {
 *       "nameRequired": "Nome é obrigatório",
 *       "nameMinLength": "Nome deve ter no mínimo 2 caracteres",
 *       "phoneOnlyNumbers": "Telefone deve conter apenas números"
 *     }
 *   }
 * }
 * ```
 *
 * ## 4. TypeScript types
 *
 * Use os types gerados automaticamente pelos schemas:
 *
 * ```typescript
 * import type { CreateContactFormData } from '@/schemas'
 *
 * function handleSubmit(data: CreateContactFormData) {
 *   // TypeScript garante que data tem todos os campos necessários
 * }
 * ```
 */

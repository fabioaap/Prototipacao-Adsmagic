/**
 * Backend API Types
 *
 * Re-exports types that mirror backend API contracts.
 * These types use snake_case to match the database/API naming convention.
 *
 * @module types/api
 */

// ============================================================================
// CONTACTS API TYPES
// ============================================================================
export type {
  BackendContact,
  BackendCreateContactDTO,
  BackendUpdateContactDTO,
  BackendContactsListParams,
  BackendContactsListResponse,
  BackendContactResponse,
  BackendDeleteContactResponse,
  BackendValidationError,
  BackendErrorResponse
} from './contacts.api'

/**
 * Contacts API Service
 *
 * Handles all contact-related API operations.
 * Supports both mock data and real API (controlled by USE_MOCK flag).
 *
 * When USE_MOCK = true:
 * - Returns mock data from @/mocks/contacts
 * - Simulates API delay (300-500ms)
 * - Filters and pagination work in-memory
 *
 * When USE_MOCK = false:
 * - Makes real HTTP requests via apiClient
 * - Uses adapters to convert between frontend/backend formats
 *
 * @module services/api/contacts
 */

import { apiClient } from './client'
import { tagsService } from './tags'
import type {
  Contact,
  CreateContactDTO,
  UpdateContactDTO,
  PaginatedResponse,
  ContactFilters,
  Result,
  BackendContactsListResponse,
  BackendContact
} from '@/types'
import { MOCK_CONTACTS, searchContacts } from '@/mocks/contacts'

// Adapters for converting between frontend/backend formats
import {
  mapBackendContactToFrontend,
  mapBackendListResponseToFrontend,
  mapFrontendToBackendCreate,
  mapFrontendToBackendUpdate,
  mapFiltersToBackendParams,
  getCurrentProjectId,
  hasUnsupportedFilters
} from './adapters/contactsAdapter'

/**
 * Flag to control mock vs real API
 *
 * SET THIS TO false WHEN BACKEND IS READY
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * Simulates API delay for realistic UX in mock mode
 */
async function simulateDelay(): Promise<void> {
  if (USE_MOCK) {
    const delay = Math.random() * 200 + 300 // 300-500ms
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

/**
 * Get all contacts with optional filters and pagination
 *
 * @param filters - Optional filters (search, origins, stages, date range, etc.)
 * @returns Paginated list of contacts
 */
export async function getContacts(
  filters?: ContactFilters
): Promise<Result<PaginatedResponse<Contact>, Error>> {
  try {
    if (USE_MOCK) {
      await simulateDelay()

      // Start with all contacts
      let filtered = [...MOCK_CONTACTS]

      // In mock mode, we simulate project filtering but allow all mock data through
      // This is because mock contacts have hardcoded projectIds that won't match real projects
      const currentProjectId = localStorage.getItem('current_project_id')
      if (currentProjectId && import.meta.env.DEV) {
        console.log('[Contacts Service] Mock mode - project filter would be:', currentProjectId)
        console.log('[Contacts Service] Mock contacts have projectId:', MOCK_CONTACTS[0]?.projectId)
      }

      // Apply search filter
      if (filters?.search) {
        filtered = searchContacts(filters.search)
      }

      // Apply origin filter
      if (filters?.origins && filters.origins.length > 0) {
        filtered = filtered.filter((contact) => filters.origins!.includes(contact.origin))
      }

      // Apply stage filter
      if (filters?.stages && filters.stages.length > 0) {
        filtered = filtered.filter((contact) => filters.stages!.includes(contact.stage))
      }

      // Apply tag filter
      if (filters?.tags && filters.tags.length > 0) {
        const contactTags = await Promise.all(
          filtered.map(async (contact) => ({
            contact,
            tags: await tagsService.getContactTags(contact.id)
          }))
        )

        filtered = contactTags
          .filter(({ tags }) => tags.some((tag) => filters.tags!.includes(tag.id)))
          .map(({ contact }) => contact)
      }

      // Apply date range filter
      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        filtered = filtered.filter((contact) => new Date(contact.createdAt) >= fromDate)
      }

      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo)
        filtered = filtered.filter((contact) => new Date(contact.createdAt) <= toDate)
      }

      // Apply hasSales filter (mock: assume contacts with stage = sale have sales)
      if (filters?.hasSales !== undefined) {
        if (filters.hasSales) {
          filtered = filtered.filter((contact) => contact.stage === 'stage-sale')
        } else {
          filtered = filtered.filter((contact) => contact.stage !== 'stage-sale')
        }
      }

      // Sort by most recent first
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // Apply pagination
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || 10
      const total = filtered.length
      const totalPages = Math.ceil(total / pageSize)
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const data = filtered.slice(start, end)

      return {
        ok: true,
        value: {
          data,
          pagination: {
            page,
            pageSize,
            total,
            totalPages
          }
        }
      }
    }

    // Log warning for unsupported filters
    hasUnsupportedFilters(filters)

    // Convert frontend filters to backend query params
    const backendParams = mapFiltersToBackendParams(filters)

    // Real API call with converted params
    const response = await apiClient.get<BackendContactsListResponse>('/contacts', {
      params: backendParams
    })

    // Convert backend response to frontend format
    const page = filters?.page ?? 1
    const pageSize = filters?.pageSize ?? 10
    const paginatedResponse = mapBackendListResponseToFrontend(response.data, page, pageSize)

    return {
      ok: true,
      value: paginatedResponse
    }
  } catch (error) {
    console.error('[Contacts Service] Error fetching contacts:', error)
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Get a single contact by ID
 *
 * @param id - Contact ID
 * @returns Contact or null if not found
 */
export async function getContactById(id: string): Promise<Result<Contact | null, Error>> {
  try {
    if (USE_MOCK) {
      await simulateDelay()

      const contact = MOCK_CONTACTS.find((c) => c.id === id)

      return {
        ok: true,
        value: contact || null
      }
    }

    // Real API call - backend returns BackendContact
    const response = await apiClient.get<BackendContact>(`/contacts/${id}`)

    // Convert backend response to frontend format
    const contact = mapBackendContactToFrontend(response.data)

    return {
      ok: true,
      value: contact
    }
  } catch (error) {
    console.error(`[Contacts Service] Error fetching contact ${id}:`, error)
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Create a new contact
 *
 * @param data - Contact creation data
 * @returns Created contact
 */
export async function createContact(data: CreateContactDTO): Promise<Result<Contact, Error>> {
  try {
    if (USE_MOCK) {
      await simulateDelay()

      // Generate mock contact
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        projectId: localStorage.getItem('current_project_id') || 'default-project',
        name: data.name,
        phone: data.phone,
        countryCode: data.countryCode,
        origin: data.origin || 'origin-outros',
        stage: data.stage || 'stage-contact-initiated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          device: 'desktop',
          browser: 'Chrome',
          os: 'Windows'
        }
      }

      // In real implementation, this would be persisted
      MOCK_CONTACTS.unshift(newContact)

      return {
        ok: true,
        value: newContact
      }
    }

    // Get project ID from localStorage
    const projectId = getCurrentProjectId()
    if (!projectId) {
      return {
        ok: false,
        error: new Error('No project selected. Please select a project first.')
      }
    }

    // Convert frontend DTO to backend format
    const backendData = mapFrontendToBackendCreate(data, projectId)

    // Real API call with converted data
    const response = await apiClient.post<BackendContact>('/contacts', backendData)

    // Convert backend response to frontend format
    const contact = mapBackendContactToFrontend(response.data)

    return {
      ok: true,
      value: contact
    }
  } catch (error) {
    console.error('[Contacts Service] Error creating contact:', error)

    // Handle specific HTTP errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { error?: string } } }
      
      if (axiosError.response?.status === 409) {
        return {
          ok: false,
          error: new Error('Contact with this phone already exists')
        }
      }
      
      if (axiosError.response?.status === 403) {
        return {
          ok: false,
          error: new Error('Permission denied. Check your access to this project.')
        }
      }

      if (axiosError.response?.status === 400) {
        return {
          ok: false,
          error: new Error(axiosError.response.data?.error || 'Invalid contact data')
        }
      }
    }

    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Update an existing contact
 *
 * @param id - Contact ID
 * @param data - Contact update data
 * @returns Updated contact
 */
export async function updateContact(
  id: string,
  data: UpdateContactDTO
): Promise<Result<Contact, Error>> {
  try {
    if (USE_MOCK) {
      await simulateDelay()

      const index = MOCK_CONTACTS.findIndex((c) => c.id === id)

      if (index === -1) {
        return {
          ok: false,
          error: new Error('Contact not found')
        }
      }

      // Update contact
      const originalContact = MOCK_CONTACTS[index]
      if (!originalContact) {
        return {
          ok: false,
          error: new Error('Contact not found')
        }
      }

      const updated: Contact = {
        id: originalContact.id,
        projectId: originalContact.projectId,
        name: data.name ?? originalContact.name,
        phone: data.phone ?? originalContact.phone,
        countryCode: data.countryCode ?? originalContact.countryCode,
        origin: data.origin ?? originalContact.origin,
        stage: data.stage ?? originalContact.stage,
        email: data.email ?? originalContact.email,
        company: data.company ?? originalContact.company,
        location: data.location ?? originalContact.location,
        notes: data.notes ?? originalContact.notes,
        isFavorite: originalContact.isFavorite,
        avatar: originalContact.avatar,
        metadata: originalContact.metadata,
        createdAt: originalContact.createdAt,
        updatedAt: new Date().toISOString()
      }

      MOCK_CONTACTS[index] = updated

      return {
        ok: true,
        value: updated
      }
    }

    // Convert frontend DTO to backend format
    const backendData = mapFrontendToBackendUpdate(data)

    // Real API call - using PATCH as per backend specification
    const response = await apiClient.patch<BackendContact>(`/contacts/${id}`, backendData)

    // Convert backend response to frontend format
    const contact = mapBackendContactToFrontend(response.data)

    return {
      ok: true,
      value: contact
    }
  } catch (error) {
    console.error(`[Contacts Service] Error updating contact ${id}:`, error)

    // Handle specific HTTP errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { error?: string } } }
      
      if (axiosError.response?.status === 404) {
        return {
          ok: false,
          error: new Error('Contact not found')
        }
      }
      
      if (axiosError.response?.status === 403) {
        return {
          ok: false,
          error: new Error('Permission denied. Check your access to this project.')
        }
      }
    }

    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Delete a contact
 *
 * @param id - Contact ID
 * @returns Success status
 */
export async function deleteContact(id: string): Promise<Result<boolean, Error>> {
  try {
    if (USE_MOCK) {
      await simulateDelay()

      const index = MOCK_CONTACTS.findIndex((c) => c.id === id)

      if (index === -1) {
        return {
          ok: false,
          error: new Error('Contact not found')
        }
      }

      // Remove contact
      MOCK_CONTACTS.splice(index, 1)

      return {
        ok: true,
        value: true
      }
    }

    // Real API call - backend returns { message, id }
    await apiClient.delete(`/contacts/${id}`)

    return {
      ok: true,
      value: true
    }
  } catch (error) {
    console.error(`[Contacts Service] Error deleting contact ${id}:`, error)

    // Handle specific HTTP errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { error?: string } } }
      
      if (axiosError.response?.status === 404) {
        return {
          ok: false,
          error: new Error('Contact not found')
        }
      }
      
      if (axiosError.response?.status === 403) {
        return {
          ok: false,
          error: new Error('Permission denied. Check your access to this project.')
        }
      }
    }

    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Move contact to a different stage
 *
 * This is a convenience method that calls updateContact internally.
 *
 * @param id - Contact ID
 * @param stageId - New stage ID
 * @returns Updated contact
 */
export async function moveContactToStage(
  id: string,
  stageId: string
): Promise<Result<Contact, Error>> {
  return updateContact(id, { stage: stageId })
}

/**
 * Batch update contacts
 *
 * Useful for operations like bulk stage change, bulk delete, etc.
 *
 * NOTE: Backend does not support batch update endpoint.
 * This function uses sequential updateContact calls as fallback.
 *
 * @param contactIds - Array of contact IDs
 * @param updates - Updates to apply to all contacts
 * @returns Array of updated contacts
 *
 * @deprecated Backend does not support batch update. Consider implementing
 * a dedicated endpoint or using sequential updates in the UI layer.
 */
export async function batchUpdateContacts(
  contactIds: string[],
  updates: UpdateContactDTO
): Promise<Result<Contact[], Error>> {
  try {
    if (USE_MOCK) {
      await simulateDelay()

      const updated: Contact[] = []

      for (const id of contactIds) {
        const index = MOCK_CONTACTS.findIndex((c) => c.id === id)

        if (index !== -1) {
          const originalContact = MOCK_CONTACTS[index]
          if (originalContact) {
            const updatedContact: Contact = {
              id: originalContact.id,
              projectId: originalContact.projectId,
              name: updates.name ?? originalContact.name,
              phone: updates.phone ?? originalContact.phone,
              countryCode: updates.countryCode ?? originalContact.countryCode,
              origin: updates.origin ?? originalContact.origin,
              stage: updates.stage ?? originalContact.stage,
              email: updates.email ?? originalContact.email,
              company: updates.company ?? originalContact.company,
              location: updates.location ?? originalContact.location,
              notes: updates.notes ?? originalContact.notes,
              isFavorite: originalContact.isFavorite,
              avatar: originalContact.avatar,
              metadata: originalContact.metadata,
              createdAt: originalContact.createdAt,
              updatedAt: new Date().toISOString()
            }

            MOCK_CONTACTS[index] = updatedContact
            updated.push(updatedContact)
          }
        }
      }

      return {
        ok: true,
        value: updated
      }
    }

    // Backend does not support batch update - use sequential calls as fallback
    console.warn('[Contacts Service] batchUpdateContacts: Using sequential updates (no batch endpoint)')

    const updated: Contact[] = []
    const errors: Error[] = []

    for (const id of contactIds) {
      const result = await updateContact(id, updates)
      if (result.ok) {
        updated.push(result.value)
      } else {
        errors.push(result.error)
      }
    }

    // If any updates failed, return partial success with warning
    if (errors.length > 0) {
      console.warn(`[Contacts Service] Batch update: ${errors.length}/${contactIds.length} failed`)
    }

    return {
      ok: true,
      value: updated
    }
  } catch (error) {
    console.error('[Contacts Service] Error in batch update:', error)
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Export contacts to CSV
 *
 * Generates a CSV file with all contacts matching the filters.
 *
 * NOTE: Backend does not support export endpoint.
 * This function fetches contacts via API and generates CSV client-side.
 *
 * @param filters - Optional filters to apply
 * @returns CSV blob for download
 */
export async function exportContactsToCSV(
  filters?: ContactFilters
): Promise<Result<Blob, Error>> {
  try {
    let contactsToExport: Contact[] = []

    if (USE_MOCK) {
      await simulateDelay()

      // Filtrar contatos conforme filtros
      contactsToExport = [...MOCK_CONTACTS]

      if (filters?.stages?.length) {
        contactsToExport = contactsToExport.filter(c => filters.stages!.includes(c.stage))
      }
      if (filters?.origins?.length) {
        contactsToExport = contactsToExport.filter(c => filters.origins!.includes(c.origin))
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase()
        contactsToExport = contactsToExport.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.includes(query)
        )
      }

      if (filters?.tags?.length) {
        const contactTags = await Promise.all(
          contactsToExport.map(async (contact) => ({
            contact,
            tags: await tagsService.getContactTags(contact.id)
          }))
        )

        contactsToExport = contactTags
          .filter(({ tags }) => tags.some((tag) => filters.tags!.includes(tag.id)))
          .map(({ contact }) => contact)
      }
    } else {
      // Fetch all contacts matching filters (paginate through all pages)
      // Use a large page size to minimize requests
      const allContacts: Contact[] = []
      let page = 1
      const pageSize = 100
      let hasMore = true

      while (hasMore) {
        const result = await getContacts({ ...filters, page, pageSize })

        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          }
        }

        allContacts.push(...result.value.data)
        hasMore = page < result.value.pagination.totalPages
        page++
      }

      contactsToExport = allContacts
    }

    // Generate CSV client-side
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Empresa', 'Origem', 'Etapa', 'Localização', 'Criado Em']
    const rows = contactsToExport.map(c => [
      c.id,
      c.name,
      c.email || '',
      c.phone || '',
      c.company || '',
      c.origin,
      c.stage,
      c.location || '',
      c.createdAt
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })

    return {
      ok: true,
      value: blob
    }
  } catch (error) {
    console.error('[Contacts Service] Error exporting contacts:', error)
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Erro ao exportar contatos')
    }
  }
}

/**
 * Count contacts by origin ID
 *
 * NOTE: Backend does not support dedicated count endpoint.
 * Uses getContacts with filter and returns the total from pagination.
 *
 * @param originId - The origin ID to count contacts for
 * @returns Number of contacts with this origin
 */
export async function countContactsByOrigin(originId: string): Promise<Result<number, Error>> {
  try {
    if (USE_MOCK) {
      await simulateDelay()
      const count = MOCK_CONTACTS.filter(c => c.origin === originId).length
      return { ok: true, value: count }
    }

    // Use getContacts with filter - backend returns total in pagination metadata
    const result = await getContacts({
      origins: [originId],
      page: 1,
      pageSize: 1 // Only need metadata, not actual data
    })

    if (!result.ok) {
      return { ok: false, error: result.error }
    }

    return { ok: true, value: result.value.pagination.total }
  } catch (error) {
    console.error('[Contacts Service] Error counting contacts by origin:', error)
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Erro ao contar contatos')
    }
  }
}

/**
 * Count contacts by stage ID
 *
 * NOTE: Backend does not support dedicated count endpoint.
 * Uses getContacts with filter and returns the total from pagination.
 *
 * @param stageId - The stage ID to count contacts for
 * @returns Number of contacts with this stage
 */
export async function countContactsByStage(stageId: string): Promise<Result<number, Error>> {
  try {
    if (USE_MOCK) {
      await simulateDelay()
      const count = MOCK_CONTACTS.filter(c => c.stage === stageId).length
      return { ok: true, value: count }
    }

    // Use getContacts with filter - backend returns total in pagination metadata
    const result = await getContacts({
      stages: [stageId],
      page: 1,
      pageSize: 1 // Only need metadata, not actual data
    })

    if (!result.ok) {
      return { ok: false, error: result.error }
    }

    return { ok: true, value: result.value.pagination.total }
  } catch (error) {
    console.error('[Contacts Service] Error counting contacts by stage:', error)
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Erro ao contar contatos')
    }
  }
}

/**
 * Messages API Service
 *
 * Handles all message/conversation-related API operations.
 * Supports both mock data and real API (controlled by USE_MOCK flag).
 *
 * @module services/api/messages
 */

import { apiClient } from './client'
import type {
    Message,
    MessageMetrics,
    CreateMessageDTO,
    UpdateMessageDTO,
    MessageFilters,
    PaginatedResponse,
    Result,
} from '@/types'
import { MOCK_MESSAGES, MOCK_MESSAGE_METRICS } from '@/mocks/messages'

/**
 * Flag to control mock vs real API
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
 * Get all messages with optional filters and pagination
 */
export async function getMessages(
    filters?: MessageFilters
): Promise<Result<PaginatedResponse<Message>, Error>> {
    try {
        if (USE_MOCK) {
            await simulateDelay()

            let filtered = [...MOCK_MESSAGES]

            // Apply search filter
            if (filters?.search) {
                const searchLower = filters.search.toLowerCase()
                filtered = filtered.filter((msg: Message) =>
                    msg.name.toLowerCase().includes(searchLower)
                )
            }

            // Apply origin filter
            if (filters?.originId) {
                filtered = filtered.filter((msg: Message) => msg.originId === filters.originId)
            }

            // Apply active status filter
            if (filters?.isActive !== undefined) {
                filtered = filtered.filter((msg: Message) => msg.isActive === filters.isActive)
            }

            // Apply date range filters
            if (filters?.startDate) {
                filtered = filtered.filter(
                    (msg: Message) => new Date(msg.createdAt) >= new Date(filters.startDate!)
                )
            }
            if (filters?.endDate) {
                filtered = filtered.filter(
                    (msg: Message) => new Date(msg.createdAt) <= new Date(filters.endDate!)
                )
            }

            // Pagination
            const page = filters?.page || 1
            const pageSize = filters?.perPage || filters?.pageSize || 10
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
                        totalPages,
                    },
                },
            }
        }

        // Real API call
        const response = await apiClient.get<PaginatedResponse<Message>>('/messages', {
            params: filters,
        })

        return {
            ok: true,
            value: response.data,
        }
    } catch (error) {
        console.error('[Messages Service] Error fetching messages:', error)
        return {
            ok: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
        }
    }
}

/**
 * Get message by ID
 */
export async function getMessageById(id: string): Promise<Result<Message, Error>> {
    try {
        if (USE_MOCK) {
            await simulateDelay()
            const message = MOCK_MESSAGES.find((m: Message) => m.id === id)
            if (!message) {
                throw new Error(`Message not found: ${id}`)
            }
            return { ok: true, value: message }
        }

        const response = await apiClient.get<Message>(`/messages/${id}`)
        return { ok: true, value: response.data }
    } catch (error) {
        console.error('[Messages Service] Error fetching message:', error)
        return {
            ok: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
        }
    }
}

/**
 * Get message metrics grouped by origin
 */
export async function getMessageMetrics(
    filters?: { startDate?: string; endDate?: string }
): Promise<Result<MessageMetrics[], Error>> {
    try {
        if (USE_MOCK) {
            await simulateDelay()
            return { ok: true, value: MOCK_MESSAGE_METRICS }
        }

        const response = await apiClient.get<MessageMetrics[]>('/messages/metrics', {
            params: filters,
        })
        return { ok: true, value: response.data }
    } catch (error) {
        console.error('[Messages Service] Error fetching message metrics:', error)
        return {
            ok: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
        }
    }
}

/**
 * Create a new message
 */
export async function createMessage(
    data: CreateMessageDTO
): Promise<Result<Message, Error>> {
    try {
        if (USE_MOCK) {
            await simulateDelay()
            const newMessage: Message = {
                id: `msg_${Date.now()}`,
                projectId: localStorage.getItem('current_project_id') || 'default-project',
                name: data.name,
                originId: data.originId,
                linkId: data.linkId,
                contactsCount: 0,
                salesCount: 0,
                averageTicket: 0,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            MOCK_MESSAGES.unshift(newMessage)
            return { ok: true, value: newMessage }
        }

        const response = await apiClient.post<Message>('/messages', data)
        return { ok: true, value: response.data }
    } catch (error) {
        console.error('[Messages Service] Error creating message:', error)
        return {
            ok: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
        }
    }
}

/**
 * Update an existing message
 */
export async function updateMessage(
    id: string,
    data: UpdateMessageDTO
): Promise<Result<Message, Error>> {
    try {
        if (USE_MOCK) {
            await simulateDelay()
            const index = MOCK_MESSAGES.findIndex((m: Message) => m.id === id)
            if (index === -1) {
                throw new Error(`Message not found: ${id}`)
            }
            const base = MOCK_MESSAGES[index]!
            const updated: Message = {
                id: base.id,
                projectId: base.projectId,
                name: data.name ?? base.name,
                originId: data.originId ?? base.originId,
                contactsCount: base.contactsCount,
                salesCount: base.salesCount,
                averageTicket: base.averageTicket,
                linkId: data.linkId !== undefined ? data.linkId : base.linkId,
                isActive: data.isActive ?? base.isActive,
                createdAt: base.createdAt,
                updatedAt: new Date().toISOString(),
            }
            MOCK_MESSAGES[index] = updated
            return { ok: true, value: updated }
        }

        const response = await apiClient.patch<Message>(`/messages/${id}`, data)
        return { ok: true, value: response.data }
    } catch (error) {
        console.error('[Messages Service] Error updating message:', error)
        return {
            ok: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
        }
    }
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string): Promise<Result<void, Error>> {
    try {
        if (USE_MOCK) {
            await simulateDelay()
            const index = MOCK_MESSAGES.findIndex((m: Message) => m.id === id)
            if (index === -1) {
                throw new Error(`Message not found: ${id}`)
            }
            MOCK_MESSAGES.splice(index, 1)
            return { ok: true, value: undefined }
        }

        await apiClient.delete(`/messages/${id}`)
        return { ok: true, value: undefined }
    } catch (error) {
        console.error('[Messages Service] Error deleting message:', error)
        return {
            ok: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
        }
    }
}

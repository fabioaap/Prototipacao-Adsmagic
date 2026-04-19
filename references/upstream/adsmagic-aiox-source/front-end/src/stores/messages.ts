/**
 * Messages Store
 *
 * Gerencia mensagens/conversas do WhatsApp rastreadas por origem.
 *
 * @module stores/messages
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type {
    Message,
    MessageMetrics,
    CreateMessageDTO,
    UpdateMessageDTO,
    MessageFilters,
} from '@/types'
import {
    getMessages,
    getMessageById,
    getMessageMetrics,
    createMessage as createMessageService,
    updateMessage as updateMessageService,
    deleteMessage as deleteMessageService,
} from '@/services/api/messages'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'

export const useMessagesStore = defineStore('messages', () => {
    // State
    const messages = ref<Message[]>([])
    const selectedMessage = ref<Message | null>(null)
    const metrics = ref<MessageMetrics[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const total = ref(0)
    const currentPage = ref(1)
    const perPage = ref(10)
    const filters = ref<MessageFilters>({})

    // Multi-tenancy watch - usar ref reativo
    const { currentProjectId } = useCurrentProjectId()

    watch(
        currentProjectId,
        (newProjectId, oldProjectId) => {
            if (newProjectId !== oldProjectId) {
                messages.value = []
                selectedMessage.value = null
                metrics.value = []
                error.value = null
                total.value = 0
                currentPage.value = 1
                filters.value = {}

                if (newProjectId) {
                    fetchMessages()
                    fetchMetrics()
                }
            }
        },
        { immediate: false }
    )

    // Computed
    const totalPages = computed(() => Math.ceil(total.value / perPage.value))
    const hasMore = computed(() => currentPage.value < totalPages.value)
    const activeMessages = computed(() => messages.value.filter((m) => m.isActive))
    const inactiveMessages = computed(() => messages.value.filter((m) => !m.isActive))

    // Actions
    async function fetchMessages(resetPage = false) {
        isLoading.value = true
        error.value = null

        if (resetPage) currentPage.value = 1

        try {
            const result = await getMessages({
                ...filters.value,
                page: currentPage.value,
                perPage: perPage.value,
            })

            if (result.ok) {
                messages.value = result.value.data
                total.value = result.value.pagination.total
                currentPage.value = result.value.pagination.page
            } else {
                error.value = result.error.message
                console.error('[Messages Store] Error:', result.error)
            }
        } catch (e) {
            error.value = (e as Error).message
        } finally {
            isLoading.value = false
        }
    }

    async function fetchMetrics() {
        try {
            const result = await getMessageMetrics({
                startDate: filters.value.startDate,
                endDate: filters.value.endDate,
            })

            if (result.ok) {
                metrics.value = result.value
            }
        } catch (e) {
            console.error('[Messages Store] Error fetching metrics:', e)
        }
    }

    async function fetchMessageById(id: string) {
        isLoading.value = true
        error.value = null

        try {
            const result = await getMessageById(id)

            if (result.ok) {
                selectedMessage.value = result.value
            } else {
                error.value = result.error.message
            }
        } catch (e) {
            error.value = (e as Error).message
        } finally {
            isLoading.value = false
        }
    }

    async function createMessage(data: CreateMessageDTO) {
        isLoading.value = true
        error.value = null

        try {
            const result = await createMessageService(data)

            if (result.ok) {
                await fetchMessages(true)
                await fetchMetrics()
                return { success: true, data: result.value }
            } else {
                error.value = result.error.message
                return { success: false, error: result.error }
            }
        } catch (e) {
            error.value = (e as Error).message
            return { success: false, error: e as Error }
        } finally {
            isLoading.value = false
        }
    }

    async function updateMessage(id: string, data: UpdateMessageDTO) {
        isLoading.value = true
        error.value = null

        try {
            const result = await updateMessageService(id, data)

            if (result.ok) {
                await fetchMessages()
                await fetchMetrics()
                if (selectedMessage.value?.id === id) {
                    selectedMessage.value = result.value
                }
                return { success: true, data: result.value }
            } else {
                error.value = result.error.message
                return { success: false, error: result.error }
            }
        } catch (e) {
            error.value = (e as Error).message
            return { success: false, error: e as Error }
        } finally {
            isLoading.value = false
        }
    }

    async function deleteMessage(id: string) {
        isLoading.value = true
        error.value = null

        try {
            const result = await deleteMessageService(id)

            if (result.ok) {
                await fetchMessages()
                await fetchMetrics()
                if (selectedMessage.value?.id === id) {
                    selectedMessage.value = null
                }
                return { success: true }
            } else {
                error.value = result.error.message
                return { success: false, error: result.error }
            }
        } catch (e) {
            error.value = (e as Error).message
            return { success: false, error: e as Error }
        } finally {
            isLoading.value = false
        }
    }

    function setFilters(newFilters: Partial<MessageFilters>) {
        filters.value = { ...filters.value, ...newFilters }
        fetchMessages(true)
        fetchMetrics()
    }

    function clearFilters() {
        filters.value = {}
        fetchMessages(true)
        fetchMetrics()
    }

    function nextPage() {
        if (hasMore.value) {
            currentPage.value++
            fetchMessages()
        }
    }

    function previousPage() {
        if (currentPage.value > 1) {
            currentPage.value--
            fetchMessages()
        }
    }

    function goToPage(page: number) {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
            fetchMessages()
        }
    }

    function selectMessage(message: Message | null) {
        selectedMessage.value = message
    }

    return {
        // State (readonly)
        messages: readonly(messages),
        selectedMessage: readonly(selectedMessage),
        metrics: readonly(metrics),
        isLoading: readonly(isLoading),
        error: readonly(error),
        total: readonly(total),
        currentPage: readonly(currentPage),
        perPage: readonly(perPage),
        filters: readonly(filters),

        // Computed
        totalPages,
        hasMore,
        activeMessages,
        inactiveMessages,

        // Actions
        fetchMessages,
        fetchMetrics,
        fetchMessageById,
        createMessage,
        updateMessage,
        deleteMessage,
        setFilters,
        clearFilters,
        nextPage,
        previousPage,
        goToPage,
        selectMessage,
    }
})

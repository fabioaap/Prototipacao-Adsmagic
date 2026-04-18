/**
 * Tags Store
 *
 * Gerencia o estado das tags de contatos.
 * Tags permitem categorizar contatos para melhor organização e filtragem.
 *
 * Regras:
 * - Máximo 50 tags por projeto
 * - Nomes de tags são únicos (case-insensitive)
 * - Tags podem ser associadas a múltiplos contatos
 *
 * @module stores/tags
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { tagsService } from '@/services/api/tags'
import type { Tag, CreateTagDTO, UpdateTagDTO } from '@/types'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'

export const useTagsStore = defineStore('tags', () => {
    // ========================================================================
    // STATE
    // ========================================================================

    /**
     * Lista de todas as tags do projeto
     */
    const tags = ref<Tag[]>([])

    /**
     * Indica se está carregando dados
     */
    const isLoading = ref(false)

    /**
     * Mensagem de erro, se houver
     */
    const error = ref<string | null>(null)

    /**
     * Cache de tags por contato (contactId -> Tag[])
     */
    const contactTagsCache = ref<Map<string, Tag[]>>(new Map())

    // ========================================================================
    // MULTI-TENANCY: Watch for project changes
    // ========================================================================

    // Obter ref reativo do projeto atual
    const { currentProjectId } = useCurrentProjectId()

    /**
     * Watch for project changes to clear data and reload
     */
    watch(
        currentProjectId,
        (newProjectId, oldProjectId) => {
            if (newProjectId !== oldProjectId) {
                console.log('[Tags Store] Project changed, clearing data:', { oldProjectId, newProjectId })

                // Clear all data
                tags.value = []
                contactTagsCache.value.clear()
                error.value = null

                // Reload data for new project if project exists
                if (newProjectId) {
                    console.log('[Tags Store] Loading data for new project:', newProjectId)
                    fetchTags()
                }
            }
        },
        { immediate: false }
    )

    // ========================================================================
    // CONSTANTS
    // ========================================================================

    /**
     * Limite máximo de tags por projeto
     */
    const MAX_TAGS = 50

    // ========================================================================
    // GETTERS
    // ========================================================================

    /**
     * Número de tags
     */
    const tagsCount = computed(() => tags.value.length)

    /**
     * Verifica se pode criar mais tags
     */
    const canCreateTag = computed(() => tags.value.length < MAX_TAGS)

    /**
     * Tags ordenadas por nome
     */
    const sortedTags = computed(() => {
        return [...tags.value].sort((a, b) => a.name.localeCompare(b.name))
    })

    /**
     * Busca tag por ID
     */
    const getTagById = computed(() => {
        return (id: string) => tags.value.find(tag => tag.id === id)
    })

    /**
     * Busca tags por IDs
     */
    const getTagsByIds = computed(() => {
        return (ids: string[]) => tags.value.filter(tag => ids.includes(tag.id))
    })

    /**
     * Cores disponíveis para novas tags
     */
    const availableColors = computed(() => tagsService.getDefaultColors())

    // ========================================================================
    // ACTIONS
    // ========================================================================

    /**
     * Carrega todas as tags do projeto
     */
    async function fetchTags(): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const data = await tagsService.getAll()
            tags.value = data
            console.log('[Tags Store] Loaded', data.length, 'tags')
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao carregar tags'
            console.error('[Tags Store] Error loading tags:', err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Cria uma nova tag
     */
    async function createTag(data: CreateTagDTO): Promise<Tag> {
        if (!canCreateTag.value) {
            throw new Error(`Limite de ${MAX_TAGS} tags por projeto atingido`)
        }

        isLoading.value = true
        error.value = null

        try {
            const newTag = await tagsService.create(data)
            tags.value.push(newTag)
            console.log('[Tags Store] Created tag:', newTag.name)
            return newTag
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao criar tag'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Atualiza uma tag existente
     */
    async function updateTag(id: string, data: UpdateTagDTO): Promise<Tag> {
        isLoading.value = true
        error.value = null

        try {
            const updatedTag = await tagsService.update(id, data)

            const index = tags.value.findIndex(t => t.id === id)
            if (index !== -1) {
                tags.value[index] = updatedTag
            }

            // Atualiza cache de contatos
            contactTagsCache.value.forEach((contactTags, contactId) => {
                const tagIndex = contactTags.findIndex(t => t.id === id)
                if (tagIndex !== -1) {
                    contactTags[tagIndex] = updatedTag
                    contactTagsCache.value.set(contactId, [...contactTags])
                }
            })

            console.log('[Tags Store] Updated tag:', updatedTag.name)
            return updatedTag
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao atualizar tag'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Exclui uma tag
     */
    async function deleteTag(id: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            await tagsService.delete(id)

            tags.value = tags.value.filter(t => t.id !== id)

            // Remove do cache de contatos
            contactTagsCache.value.forEach((contactTags, contactId) => {
                const filtered = contactTags.filter(t => t.id !== id)
                contactTagsCache.value.set(contactId, filtered)
            })

            console.log('[Tags Store] Deleted tag:', id)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao excluir tag'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Busca tags de um contato
     */
    async function fetchContactTags(contactId: string): Promise<Tag[]> {
        // Verifica cache primeiro
        if (contactTagsCache.value.has(contactId)) {
            return contactTagsCache.value.get(contactId)!
        }

        try {
            const contactTags = await tagsService.getContactTags(contactId)
            contactTagsCache.value.set(contactId, contactTags)
            return contactTags
        } catch (err) {
            console.error('[Tags Store] Error loading contact tags:', err)
            return []
        }
    }

    /**
     * Adiciona tags a um contato
     */
    async function addTagsToContact(contactId: string, tagIds: string[]): Promise<void> {
        try {
            await tagsService.addTagsToContact(contactId, tagIds)

            // Atualiza cache
            const currentTags = contactTagsCache.value.get(contactId) || []
            const newTags = tags.value.filter(t => tagIds.includes(t.id))
            const merged = [...currentTags, ...newTags.filter(t => !currentTags.find(ct => ct.id === t.id))]
            contactTagsCache.value.set(contactId, merged)

            // Atualiza contagem nas tags
            tagIds.forEach(tagId => {
                const tag = tags.value.find(t => t.id === tagId)
                if (tag) {
                    tag.contactsCount = (tag.contactsCount || 0) + 1
                }
            })

            console.log('[Tags Store] Added tags to contact:', contactId, tagIds)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao adicionar tags'
            throw err
        }
    }

    /**
     * Remove tags de um contato
     */
    async function removeTagsFromContact(contactId: string, tagIds: string[]): Promise<void> {
        try {
            await tagsService.removeTagsFromContact(contactId, tagIds)

            // Atualiza cache
            const currentTags = contactTagsCache.value.get(contactId) || []
            const filtered = currentTags.filter(t => !tagIds.includes(t.id))
            contactTagsCache.value.set(contactId, filtered)

            // Atualiza contagem nas tags
            tagIds.forEach(tagId => {
                const tag = tags.value.find(t => t.id === tagId)
                if (tag && tag.contactsCount) {
                    tag.contactsCount = Math.max(0, tag.contactsCount - 1)
                }
            })

            console.log('[Tags Store] Removed tags from contact:', contactId, tagIds)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao remover tags'
            throw err
        }
    }

    /**
     * Retorna tags de um contato do cache (sync)
     */
    function getContactTags(contactId: string): Tag[] {
        return contactTagsCache.value.get(contactId) || []
    }

    /**
     * Limpa o cache de um contato específico
     */
    function clearContactTagsCache(contactId: string): void {
        contactTagsCache.value.delete(contactId)
    }

    /**
     * Limpa todo o cache de contatos
     */
    function clearAllCache(): void {
        contactTagsCache.value.clear()
    }

    /**
     * Limpa erro
     */
    function clearError(): void {
        error.value = null
    }

    // ========================================================================
    // RETURN (Public API)
    // ========================================================================

    return {
        // State (readonly para evitar mutação direta)
        tags: readonly(tags),
        isLoading: readonly(isLoading),
        error: readonly(error),

        // Getters
        tagsCount,
        canCreateTag,
        sortedTags,
        getTagById,
        getTagsByIds,
        availableColors,

        // Actions
        fetchTags,
        createTag,
        updateTag,
        deleteTag,
        fetchContactTags,
        addTagsToContact,
        removeTagsFromContact,
        getContactTags,
        clearContactTagsCache,
        clearAllCache,
        clearError,
    }
})

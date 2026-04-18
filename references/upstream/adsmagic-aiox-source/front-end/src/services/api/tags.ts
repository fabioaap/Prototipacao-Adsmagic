/**
 * Tags API Service
 *
 * Gerencia todas as operações relacionadas a tags de contatos.
 * Segue o padrão "Mock First, API Ready" para desenvolvimento.
 *
 * @module services/api/tags
 */

import { apiClient, getApiErrorMessage } from './client'
import type { Tag, CreateTagDTO, UpdateTagDTO } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

/** Resposta da API de listagem de tags (snake_case) */
interface BackendTagRow {
  id: string
  project_id: string
  name: string
  color: string
  description: string | null
  created_at: string
  updated_at?: string
  contacts_count?: number
}

interface TagsListResponse {
  data: BackendTagRow[]
  meta: { total: number; limit: number; offset: number }
}

// ============================================================================
// HELPERS
// ============================================================================

function getCurrentProjectId(): string | null {
  return localStorage.getItem('current_project_id')
}

/**
 * Converts backend tag (snake_case) to frontend Tag (camelCase)
 */
function mapBackendTagToFrontend(row: BackendTagRow): Tag {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    color: row.color,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    ...(row.updated_at && { updatedAt: row.updated_at }),
    ...(row.contacts_count !== undefined && { contactsCount: row.contacts_count })
  }
}

// Cores padrão para tags
const TAG_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
]

// Mock data para desenvolvimento
let MOCK_TAGS: Tag[] = [
    {
        id: 'tag-1',
        projectId: 'project-1',
        name: 'VIP',
        color: '#f59e0b',
        description: 'Clientes prioritários',
        contactsCount: 12,
        createdAt: '2025-01-15T10:00:00Z',
    },
    {
        id: 'tag-2',
        projectId: 'project-1',
        name: 'Quente',
        color: '#ef4444',
        description: 'Leads prontos para comprar',
        contactsCount: 8,
        createdAt: '2025-01-16T14:30:00Z',
    },
    {
        id: 'tag-3',
        projectId: 'project-1',
        name: 'Recontato',
        color: '#3b82f6',
        description: 'Precisa de follow-up',
        contactsCount: 23,
        createdAt: '2025-01-17T09:15:00Z',
    },
    {
        id: 'tag-4',
        projectId: 'project-1',
        name: 'Indicação',
        color: '#10b981',
        description: 'Veio por indicação',
        contactsCount: 5,
        createdAt: '2025-01-18T16:45:00Z',
    },
]

// Mapeamento de tags por contato (mock)
const MOCK_CONTACT_TAGS: Map<string, string[]> = new Map([
    ['contact-1', ['tag-1', 'tag-3']],
    ['contact-2', ['tag-2']],
    ['contact-3', ['tag-4']],
])

// Flag para alternar entre mock e API real
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Flag para usar mock em endpoints de contact-tags
const USE_MOCK_FOR_CONTACT_TAGS = false

/**
 * Limite máximo de tags por projeto
 */
const MAX_TAGS_PER_PROJECT = 50

export const tagsService = {
    /**
     * Buscar todas as tags do projeto
     */
    async getAll(): Promise<Tag[]> {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 200))
            return [...MOCK_TAGS]
        }

        const projectId = getCurrentProjectId()
        if (!projectId) {
            return []
        }

        try {
            const response = await apiClient.get<TagsListResponse>('/tags', {
                params: { project_id: projectId, limit: 50, offset: 0 }
            })

            const rows = response.data?.data ?? []
            return rows.map(mapBackendTagToFrontend)
        } catch (err) {
            const message = getApiErrorMessage(err)
            if (import.meta.env.DEV) {
                console.error('[Tags Service] Error fetching tags:', err)
            }
            throw new Error(message)
        }
    },

    /**
     * Buscar tag por ID
     */
    async getById(id: string): Promise<Tag | null> {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 150))
            return MOCK_TAGS.find(tag => tag.id === id) || null
        }

        const response = await apiClient.get<Tag>(`/tags/${id}`)
        return response.data
    },

    /**
     * Criar nova tag
     */
    async create(data: CreateTagDTO): Promise<Tag> {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300))

            // Verifica limite de tags
            if (MOCK_TAGS.length >= MAX_TAGS_PER_PROJECT) {
                throw new Error(`Limite de ${MAX_TAGS_PER_PROJECT} tags por projeto atingido`)
            }

            // Verifica nome duplicado
            const existingTag = MOCK_TAGS.find(
                t => t.name.toLowerCase() === data.name.toLowerCase()
            )
            if (existingTag) {
                throw new Error(`Já existe uma tag com o nome "${data.name}"`)
            }

            const newTag: Tag = {
                id: `tag-${Date.now()}`,
                projectId: localStorage.getItem('current_project_id') || 'project-1',
                name: data.name,
                color: data.color || TAG_COLORS[MOCK_TAGS.length % TAG_COLORS.length] || '#3b82f6',
                description: data.description,
                contactsCount: 0,
                createdAt: new Date().toISOString(),
            }

            MOCK_TAGS.push(newTag)
            return newTag
        }

        const projectId = getCurrentProjectId()
        if (!projectId) {
            throw new Error('Nenhum projeto selecionado')
        }

        const payload = { ...data, project_id: projectId }
        const response = await apiClient.post<BackendTagRow>('/tags', payload)
        return mapBackendTagToFrontend(response.data)
    },

    /**
     * Atualizar tag existente
     */
    async update(id: string, data: UpdateTagDTO): Promise<Tag> {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 250))

            const index = MOCK_TAGS.findIndex(t => t.id === id)
            if (index === -1) {
                throw new Error('Tag não encontrada')
            }

            // Verifica nome duplicado (excluindo a própria tag)
            if (data.name) {
                const existingTag = MOCK_TAGS.find(
                    t => t.id !== id && t.name.toLowerCase() === data.name!.toLowerCase()
                )
                if (existingTag) {
                    throw new Error(`Já existe uma tag com o nome "${data.name}"`)
                }
            }

            const baseTag = MOCK_TAGS[index]!
            const updatedTag: Tag = {
                id: baseTag.id,
                projectId: baseTag.projectId,
                name: data.name ?? baseTag.name,
                color: data.color ?? baseTag.color,
                description: data.description ?? baseTag.description,
                contactsCount: baseTag.contactsCount,
                createdAt: baseTag.createdAt,
                updatedAt: new Date().toISOString(),
            }

            MOCK_TAGS[index] = updatedTag
            return updatedTag
        }

        const response = await apiClient.patch<Tag>(`/tags/${id}`, data)
        return response.data
    },

    /**
     * Excluir tag
     */
    async delete(id: string): Promise<void> {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 200))

            const index = MOCK_TAGS.findIndex(t => t.id === id)
            if (index === -1) {
                throw new Error('Tag não encontrada')
            }

            MOCK_TAGS.splice(index, 1)

            // Remove associações com contatos
            MOCK_CONTACT_TAGS.forEach((tagIds, contactId) => {
                const filtered = tagIds.filter(tagId => tagId !== id)
                MOCK_CONTACT_TAGS.set(contactId, filtered)
            })

            return
        }

        await apiClient.delete(`/tags/${id}`)
    },

    /**
     * Buscar tags de um contato
     */
    async getContactTags(contactId: string): Promise<Tag[]> {
        // Usar mock quando habilitado por configuração
        if (USE_MOCK || USE_MOCK_FOR_CONTACT_TAGS) {
            await new Promise(resolve => setTimeout(resolve, 150))

            const tagIds = MOCK_CONTACT_TAGS.get(contactId) || []
            return MOCK_TAGS.filter(tag => tagIds.includes(tag.id))
        }

        const response = await apiClient.get<BackendTagRow[]>(`/tags/contacts/${contactId}/tags`)
        return (response.data || []).map(mapBackendTagToFrontend)
    },

    /**
     * Adicionar tags a um contato
     */
    async addTagsToContact(contactId: string, tagIds: string[]): Promise<void> {
        // Usar mock quando habilitado por configuração
        if (USE_MOCK || USE_MOCK_FOR_CONTACT_TAGS) {
            await new Promise(resolve => setTimeout(resolve, 200))

            const currentTags = MOCK_CONTACT_TAGS.get(contactId) || []
            const newTags = [...new Set([...currentTags, ...tagIds])]
            MOCK_CONTACT_TAGS.set(contactId, newTags)

            // Atualiza contagem das tags
            tagIds.forEach(tagId => {
                const tag = MOCK_TAGS.find(t => t.id === tagId)
                if (tag && !currentTags.includes(tagId)) {
                    tag.contactsCount = (tag.contactsCount || 0) + 1
                }
            })

            return
        }

        await Promise.all(
            tagIds.map(async (tagId) => {
                await apiClient.post(`/tags/contacts/${contactId}/tags`, { tag_id: tagId })
            })
        )
    },

    /**
     * Remover tags de um contato
     */
    async removeTagsFromContact(contactId: string, tagIds: string[]): Promise<void> {
        // Usar mock quando habilitado por configuração
        if (USE_MOCK || USE_MOCK_FOR_CONTACT_TAGS) {
            await new Promise(resolve => setTimeout(resolve, 200))

            const currentTags = MOCK_CONTACT_TAGS.get(contactId) || []
            const newTags = currentTags.filter(id => !tagIds.includes(id))
            MOCK_CONTACT_TAGS.set(contactId, newTags)

            // Atualiza contagem das tags
            tagIds.forEach(tagId => {
                const tag = MOCK_TAGS.find(t => t.id === tagId)
                if (tag && currentTags.includes(tagId)) {
                    tag.contactsCount = Math.max(0, (tag.contactsCount || 0) - 1)
                }
            })

            return
        }

        await Promise.all(
            tagIds.map(async (tagId) => {
                await apiClient.delete(`/tags/contacts/${contactId}/tags/${tagId}`)
            })
        )
    },

    /**
     * Buscar contatos por tag
     * 
     * NOTA: Endpoint /tags/{id}/contacts ainda não implementado no backend.
     * Usando mock como fallback até implementação.
     */
    async getContactsByTag(tagId: string): Promise<string[]> {
        // Usar mock enquanto endpoint não estiver implementado no backend
        if (USE_MOCK || USE_MOCK_FOR_CONTACT_TAGS) {
            await new Promise(resolve => setTimeout(resolve, 150))

            const contactIds: string[] = []
            MOCK_CONTACT_TAGS.forEach((tagIds, contactId) => {
                if (tagIds.includes(tagId)) {
                    contactIds.push(contactId)
                }
            })
            return contactIds
        }

        const response = await apiClient.get<string[]>(`/tags/${tagId}/contacts`)
        return response.data
    },

    /**
     * Contar contatos por tag
     * 
     * NOTA: Endpoint /tags/{id}/contacts/count ainda não implementado no backend.
     * Usando mock como fallback até implementação.
     */
    async countContactsByTag(tagId: string): Promise<number> {
        // Usar mock enquanto endpoint não estiver implementado no backend
        if (USE_MOCK || USE_MOCK_FOR_CONTACT_TAGS) {
            await new Promise(resolve => setTimeout(resolve, 100))

            const tag = MOCK_TAGS.find(t => t.id === tagId)
            return tag?.contactsCount || 0
        }

        const response = await apiClient.get<{ count: number }>(`/tags/${tagId}/contacts/count`)
        return response.data.count
    },

    /**
     * Retorna cores padrão disponíveis para tags
     */
    getDefaultColors(): string[] {
        return [...TAG_COLORS]
    },
}

/**
 * Service para gerenciamento de atividades do contato
 *
 * Fornece acesso ao histórico de atividades de um contato,
 * incluindo mudanças de stage, tags, vendas, notas, etc.
 *
 * @module services/api/activities
 */
import type { ContactActivity, ContactActivityType } from '@/types/models'
import { apiClient } from './client'

// ============================================================================
// MOCK DATA
// ============================================================================

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * Gera atividades mock para um contato
 */
function generateMockActivities(contactId: string): ContactActivity[] {
    const now = new Date()
    const projectId = 'mock-project-id'

    const activities: ContactActivity[] = [
        {
            id: `activity-${contactId}-1`,
            contactId,
            projectId,
            type: 'contact_created',
            title: 'Contato criado',
            description: 'Contato foi adicionado ao sistema',
            metadata: {},
            performedBy: 'user-1',
            performedByName: 'Sistema',
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias atrás
        },
        {
            id: `activity-${contactId}-2`,
            contactId,
            projectId,
            type: 'stage_changed',
            title: 'Mudou para "Lead Qualificado"',
            description: 'Contato avançou no funil',
            metadata: {
                fromStage: 'stage-1',
                fromStageName: 'Novo',
                toStage: 'stage-2',
                toStageName: 'Lead Qualificado'
            },
            performedBy: 'user-1',
            performedByName: 'João Silva',
            createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: `activity-${contactId}-3`,
            contactId,
            projectId,
            type: 'tag_added',
            title: 'Tag adicionada: "VIP"',
            metadata: {
                tagId: 'tag-1',
                tagName: 'VIP',
                tagColor: '#f59e0b'
            },
            performedBy: 'user-1',
            performedByName: 'Maria Santos',
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: `activity-${contactId}-4`,
            contactId,
            projectId,
            type: 'note_added',
            title: 'Nota adicionada',
            metadata: {
                notePreview: 'Cliente demonstrou interesse em plano enterprise. Agendar demo...'
            },
            performedBy: 'user-2',
            performedByName: 'Carlos Oliveira',
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: `activity-${contactId}-5`,
            contactId,
            projectId,
            type: 'event_tracked',
            title: 'Evento rastreado: Visualização',
            metadata: {
                eventType: 'pageview',
                platform: 'meta_ads'
            },
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: `activity-${contactId}-6`,
            contactId,
            projectId,
            type: 'stage_changed',
            title: 'Mudou para "Proposta Enviada"',
            metadata: {
                fromStage: 'stage-2',
                fromStageName: 'Lead Qualificado',
                toStage: 'stage-3',
                toStageName: 'Proposta Enviada'
            },
            performedBy: 'user-1',
            performedByName: 'João Silva',
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: `activity-${contactId}-7`,
            contactId,
            projectId,
            type: 'tag_added',
            title: 'Tag adicionada: "Prioridade Alta"',
            metadata: {
                tagId: 'tag-2',
                tagName: 'Prioridade Alta',
                tagColor: '#ef4444'
            },
            performedBy: 'user-2',
            performedByName: 'Maria Santos',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: `activity-${contactId}-8`,
            contactId,
            projectId,
            type: 'sale_created',
            title: 'Venda registrada: R$ 2.500,00',
            description: 'Plano Enterprise - Anual',
            metadata: {
                saleId: 'sale-1',
                saleValue: 2500,
                saleStatus: 'completed'
            },
            performedBy: 'user-1',
            performedByName: 'João Silva',
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: `activity-${contactId}-9`,
            contactId,
            projectId,
            type: 'stage_changed',
            title: 'Mudou para "Cliente"',
            metadata: {
                fromStage: 'stage-3',
                fromStageName: 'Proposta Enviada',
                toStage: 'stage-4',
                toStageName: 'Cliente'
            },
            performedBy: 'user-1',
            performedByName: 'Sistema',
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: `activity-${contactId}-10`,
            contactId,
            projectId,
            type: 'field_updated',
            title: 'Email atualizado',
            metadata: {
                fieldName: 'email',
                oldValue: 'antigo@email.com',
                newValue: 'novo@email.com'
            },
            performedBy: 'user-2',
            performedByName: 'Carlos Oliveira',
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]

    return activities.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

// ============================================================================
// SERVICE
// ============================================================================

export interface GetActivitiesOptions {
    /** ID do contato */
    contactId: string
    /** Limite de resultados */
    limit?: number
    /** Offset para paginação */
    offset?: number
    /** Filtrar por tipos de atividade */
    types?: ContactActivityType[]
}

export const activitiesService = {
    /**
     * Busca atividades de um contato
     */
    async getContactActivities(options: GetActivitiesOptions): Promise<ContactActivity[]> {
        const { contactId, limit = 20, offset = 0, types } = options

        if (USE_MOCK) {
            // Simula latência de rede
            await new Promise(resolve => setTimeout(resolve, 300))

            let activities = generateMockActivities(contactId)

            // Filtra por tipos se especificado
            if (types && types.length > 0) {
                activities = activities.filter(a => types.includes(a.type))
            }

            // Aplica paginação
            return activities.slice(offset, offset + limit)
        }

        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        })

        if (types && types.length > 0) {
            params.append('types', types.join(','))
        }

        try {
            const response = await apiClient.get<ContactActivity[]>(
                `/contacts/${contactId}/activities?${params.toString()}`
            )
            return response.data
        } catch (error: unknown) {
            // Se o endpoint não existir (404), retorna array vazio
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } }
                if (axiosError.response?.status === 404) {
                    console.warn(`[ActivitiesService] Endpoint de atividades não encontrado para contato ${contactId}, retornando array vazio`)
                    return []
                }
            }
            throw error
        }
    },

    /**
     * Conta total de atividades de um contato
     */
    async countContactActivities(contactId: string): Promise<number> {
        if (USE_MOCK) {
            return generateMockActivities(contactId).length
        }

        try {
            const response = await apiClient.get<{ count: number }>(
                `/contacts/${contactId}/activities/count`
            )
            return response.data.count
        } catch (error: unknown) {
            // Se o endpoint não existir (404), retorna 0
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } }
                if (axiosError.response?.status === 404) {
                    console.warn(`[ActivitiesService] Endpoint de atividades não encontrado para contato ${contactId}, retornando 0`)
                    return 0
                }
            }
            throw error
        }
    },

    /**
     * Registra uma nova atividade (chamado internamente por outros services)
     */
    async logActivity(activity: Omit<ContactActivity, 'id' | 'createdAt'>): Promise<ContactActivity> {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 100))

            return {
                ...activity,
                id: `activity-${Date.now()}`,
                createdAt: new Date().toISOString()
            }
        }

        const response = await apiClient.post<ContactActivity>(
            `/contacts/${activity.contactId}/activities`,
            activity
        )
        return response.data
    }
}

export default activitiesService

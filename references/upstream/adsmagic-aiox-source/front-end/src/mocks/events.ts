/**
 * Mock data for events
 *
 * Contains 50+ realistic events with varied:
 * - Types (lead_created, stage_changed, message_sent, etc.)
 * - Contact references
 * - Stage references
 * - Status (success, failed)
 * - Metadata
 * - Project isolation
 *
 * @module mocks/events
 */

import type { Event, CreateEventDTO, UpdateEventDTO, EventFilters, PaginatedResponse } from '@/types'

/**
 * Event types and their descriptions
 */
const EVENT_TYPES = {
  'lead_created': 'Lead criado',
  'stage_changed': 'Estágio alterado',
  'message_sent': 'Mensagem enviada',
  'message_received': 'Mensagem recebida',
  'call_made': 'Ligação realizada',
  'email_sent': 'Email enviado',
  'email_opened': 'Email aberto',
  'link_clicked': 'Link clicado',
  'form_submitted': 'Formulário enviado',
  'page_viewed': 'Página visualizada',
  'conversion': 'Conversão realizada',
  'sale_completed': 'Venda finalizada',
  'sale_lost': 'Venda perdida',
  'follow_up_scheduled': 'Follow-up agendado',
  'meeting_scheduled': 'Reunião agendada',
  'document_sent': 'Documento enviado',
  'proposal_sent': 'Proposta enviada',
  'contract_signed': 'Contrato assinado',
  'payment_received': 'Pagamento recebido',
  'support_ticket': 'Ticket de suporte',
  'integration_sync': 'Sincronização de integração',
  'campaign_triggered': 'Campanha acionada',
  'automation_triggered': 'Automação acionada',
  'tag_added': 'Tag adicionada',
  'note_added': 'Nota adicionada',
  'task_created': 'Tarefa criada',
  'reminder_set': 'Lembrete definido',
  'status_updated': 'Status atualizado',
  'custom_field_updated': 'Campo personalizado atualizado',
  'webhook_received': 'Webhook recebido'
}

/**
 * Generate mock event data
 */
const generateMockEvent = (
  id: string, 
  contactId: string, 
  type: string, 
  stageId: string, 
  status: 'sent' | 'failed' = 'sent',
  metadata: Record<string, any> = {}
): Event => ({
  id,
  projectId: '2',
  contactId,
  type,
  platform: 'meta',
  status,
  stage: stageId,
  metadata,
  saleId: undefined,
  retryCount: 0,
  lastRetryAt: undefined,
  errorMessage: status === 'failed' ? 'Falha na comunicação com a API' : undefined,
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  sentAt: status === 'sent' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
})

/**
 * Mock events data (50+ records)
 */
export const MOCK_EVENTS: Event[] = [
  // Eventos do Dr. Leticia Lopes (contact-001)
  generateMockEvent('event-001', 'contact-001', 'lead_created', 'stage-contact-initiated', 'sent', {
    source: 'Google Ads',
    campaign: 'Odontologia - Sorriso Perfeito',
    keyword: 'dentista araraquara'
  }),
  generateMockEvent('event-002', 'contact-001', 'stage_changed', 'stage-qualification', 'sent', {
    fromStage: 'stage-contact-initiated',
    toStage: 'stage-qualification',
    reason: 'Cliente demonstrou interesse'
  }),
  generateMockEvent('event-003', 'contact-001', 'message_sent', 'stage-qualification', 'sent', {
    messageType: 'welcome',
    channel: 'whatsapp',
    content: 'Olá! Obrigado pelo interesse em nossos serviços odontológicos.'
  }),
  generateMockEvent('event-004', 'contact-001', 'message_received', 'stage-qualification', 'sent', {
    messageType: 'response',
    channel: 'whatsapp',
    content: 'Oi! Gostaria de saber mais sobre os tratamentos disponíveis.'
  }),
  generateMockEvent('event-005', 'contact-001', 'call_made', 'stage-qualification', 'sent', {
    duration: 15,
    outcome: 'interested',
    notes: 'Cliente interessado em clareamento dental'
  }),
  generateMockEvent('event-006', 'contact-001', 'stage_changed', 'stage-proposal-sent', 'sent', {
    fromStage: 'stage-qualification',
    toStage: 'stage-proposal-sent',
    reason: 'Proposta enviada'
  }),
  generateMockEvent('event-007', 'contact-001', 'proposal_sent', 'stage-proposal-sent', 'sent', {
    proposalValue: 2500,
    treatment: 'Clareamento Dental + Limpeza',
    validUntil: '2024-12-31'
  }),
  generateMockEvent('event-008', 'contact-001', 'stage_changed', 'stage-negotiation', 'sent', {
    fromStage: 'stage-proposal-sent',
    toStage: 'stage-negotiation',
    reason: 'Cliente iniciou negociação'
  }),
  generateMockEvent('event-009', 'contact-001', 'meeting_scheduled', 'stage-negotiation', 'sent', {
    meetingDate: '2024-11-15T14:00:00.000Z',
    meetingType: 'consultation',
    location: 'Clínica Odontológica'
  }),
  generateMockEvent('event-010', 'contact-001', 'stage_changed', 'stage-sale', 'sent', {
    fromStage: 'stage-negotiation',
    toStage: 'stage-sale',
    reason: 'Venda finalizada'
  }),
  generateMockEvent('event-011', 'contact-001', 'sale_completed', 'stage-sale', 'sent', {
    saleValue: 2500,
    paymentMethod: 'PIX',
    treatment: 'Clareamento Dental + Limpeza'
  }),
  generateMockEvent('event-012', 'contact-001', 'payment_received', 'stage-sale', 'sent', {
    amount: 2500,
    paymentMethod: 'PIX',
    transactionId: 'PIX-2024-001'
  }),

  // Eventos do João Silva (contact-002)
  generateMockEvent('event-013', 'contact-002', 'lead_created', 'stage-contact-initiated', 'sent', {
    source: 'Google Ads',
    campaign: 'Consultoria Empresarial',
    keyword: 'consultoria gestão'
  }),
  generateMockEvent('event-014', 'contact-002', 'message_sent', 'stage-contact-initiated', 'sent', {
    messageType: 'welcome',
    channel: 'whatsapp',
    content: 'Olá João! Vi que você tem interesse em consultoria empresarial.'
  }),
  generateMockEvent('event-015', 'contact-002', 'stage_changed', 'stage-qualification', 'sent', {
    fromStage: 'stage-contact-initiated',
    toStage: 'stage-qualification',
    reason: 'Cliente respondeu positivamente'
  }),
  generateMockEvent('event-016', 'contact-002', 'call_made', 'stage-qualification', 'sent', {
    duration: 25,
    outcome: 'very_interested',
    notes: 'Empresa de 50 funcionários, precisa de consultoria em processos'
  }),
  generateMockEvent('event-017', 'contact-002', 'proposal_sent', 'stage-qualification', 'sent', {
    proposalValue: 1200,
    service: 'Consultoria em Gestão de Processos',
    validUntil: '2024-12-15'
  }),
  generateMockEvent('event-018', 'contact-002', 'stage_changed', 'stage-negotiation', 'sent', {
    fromStage: 'stage-qualification',
    toStage: 'stage-negotiation',
    reason: 'Cliente quer negociar condições'
  }),
  generateMockEvent('event-019', 'contact-002', 'meeting_scheduled', 'stage-negotiation', 'sent', {
    meetingDate: '2024-11-20T10:00:00.000Z',
    meetingType: 'proposal_review',
    location: 'Online'
  }),
  generateMockEvent('event-020', 'contact-002', 'stage_changed', 'stage-sale', 'sent', {
    fromStage: 'stage-negotiation',
    toStage: 'stage-sale',
    reason: 'Venda finalizada'
  }),
  generateMockEvent('event-021', 'contact-002', 'sale_completed', 'stage-sale', 'sent', {
    saleValue: 1200,
    paymentMethod: 'Transferência',
    service: 'Consultoria em Gestão de Processos'
  }),

  // Eventos da Maria Oliveira (contact-003)
  generateMockEvent('event-022', 'contact-003', 'lead_created', 'stage-contact-initiated', 'sent', {
    source: 'Meta Ads',
    campaign: 'E-commerce - Moda Feminina',
    adSet: 'Interesse em Moda'
  }),
  generateMockEvent('event-023', 'contact-003', 'message_sent', 'stage-contact-initiated', 'sent', {
    messageType: 'welcome',
    channel: 'whatsapp',
    content: 'Oi Maria! Vi que você se interessou por nossa loja de moda feminina.'
  }),
  generateMockEvent('event-024', 'contact-003', 'stage_changed', 'stage-qualification', 'sent', {
    fromStage: 'stage-contact-initiated',
    toStage: 'stage-qualification',
    reason: 'Cliente demonstrou interesse em produtos'
  }),
  generateMockEvent('event-025', 'contact-003', 'link_clicked', 'stage-qualification', 'sent', {
    linkUrl: 'https://loja.com.br/vestidos',
    linkText: 'Ver Vestidos',
    pageTitle: 'Vestidos Femininos'
  }),
  generateMockEvent('event-026', 'contact-003', 'form_submitted', 'stage-qualification', 'sent', {
    formName: 'Newsletter',
    formFields: ['email', 'interests'],
    source: 'landing_page'
  }),
  generateMockEvent('event-027', 'contact-003', 'proposal_sent', 'stage-qualification', 'sent', {
    proposalValue: 3200,
    products: ['Vestido Elegante', 'Bolsa de Couro'],
    discount: '10%'
  }),
  generateMockEvent('event-028', 'contact-003', 'stage_changed', 'stage-proposal-sent', 'sent', {
    fromStage: 'stage-qualification',
    toStage: 'stage-proposal-sent',
    reason: 'Proposta enviada'
  }),
  generateMockEvent('event-029', 'contact-003', 'stage_changed', 'stage-negotiation', 'sent', {
    fromStage: 'stage-proposal-sent',
    toStage: 'stage-negotiation',
    reason: 'Cliente quer negociar desconto'
  }),
  generateMockEvent('event-030', 'contact-003', 'stage_changed', 'stage-sale', 'sent', {
    fromStage: 'stage-negotiation',
    toStage: 'stage-sale',
    reason: 'Venda finalizada'
  }),
  generateMockEvent('event-031', 'contact-003', 'sale_completed', 'stage-sale', 'sent', {
    saleValue: 3200,
    paymentMethod: 'Cartão de Crédito',
    products: ['Vestido Elegante', 'Bolsa de Couro']
  }),

  // Eventos de outros contatos
  generateMockEvent('event-032', 'contact-004', 'lead_created', 'stage-contact-initiated', 'sent', {
    source: 'Instagram',
    campaign: 'Fitness - Academia',
    adSet: 'Interesse em Academia'
  }),
  generateMockEvent('event-033', 'contact-004', 'message_sent', 'stage-contact-initiated', 'sent', {
    messageType: 'welcome',
    channel: 'whatsapp',
    content: 'Olá! Vi que você tem interesse em nossa academia.'
  }),
  generateMockEvent('event-034', 'contact-004', 'call_made', 'stage-contact-initiated', 'failed', {
    duration: 0,
    outcome: 'no_answer',
    notes: 'Cliente não atendeu a ligação'
  }),
  generateMockEvent('event-035', 'contact-004', 'follow_up_scheduled', 'stage-contact-initiated', 'sent', {
    followUpDate: '2024-11-18T16:00:00.000Z',
    followUpType: 'call',
    notes: 'Tentar ligar novamente'
  }),

  // Eventos de automação
  generateMockEvent('event-036', 'contact-005', 'automation_triggered', 'stage-qualification', 'sent', {
    automationName: 'Welcome Series',
    trigger: 'new_lead',
    step: 'step_1'
  }),
  generateMockEvent('event-037', 'contact-005', 'email_sent', 'stage-qualification', 'sent', {
    emailType: 'welcome',
    subject: 'Bem-vindo à nossa empresa!',
    template: 'welcome_template_v2'
  }),
  generateMockEvent('event-038', 'contact-005', 'email_opened', 'stage-qualification', 'sent', {
    emailId: 'email_001',
    openTime: '2024-11-10T14:30:00.000Z',
    device: 'mobile'
  }),

  // Eventos de integração
  generateMockEvent('event-039', 'contact-006', 'integration_sync', 'stage-proposal-sent', 'sent', {
    integration: 'CRM',
    syncType: 'contact_update',
    recordsSynced: 1
  }),
  generateMockEvent('event-040', 'contact-006', 'webhook_received', 'stage-proposal-sent', 'sent', {
    webhookSource: 'payment_gateway',
    eventType: 'payment_processed',
    data: { amount: 2100, status: 'completed' }
  }),

  // Eventos de campanha
  generateMockEvent('event-041', 'contact-007', 'campaign_triggered', 'stage-negotiation', 'sent', {
    campaignName: 'Black Friday 2024',
    trigger: 'price_drop',
    discount: '20%'
  }),
  generateMockEvent('event-042', 'contact-007', 'message_sent', 'stage-negotiation', 'sent', {
    messageType: 'promotional',
    channel: 'whatsapp',
    content: '🔥 Black Friday! 20% de desconto em todos os produtos!'
  }),

  // Eventos de suporte
  generateMockEvent('event-043', 'contact-008', 'support_ticket', 'stage-sale', 'sent', {
    ticketId: 'SUP-2024-001',
    priority: 'medium',
    category: 'technical_support',
    description: 'Dúvida sobre instalação do produto'
  }),
  generateMockEvent('event-044', 'contact-008', 'task_created', 'stage-sale', 'sent', {
    taskTitle: 'Follow-up com cliente',
    dueDate: '2024-11-25T17:00:00.000Z',
    priority: 'high',
    assignedTo: 'João Silva'
  }),

  // Eventos de documentação
  generateMockEvent('event-045', 'contact-009', 'document_sent', 'stage-proposal-sent', 'sent', {
    documentType: 'proposal',
    documentName: 'Proposta_Comercial_2024.pdf',
    deliveryMethod: 'email'
  }),
  generateMockEvent('event-046', 'contact-009', 'contract_signed', 'stage-sale', 'sent', {
    contractId: 'CT-2024-001',
    signatureMethod: 'digital',
    signedAt: '2024-11-12T10:30:00.000Z'
  }),

  // Eventos de tags e notas
  generateMockEvent('event-047', 'contact-010', 'tag_added', 'stage-qualification', 'sent', {
    tagName: 'VIP',
    tagColor: '#FFD700',
    addedBy: 'Sistema'
  }),
  generateMockEvent('event-048', 'contact-010', 'note_added', 'stage-qualification', 'sent', {
    noteContent: 'Cliente muito interessado, orçamento aprovado',
    noteType: 'internal',
    visibility: 'team'
  }),

  // Eventos de lembretes
  generateMockEvent('event-049', 'contact-011', 'reminder_set', 'stage-negotiation', 'sent', {
    reminderType: 'call',
    reminderDate: '2024-11-20T15:00:00.000Z',
    reminderText: 'Ligar para cliente sobre proposta'
  }),

  // Eventos de atualização de status
  generateMockEvent('event-050', 'contact-012', 'status_updated', 'stage-sale', 'sent', {
    oldStatus: 'negotiating',
    newStatus: 'closed_won',
    updatedBy: 'Sistema',
    reason: 'Venda finalizada com sucesso'
  }),

  // Eventos de campos personalizados
  generateMockEvent('event-051', 'contact-013', 'custom_field_updated', 'stage-qualification', 'sent', {
    fieldName: 'Budget',
    oldValue: 'R$ 1.000',
    newValue: 'R$ 2.500',
    updatedBy: 'Cliente'
  }),

  // Eventos de falha
  generateMockEvent('event-052', 'contact-014', 'email_sent', 'stage-qualification', 'failed', {
    emailType: 'follow_up',
    subject: 'Lembrete sobre nossa proposta',
    error: 'Invalid email address',
    retryCount: 3
  }),
  generateMockEvent('event-053', 'contact-014', 'call_made', 'stage-negotiation', 'failed', {
    duration: 0,
    outcome: 'busy',
    notes: 'Linha ocupada, tentar novamente mais tarde'
  }),

  // Eventos de conversão
  generateMockEvent('event-054', 'contact-015', 'conversion', 'stage-sale', 'sent', {
    conversionType: 'purchase',
    conversionValue: 1800,
    currency: 'BRL',
    attribution: 'Google Ads'
  }),

  // Eventos de página
  generateMockEvent('event-055', 'contact-016', 'page_viewed', 'stage-contact-initiated', 'sent', {
    pageUrl: 'https://empresa.com.br/produtos',
    pageTitle: 'Nossos Produtos',
    timeOnPage: 45,
    referrer: 'https://google.com'
  })
]

/**
 * Helper functions for mock events operations
 */

/**
 * Filter events by project ID
 */
export function filterEventsByProject(events: Event[], projectId: string): Event[] {
  return events.filter(event => event.projectId === projectId)
}

/**
 * Filter events by contact ID
 */
export function filterEventsByContact(events: Event[], contactId: string): Event[] {
  return events.filter(event => event.contactId === contactId)
}

/**
 * Filter events by type
 */
export function filterEventsByType(events: Event[], type: string): Event[] {
  return events.filter(event => event.type === type)
}

/**
 * Filter events by status
 */
export function filterEventsByStatus(events: Event[], status: 'sent' | 'failed'): Event[] {
  return events.filter(event => event.status === status)
}

/**
 * Filter events by date range
 */
export function filterEventsByDateRange(events: Event[], startDate: string, endDate: string): Event[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return events.filter(event => {
    const eventDate = new Date(event.createdAt)
    return eventDate >= start && eventDate <= end
  })
}

/**
 * Get events statistics
 */
export function getEventsStats(events: Event[]) {
  const successEvents = events.filter(event => event.status === 'sent')
  const failedEvents = events.filter(event => event.status === 'failed')
  
  const eventTypes = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalEvents: events.length,
    successEvents: successEvents.length,
    failedEvents: failedEvents.length,
    successRate: events.length > 0 ? (successEvents.length / events.length) * 100 : 0,
    eventTypes
  }
}

/**
 * Paginate events
 */
export function paginateEvents(events: Event[], page: number, pageSize: number): PaginatedResponse<Event> {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  const paginatedEvents = events.slice(startIndex, endIndex)
  
  return {
    data: paginatedEvents,
    pagination: {
      page,
      pageSize,
      total: events.length,
      totalPages: Math.ceil(events.length / pageSize)
    }
  }
}

/**
 * Apply filters to events
 */
export function applyEventsFilters(events: Event[], filters: EventFilters): Event[] {
  let filteredEvents = [...events]
  
  // Filter by project ID
  if (filters.projectId) {
    filteredEvents = filteredEvents.filter(event => event.projectId === filters.projectId)
  }
  
  // Filter by contact ID
  if (filters.contactId) {
    filteredEvents = filteredEvents.filter(event => event.contactId === filters.contactId)
  }
  
  // Filter by type
  if (filters.type) {
    filteredEvents = filteredEvents.filter(event => event.type === filters.type)
  }
  
  // Filter by status
  if (filters.status) {
    filteredEvents = filteredEvents.filter(event => event.status === filters.status)
  }
  
  // Filter by date range
  if (filters.startDate && filters.endDate) {
    filteredEvents = filterEventsByDateRange(filteredEvents, filters.startDate, filters.endDate)
  }
  
  // Sort by date (newest first)
  filteredEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  return filteredEvents
}

/**
 * Create a new event
 */
export function createMockEvent(data: CreateEventDTO): Event {
  const newEvent: Event = {
    id: `event-${Date.now()}`,
    contactId: data.contactId,
    type: data.type,
    stage: data.stage,
    platform: data.platform || 'system',
    status: data.status || 'sent',
    description: data.description || EVENT_TYPES[data.type as keyof typeof EVENT_TYPES] || `Evento de ${data.type}`,
    metadata: data.metadata || {},
    projectId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  MOCK_EVENTS.push(newEvent)
  return newEvent
}

/**
 * Update an event
 */
export function updateMockEvent(id: string, data: UpdateEventDTO): Event | null {
  const eventIndex = MOCK_EVENTS.findIndex(event => event.id === id)
  
  if (eventIndex === -1) {
    return null
  }
  
  const existingEvent = MOCK_EVENTS[eventIndex]!
  const updatedEvent: Event = {
    id: existingEvent.id,
    projectId: existingEvent.projectId,
    platform: existingEvent.platform,
    type: existingEvent.type,
    contactId: existingEvent.contactId,
    saleId: existingEvent.saleId,
    stage: existingEvent.stage,
    description: existingEvent.description,
    entityId: existingEvent.entityId,
    entityType: existingEvent.entityType,
    metadata: existingEvent.metadata,
    payload: existingEvent.payload,
    response: existingEvent.response,
    error: existingEvent.error,
    retryCount: existingEvent.retryCount,
    processedAt: existingEvent.processedAt,
    status: data.status ?? existingEvent.status,
    lastRetryAt: existingEvent.lastRetryAt,
    errorMessage: data.errorMessage ?? existingEvent.errorMessage,
    createdAt: existingEvent.createdAt,
    updatedAt: new Date().toISOString(),
    sentAt: existingEvent.sentAt,
  }
  
  MOCK_EVENTS[eventIndex] = updatedEvent
  return updatedEvent
}

/**
 * Delete an event
 */
export function deleteMockEvent(id: string): boolean {
  const eventIndex = MOCK_EVENTS.findIndex(event => event.id === id)
  
  if (eventIndex === -1) {
    return false
  }
  
  MOCK_EVENTS.splice(eventIndex, 1)
  return true
}

/**
 * Get events by contact
 */
export function getEventsByContact(contactId: string): Event[] {
  return MOCK_EVENTS.filter(event => event.contactId === contactId)
}

/**
 * Get events by project
 */
export function getEventsByProject(projectId: string): Event[] {
  return MOCK_EVENTS.filter(event => event.projectId === projectId)
}
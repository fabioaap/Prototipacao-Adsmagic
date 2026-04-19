/**
 * Stores - Centralized Export Point
 *
 * Este arquivo exporta todas as stores Pinia do projeto
 * para facilitar imports consistentes em toda a aplicação.
 *
 * Uso:
 * ```typescript
 * import { useContactsStore, useStagesStore } from '@/stores'
 * ```
 *
 * @module stores
 */

// Re-exports de todas as stores
export { useStagesStore } from './stages'
export { useOriginsStore } from './origins'
export { useContactsStore } from './contacts'
export { useSalesStore } from './sales'
export { useDashboardStore } from './dashboard'
export { useLinksStore } from './links'
export { useEventsStore } from './events'
export { useMessagesStore } from './messages'

/**
 * Guia de uso das stores:
 *
 * 1. **useStagesStore**
 *    - Gerencia etapas do funil
 *    - Getters: activeStages, kanbanStages, saleStage, lostStage
 *    - Actions: fetchStages, createStage, updateStage, deleteStage, reorderStages
 *
 * 2. **useOriginsStore**
 *    - Gerencia origens de tráfego
 *    - Getters: systemOrigins, customOrigins, activeOrigins, canCreateMore
 *    - Actions: fetchOrigins, createOrigin, updateOrigin, deleteOrigin, toggleActive
 *
 * 3. **useContactsStore**
 *    - Gerencia contatos e filtros
 *    - Getters: contactsByStage, contactsByOrigin, hasFilters, totalContacts
 *    - Actions: fetchContacts, createContact, updateContact, deleteContact, moveContactToStage
 *
 * 4. **useSalesStore**
 *    - Gerencia vendas e conversões
 *    - Getters: confirmedSales, lostSales, totalRevenue, averageTicket, conversionRate
 *    - Actions: fetchSales, createSale, markSaleLost, recoverSale
 *
 * 5. **useDashboardStore**
 *    - Métricas agregadas e estatísticas
 *    - Getters: totalContacts, totalSales, conversionRate, bestOrigin, contactsByStage
 *    - Actions: fetchMetrics, fetchTimeSeriesData, fetchOriginPerformance, setPeriod
 *
 * 6. **useLinksStore**
 *    - Gerencia links de rastreamento
 *    - Getters: activeLinks, linksByOrigin, canCreateMore, totalClicks, overallConversionRate
 *    - Actions: fetchLinks, createLink, updateLink, deleteLink, fetchLinkStats
 *
 * 7. **useEventsStore**
 *    - Gerencia eventos de conversão
 *    - Getters: successfulEvents, failedEvents, eventsByPlatform, successRate
 *    - Actions: fetchEvents, retryEvent, retryAllFailed
 */

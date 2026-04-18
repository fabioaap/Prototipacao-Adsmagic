# Guia de Performance - Adsmagic First AI

## Cache Implementado

### Empresas
- Cache de 5 minutos para lista de empresas
- Invalidado em operações de escrita (criar/atualizar/deletar)
- Chave de cache: `companies:${userId}`

### Projetos
- Cache de 5 minutos para lista de projetos
- Invalidado em operações de escrita
- Invalidado ao trocar de empresa
- Chave de cache: `projects:${companyId}`

### Onboarding
- Cache de progresso do onboarding
- Persistido entre sessões
- Invalidado ao completar onboarding

## Otimizações de Query

### Paginação
- Implementada para listas com > 20 itens
- Lazy loading em scroll
- Função `getUserProjectsPaginated` disponível

### Seleção de Campos
- Queries selecionam apenas campos necessários
- Reduz transferência de dados
- Exemplo: `select('id, name, company_id, created_by, status, whatsapp_connected, created_at, updated_at')`

## Debounce

### Campos de Busca
- 300ms de debounce em inputs de busca
- Reduz chamadas desnecessárias
- Implementado via `useDebounce` composable

## Lazy Loading

### Scroll Infinito
- Implementado via `useLazyLoad` composable
- Threshold configurável (padrão: 100px)
- Carregamento automático ao chegar no fim

## Métricas Esperadas

- Carregamento inicial: < 2s
- Navegação: < 500ms
- Cache hit ratio: > 80%
- Queries: < 200ms

## Monitoramento

### Cache Stats
```typescript
import { cacheService } from '@/services/cache/cacheService'

// Ver estatísticas do cache
console.log(cacheService.getStats())
```

### Performance Timing
```typescript
// Medir tempo de carregamento
const start = performance.now()
await fetchData()
const end = performance.now()
console.log(`Tempo: ${end - start}ms`)
```

## Otimizações Futuras

### Redis Cache
- Para produção, considerar Redis
- Cache distribuído entre instâncias
- Persistência entre restarts

### CDN
- Assets estáticos via CDN
- Imagens otimizadas
- Compressão gzip

### Service Workers
- Cache de assets
- Offline support
- Background sync

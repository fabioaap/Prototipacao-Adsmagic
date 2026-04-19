# Plano: Limpar filtros ao sair + Realtime Supabase na tabela contacts

## Context

Dois problemas na página de contatos:
1. **Filtro persistente:** Ao buscar um contato, navegar para outra página e voltar, o filtro de busca continua ativo porque o store Pinia (singleton) mantém o estado entre navegações.
2. **Sem realtime:** Mudanças na etapa de um contato não aparecem em tempo real no kanban/lista.

---

## Feature 1: Limpar filtros ao navegar para fora da página

### Causa raiz
- `onUnmounted` só limpa debounce timer, não reseta filtros do store
- `onMounted` pula fetch se `contacts.length > 0`, mantendo dados filtrados stale
- Store expõe `filters` como `readonly`

### Alterações

**1. `front-end/src/stores/contacts.ts`** — Adicionar action `resetState`:
```typescript
const resetState = (): void => {
  contacts.value = []
  kanbanContacts.value = []
  selectedContact.value = null
  error.value = null
  pagination.value = { page: 1, pageSize: 10, total: 0, totalPages: 0 }
  filters.value = { page: 1, pageSize: 10 }
}
```
Expor `resetState` no return do store.

**2. `front-end/src/views/contacts/ContactsView.vue`**:

- `onUnmounted`: adicionar `contactsStore.resetState()`
- `onMounted`: remover condicionais `contacts.length === 0`, sempre fazer fetch

---

## Feature 2: Supabase Realtime para contacts

### Riscos identificados e mitigações

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| **DELETE `payload.old` com RLS** — retorna apenas PK, não row completo | ALTA | Usar `payload.old.id` (não assumir campos extras) |
| **Dupla inscrição** — `removeChannel()` é async, `subscribe()` é sync → race condition | ALTA | `await supabase.removeChannel()` antes de criar novo channel |
| **DELETE ignora filtros** — limitação Supabase: `filter:` não se aplica a DELETE events | ALTA | Verificar `project_id` manualmente no handler de DELETE |
| **Migration não idempotente** — `ADD TABLE` falha se já existe na publicação | MÉDIA | Check condicional com `pg_publication_tables` |
| **Total/paginação corrompidos** — INSERT/UPDATE cegos aos filtros ativos | ALTA | Função `matchesActiveFilters()` antes de modificar state |
| **Dedup de mutações locais** — ações do próprio user geram evento realtime duplicado | MÉDIA | Set de IDs recentes com TTL de 2s |

---

### Passo 1: Migration idempotente

**Arquivo:** `back-end/supabase/migrations/082_enable_realtime_contacts.sql`

```sql
-- Habilitar REPLICA IDENTITY FULL para receber row completo em UPDATE
-- (DELETE com RLS retorna apenas PK — limitação conhecida do Supabase)
ALTER TABLE contacts REPLICA IDENTITY FULL;

-- Adicionar à publicação realtime apenas se não estiver
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE schemaname = 'public'
      AND tablename = 'contacts'
      AND pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
  END IF;
END $$;
```

---

### Passo 2: Função `matchesActiveFilters` no store

Antes de adicionar/manter um contato nas listas, verificar se ele satisfaz os filtros ativos. Isso resolve o risco de total/paginação corrompidos.

```typescript
const matchesActiveFilters = (contact: Contact): boolean => {
  const f = filters.value
  if (f.stages?.length && !f.stages.includes(contact.stage)) return false
  if (f.origins?.length && !f.origins.includes(contact.origin)) return false
  if (f.search) {
    const term = f.search.toLowerCase()
    const searchable = [contact.name, contact.email, contact.phone, contact.location]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (!searchable.includes(term)) return false
  }
  if (f.dateFrom && contact.createdAt < f.dateFrom) return false
  if (f.dateTo && contact.createdAt > f.dateTo) return false
  return true
}
```

---

### Passo 3: Dedup de mutações locais

```typescript
const recentLocalMutations = new Set<string>()

const trackLocalMutation = (id: string) => {
  recentLocalMutations.add(id)
  setTimeout(() => recentLocalMutations.delete(id), 2000)
}
```

Chamar `trackLocalMutation(id)` nas actions `createContact`, `updateContact`, `deleteContact`, `moveContactToStage` após sucesso.

---

### Passo 4: Actions `subscribeToRealtime` / `unsubscribeFromRealtime`

**Imports novos:**
```typescript
import { supabase, supabaseEnabled } from '@/services/api/supabaseClient'
import { mapBackendContactToFrontend } from '@/services/api/adapters/contactsAdapter'
import type { BackendContact } from '@/types/api/contacts.api'
import type { RealtimeChannel } from '@supabase/supabase-js'
```

**State:** `let realtimeChannel: RealtimeChannel | null = null` (não-reativo)

```typescript
const subscribeToRealtime = async (): Promise<void> => {
  if (!supabaseEnabled) return

  const projectId = currentProjectId.value
  if (!projectId) return

  // CRÍTICO: await para evitar race condition de dupla inscrição
  await unsubscribeFromRealtime()

  const channelName = `contacts:project-${projectId}`

  realtimeChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'contacts',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        const contact = mapBackendContactToFrontend(payload.new as BackendContact)
        if (recentLocalMutations.has(contact.id)) return

        if (!matchesActiveFilters(contact)) return

        kanbanContacts.value = upsertContactInCollection(kanbanContacts.value, contact)
        if (pagination.value.page === 1) {
          contacts.value = upsertContactInCollection(contacts.value, contact)
        }
        pagination.value = { ...pagination.value, total: pagination.value.total + 1 }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'contacts',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        const contact = mapBackendContactToFrontend(payload.new as BackendContact)
        if (recentLocalMutations.has(contact.id)) return

        const existsInKanban = kanbanContacts.value.some(c => c.id === contact.id)
        const existsInPage = contacts.value.some(c => c.id === contact.id)
        const matches = matchesActiveFilters(contact)

        // Kanban: upsert se match, remover se não match mais
        if (matches) {
          kanbanContacts.value = upsertContactInCollection(kanbanContacts.value, contact)
        } else if (existsInKanban) {
          kanbanContacts.value = kanbanContacts.value.filter(c => c.id !== contact.id)
        }

        // Lista paginada: atualizar se existe na página
        if (existsInPage) {
          if (matches) {
            contacts.value = upsertContactInCollection(contacts.value, contact)
          } else {
            contacts.value = contacts.value.filter(c => c.id !== contact.id)
          }
        }

        // Atualizar selectedContact se for o mesmo
        if (selectedContact.value?.id === contact.id) {
          selectedContact.value = contact
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'contacts',
        // NOTA: filtro NÃO se aplica a DELETE (limitação Supabase)
        // Verificação manual de project via presença no state local
      },
      (payload) => {
        // Com RLS, payload.old contém apenas { id } — usar só o ID
        const deletedId = (payload.old as { id: string }).id
        if (recentLocalMutations.has(deletedId)) return

        // Verificar se o contato pertencia ao nosso state (proxy para project_id)
        const existedInKanban = kanbanContacts.value.some(c => c.id === deletedId)
        const existedInPage = contacts.value.some(c => c.id === deletedId)

        if (!existedInKanban && !existedInPage) return // Não é do nosso projeto/filtros

        contacts.value = contacts.value.filter(c => c.id !== deletedId)
        kanbanContacts.value = kanbanContacts.value.filter(c => c.id !== deletedId)

        if (selectedContact.value?.id === deletedId) {
          selectedContact.value = null
        }

        pagination.value = {
          ...pagination.value,
          total: Math.max(0, pagination.value.total - 1)
        }
      }
    )
    .subscribe((status) => {
      if (import.meta.env.DEV) {
        console.log(`[Contacts Realtime] ${channelName}: ${status}`)
      }
    })
}

const unsubscribeFromRealtime = async (): Promise<void> => {
  if (realtimeChannel) {
    await supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
}
```

**Decisões de design:**
- Eventos separados (INSERT/UPDATE/DELETE) ao invés de `event: '*'` → handlers mais claros e type-safe
- DELETE: sem `filter` (não funciona no Supabase) → verifica presença no state local como proxy de project_id
- DELETE: usa apenas `payload.old.id` (RLS limita a PK)
- `unsubscribeFromRealtime` é **async** → sempre usar `await`
- `pagination.value` usa spread para não mutar readonly

---

### Passo 5: Integrar no watcher de projeto e resetState

**Watch de `currentProjectId`** — adicionar:
```typescript
if (newProjectId) {
  fetchContacts()
  fetchKanbanContacts()
  subscribeToRealtime()   // ← novo
} else {
  unsubscribeFromRealtime()  // ← novo
}
```

**`resetState`** — adicionar `unsubscribeFromRealtime()` no início

---

### Passo 6: ContactsView lifecycle

**`onMounted`:**
```typescript
onMounted(async () => {
  try {
    await Promise.all([
      stagesStore.fetchStages(),
      originsStore.fetchOrigins(),
      contactsStore.fetchContacts(),
      contactsStore.fetchKanbanContacts(),
    ])
    contactsStore.subscribeToRealtime()
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})
```

**`onUnmounted`:**
```typescript
onUnmounted(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
  contactsStore.resetState()
})
```

---

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `front-end/src/stores/contacts.ts` | `resetState`, `matchesActiveFilters`, `subscribeToRealtime`, `unsubscribeFromRealtime`, `recentLocalMutations`, `trackLocalMutation`, imports, watcher update |
| `front-end/src/views/contacts/ContactsView.vue` | `onMounted` (fetch incondicional + subscribe), `onUnmounted` (resetState) |
| `back-end/supabase/migrations/082_enable_realtime_contacts.sql` | Nova migration idempotente |

## Verificação

1. **Filtros limpos:** Abrir contatos → buscar nome → navegar para dashboard → voltar → busca limpa, lista completa
2. **Realtime UPDATE:** 2 abas abertas → aba A move contato de etapa → aba B atualiza kanban automaticamente
3. **Realtime com filtros:** Filtrar por stage "Lead" → outro user cria contato stage "Customer" → NÃO aparece na view filtrada
4. **DELETE:** Deletar contato na aba A → some na aba B
5. **Mock mode:** `VITE_USE_MOCK=true` → realtime não ativa (guard `supabaseEnabled`)
6. **Migration idempotente:** `supabase db reset` 2x sem erro

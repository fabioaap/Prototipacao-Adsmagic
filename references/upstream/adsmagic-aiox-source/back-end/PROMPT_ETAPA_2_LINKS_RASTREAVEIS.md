# 🎯 Prompt: Implementar Etapa 2 - Sistema de Links Rastreáveis

## 📋 Contexto

Implementar o **Sistema de Links Rastreáveis** conforme especificado na **Etapa 2** do arquivo `ETAPAS_BACKEND.md`, seguindo os padrões arquiteturais estabelecidos no projeto (TypeScript, SOLID, Clean Code) e os guardrails de produção.

**Objetivo**: Criar sistema completo de links rastreáveis com tracking de UTMs, shortcodes e redirecionamento, permitindo rastreamento de cliques, contatos e vendas gerados por cada link.

---

## 🏗️ Arquitetura e Padrões

### Princípios a Seguir

1. **SOLID**
   - **SRP**: Cada handler/validator/utility tem UMA responsabilidade
   - **OCP**: Extensível sem modificar código existente
   - **DIP**: Depender de abstrações (Supabase client injetado)

2. **Clean Code**
   - Funções pequenas e focadas (máximo 30 linhas)
   - Nomenclatura descritiva e pronunciável
   - Validação com Zod em camada separada
   - Tratamento de erros específico e informativo

3. **TypeScript Strict**
   - Sem `any` - usar `unknown` quando necessário
   - Tipos explícitos para DTOs e responses
   - Interfaces para contratos

4. **Estrutura de Pastas** (seguir padrão de `contacts`)
```
back-end/supabase/functions/trackable-links/
├── index.ts                    # Router principal
├── types.ts                    # Tipos TypeScript (DTOs, responses)
├── handlers/
│   ├── create.ts              # POST /trackable-links
│   ├── get.ts                 # GET /trackable-links/:id
│   ├── list.ts                # GET /trackable-links
│   ├── update.ts              # PATCH /trackable-links/:id
│   ├── delete.ts              # DELETE /trackable-links/:id
│   ├── stats.ts               # GET /trackable-links/:id/stats
│   ├── generate-short.ts      # POST /trackable-links/:id/generate-short
│   └── redirect.ts            # GET /trackable-links/redirect/:slug (público)
├── validators/
│   └── trackable-link.ts      # Schemas Zod
└── utils/
    ├── cors.ts                # CORS headers (reusar de contacts)
    └── response.ts            # Helpers de resposta (reusar de contacts)
```

---

## 📝 Checklist de Implementação

### 1. Migration (030_trackable_links.sql)

**Localização**: `back-end/supabase/migrations/030_trackable_links.sql`

**Requisitos**:
- Criar tabela `trackable_links` com todos os campos especificados
- Índices para performance:
  - `idx_trackable_links_project_id` em `project_id`
  - `idx_trackable_links_slug` em `slug` (UNIQUE)
  - `idx_trackable_links_short_code` em `short_code` (UNIQUE)
  - `idx_trackable_links_origin_id` em `origin_id`
- Trigger para `updated_at` automático
- Foreign keys com `ON DELETE CASCADE` onde apropriado
- Constraints de UNIQUE para `slug` e `short_code`

**Estrutura da tabela**:
```sql
CREATE TABLE trackable_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  tracking_url TEXT, -- Gerado automaticamente
  initial_message TEXT,
  origin_id UUID REFERENCES origins(id) ON DELETE SET NULL,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  short_code VARCHAR(20) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  clicks_count INTEGER DEFAULT 0,
  contacts_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Aplicar via MCP**: `mcp_supabase_apply_migration` com nome `create_trackable_links_table`

---

### 2. RLS Policies

**Localização**: Incluir na migration `030_trackable_links.sql` ou criar `031_trackable_links_rls.sql`

**Requisitos**:
- Isolamento por projeto via `project_users`
- Usar função helper `user_has_project_access()` se existir
- Policies:
  - `SELECT`: Usuários com acesso ao projeto
  - `INSERT`: Usuários com role `admin` ou `owner` no projeto
  - `UPDATE`: Usuários com role `admin` ou `owner` no projeto
  - `DELETE`: Usuários com role `owner` no projeto
- Endpoint público de redirecionamento usa função `SECURITY DEFINER` separada

**Exemplo de policy**:
```sql
-- SELECT policy
CREATE POLICY "Users can view links from their projects"
  ON trackable_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_users pu
      WHERE pu.project_id = trackable_links.project_id
      AND pu.user_id = auth.uid()
      AND pu.is_active = true
    )
  );
```

**Aplicar via MCP**: `mcp_supabase_apply_migration` com nome `trackable_links_rls_policies`

---

### 3. Edge Function (trackable-links)

**Localização**: `back-end/supabase/functions/trackable-links/`

#### 3.1 Router Principal (`index.ts`)

**Requisitos**:
- Seguir padrão de `contacts/index.ts`
- Autenticação JWT obrigatória (exceto endpoint público `/redirect/:slug`)
- Routing para todos os handlers
- CORS configurado corretamente
- Tratamento de erros centralizado

**Estrutura**:
```typescript
// Seguir padrão de contacts/index.ts
// Rotas:
// POST /trackable-links → handleCreate
// GET /trackable-links → handleList
// GET /trackable-links/:id → handleGet
// PATCH /trackable-links/:id → handleUpdate
// DELETE /trackable-links/:id → handleDelete
// GET /trackable-links/:id/stats → handleStats
// POST /trackable-links/:id/generate-short → handleGenerateShort
// GET /trackable-links/redirect/:slug → handleRedirect (público)
```

#### 3.2 Tipos (`types.ts`)

**Requisitos**:
- Interface `TrackableLink` (tipo do banco - snake_case)
- Interface `CreateTrackableLinkDTO` (camelCase para frontend)
- Interface `UpdateTrackableLinkDTO` (camelCase parcial)
- Interface `TrackableLinkStats`
- Interface `TrackableLinkListResponse` (com paginação)

**Exemplo**:
```typescript
export interface TrackableLink {
  id: string
  project_id: string
  name: string
  slug: string
  destination_url: string
  tracking_url: string | null
  initial_message: string | null
  origin_id: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  short_code: string | null
  is_active: boolean
  clicks_count: number
  contacts_count: number
  sales_count: number
  revenue: number
  created_at: string
  updated_at: string
}

export interface CreateTrackableLinkDTO {
  projectId: string
  name: string
  slug?: string // Opcional - gerar automaticamente se não fornecido
  destinationUrl: string
  initialMessage?: string
  originId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  isActive?: boolean
}
```

#### 3.3 Validators (`validators/trackable-link.ts`)

**Requisitos**:
- Schemas Zod para todos os DTOs
- Validações:
  - `slug`: alfanumérico, hífens, underscore (regex)
  - `destinationUrl`: URL válida
  - `shortCode`: alfanumérico (se fornecido)
  - UTMs: strings opcionais (máx 100 chars)
- Função `extractValidationErrors` para formatar erros
- Schema para query parameters de listagem

**Exemplo**:
```typescript
export const createTrackableLinkSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  slug: z.string()
    .regex(/^[a-z0-9-_]+$/, 'Slug must contain only lowercase letters, numbers, hyphens and underscores')
    .max(50, 'Slug must be at most 50 characters')
    .optional(),
  destinationUrl: z.string().url('Invalid destination URL format'),
  initialMessage: z.string().max(500).optional().nullable(),
  originId: z.string().uuid('Invalid origin ID format').optional().nullable(),
  utmSource: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(100).optional().nullable(),
  utmCampaign: z.string().max(100).optional().nullable(),
  utmContent: z.string().max(100).optional().nullable(),
  utmTerm: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional().default(true)
})
```

#### 3.4 Handlers

**Requisitos para TODOS os handlers**:
- Verificar autenticação do usuário
- Validar acesso ao projeto
- Validação de entrada com Zod
- Tratamento de erros específico (23505 = unique violation, 23503 = FK violation, etc.)
- Logs informativos para debug
- Respostas padronizadas via `successResponse` / `errorResponse`

**Handlers a implementar**:

1. **`handlers/create.ts`** - POST /trackable-links
   - Validar dados de entrada
   - Gerar `slug` automaticamente se não fornecido (usar `name` como base, normalizar)
   - Gerar `tracking_url` (URL da Edge Function + slug)
   - Validar que `origin_id` pertence ao projeto (se fornecido)
   - Inserir no banco
   - Retornar link criado

2. **`handlers/list.ts`** - GET /trackable-links
   - Query params: `project_id`, `is_active`, `origin_id`, `search`, `limit`, `offset`
   - Filtrar por projeto do usuário
   - Busca full-text em `name` e `slug`
   - Paginação padrão: limit=10, offset=0
   - Retornar lista paginada

3. **`handlers/get.ts`** - GET /trackable-links/:id
   - Validar UUID
   - Verificar acesso ao projeto
   - Retornar link específico
   - Incluir estatísticas básicas (já estão no link)

4. **`handlers/update.ts`** - PATCH /trackable-links/:id
   - Validar dados parciais
   - Não permitir atualizar `slug` (ou apenas se não tiver cliques)
   - Atualizar `tracking_url` se `slug` mudar
   - Validar `origin_id` se fornecido
   - Retornar link atualizado

5. **`handlers/delete.ts`** - DELETE /trackable-links/:id
   - Verificar permissões (apenas `owner`)
   - Verificar dependências (se houver cliques, desativar ao invés de deletar)
   - Retornar 204 No Content

6. **`handlers/stats.ts`** - GET /trackable-links/:id/stats
   - Agregar estatísticas:
     - `clicks_count`, `contacts_count`, `sales_count`, `revenue`
     - Conversão de cliques → contatos
     - Conversão de contatos → vendas
     - Ticket médio
   - Retornar objeto de estatísticas

7. **`handlers/generate-short.ts`** - POST /trackable-links/:id/generate-short
   - Gerar `short_code` único (alfanumérico, 8 caracteres)
   - Verificar unicidade no banco
   - Atualizar link
   - Retornar link atualizado

8. **`handlers/redirect.ts`** - GET /trackable-links/redirect/:slug (PÚBLICO)
   - **Este endpoint NÃO requer autenticação**
   - Buscar link por `slug` ou `short_code`
   - Verificar se está ativo
   - Incrementar `clicks_count`
   - Capturar dados do request (IP, User-Agent, Referer) e salvar em `link_clicks` (tabela futura ou metadata)
   - Construir URL de destino com UTMs
   - Redirecionar (302) para destino

---

### 4. Deploy e Teste

**Requisitos**:
- Aplicar migrations via MCP: `mcp_supabase_apply_migration`
- Deploy Edge Function via MCP: `mcp_supabase_deploy_edge_function`
- Testar todos os endpoints:
  - CRUD completo
  - Validações de entrada
  - RLS (acesso negado para projetos sem permissão)
  - Redirecionamento público

---

## 🛡️ Guardrails de Produção

### ALLOWED_PATHS
```
back-end/supabase/functions/trackable-links/**
back-end/supabase/migrations/030_trackable_links.sql
back-end/supabase/migrations/031_trackable_links_rls.sql (se separado)
```

### FORBIDDEN_PATHS
- `/infra/**`
- `/supabase/**` (exceto migrations e functions)
- `.env*`

### Validações Obrigatórias
- [ ] TypeScript strict passa (`deno check`)
- [ ] Nenhum `any` sem justificativa
- [ ] Todas as funções têm JSDoc para APIs públicas
- [ ] Handlers tratam erros específicos (códigos PostgreSQL)
- [ ] RLS validado (testar acesso negado)
- [ ] Migration usa `IF NOT EXISTS` para colunas (não quebra se já existir)

---

## 📚 Referências

### Padrões a Seguir
- Estrutura: `back-end/supabase/functions/contacts/`
- Migration exemplo: `back-end/supabase/migrations/027_sales_table.sql`
- Handler exemplo: `back-end/supabase/functions/contacts/handlers/create.ts`
- Validator exemplo: `back-end/supabase/functions/contacts/validators/contact.ts`

### Documentação
- `back-end/ETAPAS_BACKEND.md` - Etapa 2 (linhas 104-172)
- `back-end/TODO_BACKEND.md` - Seção 2.2 Trackable Links (linhas 77-89)
- `back-end/.cursor/rules/cursorrules.mdc` - Princípios SOLID e Clean Code
- `back-end/.cursor/rules/guardralis-prod.mdc` - Guardrails de produção

---

## ✅ Critérios de Sucesso

- [ ] Migration `030_trackable_links.sql` aplicada com sucesso
- [ ] RLS policies criadas e funcionando
- [ ] Edge Function `trackable-links` deployada
- [ ] Todos os 8 handlers implementados e testados
- [ ] Validação Zod em todos os endpoints
- [ ] Tratamento de erros específico (PostgreSQL error codes)
- [ ] Endpoint público de redirecionamento funciona
- [ ] Incremento de `clicks_count` funcionando
- [ ] TypeScript strict sem erros
- [ ] Código segue padrão de `contacts` function
- [ ] Logs informativos para debug

---

## 🚀 Ordem de Implementação Recomendada

1. **Migration** → Aplicar estrutura da tabela
2. **RLS Policies** → Garantir segurança
3. **Tipos e Validators** → Contratos e validação
4. **Utils** → Reusar de `contacts` ou criar novos
5. **Router Principal** → Estrutura base
6. **Handlers** → Implementar na ordem:
   - `create.ts` (mais completo, valida tudo)
   - `get.ts` (mais simples)
   - `list.ts` (paginação)
   - `update.ts` (validações parciais)
   - `delete.ts` (verificações de permissão)
   - `stats.ts` (agregações)
   - `generate-short.ts` (lógica de geração)
   - `redirect.ts` (público, requer atenção especial)
7. **Deploy e Teste** → Validar funcionamento

---

## 📝 Notas Adicionais

- **Slug Generation**: Se não fornecido, gerar a partir de `name` (lowercase, substituir espaços por hífens, remover caracteres especiais)
- **Tracking URL**: Formato `https://<supabase-url>/functions/v1/trackable-links/redirect/<slug>`
- **Short Code**: Gerar aleatoriamente (8 caracteres alfanuméricos), verificar unicidade
- **Contadores**: `clicks_count`, `contacts_count`, `sales_count` serão atualizados via triggers futuros (não implementar agora, apenas estrutura)
- **Performance**: Índices criados na migration são suficientes para queries iniciais

---

**Pronto para implementação!** 🎯

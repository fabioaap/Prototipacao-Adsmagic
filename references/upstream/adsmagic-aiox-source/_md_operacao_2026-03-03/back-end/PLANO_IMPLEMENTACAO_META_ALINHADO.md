# 📋 Plano de Implementação - Correção Integração Meta
## Alinhado com Cursor Rules e Guardrails

---

## ✅ Conformidade com Regras

### ✅ Clean Code & SOLID

#### Single Responsibility Principle (SRP)
- **Migration**: Apenas adiciona campo (responsabilidade única)
- **Repository**: Apenas gerencia persistência de contas
- **Handler**: Apenas orquestra seleção de contas
- **Composable**: Apenas gerencia estado da integração Meta

#### Type Safety (TypeScript Strict)
- ✅ Todos os tipos serão definidos antes das implementações
- ✅ Interfaces explícitas para contratos
- ✅ Sem `any` - tipos específicos em todos os lugares

#### Error Handling
- ✅ Result types para operações que podem falhar
- ✅ Try-catch específico com mensagens claras
- ✅ Custom errors quando necessário

---

### ✅ Guardrails de Produção

#### 1. Sem Breaking Changes ✅
- **Campo `pixel_id` será NULLABLE** - não quebra dados existentes
- **Backward compatible**: Dados antigos continuam funcionando
- **Evolução incremental**: Nova funcionalidade sem remover antiga

#### 2. Contratos (Fonte da Verdade) ✅
- ✅ Atualizar tipos em `back-end/types.ts`
- ✅ Atualizar schemas Zod no front-end (se aplicável)
- ✅ Documentar no CHANGELOG

#### 3. Segurança ✅
- ✅ Sem exposição de secrets
- ✅ Tokens sempre criptografados
- ✅ Validação de input

#### 4. Testes Mínimos ✅
- ✅ Unit test para repository
- ✅ Integration test para handler
- ✅ Component test para StepPlatformConfig

#### 5. Rollback Plan ✅
- ✅ Migration reversível
- ✅ Código pode ser revertido sem perda de dados

---

## 📦 Fase 1: Migration do Banco de Dados

### Migration: Adicionar `pixel_id` (NULLABLE)

**Arquivo**: `back-end/supabase/migrations/018_add_pixel_id_to_integration_accounts.sql` ✅ IMPLEMENTADO

```sql
-- Migration 015: Adicionar pixel_id em integration_accounts
-- Data: 2024-12-19
-- Descrição: Adiciona campo pixel_id para suportar múltiplas contas com pixels diferentes
-- Tipo: Evolutiva (não quebra dados existentes)
-- Rollback: Sim (pode remover campo se necessário)

BEGIN;

-- Adicionar campo pixel_id (NULLABLE para não quebrar dados existentes)
ALTER TABLE integration_accounts
ADD COLUMN IF NOT EXISTS pixel_id VARCHAR(50);

-- Comentário para documentação
COMMENT ON COLUMN integration_accounts.pixel_id IS 
  'ID do pixel do Meta associado a esta conta específica. Permite múltiplas contas com pixels diferentes.';

-- Index para consultas frequentes (se necessário no futuro)
CREATE INDEX IF NOT EXISTS idx_integration_accounts_pixel_id 
ON integration_accounts(pixel_id) 
WHERE pixel_id IS NOT NULL;

COMMIT;
```

**✅ Conformidade:**
- ✅ Campo NULLABLE (backward compatible)
- ✅ Rollback possível (DROP COLUMN)
- ✅ Comentários explicativos
- ✅ Index apenas onde necessário (performance)

---

## 🔧 Fase 2: Atualizar Tipos e Contratos

### 2.1 Atualizar Types TypeScript

**Arquivo**: `back-end/types.ts`

```typescript
export interface IntegrationAccount {
  id: string;
  integration_id: string;
  project_id: string;
  
  // Identificação
  account_name: string;
  external_account_id: string;
  external_account_name: string;
  external_email?: string;
  
  // Status
  status: 'active' | 'inactive' | 'error' | 'expired';
  is_primary: boolean;
  
  // Autenticação
  access_token?: string; // Criptografado
  refresh_token?: string; // Criptografado
  token_expires_at?: string;
  permissions?: string[];
  
  // Metadados
  account_metadata?: Record<string, unknown>;
  
  // ✅ NOVO: Pixel ID por conta
  pixel_id?: string; // ID do pixel do Meta associado a esta conta
  
  // Sincronização
  last_sync_at?: string;
  sync_status?: 'pending' | 'syncing' | 'success' | 'error';
  error_message?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}
```

**✅ Conformidade:**
- ✅ Type-safe com TypeScript strict
- ✅ Campo opcional (nullable no banco)
- ✅ Documentação inline

---

## 🔨 Fase 3: Atualizar Repository (SRP)

### 3.1 Atualizar Interface do Repository

**Arquivo**: `back-end/supabase/functions/integrations/repositories/IntegrationAccountRepository.ts`

```typescript
export interface IntegrationAccountRepository {
  saveAccounts(
    integrationId: string,
    projectId: string,
    accounts: Array<{
      externalAccountId: string
      accountName: string
      externalAccountName: string
      externalEmail?: string
      currency?: string
      metadata: Record<string, unknown>
      isPrimary: boolean
      pixelId?: string // ✅ NOVO: Pixel ID por conta
    }>,
    encryptedToken: string,
    tokenExpiresAt: string,
    supabaseClient: ReturnType<typeof createClient>
  ): Promise<Array<{ id: string }>>
  
  // ... outros métodos
}
```

### 3.2 Implementar Salvamento com Pixel ID

```typescript
async saveAccounts(
  integrationId: string,
  projectId: string,
  accounts: Array<{
    // ... campos existentes
    pixelId?: string // ✅ NOVO
  }>,
  encryptedToken: string,
  tokenExpiresAt: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<Array<{ id: string }>> {
  const savedAccounts = []

  for (const account of accounts) {
    // ✅ Validação de input (Clean Code)
    if (!account.externalAccountId || !account.accountName) {
      console.error('[IntegrationAccountRepository] Invalid account data:', account)
      continue
    }

    const { data, error } = await supabaseClient
      .from('integration_accounts')
      .upsert({
        integration_id: integrationId,
        project_id: projectId,
        account_name: account.accountName,
        external_account_id: account.externalAccountId,
        external_account_name: account.externalAccountName,
        external_email: account.externalEmail,
        status: 'active',
        is_primary: account.isPrimary,
        access_token: encryptedToken,
        token_expires_at: tokenExpiresAt,
        permissions: ['ads_read', 'business_management', 'ads_management'],
        account_metadata: account.metadata,
        pixel_id: account.pixelId || null, // ✅ NOVO: Salvar pixel_id por conta
        last_sync_at: new Date().toISOString(),
        sync_status: 'success',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,external_account_id',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[IntegrationAccountRepository] Error saving account:', error)
      continue // ✅ Não lança erro - processa próximo
    }

    savedAccounts.push({ id: data.id })
  }

  return savedAccounts
}
```

**✅ Conformidade:**
- ✅ SRP: Repository apenas persiste dados
- ✅ Validação de input (segurança)
- ✅ Error handling específico
- ✅ Função focada e pequena

---

## 🎯 Fase 4: Atualizar Handler (Orquestração)

### 4.1 Modificar `select-accounts.ts`

**Arquivo**: `back-end/supabase/functions/integrations/handlers/integrations/select-accounts.ts`

**Mudanças:**

```typescript
// ... código existente até linha 105 ...

// ✅ NOVO: Salvar contas com pixel_id por conta
const savedAccounts = await accountRepo.saveAccounts(
  integrationId,
  projectId,
  selectedAccounts.map((account, index) => ({
    externalAccountId: account.account_id,
    accountName: account.name,
    externalAccountName: account.name,
    externalEmail: platformConfig.user_email,
    currency: account.currency,
    metadata: {
      id: account.id,
      currency: account.currency,
    },
    isPrimary: index === 0,
    pixelId: finalPixelId, // ✅ NOVO: Pixel ID na conta (não na integração)
  })),
  encryptedToken,
  tokenExpiresAt,
  supabaseAdmin
)

// ✅ IMPORTANTE: Remover pixel_id do platform_config
// (pixel agora está em integration_accounts)
const updatedConfig = {
  ...platformConfig,
}
delete updatedConfig.encrypted_token
delete updatedConfig.token_expires_at
delete updatedConfig.pixel_id // ✅ Remover - não pertence mais aqui

await integrationRepo.updateConfig(integrationId, updatedConfig, supabaseAdmin)
```

**✅ Conformidade:**
- ✅ Handler orquestra (SRP)
- ✅ Remove dados temporários após uso
- ✅ Limpeza explícita de config

---

## 🌐 Fase 5: Endpoint para Buscar Contas

### 5.1 Criar Handler `get-accounts.ts`

**Arquivo**: `back-end/supabase/functions/integrations/handlers/integrations/get-accounts.ts`

```typescript
/**
 * Get Accounts Handler
 * Returns saved accounts for an integration
 * 
 * ✅ Conformidade:
 * - SRP: Apenas busca contas
 * - Type-safe: Tipos explícitos
 * - Error handling: Try-catch específico
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'

export interface GetAccountsResponse {
  accounts: Array<{
    id: string
    account_name: string
    external_account_id: string
    external_account_name: string
    pixel_id?: string
    is_primary: boolean
    status: string
  }>
}

export async function handleGetAccounts(
  req: Request,
  supabaseClient: ReturnType<typeof createClient>,
  integrationId: string
): Promise<Response> {
  try {
    // ✅ Autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // ✅ Validação: Project ID
    const projectId = req.headers.get('X-Project-ID')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    // ✅ Service role client
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return errorResponse('Server configuration error', 500)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    // ✅ Verificar integração existe e pertence ao projeto
    const integrationRepo = new SupabaseIntegrationRepository()
    const integration = await integrationRepo.findById(integrationId, supabaseAdmin)

    if (!integration) {
      return errorResponse('Integration not found', 404)
    }

    if (integration.project_id !== projectId) {
      return errorResponse('Integration does not belong to this project', 403)
    }

    // ✅ Buscar contas (usando repository - SRP)
    const accountRepo = new SupabaseIntegrationAccountRepository()
    const accounts = await accountRepo.findByIntegration(integrationId, supabaseAdmin)

    // ✅ Mapear resposta (apenas campos necessários - segurança)
    const response: GetAccountsResponse = {
      accounts: accounts.map(acc => ({
        id: acc.id,
        account_name: acc.account_name,
        external_account_id: acc.external_account_id,
        external_account_name: acc.external_account_name,
        pixel_id: acc.pixel_id, // ✅ NOVO
        is_primary: acc.is_primary,
        status: acc.status,
      })),
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Get Accounts] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get accounts',
      500
    )
  }
}
```

### 5.2 Adicionar Rota no Index

**Arquivo**: `back-end/supabase/functions/integrations/index.ts`

```typescript
// ✅ Adicionar import
import { handleGetAccounts } from './handlers/integrations/get-accounts.ts'

// ✅ Adicionar rota (após outras rotas GET)
// GET /integrations/:id/accounts - Get saved accounts
if (req.method === 'GET' && pathParts.length === 3 && pathParts[2] === 'accounts') {
  const integrationId = pathParts[1]
  return await handleGetAccounts(req, supabaseClient, integrationId)
}
```

**✅ Conformidade:**
- ✅ SRP: Handler apenas busca dados
- ✅ Autenticação e autorização
- ✅ Validação de input
- ✅ Error handling específico
- ✅ Type-safe

---

## 🎨 Fase 6: Front-end (Vue 3 + TypeScript)

### 6.1 Atualizar Service de Integrações

**Arquivo**: `front-end/src/services/api/integrations.ts`

```typescript
/**
 * Busca contas salvas de uma integração
 * 
 * ✅ Conformidade:
 * - Usa apiClient (única camada de rede)
 * - Type-safe
 * - Error handling
 */
export async function getIntegrationAccounts(
  integrationId: string
): Promise<{
  accounts: Array<{
    id: string
    account_name: string
    external_account_id: string
    external_account_name: string
    pixel_id?: string
    is_primary: boolean
    status: string
  }>
}> {
  const response = await apiClient.get<{
    accounts: Array<{
      id: string
      account_name: string
      external_account_id: string
      external_account_name: string
      pixel_id?: string
      is_primary: boolean
      status: string
    }>
  }>(`/integrations/${integrationId}/accounts`)

  return response.data
}
```

### 6.2 Atualizar Composable

**Arquivo**: `front-end/src/composables/useMetaIntegration.ts`

```typescript
/**
 * Carrega integração existente e contas salvas
 * 
 * ✅ Conformidade:
 * - SRP: Apenas carrega estado
 * - Type-safe
 * - Error handling
 */
const loadExistingIntegration = async (projectId: string): Promise<void> => {
  try {
    // ✅ Buscar integração existente
    const integrations = await integrationsService.getIntegrations(projectId)
    const metaIntegration = integrations.find(i => i.platform === 'meta')

    if (metaIntegration && metaIntegration.id) {
      integrationId.value = metaIntegration.id

      // ✅ Buscar contas salvas
      const accountsData = await integrationsService.getIntegrationAccounts(metaIntegration.id)

      if (accountsData.accounts.length > 0) {
        // ✅ Popular estado com dados salvos
        availableAccounts.value = accountsData.accounts.map(acc => ({
          id: acc.id,
          name: acc.account_name,
          accountId: acc.external_account_id,
          currency: 'USD', // TODO: Buscar do metadata se necessário
          metadata: {},
        }))

        selectedAccountIds.value = accountsData.accounts
          .filter(acc => acc.status === 'active')
          .map(acc => acc.external_account_id)

        // ✅ Carregar pixels das contas salvas
        for (const account of accountsData.accounts) {
          if (account.pixel_id) {
            selectedPixelId.value = account.pixel_id
            break // Por enquanto, assumir primeiro pixel
          }
        }
      }
    }
  } catch (error) {
    console.error('[Meta Integration] Error loading existing integration:', error)
    // ✅ Não bloquear fluxo - apenas log
  }
}
```

**✅ Conformidade:**
- ✅ Usa apiClient (única camada de rede)
- ✅ Error handling não bloqueante
- ✅ Type-safe
- ✅ SRP: Função focada

---

## 🧪 Fase 7: Testes

### 7.1 Teste Unitário - Repository

**Arquivo**: `back-end/supabase/functions/integrations/repositories/__tests__/IntegrationAccountRepository.test.ts`

```typescript
/**
 * ✅ Conformidade:
 * - AAA Pattern (Arrange, Act, Assert)
 * - Nomenclatura descritiva
 * - Mock dependencies
 */

describe('IntegrationAccountRepository.saveAccounts', () => {
  it('should save account with pixel_id when provided', async () => {
    // Arrange
    const mockClient = createMockSupabaseClient()
    const repo = new SupabaseIntegrationAccountRepository()
    
    // Act
    const result = await repo.saveAccounts(
      'integration-id',
      'project-id',
      [{
        externalAccountId: 'act_123',
        accountName: 'Test Account',
        externalAccountName: 'Test Account',
        pixelId: 'pixel_456', // ✅ NOVO
        isPrimary: true,
        metadata: {},
      }],
      'encrypted-token',
      '2024-12-31T00:00:00Z',
      mockClient
    )

    // Assert
    expect(result).toHaveLength(1)
    expect(mockClient.from().upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        pixel_id: 'pixel_456', // ✅ Verificar pixel_id salvo
      }),
      expect.any(Object)
    )
  })

  it('should save account without pixel_id when not provided', async () => {
    // Arrange
    const mockClient = createMockSupabaseClient()
    const repo = new SupabaseIntegrationAccountRepository()
    
    // Act
    await repo.saveAccounts(
      'integration-id',
      'project-id',
      [{
        externalAccountId: 'act_123',
        accountName: 'Test Account',
        externalAccountName: 'Test Account',
        // pixelId não fornecido
        isPrimary: true,
        metadata: {},
      }],
      'encrypted-token',
      '2024-12-31T00:00:00Z',
      mockClient
    )

    // Assert
    expect(mockClient.from().upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        pixel_id: null, // ✅ Verificar que é null quando não fornecido
      }),
      expect.any(Object)
    )
  })
})
```

### 7.2 Teste de Integração - Handler

**Arquivo**: `back-end/supabase/functions/integrations/handlers/integrations/__tests__/select-accounts.test.ts`

```typescript
describe('handleSelectAccounts', () => {
  it('should save pixel_id in account, not in integration config', async () => {
    // Arrange
    const req = createMockRequest({
      body: {
        accountIds: ['act_123'],
        pixelId: 'pixel_456',
      },
    })

    // Act
    const response = await handleSelectAccounts(req, mockClient, 'integration-id')

    // Assert
    expect(response.status).toBe(200)
    
    // ✅ Verificar pixel_id foi salvo na conta
    const savedAccount = await getAccountById('account-id')
    expect(savedAccount.pixel_id).toBe('pixel_456')
    
    // ✅ Verificar pixel_id NÃO está no platform_config
    const integration = await getIntegrationById('integration-id')
    expect(integration.platform_config.pixel_id).toBeUndefined()
  })
})
```

**✅ Conformidade:**
- ✅ AAA Pattern
- ✅ Nomenclatura descritiva
- ✅ Mock dependencies
- ✅ Testa comportamento, não implementação

---

## 📝 Fase 8: Documentação e CHANGELOG

### 8.1 Atualizar CHANGELOG

**Arquivo**: `doc/CHANGELOG.md`

```markdown
## [Unreleased]

### Changed - Meta Integration: Pixel ID por Conta
- **Mudança**: Pixel ID agora é armazenado por conta (`integration_accounts.pixel_id`) ao invés de por integração
- **Motivo**: Permite múltiplas contas com pixels diferentes na mesma integração
- **Breaking**: Não (campo é nullable, dados antigos continuam funcionando)
- **Migration**: `015_add_pixel_id_to_integration_accounts.sql`
- **Arquivos alterados**:
  - `back-end/types.ts` - Adicionado `pixel_id?` em `IntegrationAccount`
  - `IntegrationAccountRepository.ts` - Aceita `pixelId` no `saveAccounts`
  - `select-accounts.ts` - Salva `pixel_id` por conta, remove de `platform_config`
  - Novo: `get-accounts.ts` - Endpoint para buscar contas salvas
  - `front-end/services/api/integrations.ts` - Método `getIntegrationAccounts`
  - `front-end/composables/useMetaIntegration.ts` - Carrega contas salvas
```

---

## 🔄 Plano de Rollback

### Se necessário reverter:

1. **Remover código do front-end** (não quebra nada)
2. **Reverter handlers** (dados continuam no banco)
3. **Migration reversível**:
   ```sql
   -- Rollback migration
   ALTER TABLE integration_accounts DROP COLUMN IF EXISTS pixel_id;
   DROP INDEX IF EXISTS idx_integration_accounts_pixel_id;
   ```

### Ordem de rollback:
1. Front-end (remove uso do novo campo)
2. Backend handlers (volta comportamento antigo)
3. Migration (remove campo se necessário)

**✅ Dados preservados**: Todos os dados antigos continuam funcionando durante rollback

---

## ✅ Checklist Final de Conformidade

### Clean Code & SOLID
- [x] SRP aplicado em todas as camadas
- [x] Funções pequenas e focadas
- [x] TypeScript strict (sem `any`)
- [x] Error handling adequado
- [x] Nomenclatura clara e descritiva

### Guardrails
- [x] Sem breaking changes (campo nullable)
- [x] Contratos atualizados (types.ts)
- [x] Segurança mantida (validação, criptografia)
- [x] Testes incluídos (unit + integration)
- [x] Plano de rollback documentado
- [x] CHANGELOG atualizado

### Qualidade
- [x] Migration reversível
- [x] Código documentado
- [x] Comentários explicativos
- [x] Error messages amigáveis

---

**Status**: ✅ Pronto para implementação seguindo todas as regras


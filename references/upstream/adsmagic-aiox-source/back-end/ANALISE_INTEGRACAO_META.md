# Análise da Integração Meta/Facebook - Problemas Identificados

## 📋 Resumo Executivo

Análise completa do fluxo de integração Meta no wizard de projetos. Identificados problemas críticos no salvamento de dados que impedem suporte a múltiplas contas com pixels diferentes.

---

## 🔍 Fluxo Atual (Como está funcionando)

### 1. OAuth e Autenticação ✅
- Usuário clica em "Conectar Meta Ads"
- Popup OAuth é aberto
- Token curto-vida é obtido
- Backend troca por token longo-vida (~60 dias)
- Token é salvo **criptografado** na tabela `integrations.platform_config.encrypted_token`
- Status da integração fica `pending` (aguardando seleção de contas)
- Contas disponíveis são retornadas para seleção

**✅ FUNCIONANDO CORRETAMENTE**

### 2. Seleção de Conta e Pixel ⚠️
- Usuário escolhe uma conta
- Pixels são carregados para essa conta
- Usuário escolhe ou cria um pixel
- Usuário clica em "Salvar Seleção"
- `finalizeSelection()` é chamado

**⚠️ PROBLEMAS IDENTIFICADOS AQUI**

### 3. Salvamento no Banco de Dados ❌

#### Problema Principal: Pixel ID no lugar errado

Atualmente, o pixel ID está sendo salvo em:
- **Tabela**: `integrations`
- **Campo**: `platform_config.pixel_id`
- **Problema**: Isso significa **UM pixel por integração**, não por conta

**Código atual (`select-accounts.ts` linhas 127-155):**
```typescript
// Handle pixel selection/creation
let finalPixelId = pixelId

// ... código de criação de pixel ...

// ❌ PROBLEMA: Pixel ID é salvo no platform_config da integração
const updatedConfig = {
  ...platformConfig,
  pixel_id: finalPixelId,  // ❌ Um pixel para TODAS as contas
}
delete updatedConfig.encrypted_token
delete updatedConfig.token_expires_at

await integrationRepo.updateConfig(integrationId, updatedConfig, supabaseAdmin)
```

**O que DEVERIA acontecer:**
- Pixel ID deveria ser salvo em `integration_accounts.pixel_id` (um pixel por conta)
- Cada conta pode ter seu próprio pixel

---

## 🗄️ Estrutura Atual do Banco de Dados

### Tabela: `integrations`
```sql
- id (uuid)
- project_id (uuid)
- platform (varchar) -- 'meta'
- platform_type (varchar) -- 'advertising'
- status (varchar) -- 'pending', 'connected', etc
- platform_config (jsonb) -- { pixel_id: "123", ... } ❌ PROBLEMA AQUI
- last_sync_at (timestamptz)
- created_at, updated_at
```

### Tabela: `integration_accounts`
```sql
- id (uuid)
- integration_id (uuid)
- project_id (uuid)
- account_name (varchar)
- external_account_id (varchar)
- external_account_name (varchar)
- status (varchar)
- is_primary (boolean)
- access_token (text) -- criptografado ✅
- refresh_token (text)
- token_expires_at (timestamptz)
- permissions (jsonb)
- account_metadata (jsonb) -- { currency: "BRL", ... }
- last_sync_at (timestamptz)
- sync_status (varchar)
- error_message (text)
- created_at, updated_at

❌ FALTA: pixel_id (varchar) -- Campo para armazenar pixel por conta
```

---

## 🐛 Problemas Identificados

### Problema 1: Pixel ID Armazenado Incorretamente
- **Onde está**: `integrations.platform_config.pixel_id`
- **Onde deveria estar**: `integration_accounts.pixel_id`
- **Impacto**: Impossível ter múltiplas contas com pixels diferentes

### Problema 2: Falta Campo `pixel_id` na Tabela
- A tabela `integration_accounts` não tem campo `pixel_id`
- Necessário adicionar via migration

### Problema 3: Front-end Não Permite Múltiplas Seleções
- Após salvar primeira conta+pixel, não há forma de adicionar mais
- O componente `StepPlatformConfig.vue` não carrega contas já salvas
- Não há UI para gerenciar múltiplas contas

### Problema 4: Token Duplicado nas Contas
- O token está sendo salvo em cada `integration_account` (linha 69 do `IntegrationAccountRepository.ts`)
- Isso está correto, mas o token também está em `integrations.platform_config.encrypted_token`
- Após salvar contas, o token deveria ser removido do `platform_config`

---

## 📊 Fluxo Esperado (Como DEVERIA funcionar)

### Cenário: Múltiplas Contas

1. **Primeira Conta:**
   - Usuário faz OAuth → Token salvo em `integrations.platform_config` (temporário)
   - Usuário escolhe Conta A → Pixel X
   - Backend salva:
     - Conta A em `integration_accounts` com `pixel_id = X`
     - Token criptografado em `integration_accounts.access_token`
     - Remove token temporário de `integrations.platform_config`

2. **Segunda Conta (mesma integração):**
   - Usuário clica "Adicionar Outra Conta"
   - Pode escolher outra conta → Pixel Y
   - Backend salva:
     - Conta B em `integration_accounts` com `pixel_id = Y`
     - Token é reutilizado (mesmo token da integração)

3. **Resultado Final:**
   - `integrations`: Status `connected`, sem `encrypted_token` no config
   - `integration_accounts`: 
     - Linha 1: Conta A + Pixel X
     - Linha 2: Conta B + Pixel Y

---

## ✅ Soluções Propostas

### Solução 1: Adicionar Campo `pixel_id` na Tabela

**Migration SQL:**
```sql
ALTER TABLE integration_accounts
ADD COLUMN pixel_id VARCHAR(50);

COMMENT ON COLUMN integration_accounts.pixel_id IS 'ID do pixel do Meta associado a esta conta';
```

### Solução 2: Modificar Backend para Salvar Pixel por Conta

**Arquivo**: `back-end/supabase/functions/integrations/handlers/integrations/select-accounts.ts`

**Mudanças necessárias:**
1. Ao salvar contas, incluir `pixel_id` na conta selecionada
2. Remover `pixel_id` de `platform_config`
3. Remover `encrypted_token` e `token_expires_at` de `platform_config` após salvar

**Código proposto:**
```typescript
// Salvar contas com pixel_id
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
    pixelId: finalPixelId, // ✅ NOVO: Incluir pixel_id na conta
  })),
  encryptedToken,
  tokenExpiresAt,
  supabaseAdmin
)

// Atualizar config sem pixel_id (remover completamente)
const updatedConfig = {
  ...platformConfig,
}
delete updatedConfig.encrypted_token
delete updatedConfig.token_expires_at
delete updatedConfig.pixel_id // ✅ Garantir que não fica no config

await integrationRepo.updateConfig(integrationId, updatedConfig, supabaseAdmin)
```

### Solução 3: Modificar Repository para Aceitar `pixelId`

**Arquivo**: `back-end/supabase/functions/integrations/repositories/IntegrationAccountRepository.ts`

**Mudanças necessárias:**
1. Adicionar `pixelId` na interface de `saveAccounts`
2. Incluir `pixel_id` no upsert

### Solução 4: Modificar Front-end para Suportar Múltiplas Contas

**Arquivo**: `front-end/src/views/project-wizard/steps/StepPlatformConfig.vue`

**Mudanças necessárias:**
1. Carregar contas já salvas quando componente montar
2. Exibir lista de contas já conectadas
3. Permitir adicionar novas contas
4. Permitir remover contas (opcional, para MVP pode apenas adicionar)

### Solução 5: Carregar Contas ao Montar Componente

**Mudanças necessárias:**
1. Criar endpoint para buscar contas de uma integração
2. Chamar esse endpoint quando `StepPlatformConfig` montar
3. Popular campos locais com dados salvos

---

## 🎯 Priorização

### MVP (Mínimo Viável)
1. ✅ Adicionar campo `pixel_id` na tabela
2. ✅ Modificar backend para salvar pixel por conta
3. ✅ Carregar contas ao montar componente
4. ✅ Exibir contas já conectadas

### Melhorias Futuras
- ⭐ Permitir adicionar múltiplas contas em sequência (UI completa)
- ⭐ Permitir remover contas
- ⭐ Permitir editar pixel de uma conta existente
- ⭐ Sincronização automática de contas da Meta

---

## 📝 Checklist de Implementação

### Backend
- [ ] Criar migration para adicionar `pixel_id` em `integration_accounts`
- [ ] Modificar `IntegrationAccountRepository.saveAccounts()` para aceitar `pixelId`
- [ ] Modificar `select-accounts.ts` para salvar `pixel_id` por conta
- [ ] Remover `pixel_id` de `platform_config` após salvar
- [ ] Criar endpoint `GET /integrations/:id/accounts` para buscar contas salvas

### Frontend
- [ ] Modificar `useMetaIntegration` para carregar contas salvas
- [ ] Modificar `StepPlatformConfig.vue` para exibir contas conectadas
- [ ] Adicionar botão "Adicionar Outra Conta" (se houver integração existente)
- [ ] Testar fluxo completo: OAuth → Seleção → Salvamento → Recarregamento

---

## 🔗 Referências

- Arquivo de migration atual: `back-end/supabase/migrations/014_integrations_tables.sql`
- Handler de seleção: `back-end/supabase/functions/integrations/handlers/integrations/select-accounts.ts`
- Repository: `back-end/supabase/functions/integrations/repositories/IntegrationAccountRepository.ts`
- Composable front-end: `front-end/src/composables/useMetaIntegration.ts`
- View: `front-end/src/views/project-wizard/steps/StepPlatformConfig.vue`


# 📊 Resumo Executivo - Análise da Integração Meta

## ✅ O que está funcionando

1. **OAuth Flow**: Autenticação completa funcionando
   - Token curto-vida → Token longo-vida (60 dias)
   - Token salvo criptografado temporariamente em `integrations.platform_config`

2. **Seleção de Contas**: Backend suporta múltiplas contas
   - Repository salva múltiplas contas na tabela `integration_accounts`

3. **Carregamento de Pixels**: Funciona por conta
   - Endpoint `GET /integrations/:id/pixels?accountId=xxx` busca pixels de conta específica

---

## ❌ Problemas Críticos Identificados

### 🔴 Problema 1: Pixel ID no lugar errado

**Situação atual:**
- Pixel ID está sendo salvo em `integrations.platform_config.pixel_id`
- Isso significa **UM pixel para TODA a integração**, não por conta

**Impacto:**
- ❌ Impossível ter múltiplas contas com pixels diferentes
- ❌ Se usuário adicionar segunda conta, perderá o pixel da primeira

**Código problemático:**
```typescript:148:155:back-end/supabase/functions/integrations/handlers/integrations/select-accounts.ts
// Remove temporary token from config, store pixel ID
const updatedConfig = {
  ...platformConfig,
  pixel_id: finalPixelId,  // ❌ PROBLEMA: Um pixel para todas as contas
}
delete updatedConfig.encrypted_token
delete updatedConfig.token_expires_at
```

**Solução:**
- Adicionar campo `pixel_id` na tabela `integration_accounts`
- Salvar pixel_id por conta, não na integração

---

### 🔴 Problema 2: Falta campo `pixel_id` na tabela

**Situação atual:**
- Tabela `integration_accounts` **não tem** campo `pixel_id`

**Estrutura atual da tabela:**
```sql
integration_accounts:
  - id, integration_id, project_id
  - account_name, external_account_id, external_account_name
  - status, is_primary
  - access_token (criptografado) ✅
  - token_expires_at ✅
  - account_metadata (jsonb) -- poderia usar aqui, mas não é ideal
  - ❌ FALTA: pixel_id
```

**Solução:**
- Criar migration para adicionar `pixel_id VARCHAR(50)` na tabela

---

### 🔴 Problema 3: Front-end não carrega contas salvas

**Situação atual:**
- Após salvar primeira conta+pixel, componente não carrega dados salvos
- Se usuário recarregar página, precisa fazer OAuth novamente

**Código atual:**
```typescript:389:432:front-end/src/views/project-wizard/steps/StepPlatformConfig.vue
onMounted(() => {
  // SEMPRE resetar o composable primeiro para garantir estado limpo
  metaIntegration.reset()
  
  // ... código verifica apenas savedMeta do wizardStore ...
  
  // ❌ PROBLEMA: Não busca contas do banco de dados
  // Não carrega integrationId existente
  // Não carrega contas já salvas
})
```

**Solução:**
- Criar endpoint `GET /integrations?projectId=xxx&platform=meta` para buscar integração existente
- Carregar contas salvas ao montar componente
- Preencher campos locais com dados salvos

---

### 🟡 Problema 4: Não há endpoint para buscar contas

**Situação atual:**
- Repository tem método `findByIntegration()` ✅
- Mas não há endpoint HTTP exposto para buscar contas

**Solução:**
- Criar endpoint `GET /integrations/:id/accounts` 
- Ou modificar `GET /integrations/:id` para retornar contas também

---

## 📋 Fluxo Esperado vs Atual

### Fluxo Atual (Problemas):
```
1. OAuth → Token salvo temporariamente ✅
2. Usuário escolhe Conta A + Pixel X
3. Backend salva:
   - Conta A em integration_accounts ✅
   - Pixel X em integrations.platform_config ❌ (ERRADO)
4. Usuário recarrega página → Perde dados ❌
5. Usuário tenta adicionar Conta B → Pixel Y sobrescreve X ❌
```

### Fluxo Esperado (Corrigido):
```
1. OAuth → Token salvo temporariamente ✅
2. Usuário escolhe Conta A + Pixel X
3. Backend salva:
   - Conta A em integration_accounts com pixel_id = X ✅
   - Remove token temporário ✅
4. Usuário recarrega página → Carrega contas salvas ✅
5. Usuário adiciona Conta B + Pixel Y:
   - Conta B em integration_accounts com pixel_id = Y ✅
   - Conta A mantém pixel_id = X ✅
```

---

## 🎯 Plano de Correção

### Fase 1: Correção do Banco de Dados
1. ✅ Criar migration para adicionar `pixel_id` em `integration_accounts`
2. ✅ Atualizar tipos TypeScript

### Fase 2: Correção do Backend
3. ✅ Modificar `IntegrationAccountRepository.saveAccounts()` para aceitar `pixelId`
4. ✅ Modificar `select-accounts.ts` para salvar `pixel_id` por conta
5. ✅ Remover `pixel_id` de `platform_config` após salvar
6. ✅ Criar endpoint para buscar integração e contas

### Fase 3: Correção do Front-end
7. ✅ Carregar integração existente ao montar componente
8. ✅ Carregar contas salvas e preencher campos
9. ✅ Exibir lista de contas já conectadas
10. ⭐ Permitir adicionar múltiplas contas (melhoria futura)

---

## 🔍 Evidências do Problema

### 1. Estrutura do Banco (Consulta Real):
```sql
-- integration_accounts NÃO tem pixel_id
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'integration_accounts';
-- Resultado: Não há pixel_id
```

### 2. Código Backend:
```typescript:148:155:back-end/supabase/functions/integrations/handlers/integrations/select-accounts.ts
// Pixel salvo no lugar errado
const updatedConfig = {
  ...platformConfig,
  pixel_id: finalPixelId,  // ❌ Na integração, não na conta
}
```

### 3. Front-end não carrega dados:
- Componente sempre faz `reset()` ao montar
- Não busca integração existente do banco
- Não carrega contas já salvas

---

## 📝 Próximos Passos

1. **Revisar análise** com equipe
2. **Aprovar plano de correção**
3. **Implementar correções** (prioridade alta)
4. **Testar fluxo completo** após correções

---

## 🔗 Arquivos Envolvidos

### Backend:
- `back-end/supabase/migrations/014_integrations_tables.sql` - Adicionar campo
- `back-end/supabase/functions/integrations/handlers/integrations/select-accounts.ts` - Corrigir salvamento
- `back-end/supabase/functions/integrations/repositories/IntegrationAccountRepository.ts` - Adicionar pixelId
- `back-end/supabase/functions/integrations/index.ts` - Adicionar endpoint

### Frontend:
- `front-end/src/composables/useMetaIntegration.ts` - Carregar dados salvos
- `front-end/src/views/project-wizard/steps/StepPlatformConfig.vue` - Carregar ao montar
- `front-end/src/services/api/integrations.ts` - Adicionar método para buscar integração

---

**Data da Análise**: 2024-12-19
**Analisado por**: AI Assistant
**Status**: ⚠️ Problemas críticos identificados - Correção necessária


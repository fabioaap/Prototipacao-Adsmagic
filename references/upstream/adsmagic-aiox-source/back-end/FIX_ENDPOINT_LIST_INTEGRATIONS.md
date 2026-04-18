# 🔧 Fix: Endpoint GET /integrations retornando 404

## 🔴 Problema Identificado

Quando o componente `StepPlatformConfig` tenta carregar a integração existente, a chamada para `GET /integrations` retorna **404 Not Found**.

**Log do erro:**
```
GET https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/integrations 404 (Not Found)
```

**Causa:**
- O endpoint `GET /integrations` não existia no backend
- O método `loadExistingIntegration()` chamava `integrationsService.getIntegrations()`, que fazia `GET /integrations`
- Sem esse endpoint, era impossível listar integrações existentes de um projeto

---

## ✅ Solução Implementada

### 1. Criado Handler `list-integrations.ts`

Novo arquivo: `back-end/supabase/functions/integrations/handlers/integrations/list-integrations.ts`

**Funcionalidades:**
- Retorna todas as integrações de um projeto (baseado no header `X-Project-ID`)
- Autenticação obrigatória (JWT)
- Validação de projectId
- Service role client para contornar RLS se necessário
- Retorna array de integrações formatadas

### 2. Adicionada Rota no `index.ts`

```typescript
// GET /integrations - List all integrations for a project
if (req.method === 'GET' && pathParts.length === 1 && pathParts[0] === 'integrations') {
  return await handleListIntegrations(req, supabaseClient)
}
```

**Importante:** Esta rota deve ser verificada ANTES de outras rotas que também começam com `integrations` para evitar conflitos.

### 3. Atualizado Frontend para Mapear Resposta

O método `getIntegrations()` em `front-end/src/services/api/integrations.ts` agora:
- Mapeia `project_id` para `projectId`
- Mapeia `platform_type` para `platformType`
- Converte `status` para `isActive`
- Formata `platform_config` para `settings`

---

## 📝 Mudanças nos Arquivos

### Backend

1. **`back-end/supabase/functions/integrations/handlers/integrations/list-integrations.ts`** (NOVO)
   - Handler para listar integrações por projeto

2. **`back-end/supabase/functions/integrations/index.ts`**
   - Adicionada rota `GET /integrations`
   - Importado `handleListIntegrations`

### Frontend

3. **`front-end/src/services/api/integrations.ts`**
   - Atualizado `getIntegrations()` para mapear resposta do backend corretamente

---

## 🔄 Fluxo Corrigido

### Antes (❌ Problema):
```
loadExistingIntegration() → GET /integrations → 404 Not Found → Erro
```

### Depois (✅ Correto):
```
loadExistingIntegration() → GET /integrations → 200 OK → Lista de integrações → Filtra Meta → Carrega contas e pixels
```

---

## ✅ Testes Realizados

1. ✅ Endpoint criado
2. ✅ Rota adicionada
3. ✅ Deploy realizado (versão 28)
4. ⏳ **Aguardando teste em produção**

---

## 🔍 Verificação

Após o deploy, o endpoint deve:
- Retornar 200 OK quando chamado com header `X-Project-ID` válido
- Retornar 400 se `X-Project-ID` estiver ausente
- Retornar 401 se token JWT for inválido
- Retornar array vazio `[]` se não houver integrações

---

**Data da correção**: 2025-01-28  
**Status**: ✅ Implementado e deployado (versão 28)


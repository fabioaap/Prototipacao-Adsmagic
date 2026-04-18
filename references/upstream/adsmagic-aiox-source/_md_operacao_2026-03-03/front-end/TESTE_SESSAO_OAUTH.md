# 🧪 Guia: Testar Preservação de Sessão durante OAuth

## ✅ Sim, `ensureSession()` é usado em TODO o projeto!

A função `ensureSession()` está integrada no **interceptor de request do `apiClient`**, então **TODAS** as requisições HTTP feitas via `apiClient` automaticamente:

1. ✅ Verificam se há sessão válida
2. ✅ Fazem refresh automático se necessário
3. ✅ Adicionam o token de autenticação no header

**Isso significa que você não precisa fazer nada extra** - todas as chamadas de API já estão protegidas!

---

## 🔍 Como Testar Localmente

### **1. Preparação**

1. **Inicie o servidor de desenvolvimento:**
```bash
cd front-end
pnpm dev
```

2. **Abra o DevTools do navegador:**
   - Chrome/Edge: `F12` ou `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Firefox: `F12` ou `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Safari: `Cmd+Option+I` (precisa habilitar menu Desenvolvedor)

3. **Vá para a aba Console** para ver os logs

---

### **2. Teste Básico: Verificar Logs de Sessão**

#### **Passo a Passo:**

1. **Faça login na aplicação**
   - Você verá no console: `[API] Request with auth token: /endpoint`

2. **Navegue para qualquer página que faça requisições**
   - Exemplo: `/pt/projects`
   - Observe no console: `[API] Session available and valid`

3. **Verifique se não há warnings:**
   - ❌ Se aparecer: `[API] No active session - request may fail on backend`
   - ✅ Isso significa que a sessão está sendo preservada corretamente

---

### **3. Teste Completo: Fluxo OAuth Meta**

#### **Passo a Passo Detalhado:**

1. **Faça login na aplicação**
   ```javascript
   // No console, você verá:
   // [API] Request with auth token: /auth/login
   // Auth state changed: SIGNED_IN
   ```

2. **Navegue para o Project Wizard:**
   ```
   http://localhost:5173/pt/project-wizard?projectId=SEU_PROJECT_ID
   ```

3. **Vá até o Step 4 (Configuração de Plataforma)**
   - Você verá a opção "Conectar Meta Ads"

4. **Abra o Console e monitore os logs:**
   ```javascript
   // Antes de clicar em "Conectar", você verá:
   // [API] Request with auth token: /integrations/oauth/meta
   // [API] Session available and valid
   ```

5. **Clique em "Conectar Meta Ads"**
   - Popup do Facebook/Meta abrirá
   - **IMPORTANTE**: Mantenha o console da janela principal aberto!

6. **Durante o popup, monitore o console:**
   ```javascript
   // Você NÃO deve ver:
   // ❌ Auth state changed: SIGNED_OUT
   
   // Você DEVE ver:
   // ✅ [Meta Integration] Token recebido do popup, processando callback...
   // ✅ [Meta Integration] Verificando sessão antes de processar callback...
   // ✅ [Meta Integration] Sessão válida confirmada
   ```

7. **Após autorizar no Meta:**
   ```javascript
   // Você DEVE ver:
   // ✅ [Meta Integration] Callback processado com sucesso
   // ✅ [API] Request with auth token: /integrations/oauth/meta/callback
   ```

8. **Se a sessão foi perdida (bug antigo), você veria:**
   ```javascript
   // ❌ Auth state changed: SIGNED_OUT
   // ❌ [API] No active session - request will fail on backend
   // ❌ [Meta Integration] Erro na API ao processar callback: 401
   ```

---

### **4. Teste de Recuperação: Simular Sessão Perdida**

Para testar se o retry funciona:

1. **Abra o Console e execute:**
   ```javascript
   // Simular perda temporária de sessão
   localStorage.removeItem('sb-nitefyufrzytdtxhaocf-auth-token')
   ```

2. **Tente fazer uma requisição (ex: recarregar página)**
   - O `ensureSession()` deve tentar fazer refresh
   - Você verá: `[API] Attempting to refresh expired session`

3. **Se o refresh token ainda estiver válido:**
   ```javascript
   // ✅ [API] Session refreshed successfully
   // ✅ [API] Request with auth token: /endpoint
   ```

---

### **5. Monitoramento Avançado no Console**

#### **Filtros Úteis no Console:**

1. **Ver apenas logs de sessão:**
   ```
   Filtro: [API] Session
   ```

2. **Ver apenas logs de OAuth:**
   ```
   Filtro: [Meta Integration]
   ```

3. **Ver apenas erros:**
   ```
   Filtro: Error
   ```

#### **Comandos Úteis no Console:**

```javascript
// Verificar sessão atual
const { data: { session } } = await supabase.auth.getSession()
console.log('Sessão atual:', session ? 'Válida' : 'Nula')

// Verificar se ensureSession funciona
import { ensureSession } from '@/services/api/client'
const session = await ensureSession()
console.log('Sessão garantida:', session ? 'Sim' : 'Não')

// Monitorar todas as requisições
// (já está ativo automaticamente em DEV)
```

---

### **6. Teste de Edge Cases**

#### **Cenário 1: Sessão Expira Durante OAuth**

1. **Faça login**
2. **Espere a sessão expirar** (ou simule no console)
3. **Tente conectar Meta**
4. **Resultado esperado:**
   ```javascript
   // ✅ [API] Attempting to refresh expired session
   // ✅ [API] Session refreshed successfully
   // ✅ OAuth continua normalmente
   ```

#### **Cenário 2: Refresh Token Inválido**

1. **Simule refresh token inválido** (requer mock no código)
2. **Tente fazer requisição**
3. **Resultado esperado:**
   ```javascript
   // ✅ [API] Failed to refresh session: Refresh failed
   // ✅ Mensagem amigável ao usuário
   // ✅ Redirecionamento para login (se necessário)
   ```

---

### **7. Verificação Visual no Network Tab**

1. **Abra DevTools > Network**
2. **Filtre por "Fetch/XHR"**
3. **Tente conectar Meta**
4. **Verifique os headers das requisições:**

   **Requisição para `/integrations/oauth/meta`:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   X-Project-ID: seu-project-id
   ```

   **Requisição para `/integrations/oauth/meta/callback`:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   X-Project-ID: seu-project-id
   ```

5. **Se o header `Authorization` estiver presente em TODAS as requisições:**
   - ✅ Sessão está sendo preservada!

---

### **8. Checklist de Sucesso**

Após testar, verifique:

- [ ] ✅ Não aparece `SIGNED_OUT` durante OAuth popup
- [ ] ✅ Todos os logs mostram `[API] Session available and valid`
- [ ] ✅ Requisição de callback tem header `Authorization`
- [ ] ✅ OAuth completa com sucesso sem erro 401
- [ ] ✅ Se sessão expirar, refresh automático funciona
- [ ] ✅ Mensagens de erro são amigáveis (não expõem detalhes técnicos)

---

### **9. Troubleshooting**

#### **Problema: Sessão ainda é perdida**

**Sintomas:**
```javascript
// Console mostra:
Auth state changed: SIGNED_OUT
[API] No active session - request will fail on backend
```

**Soluções:**
1. Verifique se está usando `apiClient` (não `fetch` direto)
2. Verifique se o popup não está interferindo (isso foi corrigido)
3. Limpe cache e cookies do navegador
4. Verifique se não há múltiplas instâncias do Supabase client

#### **Problema: Refresh não funciona**

**Sintomas:**
```javascript
// Console mostra:
[API] Attempting to refresh expired session
[API] Failed to refresh session: Refresh failed
```

**Soluções:**
1. Verifique se o refresh token ainda é válido
2. Faça login novamente
3. Verifique configuração do Supabase

---

## 📊 Resumo: Onde `ensureSession()` é Usado

### **Automaticamente (via interceptor):**
- ✅ Todas as requisições via `apiClient.get()`
- ✅ Todas as requisições via `apiClient.post()`
- ✅ Todas as requisições via `apiClient.put()`
- ✅ Todas as requisições via `apiClient.delete()`
- ✅ Todas as requisições via `apiClient.patch()`

### **Manualmente (quando necessário):**
- ✅ `useMetaIntegration.onSuccess` - antes de processar callback OAuth
- ✅ Qualquer lugar que precise garantir sessão antes de operação crítica

### **Exemplo de uso manual:**
```typescript
import { ensureSession } from '@/services/api/client'

// Antes de operação crítica
const session = await ensureSession()
if (!session) {
  // Redirecionar para login ou mostrar erro
  return
}
// Continuar com operação
```

---

## 🎯 Conclusão

**Sim, `ensureSession()` é usado automaticamente em TODO o projeto!**

Todas as requisições HTTP via `apiClient` já estão protegidas. Você só precisa:

1. ✅ Usar `apiClient` (não `fetch` direto)
2. ✅ Monitorar logs no console durante desenvolvimento
3. ✅ Testar o fluxo OAuth Meta completo

**Não é necessário fazer nada extra** - a proteção já está ativa! 🚀


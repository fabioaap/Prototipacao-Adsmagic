# Análise Crítica: URL de Callback OAuth Meta

## ✅ **Sua Observação Está CORRETA**

Sim, o callback **DEVE ser uma URL do frontend**. O fluxo atual está quase correto, mas há um problema crítico.

## 🔍 **Análise do Fluxo Atual**

### **Fluxo Implementado:**
1. ✅ Frontend constrói `redirectUri`: `${window.location.origin}/${locale}/auth/oauth/callback`
2. ✅ Frontend chama backend: `POST /integrations/oauth/meta`
3. ❌ **PROBLEMA**: Backend usa `META_OAUTH_REDIRECT_URI` de variável de ambiente (fixa)
4. ✅ Meta redireciona para callback com token no hash: `#access_token=...`
5. ✅ Página `OAuthCallback.vue` extrai token e envia para janela pai via `postMessage`
6. ✅ Janela pai recebe token e chama backend: `POST /integrations/oauth/meta/callback`
7. ✅ Backend processa token, obtém contas e retorna
8. ✅ Frontend habilita seleção de contas e pixels

### **Problema Identificado:**

```typescript
// ❌ ATUAL: Backend usa variável de ambiente fixa
const redirectUri = Deno.env.get('META_OAUTH_REDIRECT_URI')

// ✅ DEVERIA: Backend recebe redirectUri do frontend
const { redirectUri } = await req.json()
```

**Por que isso é um problema?**
- O frontend pode ter múltiplos locales (`/pt/`, `/en/`, etc.)
- O redirectUri precisa ser dinâmico baseado no locale atual
- Variável de ambiente fixa não suporta múltiplos locales
- Meta App precisa ter TODAS as URLs de callback registradas

## 🎯 **Solução Recomendada**

### **Opção 1: Frontend envia redirectUri (RECOMENDADO)**

**Vantagens:**
- ✅ Suporta múltiplos locales dinamicamente
- ✅ Mais flexível para desenvolvimento/produção
- ✅ Não precisa configurar múltiplas URLs no Meta App
- ✅ Segue padrão OAuth moderno

**Implementação:**

```typescript
// Frontend: useMetaIntegration.ts
const startOAuth = async (): Promise<void> => {
  const locale = (route.params.locale as string) || 'pt'
  const redirectUri = `${window.location.origin}/${locale}/auth/oauth/callback`
  
  // Enviar redirectUri para o backend
  const { authUrl } = await integrationsService.startOAuth('meta', redirectUri)
  // ...
}

// Backend: handlers/oauth/start.ts
export async function handleOAuthStart(
  req: Request,
  platform: string
): Promise<Response> {
  const body = await req.json()
  const { redirectUri } = body // Receber do frontend
  
  // Validar redirectUri (segurança)
  const allowedOrigins = [
    Deno.env.get('FRONTEND_URL') || 'http://localhost:3000',
    'https://seu-dominio.com',
  ]
  
  const isValidOrigin = allowedOrigins.some(origin => 
    redirectUri.startsWith(origin)
  )
  
  if (!isValidOrigin) {
    return errorResponse('Invalid redirect URI', 400)
  }
  
  // Usar redirectUri recebido
  const authUrl = `https://www.facebook.com/${apiVersion}/dialog/oauth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` + // ✅ Dinâmico
    `&scope=${encodeURIComponent(scope)}`
}
```

### **Opção 2: Usar variável de ambiente com wildcard (ALTERNATIVA)**

**Vantagens:**
- ✅ Mais simples de implementar
- ✅ Não precisa modificar API

**Desvantagens:**
- ❌ Meta App precisa ter múltiplas URLs registradas
- ❌ Menos flexível

**Configuração no Meta App:**
```
https://seu-dominio.com/pt/auth/oauth/callback
https://seu-dominio.com/en/auth/oauth/callback
https://seu-dominio.com/es/auth/oauth/callback
```

## 🔒 **Considerações de Segurança**

### **1. Validação de Redirect URI**

O backend DEVE validar que o `redirectUri`:
- ✅ Pertence a um domínio permitido
- ✅ Usa HTTPS em produção
- ✅ Não contém caracteres maliciosos

```typescript
function validateRedirectUri(redirectUri: string): boolean {
  const url = new URL(redirectUri)
  
  // Lista de origens permitidas
  const allowedOrigins = [
    'https://seu-dominio.com',
    'https://www.seu-dominio.com',
    // Adicionar localhost apenas em desenvolvimento
    ...(Deno.env.get('ENVIRONMENT') === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : []
    )
  ]
  
  return allowedOrigins.some(origin => 
    url.origin === origin && 
    url.pathname.startsWith('/') // Garantir path válido
  )
}
```

### **2. Configuração no Meta App**

No Facebook Developers:
1. Settings > Basic > Add Platform > Website
2. Site URL: `https://seu-dominio.com`
3. Valid OAuth Redirect URIs:
   ```
   https://seu-dominio.com/pt/auth/oauth/callback
   https://seu-dominio.com/en/auth/oauth/callback
   http://localhost:3000/pt/auth/oauth/callback (apenas dev)
   ```

## 📋 **Checklist de Implementação**

### **Backend:**
- [ ] Modificar `handleOAuthStart` para receber `redirectUri` do body
- [ ] Adicionar validação de `redirectUri` (origem permitida)
- [ ] Usar `redirectUri` recebido ao invés de variável de ambiente
- [ ] Manter `META_OAUTH_REDIRECT_URI` como fallback (opcional)

### **Frontend:**
- [ ] Modificar `startOAuth` para enviar `redirectUri` no body
- [ ] Garantir que `redirectUri` usa locale correto
- [ ] Testar com diferentes locales

### **Meta App:**
- [ ] Registrar todas as URLs de callback no Meta App
- [ ] Testar OAuth flow em cada locale

### **Documentação:**
- [ ] Documentar URLs de callback necessárias
- [ ] Adicionar instruções para configurar Meta App

## 🎯 **Recomendação Final**

**Implementar Opção 1** (Frontend envia redirectUri) porque:
1. ✅ Mais flexível e escalável
2. ✅ Suporta múltiplos locales sem configuração extra
3. ✅ Segue melhores práticas OAuth
4. ✅ Facilita desenvolvimento (localhost dinâmico)

**URL de Callback Recomendada:**
```
https://seu-dominio.com/{locale}/auth/oauth/callback
```

Onde `{locale}` é dinâmico (`pt`, `en`, `es`, etc.)

## 🔄 **Fluxo Completo Corrigido**

```
1. Usuário clica "Conectar Meta"
   ↓
2. Frontend: startOAuth()
   - Constrói redirectUri: `${origin}/${locale}/auth/oauth/callback`
   - Chama: POST /integrations/oauth/meta { redirectUri }
   ↓
3. Backend: handleOAuthStart()
   - Valida redirectUri
   - Gera authUrl com redirectUri dinâmico
   - Retorna: { authUrl }
   ↓
4. Frontend: openOAuthPopup({ authUrl, redirectUri })
   - Abre popup com authUrl
   ↓
5. Meta redireciona para: {redirectUri}#access_token=...
   ↓
6. OAuthCallback.vue:
   - Extrai token do hash
   - Envia para janela pai: postMessage({ type: 'OAUTH_SUCCESS', token })
   - Fecha popup
   ↓
7. useOAuthPopup:
   - Recebe token via postMessage
   - Chama onSuccess(token)
   ↓
8. useMetaIntegration.onSuccess:
   - Chama: POST /integrations/oauth/meta/callback { accessToken }
   ↓
9. Backend: handleOAuthCallback()
   - Troca token por long-lived
   - Busca contas Meta
   - Salva integração
   - Retorna: { success, integrationId, accounts }
   ↓
10. Frontend:
    - Atualiza estado com integrationId e accounts
    - Habilita seleção de contas e pixels
    - ✅ SUCESSO!
```

## ⚠️ **Pontos de Atenção**

1. **Meta App Configuration**: Todas as URLs de callback devem estar registradas
2. **HTTPS em Produção**: Meta não aceita HTTP em produção
3. **Validação de Origem**: Backend deve validar redirectUri rigorosamente
4. **Locale Handling**: Garantir que locale está sempre presente na URL


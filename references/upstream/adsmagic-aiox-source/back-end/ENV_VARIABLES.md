# 🔐 Variáveis de Ambiente - Backend Adsmagic First AI

**⚠️ IMPORTANTE**: Este documento lista todas as variáveis de ambiente necessárias. Configure-as via arquivo `.env.local` (gitignored) ou variáveis de ambiente do sistema.

---

## 📋 Variáveis Obrigatórias

### **Supabase Configuration**

| Variável | Descrição | Como Obter |
|----------|-----------|------------|
| `SUPABASE_URL` | URL do projeto Supabase | Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Chave anônima (anon/public) | Dashboard → Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service-role (opcional) | Dashboard → Settings → API → `service_role` `secret` |

**⚠️ NOTA**: A `SUPABASE_ANON_KEY` é obrigatória para:
- Autenticação via Auth API (`/auth/v1/*`)
- Acesso à REST API (`/rest/v1/*`)
- Requisições do frontend

A `SUPABASE_SERVICE_ROLE_KEY` deve ser usada **APENAS** em Edge Functions ou backend privado, nunca exposta ao frontend.

---

## 🔧 Variáveis Opcionais

### **Meta OAuth Configuration**

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `META_OAUTH_CLIENT_ID` | Client ID do Meta App | - |
| `META_OAUTH_CLIENT_SECRET` | Client Secret do Meta App | - |
| `META_OAUTH_API_VERSION` | Versão da API Meta | `v23.0` |
| `META_OAUTH_REDIRECT_URI` | URI de redirecionamento | - |
| `META_OAUTH_SCOPE` | Escopos solicitados | `ads_read,business_management,ads_management` |

---

## 📝 Exemplo de Arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do diretório `back-end/`:

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

# Meta OAuth
META_OAUTH_CLIENT_ID=seu-client-id
META_OAUTH_CLIENT_SECRET=seu-client-secret
META_OAUTH_API_VERSION=v23.0
META_OAUTH_REDIRECT_URI=http://localhost:5173/auth/oauth/callback
META_OAUTH_SCOPE=ads_read,business_management,ads_management
```

---

## 🚀 Como Usar

### **Node.js/TypeScript**

```typescript
// Instalar dotenv
// npm install dotenv

import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY
```

### **Deno (Edge Functions)**

```typescript
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
```

### **Postman**

1. Configure as variáveis no Environment
2. Ou use script Pre-request para carregar do `.env.local`:
   ```javascript
   // Script Pre-request (requer instalação do dotenv)
   require('dotenv').config({ path: './.env.local' })
   pm.environment.set('anon_key', process.env.SUPABASE_ANON_KEY)
   ```

---

## 🔒 Segurança

### **✅ Boas Práticas**

- ✅ Adicione `.env.local` ao `.gitignore`
- ✅ Use diferentes chaves para dev/staging/prod
- ✅ Rotacione chaves expostas acidentalmente
- ✅ Nunca commite arquivos `.env` com valores reais
- ✅ Use variáveis de ambiente do sistema em produção

### **❌ O Que NÃO Fazer**

- ❌ Commitar chaves em código fonte
- ❌ Expor `SERVICE_ROLE_KEY` no frontend
- ❌ Usar chaves de produção em desenvolvimento
- ❌ Compartilhar chaves via email/chat não seguro

---

## 🔄 Rotação de Chaves (Se Expostas)

Se uma chave foi commitada acidentalmente:

1. **No Supabase Dashboard:**
   - Vá em Settings → API
   - Clique em "Regenerate" para a chave comprometida
   - Atualize todas as aplicações/ambientes

2. **No Repositório:**
   - Remova a chave dos arquivos commitados
   - Use `git filter-branch` ou `BFG Repo-Cleaner` para limpar histórico (se necessário)
   - Force push (após revisão cuidadosa)

---

## 📚 Referências

- [Supabase Docs - API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Docs - Environment Variables](https://supabase.com/docs/guides/api/api-keys)
- [Meta for Developers - OAuth](https://developers.facebook.com/docs/facebook-login/)

---

**Última atualização**: 2025-01-28


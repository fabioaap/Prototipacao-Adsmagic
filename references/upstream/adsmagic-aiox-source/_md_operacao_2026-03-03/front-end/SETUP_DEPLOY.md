# ⚡ Setup Rápido - Deploy via Wrangler

Guia rápido para configurar o deploy via Wrangler CLI após rollback.

## 🎯 Objetivo

Configurar deploy automático via Wrangler CLI para o projeto `adsmagic-frontend` no Cloudflare Pages.

---

## 📝 Passo a Passo

### 1. Instalar Wrangler CLI (se ainda não tiver)

```bash
npm install -g wrangler
# ou
pnpm add -g wrangler
```

### 2. Fazer Login

```bash
cd front-end
wrangler login
```

Isso abrirá o navegador para autenticar.

### 3. Verificar/Criar Projeto

```bash
# Verificar se o projeto existe
wrangler pages project list

# Se não existir, criar:
wrangler pages project create adsmagic-frontend
```

### 4. Configurar Secrets (Variáveis de Ambiente)

```bash
# Secrets obrigatórios
wrangler pages secret put VITE_SUPABASE_URL --project-name=adsmagic-frontend
wrangler pages secret put VITE_SUPABASE_ANON_KEY --project-name=adsmagic-frontend

# Quando executar, será solicitado o valor
# Cole o valor e pressione Enter
```

### 5. Testar Deploy Local

```bash
# Build
pnpm build

# Deploy
pnpm deploy
# ou
wrangler pages deploy dist --project-name=adsmagic-frontend
```

### 6. Configurar GitHub Secrets (para CI/CD)

1. Acesse: https://github.com/[seu-usuario]/[seu-repo]/settings/secrets/actions

2. Adicione os seguintes secrets:

   **`CLOUDFLARE_API_TOKEN`**
   - Obter em: https://dash.cloudflare.com/profile/api-tokens
   - Criar token com permissão: `Cloudflare Pages` → `Edit`
   
   **`CLOUDFLARE_ACCOUNT_ID`**
   - Obter em: https://dash.cloudflare.com/
   - Aparece no painel lateral direito ou na URL

   **`VITE_SUPABASE_URL`** (opcional, para build)
   - URL do Supabase
   
   **`VITE_SUPABASE_ANON_KEY`** (opcional, para build)
   - Chave anônima do Supabase

### 7. Testar Deploy Automático

```bash
# Fazer commit e push
git add .
git commit -m "feat: configurar deploy automático via Wrangler"
git push origin main
```

O GitHub Actions irá fazer o deploy automaticamente.

---

## ✅ Verificação

Após o deploy, verifique:

1. **Deploy concluído**: https://github.com/[seu-usuario]/[seu-repo]/actions
2. **Site acessível**: https://adsmagic-frontend.pages.dev
3. **Logs do deploy**: Dashboard do Cloudflare Pages → Deployments

---

## 🔧 Comandos Úteis

```bash
# Deploy manual
pnpm deploy

# Ver deployments
wrangler pages deployment list --project-name=adsmagic-frontend

# Ver detalhes do projeto
wrangler pages project get adsmagic-frontend

# Listar secrets
wrangler pages secret list --project-name=adsmagic-frontend
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [DEPLOY_WRANGLER.md](./DEPLOY_WRANGLER.md) - Guia completo
- [DEPLOY.md](./DEPLOY.md) - Guia geral de deploy

---

**Pronto!** Seu deploy está configurado e automatizado. 🚀


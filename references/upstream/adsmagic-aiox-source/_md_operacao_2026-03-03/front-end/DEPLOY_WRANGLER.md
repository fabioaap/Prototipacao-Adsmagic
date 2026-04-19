# 🚀 Deploy via Wrangler CLI - Guia Completo

Este guia explica como fazer deploy do front-end usando o Wrangler CLI e como automatizar via GitHub Actions.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Setup Inicial](#setup-inicial)
- [Deploy Manual via CLI](#deploy-manual-via-cli)
- [Deploy Automático via GitHub Actions](#deploy-automático-via-github-actions)
- [Configuração de Secrets](#configuração-de-secrets)
- [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

1. **Conta no Cloudflare** (gratuita)
   - Criar em: https://dash.cloudflare.com/sign-up

2. **Projeto criado no Cloudflare Pages**
   - O projeto já foi criado anteriormente
   - Nome do projeto: `adsmagic-frontend`

3. **Wrangler CLI instalado** (para deploy local)
   ```bash
   npm install -g wrangler
   # ou
   pnpm add -g wrangler
   ```

---

## Setup Inicial

### 1. Fazer Login no Wrangler

```bash
cd front-end
wrangler login
```

Isso abrirá o navegador para autenticar com sua conta Cloudflare.

### 2. Verificar Projeto

```bash
# Listar projetos
wrangler pages project list

# Ver detalhes do projeto
wrangler pages project get adsmagic-frontend
```

### 3. Configurar Variáveis de Ambiente (Secrets)

As variáveis de ambiente podem ser configuradas de duas formas:

#### Opção A: Via CLI (Recomendado para secrets)

```bash
# Secrets (valores sensíveis)
wrangler pages secret put VITE_SUPABASE_URL --project-name=adsmagic-frontend
wrangler pages secret put VITE_SUPABASE_ANON_KEY --project-name=adsmagic-frontend

# Variáveis públicas (se necessário)
# Use o dashboard do Cloudflare Pages para variáveis públicas
```

#### Opção B: Via Dashboard

1. Acesse: https://dash.cloudflare.com/
2. Vá para **Pages** → **adsmagic-frontend** → **Settings** → **Environment variables**
3. Adicione as variáveis necessárias

**Variáveis Obrigatórias:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Variáveis Opcionais:**
- `VITE_API_BASE_URL`
- `VITE_META_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_TIKTOK_CLIENT_ID`
- `VITE_LINKEDIN_CLIENT_ID`

---

## Deploy Manual via CLI

### Deploy de Produção

```bash
cd front-end

# Build + Deploy
pnpm deploy

# Ou passo a passo:
pnpm build
wrangler pages deploy dist --project-name=adsmagic-frontend
```

### Deploy de Preview

```bash
# Deploy para branch específica
pnpm deploy:preview

# Ou manualmente:
pnpm build
wrangler pages deploy dist --project-name=adsmagic-frontend --branch=preview
```

### Verificar Deploy

```bash
# Listar deployments
wrangler pages deployment list --project-name=adsmagic-frontend

# Ver detalhes de um deployment
wrangler pages deployment get [deployment-id] --project-name=adsmagic-frontend
```

---

## Deploy Automático via GitHub Actions

O workflow está configurado em `.github/workflows/deploy-cloudflare.yml`.

### Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá para **Settings** → **Secrets and variables** → **Actions**
3. Adicione os seguintes secrets:

#### Secrets Obrigatórios

**`CLOUDFLARE_API_TOKEN`**
- Como obter:
  1. Acesse: https://dash.cloudflare.com/profile/api-tokens
  2. Clique em **Create Token**
  3. Use o template **Edit Cloudflare Workers** ou crie um custom:
     - Permissions: `Account` → `Cloudflare Pages` → `Edit`
     - Account Resources: Selecione sua conta
  4. Copie o token gerado

**`CLOUDFLARE_ACCOUNT_ID`**
- Como obter:
  1. Acesse: https://dash.cloudflare.com/
  2. Selecione seu site/domínio
  3. No painel lateral direito, você verá o **Account ID**
  4. Ou acesse: https://dash.cloudflare.com/profile/api-tokens
  5. O Account ID aparece na URL ou no painel

#### Secrets Opcionais (para build)

**`VITE_SUPABASE_URL`**
- URL do seu projeto Supabase

**`VITE_SUPABASE_ANON_KEY`**
- Chave anônima do Supabase

**`VITE_API_BASE_URL`**
- URL base da API (opcional)

### Como Funciona

1. **Push para branch configurada** (`main`, `master`, ou `fix/bugfixes`)
2. **GitHub Actions detecta o push**
3. **Workflow executa:**
   - Checkout do código
   - Setup do Node.js e pnpm
   - Instalação de dependências
   - Build do projeto
   - Deploy via Wrangler CLI
4. **Deploy automático no Cloudflare Pages**

### Deploy Manual via GitHub Actions

Você também pode acionar o deploy manualmente:

1. Vá para **Actions** no GitHub
2. Selecione **Deploy to Cloudflare Pages**
3. Clique em **Run workflow**
4. Selecione a branch e clique em **Run workflow**

---

## Configuração de Secrets

### Secrets vs Variáveis de Ambiente

- **Secrets**: Valores sensíveis (tokens, chaves privadas)
  - Configurados via `wrangler pages secret put`
  - Não aparecem em logs
  - Criptografados

- **Variáveis de Ambiente**: Valores públicos ou não sensíveis
  - Configurados via Dashboard do Cloudflare Pages
  - Aparecem em logs de build
  - Úteis para configurações públicas

### Listar Secrets Configurados

```bash
# Listar secrets (não mostra valores)
wrangler pages secret list --project-name=adsmagic-frontend
```

### Remover Secret

```bash
wrangler pages secret delete SECRET_NAME --project-name=adsmagic-frontend
```

---

## Troubleshooting

### Erro: "Project not found"

**Problema**: Wrangler não encontra o projeto `adsmagic-frontend`

**Soluções**:
1. Verifique se o projeto existe no Cloudflare Pages
2. Verifique o nome do projeto: `wrangler pages project list`
3. Crie o projeto se não existir:
   ```bash
   wrangler pages project create adsmagic-frontend
   ```

### Erro: "Authentication required"

**Problema**: Wrangler não está autenticado

**Solução**:
```bash
wrangler login
```

### Erro: "Build failed"

**Problema**: Build local falha

**Soluções**:
1. Teste o build localmente:
   ```bash
   pnpm build
   ```
2. Verifique se todas as dependências estão instaladas:
   ```bash
   pnpm install
   ```
3. Verifique se as variáveis de ambiente estão configuradas

### Erro: "Deployment failed"

**Problema**: Deploy falha após build bem-sucedido

**Soluções**:
1. Verifique os logs do deployment:
   ```bash
   wrangler pages deployment list --project-name=adsmagic-frontend
   ```
2. Verifique se o diretório `dist` existe após o build
3. Verifique se o arquivo `dist/index.html` existe

### Erro no GitHub Actions: "Invalid API Token"

**Problema**: Token do Cloudflare inválido ou sem permissões

**Soluções**:
1. Verifique se o token está correto no GitHub Secrets
2. Verifique se o token tem permissões para Cloudflare Pages
3. Crie um novo token se necessário

### Erro no GitHub Actions: "Account ID not found"

**Problema**: Account ID incorreto ou não configurado

**Soluções**:
1. Verifique se o Account ID está correto no GitHub Secrets
2. Obtenha o Account ID correto do dashboard do Cloudflare

---

## Comandos Úteis

```bash
# Login no Wrangler
wrangler login

# Listar projetos
wrangler pages project list

# Ver detalhes do projeto
wrangler pages project get adsmagic-frontend

# Listar deployments
wrangler pages deployment list --project-name=adsmagic-frontend

# Fazer deploy
wrangler pages deploy dist --project-name=adsmagic-frontend

# Deploy com branch específica
wrangler pages deploy dist --project-name=adsmagic-frontend --branch=preview

# Listar secrets
wrangler pages secret list --project-name=adsmagic-frontend

# Adicionar secret
wrangler pages secret put SECRET_NAME --project-name=adsmagic-frontend

# Remover secret
wrangler pages secret delete SECRET_NAME --project-name=adsmagic-frontend
```

---

## Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Wrangler CLI instalado e autenticado (`wrangler login`)
- [ ] Projeto existe no Cloudflare Pages
- [ ] Variáveis de ambiente configuradas (secrets ou dashboard)
- [ ] Build local funciona (`pnpm build`)
- [ ] Diretório `dist` existe após build
- [ ] GitHub Secrets configurados (para CI/CD)
- [ ] Workflow do GitHub Actions configurado

---

## Próximos Passos

1. **Configurar domínio personalizado** (opcional)
   - Dashboard → Pages → Settings → Custom domains

2. **Configurar Analytics** (opcional)
   - Dashboard → Pages → Analytics

3. **Configurar Web Analytics** (opcional)
   - Adicione o script do Cloudflare Web Analytics no HTML

---

## Recursos Úteis

- [Documentação Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Actions - Cloudflare Pages](https://github.com/cloudflare/pages-action)

---

**Última atualização**: 2025-01-27


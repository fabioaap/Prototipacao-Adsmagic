# 🚀 Deploy Automatizado - Cloudflare Pages

Guia completo para configurar deploy automatizado do front-end no Cloudflare Pages.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Opções de Deploy](#opções-de-deploy)
- [Método 1: Integração Nativa (Recomendado)](#método-1-integração-nativa-recomendado)
- [Método 2: GitHub Actions + Wrangler](#método-2-github-actions--wrangler)
- [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Cloudflare Pages oferece duas formas principais de fazer deploy:

1. **Integração Nativa com GitHub** (Recomendado)
   - Cloudflare detecta pushes automaticamente
   - Build e deploy gerenciados pelo Cloudflare
   - Mais simples e eficiente
   - Preview deployments automáticos para PRs

2. **GitHub Actions + Wrangler CLI**
   - Controle total sobre o processo de build
   - Útil para validações customizadas antes do deploy
   - Requer configuração de secrets no GitHub

---

## Opções de Deploy

### ✅ Método 1: Integração Nativa (Recomendado)

**Vantagens:**
- ✅ Configuração mais simples
- ✅ Não requer secrets do Cloudflare no GitHub
- ✅ Preview deployments automáticos para PRs
- ✅ Build otimizado pelo Cloudflare
- ✅ Rollback fácil via dashboard

**Quando usar:**
- Projeto novo ou sem configuração prévia
- Quer simplicidade e automação máxima
- Não precisa de validações customizadas antes do deploy

### ⚙️ Método 2: GitHub Actions + Wrangler

**Vantagens:**
- ✅ Controle total sobre o processo
- ✅ Validações customizadas (tests, lint, typecheck)
- ✅ Deploy apenas após validações passarem
- ✅ Logs detalhados no GitHub Actions

**Quando usar:**
- Precisa validar código antes de fazer deploy
- Quer garantir que testes passem antes do deploy
- Prefere ter controle total sobre o processo

---

## Método 1: Integração Nativa (Recomendado)

### Passo 1: Criar Projeto no Cloudflare Pages

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navegue para **Pages** → **Create a project**
3. Clique em **Connect to Git**
4. Autorize o Cloudflare a acessar seu repositório GitHub
5. Selecione o repositório do projeto
6. Clique em **Begin setup**

### Passo 2: Configurar Build Settings

Configure os seguintes campos:

| Campo | Valor |
|-------|-------|
| **Project name** | `adsmagic-frontend` |
| **Production branch** | `main` (ou `master`) |
| **Framework preset** | `Vite` |
| **Build command** | `pnpm install && pnpm build` |
| **Build output directory** | `dist` |
| **Root directory** | `front-end` |

**Importante:**
- Se o repositório é um monorepo, defina **Root directory** como `front-end`
- Se o repositório contém apenas o front-end, deixe **Root directory** vazio

### Passo 3: Configurar Node.js Version

1. Vá para **Settings** → **Builds & deployments**
2. Em **Environment variables**, adicione:
   - `NODE_VERSION`: `18` (ou a versão desejada)

### Passo 4: Configurar Variáveis de Ambiente

Veja a seção [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente) abaixo.

### Passo 5: Criar Projeto

Clique em **Save and Deploy** para criar o projeto e fazer o primeiro deploy.

### Como Funciona

1. **Push para branch de produção** (`main` ou `master`)
   ```bash
   git push origin main
   ```

2. **Cloudflare detecta o push automaticamente**
   - Webhook do GitHub aciona o build

3. **Build automático**
   - Instala dependências: `pnpm install`
   - Executa build: `pnpm build`
   - Gera arquivos em `dist/`

4. **Deploy automático**
   - Arquivos são servidos via CDN global
   - URL: `https://adsmagic-frontend.pages.dev`

### Preview Deployments

Cada Pull Request recebe automaticamente um deployment de preview:

1. Crie um Pull Request no GitHub
2. Cloudflare Pages detecta o PR
3. Cria um deployment de preview automaticamente
4. URL de preview aparece como comentário no PR

---

## Método 2: GitHub Actions + Wrangler

### Pré-requisitos

1. **Wrangler CLI** (já configurado no workflow)
2. **Secrets no GitHub** (veja abaixo)

### Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá para **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione os seguintes secrets:

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

#### Secrets para Build (Opcionais)

Se você quiser que o GitHub Actions faça o build com variáveis reais:

**`VITE_SUPABASE_URL`**
- URL do seu projeto Supabase

**`VITE_SUPABASE_ANON_KEY`**
- Chave anônima do Supabase

**`VITE_API_BASE_URL`**
- URL base da API (opcional)

**Nota:** Se não configurar esses secrets, o build usará valores mock e as variáveis reais devem estar configuradas no Cloudflare Pages.

### Como Funciona

1. **Push para branch configurada** (`main`, `master`, ou `fix/bugfixes`)
   ```bash
   git push origin main
   ```

2. **GitHub Actions detecta o push**
   - Workflow `.github/workflows/deploy-cloudflare-pages.yml` é acionado

3. **Workflow executa:**
   - Checkout do código
   - Setup do Node.js e pnpm
   - Instalação de dependências
   - Type check (opcional, não bloqueia)
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

## Configuração de Variáveis de Ambiente

### Variáveis Obrigatórias

Estas variáveis **devem** ser configuradas para o app funcionar:

#### `VITE_SUPABASE_URL`
- **Descrição**: URL do projeto Supabase
- **Onde obter**: Dashboard do Supabase → Settings → API → Project URL
- **Exemplo**: `https://nitefyufrzytdtxhaocf.supabase.co`

#### `VITE_SUPABASE_ANON_KEY`
- **Descrição**: Chave anônima (pública) do Supabase
- **Onde obter**: Dashboard do Supabase → Settings → API → Project API keys → `anon` `public`
- **Nota**: Esta chave é segura para uso no front-end, não é um secret

### Variáveis Opcionais

#### `VITE_API_BASE_URL`
- **Descrição**: URL base da API backend
- **Padrão**: `https://[seu-projeto].supabase.co/functions/v1`
- **Quando usar**: Se você tiver uma API customizada fora do Supabase

#### `VITE_USE_MOCK_QUEUE`
- **Descrição**: Usar mock para queue de jobs
- **Valores**: `true` ou `false`
- **Padrão**: `false`

#### `VITE_ENABLE_JOB_POLLING`
- **Descrição**: Habilitar polling de jobs
- **Valores**: `true` ou `false`
- **Padrão**: `true`

#### `VITE_JOB_POLLING_INTERVAL`
- **Descrição**: Intervalo de polling em milissegundos
- **Padrão**: `3000` (3 segundos)

### Variáveis OAuth (Opcionais)

Configure apenas se for usar integrações OAuth:

- `VITE_META_CLIENT_ID` - Client ID do Meta/Facebook
- `VITE_GOOGLE_CLIENT_ID` - Client ID do Google
- `VITE_TIKTOK_CLIENT_ID` - Client ID do TikTok
- `VITE_LINKEDIN_CLIENT_ID` - Client ID do LinkedIn

### Como Configurar no Cloudflare Pages

#### Via Dashboard (Recomendado)

1. No Cloudflare Dashboard, vá para **Pages** → `adsmagic-frontend`
2. Clique em **Settings** → **Environment variables**
3. Para cada variável:
   - Clique em **Add variable**
   - Digite o nome da variável (ex: `VITE_SUPABASE_URL`)
   - Digite o valor
   - Selecione os ambientes (Production, Preview, ou ambos)
   - Clique em **Save**

**Importante:**
- Configure variáveis para **Production** e **Preview** separadamente se necessário
- Preview deployments usam as variáveis do ambiente Preview
- Nunca commite valores reais no código

#### Via Wrangler CLI (Alternativa)

```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Fazer login
wrangler login

# Adicionar secret (valores sensíveis)
wrangler pages secret put VITE_SUPABASE_URL --project-name=adsmagic-frontend
wrangler pages secret put VITE_SUPABASE_ANON_KEY --project-name=adsmagic-frontend

# Listar secrets configurados
wrangler pages secret list --project-name=adsmagic-frontend
```

---

## Troubleshooting

### Build Falha no Cloudflare Pages

**Sintoma**: Deployment mostra status "Failed"

**Soluções**:
1. Verifique os logs do build no dashboard do Cloudflare
2. Teste o build localmente:
   ```bash
   cd front-end
   pnpm install
   pnpm build
   ```
3. Verifique se todas as dependências estão no `package.json`
4. Verifique se o Node.js version está compatível (Cloudflare usa Node 18 por padrão)

**Erro comum**: `Command not found: pnpm`
- **Solução**: Cloudflare Pages suporta pnpm automaticamente. Verifique se o comando está correto no build settings.

### Variáveis de Ambiente Não Funcionam

**Sintoma**: App não consegue conectar ao Supabase ou API

**Soluções**:
1. Verifique se as variáveis estão configuradas no dashboard do Cloudflare
2. Verifique se os nomes estão corretos (case-sensitive)
3. Verifique se estão configuradas para o ambiente correto (Production/Preview)
4. Faça um novo deploy após adicionar variáveis
5. Verifique no console do browser se as variáveis estão sendo carregadas:
   ```javascript
   console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
   ```

### SPA Routing Não Funciona

**Sintoma**: Rotas diretas retornam 404

**Solução**: O arquivo `public/_redirects` já está configurado com:
```
/* /index.html 200
```

Se ainda não funcionar:
1. Verifique se o arquivo `_redirects` está sendo copiado para `dist/` durante o build
2. Verifique se o Cloudflare Pages está configurado para SPA routing

### Erro no GitHub Actions: "Invalid API Token"

**Sintoma**: Workflow falha com erro de autenticação

**Soluções**:
1. Verifique se o token está correto no GitHub Secrets
2. Verifique se o token tem permissões para Cloudflare Pages
3. Crie um novo token se necessário

### Erro no GitHub Actions: "Account ID not found"

**Sintoma**: Workflow falha com erro de Account ID

**Soluções**:
1. Verifique se o Account ID está correto no GitHub Secrets
2. Obtenha o Account ID correto do dashboard do Cloudflare

### Performance Lenta

**Sintoma**: Site carrega devagar

**Soluções**:
1. Cloudflare Pages já usa CDN global automaticamente
2. Verifique se os assets estão sendo comprimidos (Vite faz isso automaticamente)
3. Verifique se está usando lazy loading de componentes
4. Use o Cloudflare Analytics para identificar gargalos

---

## Checklist de Configuração

### Método 1: Integração Nativa

- [ ] Conta no Cloudflare criada
- [ ] Projeto criado no Cloudflare Pages
- [ ] Repositório GitHub conectado
- [ ] Build settings configurados corretamente
- [ ] Variáveis de ambiente configuradas (Production e Preview)
- [ ] Primeiro deploy concluído com sucesso
- [ ] Site acessível via URL do Cloudflare
- [ ] SPA routing funcionando
- [ ] Variáveis de ambiente carregadas (verificar no console)

### Método 2: GitHub Actions

- [ ] Conta no Cloudflare criada
- [ ] Projeto criado no Cloudflare Pages
- [ ] `CLOUDFLARE_API_TOKEN` configurado no GitHub Secrets
- [ ] `CLOUDFLARE_ACCOUNT_ID` configurado no GitHub Secrets
- [ ] Variáveis de build configuradas (opcional)
- [ ] Workflow testado e funcionando
- [ ] Deploy automático funcionando

---

## Comandos Úteis

### Wrangler CLI

```bash
# Login
wrangler login

# Listar projetos
wrangler pages project list

# Ver detalhes do projeto
wrangler pages project get adsmagic-frontend

# Listar deployments
wrangler pages deployment list --project-name=adsmagic-frontend

# Fazer deploy manual
wrangler pages deploy dist --project-name=adsmagic-frontend

# Listar secrets
wrangler pages secret list --project-name=adsmagic-frontend

# Adicionar secret
wrangler pages secret put SECRET_NAME --project-name=adsmagic-frontend

# Remover secret
wrangler pages secret delete SECRET_NAME --project-name=adsmagic-frontend
```

### Build Local

```bash
cd front-end

# Instalar dependências
pnpm install

# Build
pnpm build

# Preview local
pnpm preview
```

---

## Próximos Passos

1. **Configurar domínio personalizado** (opcional)
   - Dashboard → Pages → Settings → Custom domains

2. **Configurar Analytics** (opcional)
   - Dashboard → Pages → Analytics

3. **Configurar Web Analytics** (opcional)
   - Adicione o script do Cloudflare Web Analytics no HTML

4. **Configurar Preview Deployments** (opcional)
   - Já funciona automaticamente com integração nativa
   - Para GitHub Actions, configure comentários automáticos no PR

---

## Recursos Úteis

- [Documentação Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Guia de Variáveis de Ambiente](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [Troubleshooting Guide](https://developers.cloudflare.com/pages/platform/troubleshooting/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions - Cloudflare Pages](https://github.com/cloudflare/pages-action)

---

**Última atualização**: 2025-01-27


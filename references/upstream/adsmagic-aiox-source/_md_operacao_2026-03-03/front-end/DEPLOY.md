# 🚀 Guia de Deploy - Cloudflare Pages

Este documento descreve o processo completo de deploy do front-end AdsMagic para o Cloudflare Pages.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Setup Inicial](#setup-inicial)
- [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
- [Deploy Automático](#deploy-automático)
- [Preview Deployments](#preview-deployments)
- [Rollback](#rollback)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

O projeto utiliza **Cloudflare Pages** para hospedar o front-end Vue 3. O deploy é automático via integração com GitHub.

### Por que Cloudflare Pages?

- ✅ **Deploy automático** via GitHub (push → deploy)
- ✅ **CDN global** para performance máxima
- ✅ **HTTPS automático** com certificados SSL/TLS
- ✅ **Preview deployments** para cada PR
- ✅ **Rollback fácil** com 1 clique
- ✅ **Plano gratuito generoso** (500 builds/mês, 100k requests/dia)

### Arquitetura

```
GitHub Push → Cloudflare Pages → Build → Deploy → CDN Global
```

---

## Pré-requisitos

1. **Conta no Cloudflare** (gratuita)
   - Criar em: https://dash.cloudflare.com/sign-up

2. **Repositório no GitHub**
   - Código do front-end deve estar em um repositório GitHub

3. **Variáveis de ambiente**
   - Ter acesso às credenciais do Supabase
   - Ter Client IDs OAuth (se necessário)

---

## Setup Inicial

### Passo 1: Criar Projeto no Cloudflare Pages

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navegue para **Pages** → **Create a project**
3. Clique em **Connect to Git**
4. Autorize o Cloudflare a acessar seu repositório GitHub
5. Selecione o repositório do front-end
6. Clique em **Begin setup**

### Passo 2: Configurar Build Settings

Configure os seguintes campos:

- **Project name**: `adsmagic-frontend` (ou o nome desejado)
- **Production branch**: `main` (ou `master`, conforme seu repo)
- **Build command**: `pnpm install && pnpm build`
- **Build output directory**: `dist`
- **Root directory**: `front-end` (se o repo for monorepo, caso contrário deixe vazio)

### Passo 3: Configurar Framework Preset

- **Framework preset**: `Vite` (ou deixe em "None" se não aparecer)

### Passo 4: Criar Projeto

Clique em **Save and Deploy** para criar o projeto.

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

Estas variáveis têm valores padrão ou fallbacks no código:

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

#### `VITE_META_CLIENT_ID`
- **Descrição**: Client ID do Meta/Facebook
- **Onde obter**: https://developers.facebook.com/apps/

#### `VITE_GOOGLE_CLIENT_ID`
- **Descrição**: Client ID do Google
- **Onde obter**: https://console.cloud.google.com/apis/credentials

#### `VITE_TIKTOK_CLIENT_ID`
- **Descrição**: Client ID do TikTok
- **Onde obter**: https://ads.tiktok.com/marketing_api/docs

#### `VITE_LINKEDIN_CLIENT_ID`
- **Descrição**: Client ID do LinkedIn
- **Onde obter**: https://www.linkedin.com/developers/apps

### Como Configurar no Cloudflare

1. No Cloudflare Dashboard, vá para **Pages** → [Seu Projeto]
2. Clique em **Settings** → **Environment variables**
3. Para cada variável:
   - Clique em **Add variable**
   - Digite o nome da variável (ex: `VITE_SUPABASE_URL`)
   - Digite o valor
   - Selecione os ambientes (Production, Preview, ou ambos)
   - Clique em **Save**

**Importante**: 
- Configure variáveis para **Production** e **Preview** separadamente se necessário
- Preview deployments usam as variáveis do ambiente Preview
- Nunca commite valores reais no código

---

## Deploy Automático

### Como Funciona

1. **Push para GitHub**
   ```bash
   git push origin main
   ```

2. **Cloudflare detecta o push**
   - Webhook do GitHub aciona o build automaticamente

3. **Build automático**
   - Instala dependências: `pnpm install`
   - Executa build: `pnpm build`
   - Gera arquivos em `dist/`

4. **Deploy automático**
   - Arquivos são servidos via CDN global
   - URL: `https://[project-name].pages.dev`

### Verificar Status do Deploy

1. Acesse **Pages** → [Seu Projeto] → **Deployments**
2. Veja o status de cada deployment:
   - ✅ **Success**: Deploy concluído com sucesso
   - ⏳ **Building**: Build em andamento
   - ❌ **Failed**: Build falhou (veja logs)

### Logs do Build

Para ver logs detalhados:

1. Vá para **Deployments** → Clique no deployment
2. Veja a aba **Build logs** para detalhes do processo
3. Veja a aba **Functions logs** (se usar Functions)

---

## Preview Deployments

### O que são?

Cada Pull Request recebe automaticamente um deployment de preview com uma URL única.

### Como Funciona

1. Crie um Pull Request no GitHub
2. Cloudflare Pages detecta o PR
3. Cria um deployment de preview automaticamente
4. URL de preview aparece como comentário no PR (se configurado)

### Acessar Preview

1. No GitHub, vá para o Pull Request
2. Veja o comentário do Cloudflare Pages com a URL
3. Ou acesse **Pages** → [Seu Projeto] → **Deployments** → Encontre o deployment do PR

### Variáveis de Ambiente em Preview

- Preview deployments usam variáveis do ambiente **Preview**
- Configure variáveis específicas para preview se necessário
- Útil para testar com dados de staging

---

## Rollback

### Quando Fazer Rollback

- Deploy quebrou a aplicação
- Erro crítico em produção
- Necessidade de voltar para versão anterior

### Como Fazer Rollback

#### Via Dashboard (Recomendado)

1. Acesse **Pages** → [Seu Projeto] → **Deployments**
2. Encontre o deployment anterior que funcionava
3. Clique nos três pontos (⋯) → **Retry deployment**
4. O deployment anterior será redeployado

#### Via CLI (Opcional)

```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Fazer login
wrangler login

# Listar deployments
wrangler pages deployment list --project-name=adsmagic-frontend

# Fazer rollback
wrangler pages deployment rollback [deployment-id] --project-name=adsmagic-frontend
```

---

## Troubleshooting

### Build Falha

**Sintoma**: Deployment mostra status "Failed"

**Soluções**:
1. Verifique os logs do build no dashboard
2. Teste localmente: `pnpm install && pnpm build`
3. Verifique se todas as dependências estão no `package.json`
4. Verifique se o Node.js version está compatível (Cloudflare usa Node 18 por padrão)

**Erro comum**: `Command not found: pnpm`
- **Solução**: Cloudflare Pages suporta pnpm automaticamente, mas verifique se está usando o comando correto

### Variáveis de Ambiente Não Funcionam

**Sintoma**: App não consegue conectar ao Supabase ou API

**Soluções**:
1. Verifique se as variáveis estão configuradas no dashboard
2. Verifique se os nomes estão corretos (case-sensitive)
3. Verifique se estão configuradas para o ambiente correto (Production/Preview)
4. Faça um novo deploy após adicionar variáveis
5. Verifique no console do browser se as variáveis estão sendo carregadas

### SPA Routing Não Funciona

**Sintoma**: Rotas diretas retornam 404

**Solução**: O arquivo `public/_redirects` já está configurado com:
```
/* /index.html 200
```
Se ainda não funcionar, verifique se o arquivo está sendo copiado para `dist/` durante o build.

### HTTPS/SSL Issues

**Sintoma**: Avisos de certificado ou conexão não segura

**Solução**: Cloudflare fornece HTTPS automático. Se houver problemas:
1. Verifique se o domínio está configurado corretamente
2. Aguarde alguns minutos para propagação do DNS
3. Verifique se o domínio está apontando para o Cloudflare

### Performance Lenta

**Sintoma**: Site carrega devagar

**Soluções**:
1. Cloudflare Pages já usa CDN global automaticamente
2. Verifique se os assets estão sendo comprimidos (Vite faz isso automaticamente)
3. Verifique se está usando lazy loading de componentes
4. Use o Cloudflare Analytics para identificar gargalos

### OAuth Não Funciona

**Sintoma**: Integrações OAuth falham

**Soluções**:
1. Verifique se os Client IDs estão configurados corretamente
2. Verifique se as redirect URIs estão configuradas nas plataformas OAuth
3. Verifique se o bug do `process.env` foi corrigido (deve usar `import.meta.env`)
4. Verifique os logs do browser console para erros específicos

---

## Checklist Pós-Deploy

Após fazer o deploy, verifique:

- [ ] Site acessível via URL do Cloudflare (`https://[project-name].pages.dev`)
- [ ] SPA routing funciona (teste acessar rotas diretas como `/dashboard`)
- [ ] Variáveis de ambiente carregadas (verifique no console do browser)
- [ ] API calls funcionando (teste login ou outras chamadas)
- [ ] Autenticação funcionando (teste login/logout)
- [ ] HTTPS ativo (verifique o cadeado no browser)
- [ ] OAuth funcionando (se configurado)
- [ ] Performance adequada (teste tempo de carregamento)

---

## Recursos Úteis

- [Documentação Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Guia de Variáveis de Ambiente](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [Troubleshooting Guide](https://developers.cloudflare.com/pages/platform/troubleshooting/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

## Suporte

Se encontrar problemas não cobertos neste guia:

1. Verifique os logs do build no dashboard
2. Verifique os logs do browser console
3. Consulte a documentação oficial do Cloudflare Pages
4. Abra uma issue no repositório do projeto

---

**Última atualização**: 2025-01-27


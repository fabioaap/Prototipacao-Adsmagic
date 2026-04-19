# 🚀 Passo a Passo - Deploy no Cloudflare Pages

Este guia prático te levará através do processo de deploy do front-end no Cloudflare Pages.

## ✅ Pré-requisitos Verificados

- ✅ Repositório GitHub: `https://github.com/kennedyselect/Adsmagic-First-AI.git`
- ✅ Branch atual: `fix/bugfixes`
- ✅ Arquivos de configuração prontos
- ✅ `wrangler.toml` configurado
- ✅ `.env.example` criado
- ✅ `DEPLOY.md` com documentação completa

---

## 📋 Passo 1: Preparar o Código

### 1.1 Verificar se tudo está commitado

```bash
cd front-end
git status
```

Se houver arquivos não commitados, faça commit:

```bash
git add .
git commit -m "feat: configurar deploy automático Cloudflare Pages"
```

### 1.2 Fazer push para o GitHub

```bash
# Se estiver na branch fix/bugfixes, você pode fazer merge para main primeiro
# ou fazer deploy direto desta branch

git push origin fix/bugfixes
```

**Nota**: O Cloudflare Pages pode ser configurado para qualquer branch. Você pode:
- Fazer deploy da branch `fix/bugfixes` diretamente
- Ou fazer merge para `main` e configurar o deploy da `main`

---

## 📋 Passo 2: Criar Projeto no Cloudflare Pages

### 2.1 Acessar o Dashboard

1. Acesse: https://dash.cloudflare.com/
2. Faça login (ou crie uma conta gratuita)
3. No menu lateral, clique em **Workers & Pages**
4. Clique em **Create application**
5. Selecione **Pages** → **Connect to Git**

### 2.2 Conectar Repositório GitHub

1. Clique em **Connect to Git**
2. Se for a primeira vez, autorize o Cloudflare a acessar seu GitHub
3. Selecione o repositório: `kennedyselect/Adsmagic-First-AI`
4. Clique em **Begin setup**

### 2.3 Configurar Build Settings

Preencha os seguintes campos:

#### Project name
```
adsmagic-frontend
```
(ou qualquer nome que você preferir)

#### Production branch
```
fix/bugfixes
```
(ou `main` se você fizer merge)

#### Framework preset
```
Vite
```
(ou deixe em "None" se não aparecer a opção)

#### Build command
```
pnpm install && pnpm build
```

#### Build output directory
```
dist
```

#### Root directory (IMPORTANTE)
```
front-end
```
⚠️ **Muito importante**: Como o repositório é um monorepo, você DEVE especificar `front-end` como root directory.

### 2.4 Criar o Projeto

1. Clique em **Save and Deploy**
2. O Cloudflare começará o primeiro build automaticamente
3. Aguarde alguns minutos para o build completar

---

## 📋 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Acessar Configurações

1. No dashboard do Cloudflare Pages, vá para seu projeto
2. Clique em **Settings** (no topo)
3. No menu lateral, clique em **Environment variables**

### 3.2 Adicionar Variáveis Obrigatórias

Clique em **Add variable** para cada uma:

#### VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: Sua URL do Supabase (ex: `https://nitefyufrzytdtxhaocf.supabase.co`)
- **Environment**: Marque **Production** e **Preview**

#### VITE_SUPABASE_ANON_KEY
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Sua chave anônima do Supabase
- **Environment**: Marque **Production** e **Preview**

### 3.3 Adicionar Variáveis Opcionais (se necessário)

Se você usar OAuth ou outras features:

#### VITE_API_BASE_URL (opcional)
- **Name**: `VITE_API_BASE_URL`
- **Value**: URL da sua API (ou deixe vazio para usar fallback)
- **Environment**: Marque **Production** e **Preview**

#### Variáveis OAuth (opcionais)
- `VITE_META_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_TIKTOK_CLIENT_ID`
- `VITE_LINKEDIN_CLIENT_ID`

**Nota**: Configure apenas as que você realmente usar.

### 3.4 Salvar Variáveis

Após adicionar todas as variáveis, elas serão salvas automaticamente.

**Importante**: Após adicionar variáveis, você precisa fazer um novo deploy para que elas sejam aplicadas.

---

## 📋 Passo 4: Verificar o Deploy

### 4.1 Acompanhar o Build

1. No dashboard, vá para **Deployments**
2. Você verá o status do build:
   - ⏳ **Building**: Build em andamento
   - ✅ **Success**: Deploy concluído
   - ❌ **Failed**: Build falhou (veja logs)

### 4.2 Verificar Logs (se necessário)

Se o build falhar:

1. Clique no deployment que falhou
2. Veja a aba **Build logs**
3. Procure por erros específicos

**Erros comuns**:
- `Command not found: pnpm` → Verifique se o build command está correto
- `Missing environment variables` → Adicione as variáveis obrigatórias
- `Build output not found` → Verifique se o output directory está correto (`dist`)

### 4.3 Acessar o Site

Após o deploy bem-sucedido:

1. Você verá a URL do site: `https://adsmagic-frontend.pages.dev`
2. Clique na URL para acessar
3. Teste se o site carrega corretamente

---

## 📋 Passo 5: Testar o Site

### 5.1 Checklist de Testes

Teste os seguintes itens:

- [ ] Site carrega sem erros no console
- [ ] SPA routing funciona (tente acessar `/dashboard` diretamente)
- [ ] Autenticação funciona (teste login)
- [ ] API calls funcionam (verifique no Network tab)
- [ ] Variáveis de ambiente carregadas (verifique no console)
- [ ] HTTPS está ativo (cadeado verde no browser)

### 5.2 Testar SPA Routing

1. Acesse uma rota direta: `https://adsmagic-frontend.pages.dev/dashboard`
2. Deve carregar a página corretamente (não dar 404)
3. O arquivo `_redirects` deve estar funcionando

---

## 📋 Passo 6: Configurar Deploy Automático (Opcional)

### 6.1 Configurar Branch de Produção

1. Vá para **Settings** → **Builds & deployments**
2. Configure **Production branch** para `main` (ou a branch que você preferir)
3. Salve as alterações

### 6.2 Preview Deployments

Preview deployments são automáticos para Pull Requests:

1. Crie um Pull Request no GitHub
2. O Cloudflare Pages criará automaticamente um deployment de preview
3. A URL de preview aparecerá como comentário no PR

---

## 📋 Passo 7: Configurar Domínio Personalizado (Opcional)

### 7.1 Adicionar Domínio

1. Vá para **Settings** → **Custom domains**
2. Clique em **Set up a custom domain**
3. Digite seu domínio (ex: `app.adsmagic.com`)
4. Siga as instruções para configurar DNS

### 7.2 Configurar DNS

Você precisará adicionar um registro CNAME no seu provedor de DNS apontando para o Cloudflare Pages.

---

## 🔧 Troubleshooting

### Build Falha

**Problema**: Build mostra erro "Command not found: pnpm"

**Solução**: 
- Verifique se o build command está correto: `pnpm install && pnpm build`
- Cloudflare Pages suporta pnpm automaticamente, mas verifique a configuração

**Problema**: Build mostra erro "Missing environment variables"

**Solução**:
- Adicione as variáveis obrigatórias no dashboard
- Faça um novo deploy após adicionar variáveis

### Site Não Carrega

**Problema**: Site mostra erro ou não carrega

**Solução**:
- Verifique os logs do browser console
- Verifique se as variáveis de ambiente estão configuradas
- Verifique se o build foi bem-sucedido

### SPA Routing Não Funciona

**Problema**: Rotas diretas retornam 404

**Solução**:
- Verifique se o arquivo `public/_redirects` existe
- Verifique se o conteúdo está correto: `/* /index.html 200`
- O arquivo deve ser copiado para `dist/` durante o build

---

## 📝 Próximos Passos Após Deploy

1. **Monitorar Deployments**: Acompanhe os deployments no dashboard
2. **Configurar Analytics**: Ative Cloudflare Analytics para monitorar tráfego
3. **Otimizar Performance**: Use Cloudflare Analytics para identificar gargalos
4. **Configurar CI/CD**: O workflow do GitHub Actions já está configurado

---

## 🎉 Deploy Concluído!

Após seguir todos os passos, seu site estará disponível em:
- **URL de produção**: `https://adsmagic-frontend.pages.dev`
- **Dashboard**: https://dash.cloudflare.com/

---

## 📚 Recursos Adicionais

- [Documentação Completa](./DEPLOY.md)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Troubleshooting Guide](https://developers.cloudflare.com/pages/platform/troubleshooting/)

---

**Última atualização**: 2025-01-27


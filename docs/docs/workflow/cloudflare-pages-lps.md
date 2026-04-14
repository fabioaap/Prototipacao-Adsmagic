---
title: Handoff Cloudflare Pages para LPs
---

# Handoff de deploy das LPs no Cloudflare Pages

Este documento registra o handoff operacional para publicar as landing pages standalone do workspace no **Cloudflare Pages**, com ênfase no modelo **um projeto, paths no apex** (`adsmagic.com.br/<slug>`).

## Escopo deste handoff

As superfícies publicadas neste fluxo seguem `marketing/lps.manifest.json` (hoje: vendas no WhatsApp e agências).

Os pacotes finais são gerados a partir de `landing-pages/` e empacotados sob `deliverables/lps/<slug>/`.

## Importante: qual pasta sobe

Não use as subpastas isoladas dentro de `landing-pages/dist/<slug>` para deploy.

Essas pastas contêm apenas o `index.html`, porque o build multipage do Vite centraliza `assets/` e `img/` na raiz de `landing-pages/dist/`.

Use o empacotamento em `deliverables/lps/`: cada slug vira uma pasta com tudo que o host precisa:

- `index.html`
- `assets/`
- `img/`
- logos
- `manifest.json`
- `robots.txt`
- `sitemap.xml`
- `README-handoff.md`
- `_redirects` (raiz do site + normalização de barra final nos slugs)
- `_headers` (headers de segurança básicos no nível do site)

## Geração local dos artefatos

Na raiz do repositório:

```bash
npm install
npm install --prefix landing-pages
npm run lps:deliverables
```

(`lps:deliverables` equivale a `lps:build` + `lps:package`.)

Depois disso, a árvore pronta para publicação path-based estará em `deliverables/lps/` (vários diretórios irmãos, um por slug).

## Configuração recomendada: um projeto Pages (apex)

Projeto sugerido no painel: `adsmagic-lps` (ajuste se necessário; o mesmo nome é referenciado em `wrangler.toml` e no workflow GitHub opcional).

| Campo | Valor |
|--------|--------|
| Production branch | `main` (ou a branch oficial) |
| Framework preset | `None` |
| Root directory | **vazio** (raiz do repositório) |
| Build command | `npm install && npm install --prefix landing-pages && npm run lps:build && npm run lps:package` |
| Build output directory | `deliverables/lps` |

A pasta `deliverables/lps` já contém `vendas-whatsapp/`, `para-agencias/`, etc., no formato esperado para URLs `/<slug>/`.

### Raiz `/` e redirects

O script `landing-pages/scripts/package-lps.mjs` grava `deliverables/lps/_redirects`:

- `/` → `/<slug-da-primeira-pagina-no-manifest>/` com **301** (hoje: `/vendas-whatsapp/`). Para mudar a “home” da raiz, reordene as entradas em `marketing/lps.manifest.json` ou ajuste o script.
- Para cada LP: `/<slug>` → `/<slug>/` com **301** (evita duplicidade de URL com e sem barra final).

### Arquivos no repositório

- `wrangler.toml` — comentários com os mesmos parâmetros do painel e nome do projeto.
- `package.json` (raiz) — scripts `lps:deliverables` e `cf:pages:deploy` (deploy manual via Wrangler após build).
- `.github/workflows/deploy-lps-cloudflare.yml` — deploy manual por **workflow_dispatch**; exige secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`. **Não** use este workflow em paralelo com a integração Git do mesmo projeto no Cloudflare, para evitar deploy duplicado.

### Deploy manual (CLI)

Com token da API no ambiente:

```bash
export CLOUDFLARE_API_TOKEN=…
npm run cf:pages:deploy
```

O comando publica `deliverables/lps` no projeto `adsmagic-lps` (altere em `package.json` / workflow se o nome no painel for outro).

## Apontamento de domínio (DNS)

Depois que o primeiro deploy concluir no Pages:

1. No projeto Pages: **Custom domains** → adicionar `adsmagic.com.br` e, se aplicável, `www.adsmagic.com.br`.
2. No DNS da zona Cloudflare (ou outro provedor), seguir as instruções do painel (CNAME para `*.pages.dev` ou registros indicados).
3. Aguardar emissão de certificado TLS (automático).
4. Validar `https://adsmagic.com.br/` (redirect para a LP principal) e cada `https://adsmagic.com.br/<slug>/`.

## Por que o root directory do Pages fica na raiz do repo

O output final está em `deliverables/`, na raiz do workspace. Se o projeto Pages usar `landing-pages/` como root, o diretório de output `deliverables/lps` ficará fora da árvore que o build enxerga e o deploy falha ou publica arquivos errados.

## Alternativa: dois projetos Pages (uma LP cada)

Útil apenas se cada LP tiver domínio próprio ou ciclo de deploy isolado.

- Root directory: vazio (raiz do repositório)
- Mesmo build command acima
- Build output directory: `deliverables/lps/vendas-whatsapp` ou `deliverables/lps/para-agencias` conforme o projeto

Nesse modo, `_redirects` na raiz de cada pacote não se aplica da mesma forma que no modelo path-based; prefira o modelo de **um projeto** para apex com vários paths.

## Alternativa: Direct Upload

- **Um projeto path-based:** subir o conteúdo de `deliverables/lps` inteiro (incluindo `_redirects` e `_headers`).
- **Dois projetos separados:** subir cada `deliverables/lps/<slug>` isoladamente.

## Domínios e URLs canônicas

As URLs canônicas no manifest são paths no domínio raiz, por exemplo:

- `https://adsmagic.com.br/vendas-whatsapp`
- `https://adsmagic.com.br/para-agencias`

### Alternativa: dois projetos com subdomínios

Se, por questão operacional, forem usados dois projetos separados no Cloudflare Pages, os domínios seriam:

- `vendas.adsmagic.com.br`
- `agencias.adsmagic.com.br`

Nesse caso, as `canonicalUrl` no manifest e as tags `<link rel="canonical">`, `og:url` e sitemap.xml nos HTMLs **devem ser atualizadas** para refletir os subdomínios, caso contrário haverá conflito de canonical.

## Checklist pós-deploy

Validar no projeto Pages (path-based no apex):

1. `https://<domínio>/` redireciona (301) para a LP principal; cada `https://<domínio>/<slug>/` abre sem 404
2. carregamento de `assets/` e `img/`
3. hero, logos e imagens internas
4. CTA principal e CTA de login
5. links legais: privacidade, cookies e termos
6. hashes de navegação interna, quando existirem
7. domínio customizado e SSL emitido
8. `robots.txt` acessível em `/<slug>/robots.txt`
9. `sitemap.xml` acessível e com `<loc>` apontando para a canonical correta
10. tags `<title>`, `<meta name="description">` e `<link rel="canonical">` com conteúdo SEO
11. Open Graph: `og:title`, `og:description`, `og:url`, `og:image` sem 404
12. JSON-LD: validar com [Rich Results Test](https://search.google.com/test/rich-results)

## Limite deste handoff

Este handoff cobre apenas as LPs standalone.

O app principal em `Plataforma/` e o portal Docusaurus em `docs/` ainda exigem revisão específica de base path para publicação no Cloudflare Pages, porque hoje possuem comportamento condicionado a `process.env.CI`.

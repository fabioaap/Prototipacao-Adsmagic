---
title: Handoff Cloudflare Pages para LPs
---

# Handoff de deploy das LPs no Cloudflare Pages

Este documento registra o handoff operacional para publicar as duas landing pages standalone do workspace em **dois projetos separados** no Cloudflare Pages.

## Escopo deste handoff

As duas superfícies publicadas neste fluxo são:

- `lp-vendas-whatsapp`
- `lp-para-agencias`

Os pacotes finais usados no deploy são gerados a partir de `landing-pages/` e empacotados em:

- `deliverables/lps/vendas-whatsapp`
- `deliverables/lps/para-agencias`

## Importante: qual pasta sobe

Não use as subpastas isoladas dentro de `landing-pages/dist/<slug>` para deploy separado.

Essas pastas contêm apenas o `index.html`, porque o build multipage do Vite centraliza `assets/` e `img/` na raiz de `landing-pages/dist/`.

Para publicar **uma LP por projeto**, use sempre os diretórios empacotados em `deliverables/lps/<slug>`, porque eles já trazem:

- `index.html`
- `assets/`
- `img/`
- logos
- `manifest.json`
- `robots.txt`
- `sitemap.xml`
- `README-handoff.md`

## Geração local dos artefatos

Na raiz do repositório:

```bash
npm install
npm install --prefix landing-pages
npm run lps:build
npm run lps:package
```

Depois disso, os diretórios prontos para publicação estarão em `deliverables/lps/`.

## Configuração do projeto 1 no Cloudflare Pages

Projeto sugerido: `lp-vendas-whatsapp`

Configuração:

- Production branch: `main` ou a branch oficial de publicação
- Framework preset: `None`
- Root directory: vazio, usando a raiz do repositório
- Build command:

```bash
npm install && npm install --prefix landing-pages && npm run lps:build && npm run lps:package
```

- Build output directory:

```text
deliverables/lps/vendas-whatsapp
```

## Configuração do projeto 2 no Cloudflare Pages

Projeto sugerido: `lp-para-agencias`

Configuração:

- Production branch: `main` ou a branch oficial de publicação
- Framework preset: `None`
- Root directory: vazio, usando a raiz do repositório
- Build command:

```bash
npm install && npm install --prefix landing-pages && npm run lps:build && npm run lps:package
```

- Build output directory:

```text
deliverables/lps/para-agencias
```

## Por que o root directory fica na raiz

Neste handoff, o output final está em `deliverables/`, que é gerado na raiz do workspace.

Se o projeto do Cloudflare Pages usar `landing-pages/` como root directory neste cenário de duas Pages separadas, o output configurado ficará fora da área esperada do build e o deploy fica inconsistente.

Para dois projetos separados, mantenha o root directory na raiz e publique a pasta final dentro de `deliverables/lps/<slug>`.

## Alternativa: Direct Upload

Se a publicação for feita por upload direto em vez de integração com Git:

- projeto da LP de vendas: subir o conteúdo de `deliverables/lps/vendas-whatsapp`
- projeto da LP de agências: subir o conteúdo de `deliverables/lps/para-agencias`

## Domínios e URLs canônicas

As URLs canônicas registradas no manifest são baseadas em path no domínio raiz:

- `https://adsmagic.com.br/vendas-whatsapp`
- `https://adsmagic.com.br/para-agencias`

Esse modelo concentra toda a autoridade de domínio em `adsmagic.com.br`.

### Deploy path-based (recomendado)

Para servir ambas as LPs sob o mesmo domínio com paths, use **um único projeto** no Cloudflare Pages. A estrutura de output já fornece as pastas com os slugs corretos — basta compor a raiz de publicação com os dois diretórios:

```text
publish-root/
  vendas-whatsapp/
    index.html, assets/, img/, robots.txt, sitemap.xml …
  para-agencias/
    index.html, assets/, img/, robots.txt, sitemap.xml …
```

### Alternativa: dois projetos com subdomínios

Se, por questão operacional, forem usados dois projetos separados no Cloudflare Pages, os domínios seriam:

- `vendas.adsmagic.com.br`
- `agencias.adsmagic.com.br`

Nesse caso, as `canonicalUrl` no manifest e as tags `<link rel="canonical">`, `og:url` e sitemap.xml nos HTMLs **devem ser atualizadas** para refletir os subdomínios, caso contrário haverá conflito de canonical.

## Checklist pós-deploy

Validar em cada projeto:

1. abertura da home sem erro 404
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

O workspace principal agora pode ser publicado em um projeto separado do Cloudflare Pages com `npm run build` na raiz e `dist` como output directory. Ainda assim, esse fluxo continua independente das LPs standalone documentadas aqui.
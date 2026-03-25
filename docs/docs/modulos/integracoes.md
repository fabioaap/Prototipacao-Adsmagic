---
title: Integrações
---

# Integrações

**Rota:** `/pt/projects/:projectId/integrations`

O módulo de Integrações conecta o projeto Adsmagic com canais externos de mídia, captação e rastreamento. Está organizado em três abas.

---

## Componentes visuais

### Métricas + abas de navegação

![Integrações — abas](/img/screens/adsmagic/integracoes-tabs.png)

Cards de resumo no topo:

- **Integrações conectadas**: total de canais ativos
- **Plataformas suportadas**: total de plataformas disponíveis
- Botão **Atualizar** para re-sincronizar status

---

## Aba 1 — Site

Configuração do **pixel/tag de rastreamento** que deve ser instalado no site do cliente.

![Aba Site — Tag de Rastreamento anotada](/img/screens/adsmagic/integracoes-site-annotated.png)

### Funcionalidades

- Exibe o snippet de código JavaScript para instalação no `<head>` do site
- Status da instalação: **Não Instalado / Instalado**
- Botão **Copiar** código
- Instruções de instalação passo a passo
- Botão **"Verificar instalação"**: health-check para confirmar que o pixel está disparando

---

## Aba 2 — Canais

Conexão com as plataformas de anúncios e comunicação.

![Aba Canais](/img/screens/adsmagic/integracoes-canais.png)

| Canal | Método de autenticação | O que habilita |
|-------|------------------------|----------------|
| **Meta Ads** | OAuth (Flow completo — redirect + callback) | Módulo Campanhas Meta Ads, importação de eventos |
| **WhatsApp** | API Key / QR Code | Módulo Mensagens |
| **Google Ads** | OAuth (Google OAuth 2.0) | Módulo Campanhas Google Ads |

- Cada canal exibe seu status de conexão (conectado / desconectado)
- Para Meta e Google, o clique em "Conectar" abre o fluxo OAuth no provedor
- Para WhatsApp, a configuração exige apiKey ou scan de QR code

---

## Aba 3 — Anúncios

Configuração dos **templates de rastreamento UTM** para anúncios.

![Aba Anúncios — UTM Templates](/img/screens/adsmagic/integracoes-anuncios.png)

| Plataforma | O que configura |
|------------|----------------|
| **Google Ads** | Template de URL final com parâmetros UTM automáticos |
| **Meta Ads** | Parâmetro de URL para rastrear cliques do Facebook/Instagram |

---

## Callbacks configurados

| Callback | Rota | Plataforma |
|----------|------|-----------|
| Meta OAuth | `/pt/integrations/meta/oauth/callback` | Meta/Facebook |
| Google OAuth | `/pt/integrations/google/oauth/callback` | Google |
| TikTok OAuth | `/pt/integrations/tiktok/oauth/callback` | TikTok |

## Estado atual (As-Is)

- Meta e Google estão com OAuth funcional.
- TikTok tem callback configurado, mas a integração pode estar em fase de desenvolvimento.
- A tag de site é um snippet JavaScript; não há plugin nativo para CMS (WordPress, Shopify, etc.) na versão atual.

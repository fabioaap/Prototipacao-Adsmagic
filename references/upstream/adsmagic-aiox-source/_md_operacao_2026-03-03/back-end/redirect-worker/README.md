# AdsMagic Redirect Worker (`r.adsmagic.com.br`)

Worker de borda que faz proxy de `https://r.adsmagic.com.br/*` para a Edge Function pública `redirect` no Supabase.

## Objetivo

1. Manter URL canônica curta para tracking (`/link_id`).
2. Preservar comportamento do upstream (`302`, `Location`, `Set-Cookie`).
3. Centralizar controle de borda (timeout, logs, host guard).

## Pré-requisitos

1. Zona `adsmagic.com.br` ativa no Cloudflare.
2. `wrangler` autenticado (`wrangler login`).
3. Permissão de edição de Workers e DNS.

## Configuração local

```bash
cd back-end/redirect-worker
npm install
```

Executar local:

```bash
npm run dev
```

## Deploy manual

1. Deploy:

```bash
cd back-end/redirect-worker
npm run deploy
```

## DNS e Route (`r.adsmagic.com.br`)

1. Criar registro DNS na zona `adsmagic.com.br`:
   - Tipo: `CNAME`
   - Nome: `r`
   - Target: qualquer host válido (ex.: `<worker-name>.<subdomain>.workers.dev`)
   - Proxy status: `Proxied` (laranja)
2. Garantir route do Worker:
   - `r.adsmagic.com.br/*`

O `wrangler.toml` já define a route; o DNS precisa existir e estar proxied para o tráfego cair no Worker Route.

## Variáveis

`wrangler.toml`:

1. `ALLOWED_HOST` (default `r.adsmagic.com.br`)
2. `UPSTREAM_TIMEOUT_MS` (default `8000`)

Secret:

1. Nenhum secret obrigatório para o redirect (somente vars públicas).

## Observabilidade

Logs estruturados com:

1. `requestId`
2. `routeKey`
3. `upstreamStatus`
4. `latencyMs`

Tail de logs:

```bash
npm run tail
```

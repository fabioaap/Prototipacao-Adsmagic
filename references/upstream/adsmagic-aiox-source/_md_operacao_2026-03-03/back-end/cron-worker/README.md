# AdsMagic Job Trigger - Cloudflare Worker

Cloudflare Worker que triggera o `job-worker` do Supabase a cada minuto para processar jobs pendentes.

## Setup

### 1. Instalar dependências

```bash
cd back-end/cron-worker
npm install
```

### 2. Configurar secrets

```bash
# URL do Supabase
wrangler secret put SUPABASE_URL
# Cole: https://nitefyufrzytdtxhaocf.supabase.co

# Service Role Key (NÃO use a anon key)
wrangler secret put SERVICE_ROLE_KEY
# Cole a service_role key do Supabase Dashboard
```

### 3. Deploy

```bash
wrangler deploy
```

## Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Info do worker |
| `/health` | GET | Health check |
| `/trigger` | POST | Trigger manual (requer auth) |
| `/stats` | GET | Estatísticas do job worker |

## Cron

O worker é executado automaticamente a cada minuto (`* * * * *`).

Você pode verificar os logs com:

```bash
wrangler tail
```

## Desenvolvimento Local

```bash
wrangler dev
```

## Monitoramento

### Ver logs em tempo real

```bash
wrangler tail
```

### Ver estatísticas

```bash
curl https://adsmagic-job-trigger.<seu-subdomain>.workers.dev/stats
```

## Troubleshooting

### Worker não está executando

1. Verifique se o deploy foi bem-sucedido: `wrangler deploy`
2. Verifique os logs: `wrangler tail`
3. Verifique se os secrets estão configurados: `wrangler secret list`

### Erro de autenticação

1. Verifique se o SERVICE_ROLE_KEY está correto
2. Verifique se a Edge Function `job-worker` está deployada no Supabase

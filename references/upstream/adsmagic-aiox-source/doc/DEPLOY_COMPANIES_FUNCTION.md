# Deploy do Edge Function `companies`

## Status
✅ **CONCLUÍDO** - Edge Function deployado via MCP Supabase em 25/10/2024

**Detalhes do Deploy:**
- ID: `7b73108b-3dba-4007-9fbf-fecfd094618c`
- Versão: v1
- Status: ACTIVE
- Endpoint: `https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/companies`

## Causa do Problema
O erro `404 NOT FOUND` em `/companies` ocorre porque o Edge Function `companies` não está deployado no Supabase. Atualmente, apenas o Edge Function `projects` está deployado.

## Solução: Deploy Manual

### Opção 1: Deploy via Supabase CLI (Recomendado)

```bash
# 1. Garantir que Docker Desktop está rodando
# 2. Deploy do Edge Function
cd back-end
supabase functions deploy companies

# 3. Verificar deploy
supabase functions list
```

**Saída esperada:**
```
│ companies   │ v1     │ ACTIVE │
```

### Opção 2: Deploy via Dashboard Supabase

1. Acesse: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf/functions
2. Clique em "Deploy new function"
3. Nome: `companies`
4. Cole o conteúdo de `back-end/supabase/functions/companies/index.ts`
5. Adicione os arquivos de dependência nos subdiretórios
6. Clique em "Deploy"

### Opção 3: Script de Deploy Automatizado

Criar script `deploy-companies.sh`:

```bash
#!/bin/bash
cd back-end
supabase functions deploy companies --no-verify-jwt
```

## Estrutura de Arquivos

O Edge Function `companies` requer:

```
companies/
├── index.ts              # Entry point
├── types.ts              # TypeScript types
├── utils/
│   ├── cors.ts          # CORS headers
│   └── response.ts      # Response helpers
├── validators/
│   └── company.ts       # Zod validators
└── handlers/
    ├── create.ts        # POST /companies
    ├── list.ts          # GET /companies
    ├── get.ts           # GET /companies/:id
    ├── update.ts        # PATCH /companies/:id
    └── delete.ts        # DELETE /companies/:id
```

## Teste Pós-Deploy

```bash
# Obter token de autenticação
TOKEN="seu_access_token_aqui"

# Testar listagem de empresas
curl -X GET \
  https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Resposta esperada: 200 OK com array de empresas
```

## Verificação

Após o deploy, verifique logs:

```bash
supabase functions logs companies --follow
```

## Problemas Conhecidos

- Docker Desktop deve estar rodando para deploy via CLI
- Verificar se arquivo `index.ts` não tem erros de sintaxe
- Confirmar que todos os imports estão corretos

## Rollback

Se o deploy causar problemas:

```bash
# Listar versões
supabase functions versions companies

# Deletar versão problemática
supabase functions delete companies --version 1
```

## Próximos Passos

Após deploy bem-sucedido:
1. Testar criação de empresa via frontend
2. Verificar logs de erro no Supabase Dashboard
3. Validar que CORS está funcionando
4. Confirmar que autenticação JWT está sendo aceita

# Fix: Erro ao carregar empresas

## 🔴 Problema

~~O Edge Function `companies` não está deployado no Supabase.~~

## ✅ Status: RESOLVIDO

Edge Function `companies` foi deployado com sucesso via MCP Supabase.

**Detalhes do Deploy:**
- ID: `7b73108b-3dba-4007-9fbf-fecfd094618c`
- Versão: v1
- Status: ACTIVE
- Data: 25/10/2024

**Evidência:**
- Logs mostram `OPTIONS /companies` retornando 404
- Erro CORS porque o preflight falha (endpoint não existe)
- Frontend tenta carregar empresas mas API retorna 404

## 🔧 Solução

### Opção 1: Deploy do Edge Function (Recomendado)

```bash
# Requer Docker Desktop em execução
cd back-end
supabase functions deploy companies
```

**Verificar deploy:**
- Ir para Dashboard Supabase → Edge Functions
- Confirmar que `companies` está listado como `ACTIVE`

### Opção 2: Workaround Temporário

Se não puder fazer deploy agora, modificar o frontend para:

1. **Criar empresa via Supabase direto** (via SQL ou Dashboard)
2. **Usar dados mockados** para desenvolvimento local
3. **Redirecionar direto para onboarding** se sem empresa

## 📋 Plano de Rollback

Se o deploy causar problemas:

1. Reverter para versão anterior via Dashboard Supabase
2. Desabilitar Edge Function temporariamente
3. Usar dados mockados no frontend

## ✅ Teste Pós-Deploy

```bash
# Testar endpoint
curl https://nitefyufrzytdtxhaocf.supabase.co/functions/v1/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Resposta esperada: `200 OK` com lista de empresas

## 📝 Arquivos Alterados

- `front-end/src/views/projects/ProjectsView.vue` - Melhor tratamento de erro
- `front-end/src/stores/companies.ts` - Retorna array vazio em caso de erro

## 🚨 Impacto

- **Crítico**: Usuários não conseguem acessar projetos
- **Workaround**: Redirecionar para onboarding
- **Solução definitiva**: Deploy do Edge Function `companies`

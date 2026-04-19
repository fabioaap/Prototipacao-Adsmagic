# 🧪 Guia de Testes - Postman

**Versão**: 1.0  
**Data**: 2025-01-28  
**Autor**: Especialista Backend  
**Status**: Guia Completo de Testes

---

## 📋 Índice

1. [Configuração Inicial](#1-configuração-inicial)
2. [Obter Token JWT](#2-obter-token-jwt)
3. [Configurar Postman](#3-configurar-postman)
4. [Testar Endpoints](#4-testar-endpoints)
5. [Exemplos de Requisições](#5-exemplos-de-requisições)

---

## 1. Configuração Inicial

### **Informações do Projeto Supabase**

- **URL do Projeto**: `https://nitefyufrzytdtxhaocf.supabase.co`
- **URL Base das Edge Functions**: `https://nitefyufrzytdtxhaocf.supabase.co/functions/v1`
- **Autenticação**: JWT obrigatório em todos os endpoints
- **Formato do Token**: `Bearer {token}`

### **Endpoints Disponíveis**

| Edge Function | Base URL |
|---------------|----------|
| Projects | `/functions/v1/projects` |
| Companies | `/functions/v1/companies` |
| Contacts | `/functions/v1/contacts` |
| Integrations | `/functions/v1/integrations` |
| Dashboard | `/functions/v1/dashboard` |
| Messaging | `/functions/v1/messaging` |

> **📱 Para testes detalhados de Mensageria**, consulte: [`TESTE_ENDPOINTS_MENSAGERIA.md`](./TESTE_ENDPOINTS_MENSAGERIA.md)

---

## 2. Obter Token JWT

### **Opção 1: Via Supabase Dashboard (Recomendado para Testes)**

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto: `nitefyufrzytdtxhaocf`
3. Vá em **Authentication** → **Users**
4. Crie um novo usuário ou use um existente
5. Copie o **Access Token** (JWT) do usuário

### **⚠️ IMPORTANTE: Header `apikey` Obrigatório**

A API de autenticação do Supabase (`/auth/v1/*`) **requer obrigatoriamente** o header `apikey` com a chave anônima do projeto. Sem este header, você receberá o erro:

```json
{
  "message": "No API key found in request",
  "hint": "No `apikey` request header or url param was found."
}
```

**Como Obter a Chave Anônima:**

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie a **`anon` `public`** key (chave anônima)
5. Configure no Postman Environment como variável `{{anon_key}}`

**⚠️ SEGURANÇA**: Nunca commite chaves em código. Use variáveis de ambiente.

### **Opção 2: Via API REST do Supabase**

#### **2.1. Criar Usuário (Sign Up)**

```http
POST https://nitefyufrzytdtxhaocf.supabase.co/auth/v1/signup
Content-Type: application/json
apikey: {{anon_key}}

{
  "email": "teste@example.com",
  "password": "SenhaSegura123!",
  "data": {
    "first_name": "Teste",
    "last_name": "Usuario"
  }
}
```

**⚠️ IMPORTANTE**: A API de autenticação do Supabase (`/auth/v1/*`) **requer** o header `apikey` com a chave anônima do projeto. Sem este header, você receberá o erro: `"No API key found in request"`.

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "teste@example.com"
  }
}
```

#### **2.2. Fazer Login (Sign In)**

```http
POST https://nitefyufrzytdtxhaocf.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json
apikey: {{anon_key}}

{
  "email": "teste@example.com",
  "password": "SenhaSegura123!"
}
```

**⚠️ IMPORTANTE**: A API de autenticação do Supabase (`/auth/v1/*`) **requer** o header `apikey` com a chave anônima do projeto. Sem este header, você receberá o erro: `"No API key found in request"`.

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "teste@example.com"
  }
}
```

#### **2.3. Refresh Token (Renovar Token)**

```http
POST https://nitefyufrzytdtxhaocf.supabase.co/auth/v1/token?grant_type=refresh_token
Content-Type: application/json
apikey: {{anon_key}}

{
  "refresh_token": "seu-refresh-token-aqui"
}
```

**⚠️ IMPORTANTE**: A API de autenticação do Supabase (`/auth/v1/*`) **requer** o header `apikey` com a chave anônima do projeto.

---

## 3. Configurar Postman

### **3.1. Importar Collection e Environment (Método Rápido)**

1. Abra o **Postman**
2. Clique em **Import** (canto superior esquerdo)
3. Arraste os arquivos ou clique em **Upload Files**:
   - `Adsmagic_Backend_API.postman_collection.json` (Collection)
   - `Adsmagic_Backend_Environment.postman_environment.json` (Environment)
4. Clique em **Import**
5. Selecione o environment `Adsmagic Backend - Local` no canto superior direito

### **3.2. Configurar Variáveis de Ambiente (Manual)**

Se preferir criar manualmente:

1. Clique em **Environments** → **+** (Criar novo ambiente)
2. Nome: `Adsmagic Backend - Local`
3. Adicione as seguintes variáveis:

| Variável | Valor Inicial | Descrição |
|----------|---------------|-----------|
| `base_url` | `https://nitefyufrzytdtxhaocf.supabase.co` | URL base do Supabase |
| `functions_url` | `https://nitefyufrzytdtxhaocf.supabase.co/functions/v1` | URL das Edge Functions |
| `jwt_token` | (deixe vazio) | Token JWT (será preenchido após login) |
| `refresh_token` | (deixe vazio) | Refresh token (será preenchido após login) |
| `user_id` | (deixe vazio) | ID do usuário autenticado |
| `company_id` | (deixe vazio) | ID da empresa (será preenchido após criar) |
| `project_id` | (deixe vazio) | ID do projeto (será preenchido após criar) |
| `contact_id` | (deixe vazio) | ID do contato (será preenchido após criar) |
| `origin_id` | (deixe vazio) | ID da origem (será preenchido após buscar) |
| `stage_id` | (deixe vazio) | ID do estágio (será preenchido após buscar) |
| `integration_id` | (deixe vazio) | ID da integração (será preenchido após criar) |
| `messaging_account_id` | (deixe vazio) | ID da conta de mensageria (será preenchido após criar conta no banco) |
| `messaging_phone_to` | (deixe vazio) | Número de destino para testes de mensageria (formato: 5511999999999) |
| `anon_key` | (configure manualmente) | Chave anônima do Supabase (obrigatória para Auth/REST API). Obtenha em: Settings → API → `anon` `public` key |

### **3.3. Verificar Configuração**

Após importar:
- ✅ Collection `Adsmagic Backend API` deve aparecer na lista
- ✅ Environment `Adsmagic Backend - Local` deve estar selecionado
- ✅ Variáveis `base_url` e `functions_url` devem estar preenchidas

---

## 4. Exemplos de Requisições

### **📁 COMPANIES - Empresas**

#### **4.1. Criar Empresa**

```http
POST {{functions_url}}/companies
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "name": "Empresa Teste LTDA",
  "description": "Empresa de teste para validação",
  "country": "BR",
  "currency": "BRL",
  "timezone": "America/Sao_Paulo",
  "industry": "Tecnologia",
  "size": "small",
  "website": "https://empresa-teste.com.br"
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    const data = pm.response.json();
    pm.environment.set("company_id", data.id);
    console.log("✅ Empresa criada:", data.id);
}
```

#### **4.2. Listar Empresas**

```http
GET {{functions_url}}/companies?limit=10&offset=0
Authorization: Bearer {{jwt_token}}
```

#### **4.3. Obter Empresa Específica**

```http
GET {{functions_url}}/companies/{{company_id}}
Authorization: Bearer {{jwt_token}}
```

#### **4.4. Atualizar Empresa**

```http
PATCH {{functions_url}}/companies/{{company_id}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "name": "Empresa Teste Atualizada",
  "description": "Nova descrição",
  "industry": "Marketing Digital"
}
```

#### **4.5. Deletar Empresa**

```http
DELETE {{functions_url}}/companies/{{company_id}}
Authorization: Bearer {{jwt_token}}
```

---

### **📁 PROJECTS - Projetos**

#### **4.6. Criar Projeto**

```http
POST {{functions_url}}/projects
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "company_id": "{{company_id}}",
  "created_by": "{{user_id}}",
  "name": "Projeto Teste",
  "description": "Projeto de teste para validação",
  "company_type": "individual",
  "country": "BR",
  "language": "pt",
  "currency": "BRL",
  "timezone": "America/Sao_Paulo",
  "attribution_model": "first_touch",
  "status": "draft"
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    const data = pm.response.json();
    pm.environment.set("project_id", data.id);
    console.log("✅ Projeto criado:", data.id);
}
```

#### **4.7. Listar Projetos**

```http
GET {{functions_url}}/projects?status=draft&limit=10&offset=0
Authorization: Bearer {{jwt_token}}
```

**Query Parameters:**
- `status`: `draft`, `active`, `paused`, `archived` (opcional)
- `search`: string de busca (opcional)
- `sort`: `created_at`, `name_asc`, `name_desc` (opcional)
- `limit`: número (1-100, padrão: 50)
- `offset`: número (padrão: 0)

#### **4.8. Obter Projeto Específico**

```http
GET {{functions_url}}/projects/{{project_id}}
Authorization: Bearer {{jwt_token}}
```

#### **4.9. Atualizar Projeto**

```http
PATCH {{functions_url}}/projects/{{project_id}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "name": "Projeto Atualizado",
  "status": "active",
  "description": "Nova descrição do projeto"
}
```

#### **4.10. Completar Wizard do Projeto**

```http
PATCH {{functions_url}}/projects/{{project_id}}/complete
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "wizard_completed_at": "2025-01-28T10:00:00Z"
}
```

#### **4.11. Deletar Projeto**

```http
DELETE {{functions_url}}/projects/{{project_id}}
Authorization: Bearer {{jwt_token}}
```

---

### **📁 CONTACTS - Contatos**

#### **4.12. Obter Origens do Sistema (Pré-requisito)**

Primeiro, você precisa obter IDs de `origins` e `stages`. Use o Supabase Dashboard ou crie uma query SQL:

```sql
-- Listar origens do sistema
SELECT id, name, type, color, icon 
FROM origins 
WHERE type = 'system' 
ORDER BY name;

-- Listar estágios (você precisará criar estágios primeiro)
SELECT id, name, type, display_order 
FROM stages 
WHERE project_id = 'seu-project-id' OR project_id IS NULL
ORDER BY display_order;
```

**Ou via API REST:**
```http
GET {{base_url}}/rest/v1/origins?type=eq.system
Authorization: Bearer {{jwt_token}}
apikey: {{anon_key}}
```

**⚠️ NOTA**: A API REST do Supabase (`/rest/v1/*`) também requer o header `apikey`.

#### **4.13. Criar Contato**

```http
POST {{functions_url}}/contacts
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "project_id": "{{project_id}}",
  "name": "João Silva",
  "phone": "11987654321",
  "country_code": "55",
  "email": "joao.silva@example.com",
  "company": "Empresa ABC",
  "location": "São Paulo, SP",
  "notes": "Cliente interessado em produto X",
  "is_favorite": false,
  "main_origin_id": "{{origin_id}}",
  "current_stage_id": "{{stage_id}}",
  "metadata": {
    "source": "website",
    "campaign": "summer-2025"
  }
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    const data = pm.response.json();
    pm.environment.set("contact_id", data.id);
    console.log("✅ Contato criado:", data.id);
}
```

#### **4.14. Listar Contatos**

```http
GET {{functions_url}}/contacts?project_id={{project_id}}&limit=10&offset=0
Authorization: Bearer {{jwt_token}}
```

**Query Parameters:**
- `project_id`: UUID do projeto (opcional)
- `search`: string de busca full-text (opcional)
- `origin_id`: UUID da origem (opcional)
- `stage_id`: UUID do estágio (opcional)
- `is_favorite`: `true` ou `false` (opcional)
- `sort`: `created_at`, `name_asc`, `name_desc`, `updated_at` (opcional)
- `limit`: número (1-100, padrão: 50)
- `offset`: número (padrão: 0)

**Exemplo com busca:**
```http
GET {{functions_url}}/contacts?search=joão&project_id={{project_id}}
Authorization: Bearer {{jwt_token}}
```

**Exemplo com filtros:**
```http
GET {{functions_url}}/contacts?project_id={{project_id}}&origin_id={{origin_id}}&stage_id={{stage_id}}&is_favorite=true
Authorization: Bearer {{jwt_token}}
```

#### **4.15. Obter Contato Específico**

```http
GET {{functions_url}}/contacts/{{contact_id}}
Authorization: Bearer {{jwt_token}}
```

#### **4.16. Atualizar Contato**

```http
PATCH {{functions_url}}/contacts/{{contact_id}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "name": "João Silva Atualizado",
  "email": "joao.silva.novo@example.com",
  "is_favorite": true,
  "notes": "Cliente VIP - atualizado em 2025-01-28"
}
```

#### **4.17. Atualizar Estágio do Contato**

```http
PATCH {{functions_url}}/contacts/{{contact_id}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "current_stage_id": "{{stage_id}}"
}
```

**Nota**: O histórico de mudanças de estágio é registrado automaticamente via trigger.

#### **4.18. Deletar Contato**

```http
DELETE {{functions_url}}/contacts/{{contact_id}}
Authorization: Bearer {{jwt_token}}
```

---

### **📁 INTEGRATIONS - Integrações**

#### **4.19. Listar Integrações**

```http
GET {{functions_url}}/integrations?project_id={{project_id}}
Authorization: Bearer {{jwt_token}}
```

#### **4.20. Iniciar OAuth (Meta Ads)**

```http
POST {{functions_url}}/integrations/oauth/meta
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "project_id": "{{project_id}}",
  "redirect_uri": "https://seu-app.com/oauth/callback"
}
```

---

### **📁 DASHBOARD - Analytics**

#### **4.21. Obter Métricas Gerais**

```http
GET {{functions_url}}/dashboard/metrics?project_id={{project_id}}
Authorization: Bearer {{jwt_token}}
```

#### **4.22. Obter Performance por Origem**

```http
GET {{functions_url}}/dashboard/origin-performance?project_id={{project_id}}
Authorization: Bearer {{jwt_token}}
```

#### **4.23. Obter Séries Temporais**

```http
GET {{functions_url}}/dashboard/time-series?project_id={{project_id}}&start_date=2025-01-01&end_date=2025-01-28
Authorization: Bearer {{jwt_token}}
```

---

## 5. Testes de Erros

### **5.1. Testar Autenticação (401)**

```http
GET {{functions_url}}/projects
# Sem header Authorization
```

**Resposta Esperada:**
```json
{
  "error": "Unauthorized: Missing Authorization header"
}
```

### **5.2. Testar Token Inválido (401)**

```http
GET {{functions_url}}/projects
Authorization: Bearer token-invalido-123
```

**Resposta Esperada:**
```json
{
  "error": "Unauthorized: Invalid or expired token"
}
```

### **5.3. Testar Validação (400)**

```http
POST {{functions_url}}/contacts
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "name": "A",  // Muito curto (mínimo 2 caracteres)
  "phone": "123"  // Formato inválido
}
```

**Resposta Esperada:**
```json
{
  "error": "Validation failed",
  "details": [
    "name: Name must be at least 2 characters",
    "phone: Phone must be 8-15 digits"
  ]
}
```

### **5.4. Testar Recurso Não Encontrado (404)**

```http
GET {{functions_url}}/projects/00000000-0000-0000-0000-000000000000
Authorization: Bearer {{jwt_token}}
```

**Resposta Esperada:**
```json
{
  "error": "Project not found"
}
```

### **5.5. Testar Permissão Negada (403)**

```http
DELETE {{functions_url}}/companies/{{company_id}}
Authorization: Bearer {{jwt_token}}
# Se o usuário não for owner/admin
```

**Resposta Esperada:**
```json
{
  "error": "Permission denied - check RLS policies"
}
```

---

## 6. CORS Preflight (OPTIONS)

Todos os endpoints suportam CORS preflight:

```http
OPTIONS {{functions_url}}/projects
```

**Resposta Esperada:**
- Status: `200 OK`
- Headers CORS configurados

---

## 7. Scripts de Teste Automatizados (Postman)

### **7.1. Teste de Status Code**

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Status code is 201 (Created)", function () {
    pm.response.to.have.status(201);
});
```

### **7.2. Teste de Estrutura de Resposta**

```javascript
pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('name');
    pm.expect(jsonData).to.have.property('created_at');
});
```

### **7.3. Teste de Validação**

```javascript
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

### **7.4. Teste de Headers**

```javascript
pm.test("Content-Type is application/json", function () {
    pm.response.to.have.header("Content-Type");
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

pm.test("CORS headers are present", function () {
    pm.response.to.have.header("Access-Control-Allow-Origin");
    pm.response.to.have.header("Access-Control-Allow-Methods");
});
```

---

## 8. Fluxo Completo de Teste

### **Sequência Recomendada:**

1. **Login** → Obter JWT token
2. **Criar Empresa** → Obter `company_id`
3. **Criar Projeto** → Obter `project_id`
4. **Buscar Origens** → Obter `origin_id` (origens do sistema)
5. **Criar Estágio** → Obter `stage_id` (se necessário)
6. **Criar Contato** → Obter `contact_id`
7. **Listar Contatos** → Verificar busca e filtros
8. **Atualizar Contato** → Testar mudança de estágio
9. **Deletar Contato** → Limpeza

---

## 9. Troubleshooting

### **Erro: "No API key found in request"**

**Sintoma:**
```json
{
  "message": "No API key found in request",
  "hint": "No `apikey` request header or url param was found."
}
```

**Causa:** A API de autenticação (`/auth/v1/*`) e REST API (`/rest/v1/*`) do Supabase requerem o header `apikey` com a chave anônima do projeto.

**Solução:**
1. Obtenha a chave anônima no Supabase Dashboard (Settings → API → `anon` `public` key)
2. Configure a variável `anon_key` no Postman Environment
3. No Postman, verifique se a variável `{{anon_key}}` está preenchida no environment
4. Adicione o header `apikey: {{anon_key}}` nas requisições Auth/REST API
5. Verifique se o header `apikey` está presente na requisição

**⚠️ IMPORTANTE**: Nunca commite chaves. Configure apenas localmente ou via variáveis de ambiente seguras.

**Nota:** As Edge Functions (`/functions/v1/*`) **NÃO** requerem o header `apikey`, apenas `Authorization: Bearer {token}`.

### **Erro 401: Unauthorized**
- ✅ Verificar se o token JWT está correto
- ✅ Verificar se o token não expirou (renovar se necessário)
- ✅ Verificar formato: `Bearer {token}` (com espaço após "Bearer")
- ✅ **Para Auth API**: Verificar se o header `apikey` está presente

### **Erro 403: Forbidden**
- ✅ Verificar se o usuário tem acesso à empresa/projeto
- ✅ Verificar RLS policies no Supabase Dashboard
- ✅ Verificar se o usuário está ativo (`is_active = true`)

### **Erro 404: Not Found**
- ✅ Verificar se o UUID está correto
- ✅ Verificar se o recurso existe no banco
- ✅ Verificar se o usuário tem permissão para ver o recurso (RLS)

### **Erro 400: Bad Request**
- ✅ Verificar formato JSON do body
- ✅ Verificar validação Zod (campos obrigatórios, formatos, etc.)
- ✅ Verificar se UUIDs são válidos

### **Erro 500: Internal Server Error**
- ✅ Verificar logs no Supabase Dashboard
- ✅ Verificar se todas as migrations foram aplicadas
- ✅ Verificar se as tabelas existem

---

## 10. Dicas e Boas Práticas

### **✅ Organização no Postman**
- Crie pastas por Edge Function (Companies, Projects, Contacts, etc.)
- Use nomes descritivos para as requisições
- Adicione descrições em cada requisição
- Configure testes automatizados

### **✅ Variáveis de Ambiente**
- Use variáveis para URLs e tokens
- Atualize tokens automaticamente via scripts
- Mantenha ambientes separados (Local, Staging, Production)

### **✅ Documentação**
- Adicione exemplos de resposta em cada requisição
- Documente query parameters
- Adicione notas sobre validações

### **✅ Testes Automatizados**
- Crie testes para cada endpoint
- Valide estrutura de resposta
- Teste casos de erro
- Valide performance (tempo de resposta)

---

## 11. Collection Postman Completa

### **Estrutura Recomendada:**

```
Adsmagic Backend API
├── 🔐 Authentication
│   ├── Login
│   ├── Refresh Token
│   └── Logout
├── 🏢 Companies
│   ├── Create Company
│   ├── List Companies
│   ├── Get Company
│   ├── Update Company
│   └── Delete Company
├── 📁 Projects
│   ├── Create Project
│   ├── List Projects
│   ├── Get Project
│   ├── Update Project
│   ├── Complete Wizard
│   └── Delete Project
├── 👥 Contacts
│   ├── Create Contact
│   ├── List Contacts (with search)
│   ├── Get Contact
│   ├── Update Contact
│   ├── Update Stage
│   └── Delete Contact
├── 🔗 Integrations
│   ├── List Integrations
│   ├── Start OAuth
│   └── OAuth Callback
└── 📊 Dashboard
    ├── Get Metrics
    ├── Get Origin Performance
    └── Get Time Series
```

---

## 12. Exemplos de Respostas

### **12.1. Resposta de Sucesso (200/201)**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Projeto Teste",
  "description": "Descrição do projeto",
  "status": "draft",
  "created_at": "2025-01-28T10:00:00Z",
  "updated_at": "2025-01-28T10:00:00Z"
}
```

### **12.2. Resposta de Listagem**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Projeto 1",
      "status": "active"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Projeto 2",
      "status": "draft"
    }
  ],
  "meta": {
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

### **12.3. Resposta de Erro**

```json
{
  "error": "Validation failed",
  "details": [
    "name: Name must be at least 3 characters",
    "email: Invalid email format"
  ]
}
```

---

## 13. Links Úteis

- **Supabase Dashboard**: https://supabase.com/dashboard/project/nitefyufrzytdtxhaocf
- **Documentação Supabase Auth**: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- **Postman Learning Center**: https://learning.postman.com/

---

**📝 Notas:**
- Todos os endpoints requerem autenticação JWT
- Tokens expiram após 1 hora (padrão Supabase)
- Use refresh token para renovar acesso
- RLS policies garantem isolamento de dados por empresa/projeto
- Validação Zod garante integridade dos dados

---

**✅ Pronto para Testar!**

Siga a sequência recomendada e use os exemplos acima para testar todos os endpoints implementados.


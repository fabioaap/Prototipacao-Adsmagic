# 📊 Documentação do Banco de Dados - Adsmagic First AI

**Versão**: 1.0  
**Data**: 2025-01-27  
**Autor**: Especialista em Arquitetura de Banco de Dados  
**Status**: Documentação para Implementação

---

## 🎯 Visão Geral

Este documento define a estrutura completa do banco de dados para o sistema Adsmagic First AI, baseado na análise dos contratos, schemas Zod, tipos TypeScript e regras de negócio identificadas no projeto.

### Princípios Arquiteturais
- **Multi-tenancy**: Isolamento por projeto
- **Auditoria**: Timestamps e versionamento
- **Integridade**: Constraints e validações
- **Performance**: Índices otimizados
- **Escalabilidade**: Estrutura preparada para crescimento

---

## 🏗️ Arquitetura do Banco

### Tecnologia Recomendada
- **SGBD**: Supabase (PostgreSQL 15+)
- **Extensões**: UUID, JSONB, Full-Text Search, pg_trgm
- **Backup**: Automático via Supabase
- **Replicação**: Read replicas automáticas
- **Edge Functions**: Cloudflare Workers + Hono para lógica complexa

### Padrões de Nomenclatura
- **Tabelas**: `snake_case` plural
- **Colunas**: `snake_case`
- **Índices**: `idx_{tabela}_{colunas}`
- **Constraints**: `{tabela}_{coluna}_{tipo}`
- **Foreign Keys**: `fk_{tabela}_{referencia}`

### Divisão de Responsabilidades
- **Supabase**: Operações simples (CRUD, RLS, Real-time)
- **Workers**: Lógica complexa (analytics, integrações, processamento)
- **Hono**: Framework para Workers (TypeScript-first)

---

## 📋 Estrutura das Tabelas

### 1. 👤 USUÁRIOS E AUTENTICAÇÃO

#### **Supabase Auth (Nativo)**
```sql
-- A tabela auth.users é gerenciada automaticamente pelo Supabase
-- Contém: id, email, encrypted_password, email_confirmed_at, etc.
-- Não deve ser modificada diretamente
```

#### `user_profiles` (Perfil Estendido do Usuário)
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'pt' CHECK (preferred_language IN ('pt', 'en', 'es')),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `companies` (Empresas/Organizações)
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(20) CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL', -- ISO 4217
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `company_users` (Usuários da Empresa)
```sql
CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}', -- Permissões específicas
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, user_id)
);
```

**Índices:**
```sql
-- Índices para user_profiles
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Índices para companies
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Índices para company_users
CREATE INDEX idx_company_users_company_id ON company_users(company_id);
CREATE INDEX idx_company_users_user_id ON company_users(user_id);
CREATE INDEX idx_company_users_role ON company_users(role);
CREATE INDEX idx_company_users_active ON company_users(is_active);
```

**Constraints:**
```sql
-- Constraints para user_profiles
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_name_length CHECK (LENGTH(first_name) >= 2 AND LENGTH(first_name) <= 100);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_phone_format CHECK (phone IS NULL OR phone ~ '^[0-9+]{10,20}$');

-- Constraints para companies
ALTER TABLE companies ADD CONSTRAINT companies_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100);
ALTER TABLE companies ADD CONSTRAINT companies_website_format CHECK (website IS NULL OR website ~ '^https?://');
```

---

### 2. 🏢 PROJETOS E MULTI-TENANCY

#### `projects`
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    company_type VARCHAR(20) NOT NULL CHECK (company_type IN ('franchise', 'corporate', 'individual')),
    franchise_count INTEGER CHECK (franchise_count >= 1 AND franchise_count <= 999),
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    language VARCHAR(5) NOT NULL DEFAULT 'pt', -- ISO 639-1
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL', -- ISO 4217
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    attribution_model VARCHAR(20) NOT NULL DEFAULT 'first_touch' CHECK (attribution_model IN ('first_touch', 'last_touch', 'conversion')),
    
    -- Integrações
    whatsapp_connected BOOLEAN DEFAULT false,
    meta_ads_connected BOOLEAN DEFAULT false,
    google_ads_connected BOOLEAN DEFAULT false,
    tiktok_ads_connected BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `project_users` (Usuários do Projeto)
```sql
CREATE TABLE project_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}', -- Permissões específicas do projeto
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);
```

**Índices:**
```sql
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_company_type ON projects(company_type);

-- Índices para project_users
CREATE INDEX idx_project_users_project_id ON project_users(project_id);
CREATE INDEX idx_project_users_user_id ON project_users(user_id);
CREATE INDEX idx_project_users_role ON project_users(role);
CREATE INDEX idx_project_users_active ON project_users(is_active);
```

**Constraints:**
```sql
ALTER TABLE projects ADD CONSTRAINT projects_franchise_count_required 
    CHECK (company_type != 'franchise' OR franchise_count IS NOT NULL);
ALTER TABLE projects ADD CONSTRAINT projects_name_length CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 100);
```

---

### 3. 👥 CONTATOS E GESTÃO

#### `contacts`
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL, -- Sem código do país
    country_code VARCHAR(3) NOT NULL, -- Código do país
    email VARCHAR(255),
    company VARCHAR(100),
    location VARCHAR(100),
    notes TEXT,
    avatar_url VARCHAR(500),
    is_favorite BOOLEAN DEFAULT false,
    
    -- Atribuição principal
    main_origin_id UUID NOT NULL,
    current_stage_id UUID NOT NULL,
    
    -- Metadados de rastreamento
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_contacts_project_id ON contacts(project_id);
CREATE INDEX idx_contacts_main_origin_id ON contacts(main_origin_id);
CREATE INDEX idx_contacts_current_stage_id ON contacts(current_stage_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_name_search ON contacts USING gin(to_tsvector('portuguese', name));
```

**Constraints:**
```sql
ALTER TABLE contacts ADD CONSTRAINT contacts_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100);
ALTER TABLE contacts ADD CONSTRAINT contacts_phone_format CHECK (phone ~ '^[0-9]{8,15}$');
ALTER TABLE contacts ADD CONSTRAINT contacts_country_code_format CHECK (country_code ~ '^[0-9]{1,3}$');
ALTER TABLE contacts ADD CONSTRAINT contacts_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

#### `contact_origins` (Histórico de origens)
```sql
CREATE TABLE contact_origins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    origin_id UUID NOT NULL,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_contact_origins_contact_id ON contact_origins(contact_id);
CREATE INDEX idx_contact_origins_origin_id ON contact_origins(origin_id);
CREATE INDEX idx_contact_origins_acquired_at ON contact_origins(acquired_at);
```

#### `contact_stage_history` (Histórico de estágios)
```sql
CREATE TABLE contact_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL,
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    moved_by VARCHAR(50) DEFAULT 'system', -- 'system', 'user', 'automation'
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_contact_stage_history_contact_id ON contact_stage_history(contact_id);
CREATE INDEX idx_contact_stage_history_stage_id ON contact_stage_history(stage_id);
CREATE INDEX idx_contact_stage_history_moved_at ON contact_stage_history(moved_at);
```

---

### 4. 🎯 ORIGENS DE TRÁFEGO

#### `origins`
```sql
CREATE TABLE origins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL para origens do sistema
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('system', 'custom')),
    color VARCHAR(7) NOT NULL, -- Hex color
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_origins_project_id ON origins(project_id);
CREATE INDEX idx_origins_type ON origins(type);
CREATE INDEX idx_origins_active ON origins(is_active);
```

**Constraints:**
```sql
ALTER TABLE origins ADD CONSTRAINT origins_name_length CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 50);
ALTER TABLE origins ADD CONSTRAINT origins_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE origins ADD CONSTRAINT origins_custom_project_required 
    CHECK (type != 'custom' OR project_id IS NOT NULL);
```

**Dados iniciais (origens do sistema):**
```sql
INSERT INTO origins (id, project_id, name, type, color, icon) VALUES
    (gen_random_uuid(), NULL, 'Google Ads', 'system', '#4285F4', 'chrome'),
    (gen_random_uuid(), NULL, 'Meta Ads', 'system', '#0866FF', 'facebook'),
    (gen_random_uuid(), NULL, 'Instagram', 'system', '#E4405F', 'instagram'),
    (gen_random_uuid(), NULL, 'Indicação', 'system', '#10B981', 'users'),
    (gen_random_uuid(), NULL, 'Manual', 'system', '#8B5CF6', 'user-plus'),
    (gen_random_uuid(), NULL, 'Outros', 'system', '#6B7280', 'help-circle');
```

---

### 5. 📊 ESTÁGIOS DO FUNIL

#### `stages`
```sql
CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL para estágios do sistema
    name VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL,
    color VARCHAR(7), -- Hex color
    tracking_phrase VARCHAR(100), -- Para automação WhatsApp
    type VARCHAR(10) NOT NULL CHECK (type IN ('normal', 'sale', 'lost')),
    is_active BOOLEAN DEFAULT true,
    
    -- Configuração de eventos
    event_config JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_stages_project_id ON stages(project_id);
CREATE INDEX idx_stages_type ON stages(type);
CREATE INDEX idx_stages_active ON stages(is_active);
CREATE INDEX idx_stages_display_order ON stages(project_id, display_order);
```

**Constraints:**
```sql
ALTER TABLE stages ADD CONSTRAINT stages_name_length CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 50);
ALTER TABLE stages ADD CONSTRAINT stages_display_order_positive CHECK (display_order >= 0);
ALTER TABLE stages ADD CONSTRAINT stages_sale_unique_per_project 
    CHECK (type != 'sale' OR NOT EXISTS (
        SELECT 1 FROM stages s2 WHERE s2.project_id = stages.project_id AND s2.type = 'sale' AND s2.id != stages.id
    ));
ALTER TABLE stages ADD CONSTRAINT stages_lost_unique_per_project 
    CHECK (type != 'lost' OR NOT EXISTS (
        SELECT 1 FROM stages s2 WHERE s2.project_id = stages.project_id AND s2.type = 'lost' AND s2.id != stages.id
    ));
```

---

### 6. 💰 VENDAS E CONVERSÕES

#### `sales`
```sql
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    value DECIMAL(12,2) NOT NULL CHECK (value > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    sale_date TIMESTAMP WITH TIME ZONE NOT NULL,
    origin_id UUID, -- Origem atribuída à venda
    status VARCHAR(10) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'lost')),
    
    -- Campos para vendas perdidas
    lost_reason VARCHAR(100),
    lost_observations TEXT,
    
    -- Parâmetros de rastreamento
    tracking_params JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_sales_project_id ON sales(project_id);
CREATE INDEX idx_sales_contact_id ON sales(contact_id);
CREATE INDEX idx_sales_origin_id ON sales(origin_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_value ON sales(value);
```

**Constraints:**
```sql
ALTER TABLE sales ADD CONSTRAINT sales_lost_reason_required 
    CHECK (status != 'lost' OR lost_reason IS NOT NULL);
ALTER TABLE sales ADD CONSTRAINT sales_value_max CHECK (value <= 9999999.99);
```

---

### 7. 🔗 LINKS RASTREÁVEIS

#### `trackable_links`
```sql
CREATE TABLE trackable_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    destination_url TEXT NOT NULL,
    tracking_url TEXT NOT NULL,
    short_url VARCHAR(255),
    short_code VARCHAR(20),
    initial_message TEXT, -- Mensagem pré-preenchida WhatsApp
    origin_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Parâmetros UTM
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    
    -- Estatísticas
    stats JSONB DEFAULT '{"clicks": 0, "contacts": 0, "sales": 0, "revenue": 0}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_trackable_links_project_id ON trackable_links(project_id);
CREATE INDEX idx_trackable_links_slug ON trackable_links(slug);
CREATE INDEX idx_trackable_links_short_code ON trackable_links(short_code);
CREATE INDEX idx_trackable_links_origin_id ON trackable_links(origin_id);
CREATE INDEX idx_trackable_links_active ON trackable_links(is_active);
```

**Constraints:**
```sql
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_name_length CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 100);
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_slug_format CHECK (slug ~ '^[a-z0-9-]+$');
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_destination_url_valid CHECK (destination_url ~ '^https?://');
```

---

### 8. 📡 EVENTOS DE CONVERSÃO

#### `conversion_events`
```sql
CREATE TABLE conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    stage_id UUID,
    
    -- Plataforma e tipo
    platform VARCHAR(10) NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok')),
    event_type VARCHAR(50) NOT NULL,
    
    -- Status e processamento
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Dados do evento (otimizado para Workers)
    event_data JSONB DEFAULT '{}',
    response_data JSONB,
    error_message TEXT,
    
    -- Tracking parameters para atribuição
    tracking_params JSONB DEFAULT '{}', -- gclid, fbclid, ttpclid, etc.
    
    -- Hash para deduplicação
    event_hash VARCHAR(64), -- SHA-256 do evento
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_conversion_events_project_id ON conversion_events(project_id);
CREATE INDEX idx_conversion_events_contact_id ON conversion_events(contact_id);
CREATE INDEX idx_conversion_events_sale_id ON conversion_events(sale_id);
CREATE INDEX idx_conversion_events_platform ON conversion_events(platform);
CREATE INDEX idx_conversion_events_status ON conversion_events(status);
CREATE INDEX idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX idx_conversion_events_retry ON conversion_events(status, retry_count, last_retry_at) WHERE status = 'pending';
CREATE INDEX idx_conversion_events_hash ON conversion_events(event_hash);
CREATE INDEX idx_conversion_events_tracking_params ON conversion_events USING gin(tracking_params);
```

---

### 9. 🔗 INTEGRAÇÕES (Múltiplas Contas por Plataforma)

#### `integrations` (Plataformas Integradas)
```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN (
        'whatsapp', 'facebook_messenger', 'telegram', 'instagram_direct', 
        'meta', 'google', 'tiktok', 'linkedin', 'discord', 'slack'
    )),
    platform_type VARCHAR(20) NOT NULL CHECK (platform_type IN ('messaging', 'advertising', 'analytics', 'crm')),
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'syncing', 'pending')),
    
    -- Configurações da plataforma
    platform_config JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `integration_accounts` (Contas Específicas da Plataforma)
```sql
CREATE TABLE integration_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Identificação da conta
    account_name VARCHAR(255) NOT NULL, -- Nome amigável da conta
    external_account_id VARCHAR(255) NOT NULL, -- ID da conta na plataforma externa
    external_account_name VARCHAR(255) NOT NULL, -- Nome da conta na plataforma
    external_email VARCHAR(255),
    
    -- Status da conta
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'expired')),
    is_primary BOOLEAN DEFAULT false, -- Conta principal da plataforma
    
    -- Dados de autenticação
    access_token TEXT, -- Criptografado
    refresh_token TEXT, -- Criptografado
    token_expires_at TIMESTAMP WITH TIME ZONE,
    permissions TEXT[] DEFAULT '{}',
    
    -- Metadados específicos da conta
    account_metadata JSONB DEFAULT '{}',
    
    -- Estatísticas da conta
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(integration_id, external_account_id)
);
```

#### **Nota sobre WhatsApp**
O WhatsApp agora usa as **tabelas unificadas de mensageria** (`messaging_accounts`, `messaging_brokers`, `messaging_webhooks`) ao invés de tabelas específicas. Isso permite:

- **Arquitetura unificada** para todas as plataformas de mensageria
- **Reutilização de código** e lógica
- **Manutenção simplificada**
- **Escalabilidade** para novas plataformas

**Exemplo de configuração WhatsApp:**
```sql
-- Broker WhatsApp
INSERT INTO messaging_brokers (name, display_name, platform, broker_type, api_base_url, auth_type) VALUES
('uazapi', 'UAZAPI WhatsApp', 'whatsapp', 'api', 'https://uazapi.com/api', 'api_key'),
('evolution', 'Evolution API', 'whatsapp', 'api', 'https://evolution-api.com', 'bearer'),
('official_whatsapp', 'WhatsApp Business API', 'whatsapp', 'official', 'https://graph.facebook.com', 'bearer');

-- Conta WhatsApp
INSERT INTO messaging_accounts (platform, broker_type, account_identifier, account_name, broker_config) VALUES
('whatsapp', 'uazapi', '5511999999999', 'Vendas WhatsApp', '{"instance": "instance-123", "server": "https://uazapi.com"}');
```

#### `messaging_accounts` (Contas de Mensageria Unificadas)
```sql
CREATE TABLE messaging_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_account_id UUID NOT NULL REFERENCES integration_accounts(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Plataforma de mensageria
    platform VARCHAR(20) NOT NULL CHECK (platform IN (
        'whatsapp', 'facebook_messenger', 'telegram', 'instagram_direct', 'discord', 'slack'
    )),
    
    -- Broker/Integração específica
    broker_type VARCHAR(20) NOT NULL, -- 'uazapi', 'evolution', 'telegram_bot', 'facebook_page', etc.
    broker_config JSONB DEFAULT '{}',
    
    -- Identificação da conta
    account_identifier VARCHAR(255) NOT NULL, -- phone_number, page_id, bot_token, etc.
    account_name VARCHAR(255) NOT NULL,
    account_display_name VARCHAR(255),
    
    -- Status e configurações
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'connecting', 'disconnected')),
    is_primary BOOLEAN DEFAULT false,
    
    -- Configurações específicas da plataforma
    platform_config JSONB DEFAULT '{}',
    
    -- Autenticação
    access_token TEXT, -- Criptografado
    refresh_token TEXT, -- Criptografado
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Webhook/API
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),
    api_key VARCHAR(255),
    
    -- Estatísticas
    total_messages INTEGER DEFAULT 0,
    total_contacts INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_webhook_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, platform, account_identifier, broker_type)
);
```

#### `messaging_brokers` (Brokers de Mensageria)
```sql
CREATE TABLE messaging_brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'uazapi', 'telegram_bot', 'facebook_page', etc.
    display_name VARCHAR(100) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN (
        'whatsapp', 'facebook_messenger', 'telegram', 'instagram_direct', 'discord', 'slack'
    )),
    broker_type VARCHAR(20) NOT NULL CHECK (broker_type IN ('api', 'webhook', 'bot', 'official')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Configurações do broker
    api_base_url VARCHAR(255),
    webhook_endpoint VARCHAR(255),
    auth_type VARCHAR(20) CHECK (auth_type IN ('api_key', 'bearer', 'basic', 'bot_token', 'page_token', 'none')),
    required_fields JSONB DEFAULT '[]',
    optional_fields JSONB DEFAULT '[]',
    
    -- Token administrativo (ex: AdminToken do uazapi)
    admin_token TEXT, -- Token administrativo do broker, deve ser criptografado usando pgcrypto
    admin_token_encrypted BOOLEAN DEFAULT false, -- Indica se o admin_token já está criptografado
    
    -- Limitações e recursos
    max_connections INTEGER DEFAULT 1,
    supports_media BOOLEAN DEFAULT true,
    supports_templates BOOLEAN DEFAULT false,
    supports_webhooks BOOLEAN DEFAULT false,
    supports_automation BOOLEAN DEFAULT false,
    
    -- Metadados
    documentation_url VARCHAR(500),
    support_url VARCHAR(500),
    version VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos Adicionados (Migration 045)**:
- `admin_token` (TEXT, nullable): Token administrativo do broker (ex: AdminToken do uazapi para criar instâncias). Deve ser criptografado antes de salvar usando `pgcrypto`. Campo nullable pois nem todos os brokers requerem admin_token.
- `admin_token_encrypted` (BOOLEAN, default false): Indica se o admin_token já está criptografado. Útil para validações e migrações de dados existentes.

**Segurança**: Tokens administrativos devem sempre ser criptografados antes de serem salvos no banco de dados usando funções de criptografia (`pgcrypto`).

#### `messaging_webhooks` (Webhooks de Mensageria)
```sql
CREATE TABLE messaging_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    messaging_account_id UUID NOT NULL REFERENCES messaging_accounts(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Configuração do webhook
    webhook_url VARCHAR(500) NOT NULL,
    webhook_secret VARCHAR(255),
    events TEXT[] DEFAULT '{}',
    
    -- Status e controle
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    total_events INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Configurações de retry
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    retry_delay INTEGER DEFAULT 60,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `ad_accounts` (Contas de Anúncios)
```sql
CREATE TABLE ad_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_account_id UUID NOT NULL REFERENCES integration_accounts(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok', 'linkedin')),
    
    -- Dados da conta de anúncios
    account_name VARCHAR(255) NOT NULL,
    external_account_id VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    
    -- Status e configurações
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    is_primary BOOLEAN DEFAULT false,
    
    -- Limites e configurações
    daily_spend_limit DECIMAL(12,2),
    account_type VARCHAR(20) DEFAULT 'business' CHECK (account_type IN ('personal', 'business', 'agency')),
    
    -- Estatísticas
    total_spend DECIMAL(12,2) DEFAULT 0,
    total_campaigns INTEGER DEFAULT 0,
    last_campaign_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados específicos da plataforma
    platform_metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(platform, external_account_id, project_id)
);
```

**Índices:**
```sql
-- Integrations
CREATE INDEX idx_integrations_project_id ON integrations(project_id);
CREATE INDEX idx_integrations_platform ON integrations(platform);
CREATE INDEX idx_integrations_status ON integrations(status);

-- Integration Accounts
CREATE INDEX idx_integration_accounts_integration_id ON integration_accounts(integration_id);
CREATE INDEX idx_integration_accounts_project_id ON integration_accounts(project_id);
CREATE INDEX idx_integration_accounts_status ON integration_accounts(status);
CREATE INDEX idx_integration_accounts_primary ON integration_accounts(is_primary) WHERE is_primary = true;

-- WhatsApp agora usa as tabelas unificadas de mensageria (ver seção messaging_accounts, messaging_brokers, messaging_webhooks)

-- Messaging Accounts
CREATE INDEX idx_messaging_accounts_project_id ON messaging_accounts(project_id);
CREATE INDEX idx_messaging_accounts_platform ON messaging_accounts(platform);
CREATE INDEX idx_messaging_accounts_broker_type ON messaging_accounts(broker_type);
CREATE INDEX idx_messaging_accounts_status ON messaging_accounts(status);
CREATE INDEX idx_messaging_accounts_identifier ON messaging_accounts(account_identifier);
CREATE INDEX idx_messaging_accounts_primary ON messaging_accounts(is_primary) WHERE is_primary = true;

-- Messaging Brokers
CREATE INDEX idx_messaging_brokers_name ON messaging_brokers(name);
CREATE INDEX idx_messaging_brokers_platform ON messaging_brokers(platform);
CREATE INDEX idx_messaging_brokers_type ON messaging_brokers(broker_type);
CREATE INDEX idx_messaging_brokers_active ON messaging_brokers(is_active);

-- Messaging Webhooks
CREATE INDEX idx_messaging_webhooks_account_id ON messaging_webhooks(messaging_account_id);
CREATE INDEX idx_messaging_webhooks_project_id ON messaging_webhooks(project_id);
CREATE INDEX idx_messaging_webhooks_status ON messaging_webhooks(status);
CREATE INDEX idx_messaging_webhooks_events ON messaging_webhooks USING gin(events);

-- Ad Accounts
CREATE INDEX idx_ad_accounts_project_id ON ad_accounts(project_id);
CREATE INDEX idx_ad_accounts_platform ON ad_accounts(platform);
CREATE INDEX idx_ad_accounts_status ON ad_accounts(status);
CREATE INDEX idx_ad_accounts_primary ON ad_accounts(is_primary) WHERE is_primary = true;
```

---

### 10. ⚙️ CONFIGURAÇÕES

#### `project_settings`
```sql
CREATE TABLE project_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Configurações gerais
    project_name VARCHAR(100),
    project_description TEXT,
    attribution_model VARCHAR(20) DEFAULT 'first_touch',
    
    -- Configurações de moeda
    currency VARCHAR(3) DEFAULT 'BRL',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(10) DEFAULT '24h',
    thousands_separator VARCHAR(1) DEFAULT ',',
    decimal_separator VARCHAR(1) DEFAULT '.',
    
    -- Configurações de notificação
    notifications_enabled BOOLEAN DEFAULT true,
    notification_email VARCHAR(255),
    notification_events TEXT[] DEFAULT '{}',
    digest_frequency VARCHAR(20) DEFAULT 'daily',
    digest_time TIME DEFAULT '09:00:00',
    notification_timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE UNIQUE INDEX idx_project_settings_project_id ON project_settings(project_id);
```

---

### 11. 📊 MÉTRICAS E ANALYTICS

#### `dashboard_metrics` (Cache de métricas)
```sql
CREATE TABLE dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    
    -- Métricas de tráfego
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    cost_per_click DECIMAL(10,4) DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Métricas de contatos
    total_contacts INTEGER DEFAULT 0,
    new_contacts INTEGER DEFAULT 0,
    
    -- Métricas de vendas
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_ticket DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Métricas financeiras
    total_investment DECIMAL(12,2) DEFAULT 0,
    cost_per_sale DECIMAL(10,2) DEFAULT 0,
    roi DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_dashboard_metrics_project_id ON dashboard_metrics(project_id);
CREATE INDEX idx_dashboard_metrics_date ON dashboard_metrics(metric_date);
CREATE UNIQUE INDEX idx_dashboard_metrics_project_date ON dashboard_metrics(project_id, metric_date);
```

---

## 🔐 INTEGRAÇÃO COM SUPABASE AUTH

### **Autenticação Nativa do Supabase**
```sql
-- O Supabase gerencia automaticamente a tabela auth.users
-- Campos principais:
-- - id: UUID (chave primária)
-- - email: VARCHAR
-- - encrypted_password: VARCHAR
-- - email_confirmed_at: TIMESTAMP
-- - created_at: TIMESTAMP
-- - updated_at: TIMESTAMP
-- - raw_user_meta_data: JSONB
-- - raw_app_meta_data: JSONB
```

### **Tabela de Perfil Estendido**
```sql
-- user_profiles estende auth.users com dados específicos da aplicação
-- Relacionamento: user_profiles.id → auth.users.id
-- Permite adicionar campos customizados sem modificar auth.users
```

### **Políticas RLS com Supabase Auth**
```sql
-- Todas as políticas usam auth.uid() para identificar o usuário autenticado
-- Exemplo:
CREATE POLICY projects_user_policy ON projects
    FOR ALL TO authenticated
    USING (company_id IN (
        SELECT company_id FROM company_users 
        WHERE user_id = auth.uid()
    ));
```

### **Funções de Validação**
```sql
-- Funções que verificam permissões usando auth.uid()
CREATE OR REPLACE FUNCTION user_has_company_access(company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM company_users 
        WHERE user_id = auth.uid() 
        AND company_id = company_uuid 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🏢 FLUXO DE USUÁRIO E ONBOARDING

### Fluxo Completo
```
1. Cadastro do usuário → auth.users (Supabase Auth)
2. Perfil estendido → user_profiles
3. Onboarding da empresa → companies + company_users
4. Criação do projeto → projects + project_users
5. Configurações globais → company_settings
6. Configurações do projeto → project_settings
```

### Tabelas de Configurações

#### `company_settings` (Configurações Globais da Empresa)
```sql
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Configurações de branding
    logo_url VARCHAR(500),
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7), -- Hex color
    font_family VARCHAR(50) DEFAULT 'Inter',
    
    -- Configurações de relatórios
    report_template VARCHAR(20) DEFAULT 'default' CHECK (report_template IN ('default', 'minimal', 'detailed')),
    include_company_info BOOLEAN DEFAULT true,
    include_contact_info BOOLEAN DEFAULT true,
    
    -- Configurações de notificações globais
    notifications_enabled BOOLEAN DEFAULT true,
    notification_email VARCHAR(255),
    digest_frequency VARCHAR(20) DEFAULT 'weekly',
    digest_time TIME DEFAULT '09:00:00',
    
    -- Configurações de integração
    default_attribution_model VARCHAR(20) DEFAULT 'first_touch',
    auto_track_events BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id)
);
```

#### `onboarding_progress` (Progresso do Onboarding)
```sql
CREATE TABLE onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Etapas do onboarding
    company_setup BOOLEAN DEFAULT false,
    first_project_created BOOLEAN DEFAULT false,
    integrations_connected BOOLEAN DEFAULT false,
    first_contact_added BOOLEAN DEFAULT false,
    
    -- Dados do onboarding
    onboarding_data JSONB DEFAULT '{}',
    
    -- Status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

**Índices para configurações:**
```sql
CREATE INDEX idx_company_settings_company_id ON company_settings(company_id);
CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_progress_company_id ON onboarding_progress(company_id);
CREATE INDEX idx_onboarding_progress_completed ON onboarding_progress(is_completed);
```

---

## 🚀 ARQUITETURA HÍBRIDA SUPABASE + WORKERS

### Divisão de Operações

#### **Supabase (Operações Simples)**
```typescript
// Operações ideais para Supabase
- ✅ CRUD básico (contacts, sales, projects)
- ✅ Listagens com filtros simples
- ✅ Real-time subscriptions
- ✅ Autenticação e sessões
- ✅ Configurações de projeto
- ✅ Histórico de estágios
```

#### **Cloudflare Workers (Operações Complexas)**
```typescript
// Operações ideais para Workers
- ✅ Cálculo de métricas e ROI
- ✅ Processamento de eventos de conversão
- ✅ Integrações com APIs externas (Meta, Google, TikTok)
- ✅ Analytics e relatórios complexos
- ✅ Webhooks e notificações
- ✅ Processamento de tracking parameters
```

### Tabelas Otimizadas para Workers

#### **Cache de Métricas (Workers)**
```sql
-- Tabela otimizada para cálculos em Workers
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    cache_key VARCHAR(100) NOT NULL, -- 'dashboard_metrics', 'roi_calculation', etc.
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_cache_project_key ON analytics_cache(project_id, cache_key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);
```

#### **Queue de Processamento (Workers)**
```sql
-- Fila para processamento assíncrono
CREATE TABLE processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL, -- 'conversion_event', 'analytics_update', 'integration_sync', 'message_processing'
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_processing_queue_status ON processing_queue(status);
CREATE INDEX idx_processing_queue_scheduled ON processing_queue(scheduled_at);
CREATE INDEX idx_processing_queue_job_type ON processing_queue(job_type);
```

#### **Orquestrador de Mensageria**
```sql
-- Tabela para rastrear mensagens recebidas
CREATE TABLE messaging_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    messaging_account_id UUID NOT NULL REFERENCES messaging_accounts(id) ON DELETE CASCADE,
    
    -- Identificação da mensagem
    external_message_id VARCHAR(255) NOT NULL, -- ID da mensagem na plataforma externa
    platform VARCHAR(20) NOT NULL CHECK (platform IN (
        'whatsapp', 'facebook_messenger', 'telegram', 'instagram_direct', 'discord', 'slack'
    )),
    
    -- Dados da mensagem
    sender_id VARCHAR(255) NOT NULL, -- ID do remetente na plataforma
    sender_name VARCHAR(255),
    sender_phone VARCHAR(20),
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'location', 'contact')),
    message_content TEXT,
    message_metadata JSONB DEFAULT '{}',
    
    -- Status do processamento
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Rastreamento de contato
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    contact_created BOOLEAN DEFAULT false,
    
    -- Dados do webhook
    webhook_data JSONB DEFAULT '{}',
    webhook_signature VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(platform, external_message_id, project_id)
);

-- Índices para performance
CREATE INDEX idx_messaging_events_project_id ON messaging_events(project_id);
CREATE INDEX idx_messaging_events_platform ON messaging_events(platform);
CREATE INDEX idx_messaging_events_status ON messaging_events(status);
CREATE INDEX idx_messaging_events_sender_id ON messaging_events(sender_id);
CREATE INDEX idx_messaging_events_created_at ON messaging_events(created_at);
CREATE INDEX idx_messaging_events_external_id ON messaging_events(external_message_id);
```

#### **Regras de Processamento do Orquestrador**
```sql
-- Tabela para regras de processamento de mensagens
CREATE TABLE messaging_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Configuração da regra
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Maior prioridade = processa primeiro
    
    -- Condições da regra
    platform_filter VARCHAR(20) CHECK (platform_filter IN (
        'whatsapp', 'facebook_messenger', 'telegram', 'instagram_direct', 'discord', 'slack'
    )),
    message_type_filter VARCHAR(20) CHECK (message_type_filter IN ('text', 'image', 'audio', 'video', 'document', 'location', 'contact')),
    sender_filter JSONB DEFAULT '{}', -- Filtros específicos por remetente
    content_filters JSONB DEFAULT '[]', -- Palavras-chave, regex, etc.
    
    -- Ações da regra
    actions JSONB NOT NULL, -- Array de ações a executar
    auto_reply_config JSONB DEFAULT '{}',
    stage_assignment VARCHAR(50), -- Estágio para atribuir ao contato
    origin_assignment UUID REFERENCES origins(id),
    
    -- Configurações de execução
    max_executions_per_hour INTEGER, -- Rate limiting
    max_executions_per_day INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para regras
CREATE INDEX idx_messaging_rules_project_id ON messaging_rules(project_id);
CREATE INDEX idx_messaging_rules_active ON messaging_rules(is_active);
CREATE INDEX idx_messaging_rules_priority ON messaging_rules(priority DESC);
CREATE INDEX idx_messaging_rules_platform ON messaging_rules(platform_filter);
```

#### **Log de Execução do Orquestrador**
```sql
-- Log de execução das regras
CREATE TABLE messaging_rule_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    messaging_event_id UUID NOT NULL REFERENCES messaging_events(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES messaging_rules(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Status da execução
    status VARCHAR(20) NOT NULL CHECK (status IN ('executed', 'skipped', 'failed')),
    execution_time_ms INTEGER,
    actions_performed JSONB DEFAULT '[]',
    error_message TEXT,
    
    -- Dados de contexto
    context_data JSONB DEFAULT '{}',
    
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX idx_messaging_rule_executions_event_id ON messaging_rule_executions(messaging_event_id);
CREATE INDEX idx_messaging_rule_executions_rule_id ON messaging_rule_executions(rule_id);
CREATE INDEX idx_messaging_rule_executions_status ON messaging_rule_executions(status);
CREATE INDEX idx_messaging_rule_executions_executed_at ON messaging_rule_executions(executed_at);
```

### Views Otimizadas para Workers

#### **View de Métricas Agregadas**
```sql
CREATE VIEW v_analytics_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(DISTINCT c.id) as total_contacts,
    COUNT(DISTINCT s.id) as total_sales,
    COALESCE(SUM(s.value), 0) as total_revenue,
    COALESCE(AVG(s.value), 0) as average_ticket,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sales,
    COUNT(DISTINCT CASE WHEN s.status = 'lost' THEN s.id END) as lost_sales,
    -- Métricas por origem
    jsonb_object_agg(
        o.name, 
        jsonb_build_object(
            'contacts', COUNT(DISTINCT c.id),
            'sales', COUNT(DISTINCT s.id),
            'revenue', COALESCE(SUM(s.value), 0)
        )
    ) as origin_metrics
FROM projects p
LEFT JOIN contacts c ON c.project_id = p.id
LEFT JOIN sales s ON s.project_id = p.id AND s.status = 'completed'
LEFT JOIN origins o ON o.id = c.main_origin_id
GROUP BY p.id, p.name;
```

---

## 🔧 TRIGGERS E FUNÇÕES

### 1. Atualização Automática de Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a todas as tabelas com updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trackable_links_updated_at BEFORE UPDATE ON trackable_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversion_events_updated_at BEFORE UPDATE ON conversion_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_settings_updated_at BEFORE UPDATE ON project_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_metrics_updated_at BEFORE UPDATE ON dashboard_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Atualização de Estatísticas de Links
```sql
CREATE OR REPLACE FUNCTION update_link_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'contacts' THEN
        UPDATE trackable_links 
        SET stats = jsonb_set(stats, '{contacts}', (COALESCE((stats->>'contacts')::int, 0) + 1)::text::jsonb)
        WHERE id = NEW.main_origin_id;
    END IF;
    
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'sales' THEN
        UPDATE trackable_links 
        SET stats = jsonb_set(
            jsonb_set(stats, '{sales}', (COALESCE((stats->>'sales')::int, 0) + 1)::text::jsonb),
            '{revenue}', (COALESCE((stats->>'revenue')::decimal, 0) + NEW.value)::text::jsonb
        )
        WHERE id = (SELECT origin_id FROM sales WHERE id = NEW.id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_link_stats_contacts AFTER INSERT ON contacts FOR EACH ROW EXECUTE FUNCTION update_link_stats();
CREATE TRIGGER update_link_stats_sales AFTER INSERT ON sales FOR EACH ROW EXECUTE FUNCTION update_link_stats();
```

### 3. Validação de Estágios Únicos
```sql
CREATE OR REPLACE FUNCTION validate_stage_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'sale' THEN
        IF EXISTS (SELECT 1 FROM stages WHERE project_id = NEW.project_id AND type = 'sale' AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
            RAISE EXCEPTION 'Apenas uma etapa de venda é permitida por projeto';
        END IF;
    END IF;
    
    IF NEW.type = 'lost' THEN
        IF EXISTS (SELECT 1 FROM stages WHERE project_id = NEW.project_id AND type = 'lost' AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
            RAISE EXCEPTION 'Apenas uma etapa de venda perdida é permitida por projeto';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_stage_uniqueness_trigger 
    BEFORE INSERT OR UPDATE ON stages 
    FOR EACH ROW EXECUTE FUNCTION validate_stage_uniqueness();
```

---

## 📈 ÍNDICES DE PERFORMANCE

### Índices Compostos para Consultas Frequentes
```sql
-- Dashboard - métricas por período
CREATE INDEX idx_contacts_project_created_at ON contacts(project_id, created_at);
CREATE INDEX idx_sales_project_sale_date ON sales(project_id, sale_date);
CREATE INDEX idx_sales_project_status_value ON sales(project_id, status, value);

-- Filtros de contatos
CREATE INDEX idx_contacts_project_origin_stage ON contacts(project_id, main_origin_id, current_stage_id);
CREATE INDEX idx_contacts_project_favorite ON contacts(project_id, is_favorite) WHERE is_favorite = true;

-- Busca full-text
CREATE INDEX idx_contacts_fulltext ON contacts USING gin(
    to_tsvector('portuguese', COALESCE(name, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(company, ''))
);

-- Eventos de conversão por status
CREATE INDEX idx_conversion_events_project_status_created ON conversion_events(project_id, status, created_at);
CREATE INDEX idx_conversion_events_platform_status ON conversion_events(platform, status);
```

---

## 🔒 ROW LEVEL SECURITY (RLS) - SUPABASE

### Políticas de Segurança Otimizadas
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE trackable_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_accounts ENABLE ROW LEVEL SECURITY;
-- WhatsApp agora usa as tabelas unificadas de mensageria
ALTER TABLE messaging_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_rule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

-- Política para empresas (usuário só vê empresas onde é membro)
CREATE POLICY companies_user_policy ON companies
    FOR ALL TO authenticated
    USING (id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- Política para usuários da empresa
CREATE POLICY company_users_user_policy ON company_users
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Política para configurações da empresa
CREATE POLICY company_settings_user_policy ON company_settings
    FOR ALL TO authenticated
    USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- Política para progresso do onboarding
CREATE POLICY onboarding_progress_user_policy ON onboarding_progress
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Política para projetos (usuário só vê projetos da empresa onde é membro)
CREATE POLICY projects_user_policy ON projects
    FOR ALL TO authenticated
    USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- Política para usuários do projeto
CREATE POLICY project_users_user_policy ON project_users
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR project_id IN (SELECT id FROM projects WHERE company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))));

-- Política para contatos (usuário só vê contatos de projetos onde tem acesso)
CREATE POLICY contacts_user_policy ON contacts
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para vendas (usuário só vê vendas de projetos onde tem acesso)
CREATE POLICY sales_user_policy ON sales
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para links rastreáveis
CREATE POLICY trackable_links_user_policy ON trackable_links
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para eventos de conversão
CREATE POLICY conversion_events_user_policy ON conversion_events
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para integrações
CREATE POLICY integrations_user_policy ON integrations
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para contas de integração
CREATE POLICY integration_accounts_user_policy ON integration_accounts
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- WhatsApp agora usa as políticas das tabelas unificadas de mensageria

-- Política para contas de mensageria
CREATE POLICY messaging_accounts_user_policy ON messaging_accounts
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para brokers de mensageria (público para usuários autenticados)
CREATE POLICY messaging_brokers_user_policy ON messaging_brokers
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Política para webhooks de mensageria
CREATE POLICY messaging_webhooks_user_policy ON messaging_webhooks
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para eventos de mensageria
CREATE POLICY messaging_events_user_policy ON messaging_events
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para regras de mensageria
CREATE POLICY messaging_rules_user_policy ON messaging_rules
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para execuções de regras
CREATE POLICY messaging_rule_executions_user_policy ON messaging_rule_executions
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para contas de anúncios
CREATE POLICY ad_accounts_user_policy ON ad_accounts
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para configurações do projeto
CREATE POLICY project_settings_user_policy ON project_settings
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para métricas
CREATE POLICY dashboard_metrics_user_policy ON dashboard_metrics
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para cache de analytics (Workers podem acessar)
CREATE POLICY analytics_cache_user_policy ON analytics_cache
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));

-- Política para fila de processamento (Workers podem acessar)
CREATE POLICY processing_queue_user_policy ON processing_queue
    FOR ALL TO authenticated
    USING (project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = auth.uid()
    ));
```

### Políticas para Workers (Service Role)
```sql
-- Políticas especiais para Workers com service role
CREATE POLICY analytics_cache_workers_policy ON analytics_cache
    FOR ALL TO service_role
    USING (true);

CREATE POLICY processing_queue_workers_policy ON processing_queue
    FOR ALL TO service_role
    USING (true);

-- Workers podem ler dados para processamento
CREATE POLICY conversion_events_workers_policy ON conversion_events
    FOR SELECT TO service_role
    USING (true);
```

---

## 📱 EXEMPLOS DE MÚLTIPLAS INTEGRAÇÕES

### Cenário 1: Orquestrador de Mensageria em Ação
```sql
-- Empresa: "Agência Digital XYZ"
-- Projeto: "E-commerce Cliente A"

-- 1. Configurar regras do orquestrador
INSERT INTO messaging_rules (project_id, rule_name, rule_description, platform_filter, message_type_filter, content_filters, actions, priority) VALUES
-- Regra para WhatsApp - Palavra-chave "preço"
('project-uuid', 'WhatsApp Preço', 'Responde automaticamente sobre preços via WhatsApp', 'whatsapp', 'text', 
 '["preço", "valor", "custo", "quanto"]', 
 '["auto_reply", "create_contact", "assign_stage"]', 10),

-- Regra para Facebook Messenger - Palavra-chave "suporte"
('project-uuid', 'Facebook Suporte', 'Direciona para suporte via Facebook', 'facebook_messenger', 'text',
 '["suporte", "ajuda", "problema"]',
 '["auto_reply", "create_contact", "assign_origin"]', 5),

-- Regra para Telegram - Qualquer mensagem
('project-uuid', 'Telegram Boas-vindas', 'Boas-vindas automáticas no Telegram', 'telegram', 'text',
 '[]',
 '["auto_reply", "create_contact"]', 1);

-- 2. Simular recebimento de mensagem WhatsApp
INSERT INTO messaging_events (project_id, messaging_account_id, external_message_id, platform, sender_id, sender_name, message_type, message_content, status) VALUES
('project-uuid', 'whatsapp-account-uuid', 'msg_123456789', 'whatsapp', '5511999999999', 'João Silva', 'text', 'Qual o preço do produto?', 'received');

-- 3. O orquestrador processa a mensagem
-- 3.1. Identifica a empresa através do project_id
-- 3.2. Busca regras ativas para WhatsApp
-- 3.3. Aplica filtros de conteúdo
-- 3.4. Executa ações (auto_reply, create_contact, assign_stage)
-- 3.5. Registra execução

-- 4. Log de execução da regra
INSERT INTO messaging_rule_executions (messaging_event_id, rule_id, project_id, status, actions_performed, execution_time_ms) VALUES
('event-uuid', 'rule-uuid', 'project-uuid', 'executed', 
 '["auto_reply_sent", "contact_created", "stage_assigned"]', 150);

-- 5. Contato criado automaticamente
INSERT INTO contacts (project_id, name, phone, country_code, main_origin_id, current_stage_id) VALUES
('project-uuid', 'João Silva', '5511999999999', '55', 'whatsapp-origin-uuid', 'lead-stage-uuid');
```

### Cenário 2: Múltiplas Plataformas de Mensageria (Arquitetura Unificada)
```sql
-- Empresa: "Agência Digital XYZ"
-- Projeto: "E-commerce Cliente A"

-- 1. Configurar brokers de mensageria disponíveis
INSERT INTO messaging_brokers (name, display_name, platform, broker_type, api_base_url, auth_type, required_fields) VALUES
-- WhatsApp (usando tabelas unificadas)
('uazapi', 'UAZAPI WhatsApp', 'whatsapp', 'api', 'https://uazapi.com/api', 'api_key', '["api_key", "instance"]'),
('evolution', 'Evolution API', 'whatsapp', 'api', 'https://evolution-api.com', 'bearer', '["token", "server"]'),
('official_whatsapp', 'WhatsApp Business API', 'whatsapp', 'official', 'https://graph.facebook.com', 'bearer', '["access_token", "phone_number_id"]'),

-- Facebook Messenger
('facebook_page', 'Facebook Page', 'facebook_messenger', 'official', 'https://graph.facebook.com', 'page_token', '["page_id", "access_token"]'),
('facebook_webhook', 'Facebook Webhook', 'facebook_messenger', 'webhook', 'https://api.facebook.com', 'bearer', '["verify_token"]'),

-- Telegram
('telegram_bot', 'Telegram Bot', 'telegram', 'bot', 'https://api.telegram.org', 'bot_token', '["bot_token"]'),
('telegram_webhook', 'Telegram Webhook', 'telegram', 'webhook', 'https://api.telegram.org', 'bot_token', '["bot_token", "webhook_url"]'),

-- Instagram Direct
('instagram_business', 'Instagram Business', 'instagram_direct', 'official', 'https://graph.facebook.com', 'bearer', '["instagram_account_id", "access_token"]'),

-- Discord
('discord_bot', 'Discord Bot', 'discord', 'bot', 'https://discord.com/api', 'bot_token', '["bot_token", "guild_id"]'),

-- Slack
('slack_app', 'Slack App', 'slack', 'bot', 'https://slack.com/api', 'bearer', '["bot_token", "app_token"]');

-- 2. Integrações de mensageria
INSERT INTO integrations (project_id, platform, platform_type, status) VALUES
('project-uuid', 'whatsapp', 'messaging', 'connected'),
('project-uuid', 'facebook_messenger', 'messaging', 'connected'),
('project-uuid', 'telegram', 'messaging', 'connected'),
('project-uuid', 'instagram_direct', 'messaging', 'connected');

-- 3. Contas de mensageria com diferentes brokers
INSERT INTO integration_accounts (integration_id, project_id, account_name, external_account_id, external_account_name, is_primary) VALUES
-- WhatsApp
('whatsapp-integration-uuid', 'project-uuid', 'WhatsApp UAZAPI', 'uazapi-instance-1', 'Vendas WhatsApp', true),
('whatsapp-integration-uuid', 'project-uuid', 'WhatsApp Evolution', 'evolution-instance-1', 'Suporte WhatsApp', false),

-- Facebook Messenger
('facebook-integration-uuid', 'project-uuid', 'Facebook Page Principal', 'page_123456789', 'Página Principal', true),
('facebook-integration-uuid', 'project-uuid', 'Facebook Page Suporte', 'page_987654321', 'Página Suporte', false),

-- Telegram
('telegram-integration-uuid', 'project-uuid', 'Telegram Bot Vendas', 'bot_123456789', 'Bot Vendas', true),
('telegram-integration-uuid', 'project-uuid', 'Telegram Bot Suporte', 'bot_987654321', 'Bot Suporte', false),

-- Instagram Direct
('instagram-integration-uuid', 'project-uuid', 'Instagram Business', 'instagram_123456789', 'Instagram Business', true);

-- 4. Configurações específicas por plataforma
INSERT INTO messaging_accounts (integration_account_id, project_id, platform, broker_type, account_identifier, account_name, broker_config, access_token) VALUES
-- WhatsApp UAZAPI
('account-uuid-1', 'project-uuid', 'whatsapp', 'uazapi', '5511999999999', 'Vendas WhatsApp', 
 '{"instance": "instance-123", "server": "https://uazapi.com"}', 'uazapi_key_123'),

-- WhatsApp Evolution
('account-uuid-2', 'project-uuid', 'whatsapp', 'evolution', '5511888888888', 'Suporte WhatsApp',
 '{"server": "https://evolution-api.com", "apikey": "evolution_key_456"}', 'evolution_token_456'),

-- Facebook Messenger
('account-uuid-3', 'project-uuid', 'facebook_messenger', 'facebook_page', 'page_123456789', 'Página Principal',
 '{"page_id": "123456789", "app_id": "app_123456"}', 'facebook_page_token_789'),

-- Telegram Bot
('account-uuid-4', 'project-uuid', 'telegram', 'telegram_bot', 'bot_123456789', 'Bot Vendas',
 '{"bot_token": "123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11", "guild_id": "guild_123"}', 'telegram_bot_token_456'),

-- Instagram Direct
('account-uuid-5', 'project-uuid', 'instagram_direct', 'instagram_business', 'instagram_123456789', 'Instagram Business',
 '{"instagram_account_id": "123456789", "facebook_page_id": "page_123456789"}', 'instagram_access_token_789');

-- 5. Webhooks para diferentes plataformas
INSERT INTO messaging_webhooks (messaging_account_id, project_id, webhook_url, webhook_secret, events) VALUES
-- Facebook Messenger
('account-uuid-3', 'project-uuid', 'https://api.facebook.com/webhook/messenger', 'facebook_webhook_secret', 
 '["messages", "messaging_postbacks", "messaging_optins"]'),

-- Telegram
('account-uuid-4', 'project-uuid', 'https://api.telegram.org/bot123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/setWebhook', 'telegram_webhook_secret', 
 '["message", "callback_query", "inline_query"]'),

-- Instagram Direct
('account-uuid-5', 'project-uuid', 'https://graph.facebook.com/webhook/instagram', 'instagram_webhook_secret', 
 '["messages", "messaging_postbacks", "messaging_optins"]');
```

### Cenário 2: Múltiplas Contas Meta Ads
```sql
-- Integração Meta
INSERT INTO integrations (project_id, platform, status) VALUES
('project-uuid', 'meta', 'connected');

-- Múltiplas contas Meta Ads
INSERT INTO integration_accounts (integration_id, project_id, account_name, external_account_id, external_account_name, is_primary) VALUES
('integration-uuid', 'project-uuid', 'Meta Ads Principal', 'act_123456789', 'Conta Principal', true),
('integration-uuid', 'project-uuid', 'Meta Ads Teste', 'act_987654321', 'Conta de Teste', false),
('integration-uuid', 'project-uuid', 'Meta Ads Internacional', 'act_456789123', 'Conta Internacional', false);

-- Dados específicos das contas de anúncios
INSERT INTO ad_accounts (integration_account_id, project_id, platform, account_name, external_account_id, currency, is_primary) VALUES
('account-uuid-1', 'project-uuid', 'meta', 'Meta Ads Principal', 'act_123456789', 'BRL', true),
('account-uuid-2', 'project-uuid', 'meta', 'Meta Ads Teste', 'act_987654321', 'BRL', false),
('account-uuid-3', 'project-uuid', 'meta', 'Meta Ads Internacional', 'act_456789123', 'USD', false);
```

### Cenário 3: Múltiplas Contas Google Ads
```sql
-- Integração Google
INSERT INTO integrations (project_id, platform, status) VALUES
('project-uuid', 'google', 'connected');

-- Múltiplas contas Google Ads
INSERT INTO integration_accounts (integration_id, project_id, account_name, external_account_id, external_account_name, is_primary) VALUES
('integration-uuid', 'project-uuid', 'Google Ads Search', '123-456-7890', 'Search Campaigns', true),
('integration-uuid', 'project-uuid', 'Google Ads Display', '987-654-3210', 'Display Campaigns', false),
('integration-uuid', 'project-uuid', 'Google Ads Shopping', '456-789-1230', 'Shopping Campaigns', false);

-- Dados específicos das contas de anúncios
INSERT INTO ad_accounts (integration_account_id, project_id, platform, account_name, external_account_id, currency, is_primary) VALUES
('account-uuid-1', 'project-uuid', 'google', 'Google Ads Search', '123-456-7890', 'BRL', true),
('account-uuid-2', 'project-uuid', 'google', 'Google Ads Display', '987-654-3210', 'BRL', false),
('account-uuid-3', 'project-uuid', 'google', 'Google Ads Shopping', '456-789-1230', 'BRL', false);
```

### Consultas Úteis para Múltiplas Integrações

#### Buscar todas as contas de mensageria de um projeto
```sql
SELECT 
    ma.platform,
    ma.account_identifier,
    ma.account_name,
    ma.broker_type,
    ma.status,
    ma.is_primary,
    ma.broker_config,
    ia.account_name as friendly_name,
    mb.display_name as broker_display_name,
    ma.total_messages,
    ma.total_contacts,
    ma.last_message_at
FROM messaging_accounts ma
JOIN integration_accounts ia ON ia.id = ma.integration_account_id
LEFT JOIN messaging_brokers mb ON mb.name = ma.broker_type
WHERE ma.project_id = 'project-uuid'
AND ma.status = 'active'
ORDER BY ma.platform, ma.is_primary DESC;
```

#### Buscar contas por plataforma específica
```sql
SELECT 
    ma.account_identifier,
    ma.account_name,
    ma.broker_type,
    ma.broker_config,
    ma.access_token,
    ma.webhook_url
FROM messaging_accounts ma
WHERE ma.project_id = 'project-uuid'
AND ma.platform = 'telegram'
AND ma.status = 'active';
```

#### Estatísticas por plataforma de mensageria
```sql
SELECT 
    ma.platform,
    mb.display_name as broker_name,
    COUNT(*) as total_accounts,
    COUNT(CASE WHEN ma.status = 'active' THEN 1 END) as active_accounts,
    SUM(ma.total_messages) as total_messages,
    SUM(ma.total_contacts) as total_contacts,
    AVG(ma.total_messages) as avg_messages_per_account
FROM messaging_accounts ma
LEFT JOIN messaging_brokers mb ON mb.name = ma.broker_type
WHERE ma.project_id = 'project-uuid'
GROUP BY ma.platform, mb.display_name
ORDER BY total_messages DESC;
```

#### Webhooks ativos por plataforma
```sql
SELECT 
    ma.platform,
    ma.account_name,
    mw.webhook_url,
    mw.events,
    mw.status as webhook_status,
    mw.last_triggered_at,
    mw.total_events
FROM messaging_webhooks mw
JOIN messaging_accounts ma ON ma.id = mw.messaging_account_id
WHERE mw.project_id = 'project-uuid'
AND mw.status = 'active'
ORDER BY ma.platform;
```

#### Mensagens processadas pelo orquestrador
```sql
SELECT 
    me.platform,
    me.sender_name,
    me.message_content,
    me.status,
    me.processing_completed_at,
    mr.rule_name,
    mre.actions_performed,
    mre.execution_time_ms
FROM messaging_events me
LEFT JOIN messaging_rule_executions mre ON mre.messaging_event_id = me.id
LEFT JOIN messaging_rules mr ON mr.id = mre.rule_id
WHERE me.project_id = 'project-uuid'
AND me.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY me.created_at DESC;
```

#### Regras ativas do orquestrador
```sql
SELECT 
    rule_name,
    rule_description,
    platform_filter,
    message_type_filter,
    content_filters,
    actions,
    priority,
    is_active
FROM messaging_rules
WHERE project_id = 'project-uuid'
AND is_active = true
ORDER BY priority DESC;
```

#### Estatísticas do orquestrador
```sql
SELECT 
    me.platform,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN me.status = 'processed' THEN 1 END) as processed_messages,
    COUNT(CASE WHEN me.status = 'failed' THEN 1 END) as failed_messages,
    AVG(mre.execution_time_ms) as avg_execution_time_ms,
    COUNT(DISTINCT me.sender_id) as unique_senders
FROM messaging_events me
LEFT JOIN messaging_rule_executions mre ON mre.messaging_event_id = me.id
WHERE me.project_id = 'project-uuid'
AND me.created_at >= NOW() - INTERVAL '7 days'
GROUP BY me.platform;
```

#### Buscar contas por broker específico
```sql
SELECT 
    wa.phone_number,
    wa.business_name,
    wa.broker_config,
    wa.api_key,
    wa.webhook_url
FROM whatsapp_accounts wa
WHERE wa.project_id = 'project-uuid'
AND wa.broker_type = 'uazapi'
AND wa.status = 'active';
```

#### Estatísticas por broker
```sql
SELECT 
    wa.broker_type,
    wb.display_name,
    COUNT(*) as total_accounts,
    COUNT(CASE WHEN wa.status = 'active' THEN 1 END) as active_accounts,
    SUM(wa.total_messages) as total_messages,
    AVG(wa.total_messages) as avg_messages_per_account
FROM whatsapp_accounts wa
LEFT JOIN whatsapp_brokers wb ON wb.name = wa.broker_type
WHERE wa.project_id = 'project-uuid'
GROUP BY wa.broker_type, wb.display_name;
```

#### Webhooks ativos por projeto
```sql
SELECT 
    wa.phone_number,
    wa.business_name,
    ww.webhook_url,
    ww.events,
    ww.status as webhook_status,
    ww.last_triggered_at,
    ww.total_events
FROM whatsapp_webhooks ww
JOIN whatsapp_accounts wa ON wa.id = ww.whatsapp_account_id
WHERE ww.project_id = 'project-uuid'
AND ww.status = 'active';
```

#### Buscar todas as contas de anúncios por plataforma
```sql
SELECT 
    aa.platform,
    aa.account_name,
    aa.external_account_id,
    aa.currency,
    aa.is_primary,
    aa.total_spend,
    ia.account_name as friendly_name
FROM ad_accounts aa
JOIN integration_accounts ia ON ia.id = aa.integration_account_id
WHERE aa.project_id = 'project-uuid'
AND aa.status = 'active'
ORDER BY aa.platform, aa.is_primary DESC;
```

#### Estatísticas consolidadas por plataforma
```sql
SELECT 
    aa.platform,
    COUNT(*) as total_accounts,
    COUNT(CASE WHEN aa.is_primary = true THEN 1 END) as primary_accounts,
    SUM(aa.total_spend) as total_spend,
    AVG(aa.total_spend) as avg_spend_per_account
FROM ad_accounts aa
WHERE aa.project_id = 'project-uuid'
AND aa.status = 'active'
GROUP BY aa.platform;
```

---

## 🔐 SISTEMA DE PERMISSÕES E ROLES

### Hierarquia de Permissões
```
Company Level:
├── owner: Controle total da empresa
├── admin: Gerenciar usuários e projetos
├── manager: Gerenciar projetos específicos
├── member: Acesso básico aos projetos
└── viewer: Apenas visualização

Project Level:
├── owner: Controle total do projeto
├── admin: Gerenciar usuários do projeto
├── manager: Gerenciar dados do projeto
├── member: Acesso básico aos dados
└── viewer: Apenas visualização
```

### Funções de Validação de Permissões
```sql
-- Função para verificar se usuário tem acesso à empresa
CREATE OR REPLACE FUNCTION user_has_company_access(user_uuid UUID, company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM company_users 
        WHERE user_id = user_uuid 
        AND company_id = company_uuid 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário tem acesso ao projeto
CREATE OR REPLACE FUNCTION user_has_project_access(user_uuid UUID, project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE p.id = project_uuid 
        AND cu.user_id = user_uuid 
        AND cu.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar role do usuário na empresa
CREATE OR REPLACE FUNCTION user_company_role(user_uuid UUID, company_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role
    FROM company_users 
    WHERE user_id = user_uuid 
    AND company_id = company_uuid 
    AND is_active = true;
    
    RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar role do usuário no projeto
CREATE OR REPLACE FUNCTION user_project_role(user_uuid UUID, project_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT pu.role INTO user_role
    FROM project_users pu
    JOIN projects p ON p.id = pu.project_id
    JOIN company_users cu ON cu.company_id = p.company_id
    WHERE pu.user_id = user_uuid 
    AND pu.project_id = project_uuid 
    AND pu.is_active = true
    AND cu.user_id = user_uuid
    AND cu.is_active = true;
    
    RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Triggers de Validação
```sql
-- Trigger para validar permissões ao criar projeto
CREATE OR REPLACE FUNCTION validate_project_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se o usuário tem acesso à empresa
    IF NOT user_has_company_access(NEW.created_by, NEW.company_id) THEN
        RAISE EXCEPTION 'Usuário não tem acesso à empresa';
    END IF;
    
    -- Verificar se o usuário tem permissão para criar projetos
    IF user_company_role(NEW.created_by, NEW.company_id) NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Usuário não tem permissão para criar projetos';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_project_creation_trigger
    BEFORE INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION validate_project_creation();

-- Trigger para adicionar automaticamente o criador como owner do projeto
CREATE OR REPLACE FUNCTION add_project_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO project_users (project_id, user_id, role, is_active, accepted_at)
    VALUES (NEW.id, NEW.created_by, 'owner', true, NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_project_creator_as_owner_trigger
    AFTER INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION add_project_creator_as_owner();
```

---

## 🔄 MIGRAÇÕES E VERSIONAMENTO

### Estrutura de Migrações
```
migrations/
├── 001_initial_schema.sql
├── 002_add_indexes.sql
├── 003_add_triggers.sql
├── 004_add_rls_policies.sql
├── 005_seed_system_data.sql
└── 006_add_analytics_tables.sql
```

### Exemplo de Migration
```sql
-- 001_initial_schema.sql
BEGIN;

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Criar tabelas na ordem correta (respeitando foreign keys)
-- [Código das tabelas aqui]

COMMIT;
```

---

## 📊 VIEWS E FUNÇÕES ÚTEIS

### 1. View de Métricas do Dashboard
```sql
CREATE VIEW dashboard_metrics_view AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(DISTINCT c.id) as total_contacts,
    COUNT(DISTINCT s.id) as total_sales,
    COALESCE(SUM(s.value), 0) as total_revenue,
    COALESCE(AVG(s.value), 0) as average_ticket,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sales,
    COUNT(DISTINCT CASE WHEN s.status = 'lost' THEN s.id END) as lost_sales
FROM projects p
LEFT JOIN contacts c ON c.project_id = p.id
LEFT JOIN sales s ON s.project_id = p.id
GROUP BY p.id, p.name;
```

### 2. Função para Calcular ROI
```sql
CREATE OR REPLACE FUNCTION calculate_roi(project_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_investment DECIMAL;
    total_revenue DECIMAL;
    roi_value DECIMAL;
BEGIN
    -- Calcular investimento total (soma dos gastos das APIs)
    SELECT COALESCE(SUM(ad_spend), 0) INTO total_investment
    FROM dashboard_metrics 
    WHERE project_id = project_uuid;
    
    -- Calcular receita total
    SELECT COALESCE(SUM(value), 0) INTO total_revenue
    FROM sales 
    WHERE project_id = project_uuid AND status = 'completed';
    
    -- Calcular ROI
    IF total_investment > 0 THEN
        roi_value := ((total_revenue - total_investment) / total_investment) * 100;
    ELSE
        roi_value := 0;
    END IF;
    
    RETURN roi_value;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 OTIMIZAÇÕES DE PERFORMANCE

### 1. Particionamento por Data
```sql
-- Particionar tabela de eventos por mês
CREATE TABLE conversion_events_y2024m01 PARTITION OF conversion_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE conversion_events_y2024m02 PARTITION OF conversion_events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### 2. Materialized Views para Relatórios
```sql
CREATE MATERIALIZED VIEW mv_origin_performance AS
SELECT 
    o.id as origin_id,
    o.name as origin_name,
    p.id as project_id,
    COUNT(DISTINCT c.id) as total_contacts,
    COUNT(DISTINCT s.id) as total_sales,
    COALESCE(SUM(s.value), 0) as total_revenue,
    CASE 
        WHEN COUNT(DISTINCT c.id) > 0 
        THEN (COUNT(DISTINCT s.id)::decimal / COUNT(DISTINCT c.id)::decimal) * 100 
        ELSE 0 
    END as conversion_rate
FROM origins o
JOIN projects p ON p.id = o.project_id OR o.project_id IS NULL
LEFT JOIN contacts c ON c.main_origin_id = o.id
LEFT JOIN sales s ON s.contact_id = c.id AND s.status = 'completed'
GROUP BY o.id, o.name, p.id;

-- Índice para a materialized view
CREATE UNIQUE INDEX idx_mv_origin_performance_unique ON mv_origin_performance(origin_id, project_id);
```

### 3. Configurações de PostgreSQL
```sql
-- Configurações recomendadas para performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

---

## 🔍 MONITORAMENTO E AUDITORIA

### 1. Tabela de Auditoria
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

### 2. Função de Auditoria
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, operation, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Fase 1 - Estrutura Base via MCP
- [x] ✅ Extensões disponíveis: `uuid-ossp`, `pgcrypto`, `pg_trgm`
- [ ] Criar tabelas principais via `mcp_supabase_apply_migration`
  - [ ] `user_profiles`, `companies`, `company_users`
  - [ ] `projects`, `project_users`, `project_settings`
  - [ ] `contacts`, `sales`, `origins`, `stages`
- [ ] Implementar foreign keys e constraints
- [ ] Criar índices básicos
- [ ] Configurar RLS policies via MCP

### ✅ Fase 2 - Funcionalidades Avançadas
- [ ] Implementar triggers de auditoria via MCP
- [ ] Criar funções de cálculo de métricas
- [ ] Implementar materialized views
- [ ] Configurar sistema de mensageria unificado
- [ ] Criar views de relatórios

### ✅ Fase 3 - Otimização via MCP
- [ ] Análise de performance com `mcp_supabase_execute_sql`
- [ ] Otimização de queries lentas
- [ ] Verificar advisors com `mcp_supabase_get_advisors`
- [ ] Implementação de cache
- [ ] Monitoramento via `mcp_supabase_get_logs`

### ✅ Fase 4 - Produção
- [x] ✅ Backup automático via Supabase
- [x] ✅ Replicação automática via Supabase
- [ ] Monitoramento de saúde via MCP
- [ ] Alertas de performance via MCP
- [ ] Documentação operacional

---

## 🔌 INTEGRAÇÃO COM MCP SUPABASE

### **Comandos MCP Disponíveis para Implementação**

#### **Migrations e Schema**
```bash
# Aplicar migration completa
mcp_supabase_apply_migration(name, query)

# Executar SQL diretamente
mcp_supabase_execute_sql(query)

# Listar tabelas existentes
mcp_supabase_list_tables(schemas=['public'])

# Verificar extensões instaladas
mcp_supabase_list_extensions()

# Listar migrations aplicadas
mcp_supabase_list_migrations()
```

#### **Monitoramento e Debug**
```bash
# Obter logs por serviço
mcp_supabase_get_logs(service='api'|'postgres'|'auth'|'storage')

# Verificar advisors de segurança/performance
mcp_supabase_get_advisors(type='security'|'performance')

# Gerar tipos TypeScript automaticamente
mcp_supabase_generate_typescript_types()
```

#### **Configuração do Projeto**
```bash
# Obter URL do projeto
mcp_supabase_get_project_url()

# Obter chave anônima
mcp_supabase_get_anon_key()
```

### **Estratégia de Implementação via MCP**

1. **Fase 1: Schema Base**
   - Aplicar migrations em ordem de dependência
   - Validar estrutura após cada migration
   - Verificar constraints e índices

2. **Fase 2: RLS e Segurança**
   - Aplicar políticas RLS via MCP
   - Testar permissões
   - Verificar advisors de segurança

3. **Fase 3: Otimização**
   - Analisar performance via logs
   - Aplicar otimizações baseadas em advisors
   - Monitorar métricas

### **Vantagens do MCP**
- ✅ **Execução direta** de SQL sem interface web
- ✅ **Integração nativa** com Cursor AI
- ✅ **Monitoramento em tempo real** via logs
- ✅ **Geração automática** de tipos TypeScript
- ✅ **Validação contínua** via advisors
- ✅ **Versionamento** automático de migrations

---

## 🎯 PRÓXIMOS PASSOS

### **Fase 1: Setup Supabase via MCP**
1. **Configurar projeto Supabase**
   - ✅ Projeto já criado: `https://nitefyufrzytdtxhaocf.supabase.co`
   - ✅ MCP conectado e funcional
   - ✅ Extensões disponíveis: `uuid-ossp`, `pgcrypto`, `pg_trgm`, etc.
   - Configurar RLS policies via MCP
   - Aplicar migrations via MCP
   - Configurar autenticação

2. **Implementar tabelas básicas via MCP**
   - Aplicar migrations usando `mcp_supabase_apply_migration`
   - Executar SQL via `mcp_supabase_execute_sql`
   - Validar estrutura via `mcp_supabase_list_tables`

### **Fase 2: Setup Workers**
1. **Configurar Cloudflare Workers**
   - Deploy inicial com Hono
   - Configurar CORS e middleware
   - Setup conexão com Supabase via service role

2. **Implementar lógica complexa**
   - Cálculo de métricas
   - Processamento de eventos
   - Integrações externas

### **Fase 3: Otimização**
1. **Performance**
   - Análise de queries lentas via MCP
   - Otimização de índices
   - Cache strategies

2. **Monitoramento**
   - Setup de alertas via MCP
   - Logs via `mcp_supabase_get_logs`
   - Health checks via MCP

---

## 🚀 RECOMENDAÇÕES ESPECÍFICAS

### **Para Supabase via MCP**
```typescript
// Configuração otimizada do cliente (para frontend)
const supabase = createClient(
  'https://nitefyufrzytdtxhaocf.supabase.co',
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Para Workers (service role)
const supabaseAdmin = createClient(
  'https://nitefyufrzytdtxhaocf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### **Comandos MCP Disponíveis**
```bash
# Aplicar migrations
mcp_supabase_apply_migration(name, query)

# Executar SQL
mcp_supabase_execute_sql(query)

# Listar tabelas
mcp_supabase_list_tables(schemas)

# Obter logs
mcp_supabase_get_logs(service)

# Gerar tipos TypeScript
mcp_supabase_generate_typescript_types()

# Verificar advisors
mcp_supabase_get_advisors(type)
```

### **Para Workers**
```typescript
// Estrutura recomendada para Workers
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger())

// Rotas otimizadas
app.get('/api/analytics/dashboard', analyticsHandler)
app.post('/api/events/process', eventProcessor)
app.get('/api/integrations/sync', integrationSync)
```

### **Divisão de Responsabilidades**
- **Supabase**: CRUD, Auth, Real-time, RLS
- **Workers**: Analytics, Integrations, Event Processing
- **Frontend**: UI/UX, State Management, Validation

---

---

## 📋 RESUMO DAS MELHORIAS IMPLEMENTADAS

### ✅ **Novas Tabelas Adicionadas**
- **`user_profiles`**: Perfil estendido (referencia auth.users)
- **`companies`**: Empresas/organizações
- **`company_users`**: Usuários da empresa com roles
- **`company_settings`**: Configurações globais da empresa
- **`project_users`**: Usuários específicos do projeto
- **`onboarding_progress`**: Progresso do onboarding
- **`integration_accounts`**: Múltiplas contas por plataforma
- **`whatsapp_accounts`**: Contas WhatsApp específicas
- **`ad_accounts`**: Contas de anúncios (Meta, Google, TikTok, LinkedIn)

### ✅ **Sistema de Permissões Hierárquico**
```
Empresa (Company Level)
├── owner: Controle total
├── admin: Gerenciar usuários/projetos
├── manager: Gerenciar projetos específicos
├── member: Acesso básico
└── viewer: Apenas visualização

Projeto (Project Level)
├── owner: Controle total do projeto
├── admin: Gerenciar usuários do projeto
├── manager: Gerenciar dados
├── member: Acesso básico
└── viewer: Apenas visualização
```

### ✅ **Fluxo de Usuário Otimizado**
1. **Cadastro** → `auth.users` (Supabase Auth)
2. **Perfil Estendido** → `user_profiles`
3. **Onboarding** → `companies` + `company_users` + `onboarding_progress`
4. **Criação de Projeto** → `projects` + `project_users`
5. **Configurações Globais** → `company_settings`
6. **Configurações do Projeto** → `project_settings`

### ✅ **RLS Policies Atualizadas**
- Políticas baseadas em **empresa** e **projeto**
- Validação de **permissões hierárquicas**
- **Segurança** em múltiplos níveis
- **Isolamento** de dados por empresa
- **Integração nativa** com Supabase Auth (`auth.uid()`)

### ✅ **Funções de Validação**
- `user_has_company_access()`: Verifica acesso à empresa
- `user_has_project_access()`: Verifica acesso ao projeto
- `user_company_role()`: Retorna role na empresa
- `user_project_role()`: Retorna role no projeto

### ✅ **Triggers de Segurança**
- Validação automática de permissões
- Adição automática do criador como owner
- Prevenção de acesso não autorizado

### ✅ **Sistema de Múltiplas Integrações**
- **Múltiplas contas WhatsApp** por projeto
- **Múltiplas contas Meta Ads** por projeto
- **Múltiplas contas Google Ads** por projeto
- **Múltiplas contas TikTok/LinkedIn** por projeto
- **Conta principal** identificada por plataforma
- **Configurações específicas** por conta
- **Estatísticas individuais** por conta

### ✅ **Sistema Unificado de Mensageria**
- **Arquitetura unificada** para todas as plataformas de mensageria
- **WhatsApp** (UAZAPI, Evolution, WhatsApp Business API)
- **Facebook Messenger** (Facebook Page, Webhooks)
- **Telegram** (Telegram Bot, Webhooks)
- **Instagram Direct** (Instagram Business API)
- **Discord** (Discord Bot)
- **Slack** (Slack App)
- **Múltiplos brokers** por plataforma
- **Configurações específicas** por broker
- **Webhooks unificados** para todas as plataformas
- **Autenticação flexível** (API Key, Bearer, Basic, Bot Token)
- **Campos obrigatórios** e opcionais por broker
- **Estatísticas consolidadas** e individuais
- **Reutilização de código** e lógica
- **Manutenção simplificada**

### ✅ **Orquestrador de Mensageria**
- **Processamento centralizado** de mensagens de todas as plataformas
- **Identificação automática** da empresa através do project_id
- **Regras configuráveis** por projeto e plataforma
- **Filtros inteligentes** por conteúdo, remetente e tipo de mensagem
- **Ações automatizadas** (auto_reply, create_contact, assign_stage)
- **Rate limiting** por regra e por período
- **Log completo** de execução e performance
- **Processamento assíncrono** via Workers
- **Escalabilidade** para múltiplas empresas
- **Manutenção centralizada** de lógicas de negócio

---

**📝 Notas Finais:**
- Esta documentação serve como base para implementação do backend via MCP
- ✅ **Projeto Supabase configurado**: `https://nitefyufrzytdtxhaocf.supabase.co`
- ✅ **MCP conectado** e pronto para implementação
- ✅ **Extensões disponíveis**: `uuid-ossp`, `pgcrypto`, `pg_trgm`
- Todas as constraints e validações devem ser implementadas via MCP
- Testes de performance devem ser realizados com dados reais
- ✅ **Backup automático** via Supabase (não requer configuração)
- ✅ **Monitoramento contínuo** via `mcp_supabase_get_logs`
- **Arquitetura híbrida** otimiza performance e custos
- **Supabase** para operações simples e real-time
- **Workers** para lógica complexa e integrações
- **Sistema de permissões** robusto e escalável
- **Multi-tenancy** com isolamento por empresa
- **Implementação via MCP** garante versionamento e controle

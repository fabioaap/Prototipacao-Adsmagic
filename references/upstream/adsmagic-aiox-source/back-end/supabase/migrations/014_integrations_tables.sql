-- Migration 014: Integrations Tables
-- Data: 2025-01-27
-- Descrição: Criar tabelas de integrações e contas de integrações
-- Baseado em: back-end/types.ts linhas 241-289

BEGIN;

-- ============================================================================
-- EXTENSÃO: pgcrypto para criptografia de tokens
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- TABELA: integrations
-- ============================================================================
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Plataforma
    platform VARCHAR(50) NOT NULL CHECK (platform IN (
        'whatsapp', 'facebook_messenger', 'telegram', 'instagram_direct',
        'meta', 'google', 'tiktok', 'linkedin', 'discord', 'slack'
    )),
    platform_type VARCHAR(20) NOT NULL CHECK (platform_type IN (
        'messaging', 'advertising', 'analytics', 'crm'
    )),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN (
        'connected', 'disconnected', 'error', 'syncing', 'pending'
    )),
    
    -- Configurações da plataforma
    platform_config JSONB DEFAULT '{}'::jsonb,
    
    -- Sincronização e erros
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Uma integração por plataforma por projeto
    UNIQUE(project_id, platform)
);

-- Comentários
COMMENT ON TABLE integrations IS 'Integrações configuradas por projeto';
COMMENT ON COLUMN integrations.platform IS 'Plataforma de integração (meta, google, etc)';
COMMENT ON COLUMN integrations.platform_type IS 'Tipo da plataforma (messaging, advertising, etc)';
COMMENT ON COLUMN integrations.status IS 'Status da integração';
COMMENT ON COLUMN integrations.platform_config IS 'Configurações específicas da plataforma';

-- ============================================================================
-- TABELA: integration_accounts
-- ============================================================================
CREATE TABLE integration_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Identificação da conta
    account_name VARCHAR(200) NOT NULL,
    external_account_id VARCHAR(200) NOT NULL,
    external_account_name VARCHAR(200) NOT NULL,
    external_email VARCHAR(200),
    
    -- Status da conta
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'inactive', 'error', 'expired'
    )),
    is_primary BOOLEAN DEFAULT false,
    
    -- Dados de autenticação (criptografados)
    access_token TEXT, -- Criptografado via pgcrypto
    refresh_token TEXT, -- Criptografado via pgcrypto
    token_expires_at TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '[]'::jsonb,
    
    -- Metadados específicos da conta
    account_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Estatísticas da conta
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN (
        'pending', 'syncing', 'success', 'error'
    )),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Uma conta externa por integração
    UNIQUE(integration_id, external_account_id)
);

-- Comentários
COMMENT ON TABLE integration_accounts IS 'Contas conectadas para cada integração';
COMMENT ON COLUMN integration_accounts.access_token IS 'Token de acesso criptografado (long-lived para Meta)';
COMMENT ON COLUMN integration_accounts.refresh_token IS 'Token de refresh criptografado (se disponível)';
COMMENT ON COLUMN integration_accounts.token_expires_at IS 'Data de expiração do token (~60 dias para Meta)';
COMMENT ON COLUMN integration_accounts.permissions IS 'Escopos/permissões concedidos';

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Integrations
CREATE INDEX idx_integrations_project_id ON integrations(project_id);
CREATE INDEX idx_integrations_platform ON integrations(platform);
CREATE INDEX idx_integrations_status ON integrations(status);

-- Integration Accounts
CREATE INDEX idx_integration_accounts_integration_id ON integration_accounts(integration_id);
CREATE INDEX idx_integration_accounts_project_id ON integration_accounts(project_id);
CREATE INDEX idx_integration_accounts_external_id ON integration_accounts(external_account_id);
CREATE INDEX idx_integration_accounts_status ON integration_accounts(status);

-- ============================================================================
-- TRIGGERS: updated_at
-- ============================================================================

-- Integrations
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Integration Accounts
CREATE TRIGGER update_integration_accounts_updated_at
    BEFORE UPDATE ON integration_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_accounts ENABLE ROW LEVEL SECURITY;

-- Policies para integrations
-- Usuários podem ver integrações dos projetos aos quais têm acesso
CREATE POLICY integrations_select_policy ON integrations
    FOR SELECT
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Usuários podem inserir integrações nos projetos aos quais têm acesso (admin ou owner)
CREATE POLICY integrations_insert_policy ON integrations
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() 
            AND is_active = true 
            AND role IN ('owner', 'admin')
        )
    );

-- Usuários podem atualizar integrações dos projetos aos quais têm acesso (admin ou owner)
CREATE POLICY integrations_update_policy ON integrations
    FOR UPDATE
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() 
            AND is_active = true 
            AND role IN ('owner', 'admin')
        )
    );

-- Usuários podem deletar integrações dos projetos aos quais têm acesso (owner apenas)
CREATE POLICY integrations_delete_policy ON integrations
    FOR DELETE
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() 
            AND is_active = true 
            AND role = 'owner'
        )
    );

-- Policies para integration_accounts
-- Usuários podem ver contas de integrações dos projetos aos quais têm acesso
CREATE POLICY integration_accounts_select_policy ON integration_accounts
    FOR SELECT
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Usuários podem inserir contas nos projetos aos quais têm acesso (admin ou owner)
CREATE POLICY integration_accounts_insert_policy ON integration_accounts
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() 
            AND is_active = true 
            AND role IN ('owner', 'admin')
        )
    );

-- Usuários podem atualizar contas dos projetos aos quais têm acesso (admin ou owner)
CREATE POLICY integration_accounts_update_policy ON integration_accounts
    FOR UPDATE
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() 
            AND is_active = true 
            AND role IN ('owner', 'admin')
        )
    );

-- Usuários podem deletar contas dos projetos aos quais têm acesso (owner apenas)
CREATE POLICY integration_accounts_delete_policy ON integration_accounts
    FOR DELETE
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() 
            AND is_active = true 
            AND role = 'owner'
        )
    );

COMMIT;


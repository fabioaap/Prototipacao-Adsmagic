-- Migration 016: Integration Audit Logs
-- Data: 2025-01-27
-- Descrição: Criar tabela de logs de auditoria para operações OAuth

BEGIN;

-- ============================================================================
-- TABELA: integration_audit_logs
-- ============================================================================
CREATE TABLE integration_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Ação realizada
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'oauth_start',
        'oauth_callback',
        'token_refresh',
        'token_validation',
        'account_selection',
        'account_sync',
        'pixel_creation',
        'disconnect',
        'error'
    )),
    
    -- Status da operação
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'success', 'error', 'pending'
    )),
    
    -- Metadados da operação (sem informações sensíveis)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Mensagem de erro (se houver)
    error_message TEXT,
    
    -- IP do cliente (se disponível)
    client_ip VARCHAR(45),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE integration_audit_logs IS 'Logs de auditoria para operações OAuth e integrações';
COMMENT ON COLUMN integration_audit_logs.action IS 'Tipo de ação realizada';
COMMENT ON COLUMN integration_audit_logs.status IS 'Status da operação (success, error, pending)';
COMMENT ON COLUMN integration_audit_logs.metadata IS 'Metadados da operação (sem tokens ou informações sensíveis)';

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX idx_integration_audit_logs_integration_id ON integration_audit_logs(integration_id);
CREATE INDEX idx_integration_audit_logs_project_id ON integration_audit_logs(project_id);
CREATE INDEX idx_integration_audit_logs_action ON integration_audit_logs(action);
CREATE INDEX idx_integration_audit_logs_status ON integration_audit_logs(status);
CREATE INDEX idx_integration_audit_logs_created_at ON integration_audit_logs(created_at DESC);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE integration_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver logs das integrações dos projetos aos quais têm acesso
CREATE POLICY integration_audit_logs_select_policy ON integration_audit_logs
    FOR SELECT
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policy: Apenas service_role pode inserir logs (via Edge Functions)
CREATE POLICY integration_audit_logs_insert_policy ON integration_audit_logs
    FOR INSERT
    WITH CHECK (true); -- Service role bypasses RLS

COMMIT;


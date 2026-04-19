-- Migration 009: Additional Indexes
-- Data: 2025-01-27
-- Descrição: Criar índices adicionais para foreign keys e performance
-- Baseado em: avisos de performance do MCP advisor

BEGIN;

-- ============================================================================
-- ÍNDICES PARA FOREIGN KEYS SEM COBERTURA
-- ============================================================================

-- Índice para company_users.invited_by
CREATE INDEX idx_company_users_invited_by ON company_users(invited_by) WHERE invited_by IS NOT NULL;

-- Índice para project_users.invited_by
CREATE INDEX idx_project_users_invited_by ON project_users(invited_by) WHERE invited_by IS NOT NULL;

-- ============================================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================================================

-- Índices compostos para queries frequentes
CREATE INDEX idx_company_users_company_user_active ON company_users(company_id, user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_project_users_project_user_active ON project_users(project_id, user_id, is_active) WHERE is_active = true;

-- Índices para queries de convites
CREATE INDEX idx_company_users_invites_pending ON company_users(invited_at, is_active) WHERE is_active = false AND invited_at IS NOT NULL;
CREATE INDEX idx_project_users_invites_pending ON project_users(invited_at, is_active) WHERE is_active = false AND invited_at IS NOT NULL;

-- Índices para onboarding progress
CREATE INDEX idx_onboarding_progress_user_company ON onboarding_progress(user_id, company_id, is_completed);

-- ============================================================================
-- REMOVER ÍNDICE DUPLICADO (se existir)
-- ============================================================================

-- Verificar se existe índice duplicado e remover
DROP INDEX IF EXISTS company_settings_company_id_key;

COMMIT;

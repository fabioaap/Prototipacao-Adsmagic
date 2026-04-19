-- RLS Policies 003: Company Settings and Onboarding
-- Data: 2025-01-27
-- Descrição: Implementar RLS policies para company_settings e onboarding_progress
-- Baseado em: doc/database-schema.md linhas 1413-1420

BEGIN;

-- ============================================================================
-- HABILITAR RLS NAS NOVAS TABELAS
-- ============================================================================

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES PARA company_settings
-- ============================================================================

-- Policy para configurações da empresa
-- Membros da empresa podem visualizar e modificar configurações
CREATE POLICY company_settings_user_policy ON company_settings
    FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager')
        )
    );

-- ============================================================================
-- POLICIES PARA onboarding_progress
-- ============================================================================

-- Policy para progresso do onboarding
-- Usuário só pode acessar seu próprio progresso de onboarding
CREATE POLICY onboarding_progress_user_policy ON onboarding_progress
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy para admins da empresa visualizarem onboarding de membros
CREATE POLICY onboarding_progress_admin_policy ON onboarding_progress
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

COMMIT;

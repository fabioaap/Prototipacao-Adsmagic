-- RLS Policies 004: Optimization
-- Data: 2025-01-27
-- Descrição: Otimizar RLS policies existentes para melhor performance
-- Baseado em: avisos de performance do MCP advisor

BEGIN;

-- ============================================================================
-- OTIMIZAR RLS POLICIES EXISTENTES
-- ============================================================================

-- 1. Otimizar policies usando (select auth.uid()) ao invés de auth.uid()

-- Remover policies antigas e criar novas otimizadas
DROP POLICY IF EXISTS user_profiles_user_policy ON user_profiles;
DROP POLICY IF EXISTS companies_user_policy ON companies;
DROP POLICY IF EXISTS companies_create_policy ON companies;
DROP POLICY IF EXISTS companies_modify_policy ON companies;
DROP POLICY IF EXISTS company_users_view_policy ON company_users;
DROP POLICY IF EXISTS company_users_manage_policy ON company_users;
DROP POLICY IF EXISTS company_users_accept_policy ON company_users;
DROP POLICY IF EXISTS projects_user_policy ON projects;
DROP POLICY IF EXISTS projects_create_policy ON projects;
DROP POLICY IF EXISTS projects_modify_policy ON projects;
DROP POLICY IF EXISTS project_users_view_policy ON project_users;
DROP POLICY IF EXISTS project_users_manage_policy ON project_users;
DROP POLICY IF EXISTS project_users_accept_policy ON project_users;
DROP POLICY IF EXISTS company_settings_user_policy ON company_settings;
DROP POLICY IF EXISTS onboarding_progress_user_policy ON onboarding_progress;
DROP POLICY IF EXISTS onboarding_progress_admin_policy ON onboarding_progress;

-- ============================================================================
-- POLICIES OTIMIZADAS PARA USER_PROFILES
-- ============================================================================
CREATE POLICY user_profiles_user_policy ON user_profiles
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- ============================================================================
-- POLICIES OTIMIZADAS PARA COMPANIES
-- ============================================================================
CREATE POLICY companies_user_policy ON companies
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY companies_create_policy ON companies
    FOR INSERT TO authenticated
    WITH CHECK (true); -- Ajustar conforme regras de negócio

CREATE POLICY companies_modify_policy ON companies
    FOR UPDATE TO authenticated
    USING (
        id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY companies_delete_policy ON companies
    FOR DELETE TO authenticated
    USING (
        id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role = 'owner'
        )
    );

-- ============================================================================
-- POLICIES OTIMIZADAS PARA COMPANY_USERS
-- ============================================================================
CREATE POLICY company_users_view_policy ON company_users
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM company_users cu2 
            WHERE cu2.company_id = company_users.company_id 
            AND cu2.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY company_users_manage_policy ON company_users
    FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM company_users cu2 
            WHERE cu2.company_id = company_users.company_id 
            AND cu2.user_id = (SELECT auth.uid()) 
            AND cu2.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM company_users cu2 
            WHERE cu2.company_id = company_users.company_id 
            AND cu2.user_id = (SELECT auth.uid()) 
            AND cu2.role IN ('owner', 'admin')
        )
    );

CREATE POLICY company_users_accept_policy ON company_users
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()) AND accepted_at IS NULL)
    WITH CHECK (user_id = (SELECT auth.uid()) AND accepted_at IS NOT NULL);

-- ============================================================================
-- POLICIES OTIMIZADAS PARA PROJECTS
-- ============================================================================
CREATE POLICY projects_user_policy ON projects
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY projects_create_policy ON projects
    FOR INSERT TO authenticated
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY projects_modify_policy ON projects
    FOR UPDATE TO authenticated
    USING (
        id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role IN ('owner', 'admin', 'manager')
        )
    )
    WITH CHECK (
        id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role IN ('owner', 'admin', 'manager')
        )
    );

CREATE POLICY projects_delete_policy ON projects
    FOR DELETE TO authenticated
    USING (
        id IN (
            SELECT project_id 
            FROM project_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role = 'owner'
        )
    );

-- ============================================================================
-- POLICIES OTIMIZADAS PARA PROJECT_USERS
-- ============================================================================
CREATE POLICY project_users_view_policy ON project_users
    FOR SELECT TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users pu2 
            WHERE pu2.project_id = project_users.project_id 
            AND pu2.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY project_users_manage_policy ON project_users
    FOR ALL TO authenticated
    USING (
        project_id IN (
            SELECT project_id 
            FROM project_users pu2 
            WHERE pu2.project_id = project_users.project_id 
            AND pu2.user_id = (SELECT auth.uid()) 
            AND pu2.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM project_users pu2 
            WHERE pu2.project_id = project_users.project_id 
            AND pu2.user_id = (SELECT auth.uid()) 
            AND pu2.role IN ('owner', 'admin')
        )
    );

CREATE POLICY project_users_accept_policy ON project_users
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()) AND accepted_at IS NULL)
    WITH CHECK (user_id = (SELECT auth.uid()) AND accepted_at IS NOT NULL);

-- ============================================================================
-- POLICIES OTIMIZADAS PARA COMPANY_SETTINGS
-- ============================================================================
CREATE POLICY company_settings_user_policy ON company_settings
    FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role IN ('owner', 'admin', 'manager')
        )
    );

-- ============================================================================
-- POLICIES OTIMIZADAS PARA ONBOARDING_PROGRESS
-- ============================================================================
CREATE POLICY onboarding_progress_user_policy ON onboarding_progress
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY onboarding_progress_admin_policy ON onboarding_progress
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM company_users 
            WHERE user_id = (SELECT auth.uid()) 
            AND role IN ('owner', 'admin')
        )
    );

COMMIT;

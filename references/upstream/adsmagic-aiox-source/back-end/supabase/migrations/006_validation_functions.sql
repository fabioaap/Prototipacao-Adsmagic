-- Migration 006: Validation Functions
-- Data: 2025-01-27
-- Descrição: Criar funções de validação de acesso para empresas e projetos
-- Baseado em: doc/database-schema.md linhas 946-1016

BEGIN;

-- ============================================================================
-- FUNÇÃO: user_has_company_access(company_uuid UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_has_company_access(company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM company_users 
        WHERE company_id = company_uuid 
        AND user_id = auth.uid() 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: user_has_project_access(project_uuid UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_has_project_access(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM project_users pu
        JOIN projects p ON p.id = pu.project_id
        WHERE pu.project_id = project_uuid 
        AND pu.user_id = auth.uid() 
        AND pu.is_active = true
        AND p.status != 'archived'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: user_company_role(company_uuid UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_company_role(company_uuid UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    user_role VARCHAR(20);
BEGIN
    SELECT role INTO user_role
    FROM company_users 
    WHERE company_id = company_uuid 
    AND user_id = auth.uid() 
    AND is_active = true;
    
    RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: user_project_role(project_uuid UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_project_role(project_uuid UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    user_role VARCHAR(20);
BEGIN
    SELECT pu.role INTO user_role
    FROM project_users pu
    JOIN projects p ON p.id = pu.project_id
    WHERE pu.project_id = project_uuid 
    AND pu.user_id = auth.uid() 
    AND pu.is_active = true
    AND p.status != 'archived';
    
    RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: user_can_manage_company(company_uuid UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_can_manage_company(company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM company_users 
        WHERE company_id = company_uuid 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: user_can_manage_project(project_uuid UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_can_manage_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM project_users pu
        JOIN projects p ON p.id = pu.project_id
        WHERE pu.project_id = project_uuid 
        AND pu.user_id = auth.uid() 
        AND pu.role IN ('owner', 'admin', 'manager')
        AND pu.is_active = true
        AND p.status != 'archived'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: user_is_company_owner(company_uuid UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_is_company_owner(company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM company_users 
        WHERE company_id = company_uuid 
        AND user_id = auth.uid() 
        AND role = 'owner'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: user_is_project_owner(project_uuid UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION user_is_project_owner(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM project_users pu
        JOIN projects p ON p.id = pu.project_id
        WHERE pu.project_id = project_uuid 
        AND pu.user_id = auth.uid() 
        AND pu.role = 'owner'
        AND pu.is_active = true
        AND p.status != 'archived'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

COMMIT;

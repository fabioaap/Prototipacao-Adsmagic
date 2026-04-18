-- Migration 003: Audit Triggers
-- Data: 2025-01-27
-- Descrição: Triggers de auditoria para updated_at e criação automática de project_users
-- Baseado em: doc/database-schema.md linhas 1269-1290, 2089-2102

BEGIN;

-- ============================================================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS PARA updated_at
-- ============================================================================

-- Trigger para user_profiles
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para companies
CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para company_users
CREATE TRIGGER trigger_company_users_updated_at
    BEFORE UPDATE ON company_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para projects
CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para project_users
CREATE TRIGGER trigger_project_users_updated_at
    BEFORE UPDATE ON project_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÃO PARA ADICIONAR CRIADOR COMO OWNER DO PROJETO
-- ============================================================================
CREATE OR REPLACE FUNCTION add_project_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir o criador como owner do projeto
    INSERT INTO project_users (
        project_id,
        user_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.created_by,
        'owner',
        true,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER PARA ADICIONAR CRIADOR COMO OWNER
-- ============================================================================
CREATE TRIGGER trigger_add_project_creator_as_owner
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION add_project_creator_as_owner();

COMMIT;

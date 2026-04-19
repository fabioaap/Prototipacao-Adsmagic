-- Migration 007: Security Triggers
-- Data: 2025-01-27
-- Descrição: Criar triggers de segurança para configurações e onboarding
-- Baseado em: doc/database-schema.md linhas 2089-2150

BEGIN;

-- ============================================================================
-- TRIGGER: Criar configurações ao criar empresa
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_create_company_settings()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar configurações padrão para a nova empresa
    INSERT INTO company_settings (company_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

CREATE TRIGGER create_company_settings_trigger
    AFTER INSERT ON companies
    FOR EACH ROW EXECUTE FUNCTION trigger_create_company_settings();

-- ============================================================================
-- TRIGGER: Criar progresso de onboarding ao criar usuário
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_create_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar progresso de onboarding para o novo usuário
    INSERT INTO onboarding_progress (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

CREATE TRIGGER create_onboarding_progress_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION trigger_create_onboarding_progress();

-- ============================================================================
-- TRIGGER: Validar pelo menos um owner por empresa
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_validate_company_owner()
RETURNS TRIGGER AS $$
DECLARE
    owner_count INTEGER;
BEGIN
    -- Se está removendo um owner ou desativando um owner
    IF (TG_OP = 'DELETE' AND OLD.role = 'owner' AND OLD.is_active = true) OR
       (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND OLD.is_active = true AND 
        (NEW.role != 'owner' OR NEW.is_active = false)) THEN
        
        -- Contar owners ativos restantes na empresa
        SELECT COUNT(*) INTO owner_count
        FROM company_users
        WHERE company_id = COALESCE(OLD.company_id, NEW.company_id)
        AND role = 'owner'
        AND is_active = true
        AND user_id != COALESCE(OLD.user_id, NEW.user_id);
        
        -- Se não há owners restantes, impedir a operação
        IF owner_count = 0 THEN
            RAISE EXCEPTION 'Empresa deve ter pelo menos um owner ativo';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

CREATE TRIGGER validate_company_owner_trigger
    BEFORE UPDATE OR DELETE ON company_users
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_company_owner();

-- ============================================================================
-- TRIGGER: Validar pelo menos um owner por projeto
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_validate_project_owner()
RETURNS TRIGGER AS $$
DECLARE
    owner_count INTEGER;
BEGIN
    -- Se está removendo um owner ou desativando um owner
    IF (TG_OP = 'DELETE' AND OLD.role = 'owner' AND OLD.is_active = true) OR
       (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND OLD.is_active = true AND 
        (NEW.role != 'owner' OR NEW.is_active = false)) THEN
        
        -- Contar owners ativos restantes no projeto
        SELECT COUNT(*) INTO owner_count
        FROM project_users
        WHERE project_id = COALESCE(OLD.project_id, NEW.project_id)
        AND role = 'owner'
        AND is_active = true
        AND user_id != COALESCE(OLD.user_id, NEW.user_id);
        
        -- Se não há owners restantes, impedir a operação
        IF owner_count = 0 THEN
            RAISE EXCEPTION 'Projeto deve ter pelo menos um owner ativo';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

CREATE TRIGGER validate_project_owner_trigger
    BEFORE UPDATE OR DELETE ON project_users
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_project_owner();

-- ============================================================================
-- TRIGGER: Atualizar updated_at para company_settings
-- ============================================================================
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- TRIGGER: Atualizar updated_at para onboarding_progress
-- ============================================================================
CREATE TRIGGER update_onboarding_progress_updated_at
    BEFORE UPDATE ON onboarding_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

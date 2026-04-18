-- Migration 008: Invite System
-- Data: 2025-01-27
-- Descrição: Criar sistema de convites para empresas e projetos
-- Baseado em: funcionalidades de convite do sistema

BEGIN;

-- ============================================================================
-- FUNÇÃO: invite_user_to_company()
-- ============================================================================
CREATE OR REPLACE FUNCTION invite_user_to_company(
    p_company_id UUID,
    p_user_email VARCHAR(255),
    p_role VARCHAR(20) DEFAULT 'member',
    p_permissions JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_inviter_id UUID;
    v_inviter_role VARCHAR(20);
    v_target_user_id UUID;
    v_result JSONB;
BEGIN
    -- Verificar se o usuário atual tem permissão para convidar
    v_inviter_id := auth.uid();
    
    IF v_inviter_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não autenticado'
        );
    END IF;
    
    -- Verificar se o usuário tem permissão para convidar
    SELECT role INTO v_inviter_role
    FROM company_users
    WHERE company_id = p_company_id
    AND user_id = v_inviter_id
    AND is_active = true;
    
    IF v_inviter_role NOT IN ('owner', 'admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sem permissão para convidar usuários'
        );
    END IF;
    
    -- Verificar se o role do convite é válido
    IF p_role NOT IN ('owner', 'admin', 'manager', 'member', 'viewer') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Role inválido'
        );
    END IF;
    
    -- Verificar se o usuário alvo existe
    SELECT id INTO v_target_user_id
    FROM auth.users
    WHERE email = p_user_email;
    
    IF v_target_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;
    
    -- Verificar se o usuário já é membro da empresa
    IF EXISTS (
        SELECT 1 FROM company_users
        WHERE company_id = p_company_id
        AND user_id = v_target_user_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário já é membro da empresa'
        );
    END IF;
    
    -- Criar o convite
    INSERT INTO company_users (
        company_id,
        user_id,
        role,
        permissions,
        is_active,
        invited_by,
        invited_at
    ) VALUES (
        p_company_id,
        v_target_user_id,
        p_role,
        p_permissions,
        false,
        v_inviter_id,
        NOW()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite enviado com sucesso',
        'invited_user_id', v_target_user_id,
        'role', p_role
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: accept_company_invite()
-- ============================================================================
CREATE OR REPLACE FUNCTION accept_company_invite(p_company_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não autenticado'
        );
    END IF;
    
    -- Verificar se existe convite pendente
    IF NOT EXISTS (
        SELECT 1 FROM company_users
        WHERE company_id = p_company_id
        AND user_id = v_user_id
        AND is_active = false
        AND invited_at IS NOT NULL
        AND accepted_at IS NULL
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Convite não encontrado ou já aceito'
        );
    END IF;
    
    -- Aceitar o convite
    UPDATE company_users
    SET is_active = true,
        accepted_at = NOW()
    WHERE company_id = p_company_id
    AND user_id = v_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite aceito com sucesso',
        'company_id', p_company_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: invite_user_to_project()
-- ============================================================================
CREATE OR REPLACE FUNCTION invite_user_to_project(
    p_project_id UUID,
    p_user_email VARCHAR(255),
    p_role VARCHAR(20) DEFAULT 'member',
    p_permissions JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_inviter_id UUID;
    v_inviter_role VARCHAR(20);
    v_target_user_id UUID;
    v_company_id UUID;
    v_result JSONB;
BEGIN
    v_inviter_id := auth.uid();
    
    IF v_inviter_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não autenticado'
        );
    END IF;
    
    -- Obter company_id do projeto
    SELECT company_id INTO v_company_id
    FROM projects
    WHERE id = p_project_id;
    
    IF v_company_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Projeto não encontrado'
        );
    END IF;
    
    -- Verificar se o usuário tem permissão para convidar no projeto
    SELECT pu.role INTO v_inviter_role
    FROM project_users pu
    WHERE pu.project_id = p_project_id
    AND pu.user_id = v_inviter_id
    AND pu.is_active = true;
    
    IF v_inviter_role NOT IN ('owner', 'admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sem permissão para convidar usuários para o projeto'
        );
    END IF;
    
    -- Verificar se o usuário alvo existe
    SELECT id INTO v_target_user_id
    FROM auth.users
    WHERE email = p_user_email;
    
    IF v_target_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;
    
    -- Verificar se o usuário já é membro do projeto
    IF EXISTS (
        SELECT 1 FROM project_users
        WHERE project_id = p_project_id
        AND user_id = v_target_user_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário já é membro do projeto'
        );
    END IF;
    
    -- Criar o convite
    INSERT INTO project_users (
        project_id,
        user_id,
        role,
        permissions,
        is_active,
        invited_by,
        invited_at
    ) VALUES (
        p_project_id,
        v_target_user_id,
        p_role,
        p_permissions,
        false,
        v_inviter_id,
        NOW()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite enviado com sucesso',
        'invited_user_id', v_target_user_id,
        'role', p_role
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- ============================================================================
-- FUNÇÃO: accept_project_invite()
-- ============================================================================
CREATE OR REPLACE FUNCTION accept_project_invite(p_project_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não autenticado'
        );
    END IF;
    
    -- Verificar se existe convite pendente
    IF NOT EXISTS (
        SELECT 1 FROM project_users
        WHERE project_id = p_project_id
        AND user_id = v_user_id
        AND is_active = false
        AND invited_at IS NOT NULL
        AND accepted_at IS NULL
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Convite não encontrado ou já aceito'
        );
    END IF;
    
    -- Aceitar o convite
    UPDATE project_users
    SET is_active = true,
        accepted_at = NOW()
    WHERE project_id = p_project_id
    AND user_id = v_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite aceito com sucesso',
        'project_id', p_project_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

COMMIT;

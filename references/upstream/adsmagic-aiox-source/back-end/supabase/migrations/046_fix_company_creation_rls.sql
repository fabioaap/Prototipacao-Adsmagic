-- Migration 046: Fix Company Creation RLS Circular Dependency
-- Data: 2025-01-27
-- Descrição: Corrigir dependência circular nas políticas RLS que impede criação de empresas
-- 
-- Problema: Ao criar uma empresa, a política de company_settings verifica se o usuário
-- é membro consultando company_users, mas a política de SELECT de company_users só
-- permite ver registros onde o usuário já é membro, criando dependência circular.
--
-- Solução: Adicionar política que permite ao usuário ver seus próprios registros em
-- company_users, permitindo que a verificação de company_settings funcione corretamente.

BEGIN;

-- ============================================================================
-- CORRIGIR POLÍTICA DE COMPANY_USERS PARA PERMITIR VISUALIZAÇÃO PRÓPRIA
-- ============================================================================

-- Adicionar política que permite ao usuário ver seus próprios registros em company_users
-- Isso resolve a dependência circular ao criar empresa
CREATE POLICY company_users_own_policy ON company_users
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- CORRIGIR POLÍTICA DE COMPANY_SETTINGS PARA PERMITIR CRIAÇÃO INICIAL
-- ============================================================================

-- A política atual exige que o usuário já seja membro, mas durante a criação
-- da empresa, precisamos permitir que o owner crie os settings iniciais.
-- A política existente já verifica role, mas precisa ver o registro recém-criado.
-- A política company_users_own_policy acima resolve isso.

COMMIT;

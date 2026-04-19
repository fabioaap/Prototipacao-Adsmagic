-- Migration 044: Fix Contacts RLS Policies
-- Data: 2026-01-23
-- Descrição: Corrigir políticas RLS de contacts para usar project_users diretamente
-- Problema: Políticas atuais usam company_users através de JOIN, causando problemas de permissão
-- Solução: Usar project_users diretamente, seguindo o padrão de sales

BEGIN;

-- ============================================================================
-- CORRIGIR RLS POLICIES PARA CONTACTS
-- ============================================================================
-- Substituir políticas que usam company_users por project_users diretamente

-- Remover políticas antigas
DROP POLICY IF EXISTS "contacts_user_select_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_user_insert_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_user_update_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_user_delete_policy" ON contacts;

-- Policy: SELECT - Usuário pode ver contatos dos projetos que participa
CREATE POLICY "contacts_user_select_policy" ON contacts
    FOR SELECT TO authenticated
    USING (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
        )
    );

-- Policy: INSERT - Usuário pode criar contatos nos projetos (roles permitidas)
CREATE POLICY "contacts_user_insert_policy" ON contacts
    FOR INSERT TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
            AND pu.role IN ('owner', 'admin', 'manager', 'member')
        )
    );

-- Policy: UPDATE - Usuário pode atualizar contatos dos projetos (roles permitidas)
CREATE POLICY "contacts_user_update_policy" ON contacts
    FOR UPDATE TO authenticated
    USING (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
            AND pu.role IN ('owner', 'admin', 'manager', 'member')
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
            AND pu.role IN ('owner', 'admin', 'manager', 'member')
        )
    );

-- Policy: DELETE - Usuário pode deletar contatos (apenas roles gerenciais)
CREATE POLICY "contacts_user_delete_policy" ON contacts
    FOR DELETE TO authenticated
    USING (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
            AND pu.role IN ('owner', 'admin', 'manager')
        )
    );

COMMIT;

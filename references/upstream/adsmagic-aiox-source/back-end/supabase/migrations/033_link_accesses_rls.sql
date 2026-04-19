-- Migration 033: Link Accesses RLS Policies
-- Data: 2026-01-17
-- Descrição: Políticas de segurança Row Level Security para tabela link_accesses
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 2)

BEGIN;

-- ============================================================================
-- RLS POLICIES PARA LINK_ACCESSES
-- ============================================================================
-- Acesso de leitura baseado em project_users.
-- Inserção pública permitida para tracking (sem autenticação).

-- Policy: SELECT - Usuário pode ver acessos dos projetos que participa
CREATE POLICY "link_accesses_select_policy" ON link_accesses
    FOR SELECT
    USING (
        project_id IN (
            SELECT pu.project_id 
            FROM project_users pu 
            WHERE pu.user_id = auth.uid() 
            AND pu.is_active = true
        )
    );

-- Policy: INSERT - Inserção pública permitida para tracking
-- IMPORTANTE: Esta policy permite inserção sem autenticação para que
-- o sistema de tracking possa registrar acessos de visitantes anônimos.
-- A validação do link_id e project_id é feita na Edge Function.
CREATE POLICY "link_accesses_insert_public_policy" ON link_accesses
    FOR INSERT
    WITH CHECK (true);

-- Policy: UPDATE - Apenas sistema pode atualizar (via service role)
-- Usuários autenticados podem atualizar acessos dos seus projetos
-- (usado para atribuir contact_id quando conversão ocorre)
CREATE POLICY "link_accesses_update_policy" ON link_accesses
    FOR UPDATE
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

-- Policy: DELETE - Apenas roles gerenciais podem deletar
CREATE POLICY "link_accesses_delete_policy" ON link_accesses
    FOR DELETE
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

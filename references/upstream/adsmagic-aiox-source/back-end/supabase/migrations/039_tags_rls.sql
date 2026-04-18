-- Migration 039: Tags RLS Policies
-- Data: 2026-01-20
-- Descrição: Criar RLS policies para tabelas tags e contact_tags
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 5)

BEGIN;

-- ============================================================================
-- RLS POLICIES: tags
-- ============================================================================

-- Policy: Usuários podem visualizar tags dos projetos aos quais têm acesso
CREATE POLICY "Users can view tags in their projects"
    ON tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = tags.project_id
            AND project_users.user_id = auth.uid()
            AND project_users.is_active = true
        )
    );

-- Policy: Usuários podem criar tags nos projetos aos quais têm acesso
CREATE POLICY "Users can create tags in their projects"
    ON tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = tags.project_id
            AND project_users.user_id = auth.uid()
            AND project_users.is_active = true
        )
    );

-- Policy: Usuários podem atualizar tags dos projetos aos quais têm acesso
CREATE POLICY "Users can update tags in their projects"
    ON tags FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = tags.project_id
            AND project_users.user_id = auth.uid()
            AND project_users.is_active = true
        )
    );

-- Policy: Usuários podem deletar tags dos projetos aos quais têm acesso
CREATE POLICY "Users can delete tags in their projects"
    ON tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = tags.project_id
            AND project_users.user_id = auth.uid()
            AND project_users.is_active = true
        )
    );

-- ============================================================================
-- RLS POLICIES: contact_tags
-- ============================================================================

-- Policy: Usuários podem visualizar associações de tags de contatos dos projetos aos quais têm acesso
CREATE POLICY "Users can view contact_tags in their projects"
    ON contact_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM contacts c
            JOIN project_users pu ON pu.project_id = c.project_id
            WHERE c.id = contact_tags.contact_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
    );

-- Policy: Usuários podem criar associações de tags em contatos dos projetos aos quais têm acesso
CREATE POLICY "Users can create contact_tags in their projects"
    ON contact_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contacts c
            JOIN project_users pu ON pu.project_id = c.project_id
            WHERE c.id = contact_tags.contact_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
        AND EXISTS (
            SELECT 1 FROM tags t
            JOIN project_users pu ON pu.project_id = t.project_id
            WHERE t.id = contact_tags.tag_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
    );

-- Policy: Usuários podem deletar associações de tags de contatos dos projetos aos quais têm acesso
CREATE POLICY "Users can delete contact_tags in their projects"
    ON contact_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM contacts c
            JOIN project_users pu ON pu.project_id = c.project_id
            WHERE c.id = contact_tags.contact_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
    );

COMMIT;

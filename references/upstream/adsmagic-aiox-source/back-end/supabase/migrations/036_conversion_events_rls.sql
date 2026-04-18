-- Migration 036: Conversion Events RLS Policies
-- Data: 2026-01-18
-- Descrição: Criar RLS policies para tabela conversion_events
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 3)

BEGIN;

-- ============================================================================
-- RLS POLICIES: conversion_events
-- ============================================================================

-- Policy: Usuários podem visualizar eventos de conversão dos projetos aos quais têm acesso
CREATE POLICY "Users can view conversion_events in their projects"
    ON conversion_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = conversion_events.project_id
            AND project_users.user_id = auth.uid()
            AND project_users.is_active = true
        )
    );

-- Policy: Usuários podem criar eventos de conversão nos projetos aos quais têm acesso
CREATE POLICY "Users can create conversion_events in their projects"
    ON conversion_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = conversion_events.project_id
            AND project_users.user_id = auth.uid()
            AND project_users.is_active = true
        )
    );

-- Policy: Usuários podem atualizar eventos de conversão dos projetos aos quais têm acesso
-- (Permite atualização para retry, cancelamento, etc)
CREATE POLICY "Users can update conversion_events in their projects"
    ON conversion_events FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = conversion_events.project_id
            AND project_users.user_id = auth.uid()
            AND project_users.is_active = true
        )
    );

-- Policy: Usuários podem deletar eventos de conversão dos projetos aos quais têm acesso
-- (Apenas owner/admin podem deletar eventos)
CREATE POLICY "Users can delete conversion_events in their projects"
    ON conversion_events FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = conversion_events.project_id
            AND project_users.user_id = auth.uid()
            AND project_users.is_active = true
            AND project_users.role IN ('owner', 'admin')
        )
    );

COMMIT;

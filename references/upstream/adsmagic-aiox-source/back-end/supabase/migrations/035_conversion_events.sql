-- Migration 035: Conversion Events Table
-- Data: 2026-01-18
-- Descrição: Criar tabela de eventos de conversão para integração com plataformas de ads
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 3)

BEGIN;

-- ============================================================================
-- TABELA: conversion_events
-- ============================================================================
-- Representa eventos de conversão enviados para plataformas de advertising.
-- Suporta tracking de eventos (purchase, lead, etc) para Meta, Google Ads e TikTok.
-- Inclui sistema de retry para eventos falhados.

CREATE TABLE conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Relacionamentos opcionais (pode ser evento manual sem contato/venda)
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    
    -- Plataforma e tipo de evento
    platform VARCHAR(20) NOT NULL 
        CHECK (platform IN ('meta', 'google', 'tiktok')),
    event_type VARCHAR(50) NOT NULL,
    
    -- Status do evento
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    
    -- Payload e resposta da API
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    response JSONB,
    
    -- Mensagem de erro (se falhou)
    error_message TEXT,
    
    -- Sistema de retry
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    max_retries INTEGER NOT NULL DEFAULT 3,
    
    -- Timestamps
    processed_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Evento deve estar vinculado a contato ou venda (ou ambos)
    CONSTRAINT conversion_events_contact_or_sale_check 
        CHECK (contact_id IS NOT NULL OR sale_id IS NOT NULL)
);

-- Comentários da tabela
COMMENT ON TABLE conversion_events IS 'Eventos de conversão enviados para plataformas de advertising (Meta, Google, TikTok)';
COMMENT ON COLUMN conversion_events.project_id IS 'Projeto ao qual o evento pertence';
COMMENT ON COLUMN conversion_events.contact_id IS 'Contato relacionado (opcional se tiver sale_id)';
COMMENT ON COLUMN conversion_events.sale_id IS 'Venda relacionada (opcional se tiver contact_id)';
COMMENT ON COLUMN conversion_events.platform IS 'Plataforma de destino: meta (Facebook/Meta), google (Google Ads), tiktok (TikTok Ads)';
COMMENT ON COLUMN conversion_events.event_type IS 'Tipo de evento: purchase, lead, add_to_cart, initiate_checkout, etc';
COMMENT ON COLUMN conversion_events.status IS 'Status: pending (aguardando envio), sent (enviado com sucesso), failed (falhou após retries), cancelled (cancelado)';
COMMENT ON COLUMN conversion_events.payload IS 'Payload JSON completo enviado para a plataforma';
COMMENT ON COLUMN conversion_events.response IS 'Resposta da API da plataforma (sucesso ou erro)';
COMMENT ON COLUMN conversion_events.error_message IS 'Mensagem de erro (quando status = failed)';
COMMENT ON COLUMN conversion_events.retry_count IS 'Número de tentativas de envio realizadas';
COMMENT ON COLUMN conversion_events.max_retries IS 'Número máximo de tentativas permitidas (padrão: 3)';

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice primário por projeto (queries mais comuns)
CREATE INDEX idx_conversion_events_project_id ON conversion_events(project_id);

-- Índice por contato (buscar eventos de um contato)
CREATE INDEX idx_conversion_events_contact_id ON conversion_events(contact_id) 
    WHERE contact_id IS NOT NULL;

-- Índice por venda (buscar eventos de uma venda)
CREATE INDEX idx_conversion_events_sale_id ON conversion_events(sale_id) 
    WHERE sale_id IS NOT NULL;

-- Índice por plataforma (filtro comum)
CREATE INDEX idx_conversion_events_platform ON conversion_events(platform);

-- Índice por status (buscar eventos pendentes/falhados para retry)
CREATE INDEX idx_conversion_events_status ON conversion_events(status);

-- Índice por tipo de evento (análise por tipo)
CREATE INDEX idx_conversion_events_event_type ON conversion_events(event_type);

-- Índice composto para queries de retry (status + retry_count)
CREATE INDEX idx_conversion_events_status_retry 
    ON conversion_events(status, retry_count) 
    WHERE status IN ('pending', 'failed');

-- Índice composto para queries de dashboard (projeto + status + criado)
CREATE INDEX idx_conversion_events_project_status_created 
    ON conversion_events(project_id, status, created_at DESC);

-- Índice composto para análise por plataforma (projeto + plataforma + status)
CREATE INDEX idx_conversion_events_project_platform_status 
    ON conversion_events(project_id, platform, status);

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================
-- Reutiliza a função update_updated_at_column() já existente no banco

CREATE TRIGGER set_conversion_events_updated_at
    BEFORE UPDATE ON conversion_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

COMMIT;

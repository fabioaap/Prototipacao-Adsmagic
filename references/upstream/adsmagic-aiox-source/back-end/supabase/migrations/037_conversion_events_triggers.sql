-- Migration 037: Conversion Events Automatic Triggers
-- Data: 2026-01-18
-- Descrição: Criar triggers automáticos para criação de eventos de conversão
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 3)

BEGIN;

-- ============================================================================
-- FUNÇÃO: Criar evento de conversão quando venda é completada
-- ============================================================================
-- Esta função cria automaticamente eventos de conversão para plataformas configuradas
-- quando uma venda tem status = 'completed' e existe integração ativa.

CREATE OR REPLACE FUNCTION create_conversion_event_on_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_integration_record RECORD;
    v_contact_origin_id UUID;
    v_payload JSONB;
BEGIN
    -- Apenas processar quando status = 'completed' (nova venda completada)
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Buscar origem do contato (para determinar plataforma)
        SELECT origin_id INTO v_contact_origin_id
        FROM contacts
        WHERE id = NEW.contact_id;
        
        -- Buscar integrações de advertising ativas para o projeto
        FOR v_integration_record IN
            SELECT i.id, i.platform, i.project_id
            FROM integrations i
            WHERE i.project_id = NEW.project_id
            AND i.platform_type = 'advertising'
            AND i.status = 'connected'
            AND i.platform IN ('meta', 'google', 'tiktok')
        LOOP
            -- Montar payload básico (será enriquecido pela Edge Function)
            v_payload := jsonb_build_object(
                'event_type', 'purchase',
                'value', NEW.value,
                'currency', NEW.currency,
                'sale_id', NEW.id,
                'contact_id', NEW.contact_id,
                'project_id', NEW.project_id,
                'timestamp', EXTRACT(EPOCH FROM NEW.date)
            );
            
            -- Adicionar tracking params se existirem
            IF NEW.tracking_params IS NOT NULL AND jsonb_typeof(NEW.tracking_params) = 'object' THEN
                v_payload := v_payload || jsonb_build_object('tracking_params', NEW.tracking_params);
            END IF;
            
            -- Criar evento de conversão (status = 'pending' para processamento assíncrono)
            INSERT INTO conversion_events (
                project_id,
                contact_id,
                sale_id,
                platform,
                event_type,
                status,
                payload,
                created_at
            ) VALUES (
                NEW.project_id,
                NEW.contact_id,
                NEW.id,
                v_integration_record.platform,
                'purchase',
                'pending',
                v_payload,
                NOW()
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION create_conversion_event_on_sale() IS 
    'Cria automaticamente eventos de conversão quando uma venda é completada';

-- ============================================================================
-- FUNÇÃO: Criar evento de conversão quando contato muda para estágio "sale"
-- ============================================================================
-- Esta função cria eventos de conversão "lead" quando um contato avança para estágio
-- que tem type = 'sale' (marcado como venda).

CREATE OR REPLACE FUNCTION create_conversion_event_on_stage_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_stage_record RECORD;
    v_integration_record RECORD;
    v_payload JSONB;
BEGIN
    -- Verificar se o novo estágio é do tipo 'sale'
    SELECT s.type INTO v_stage_record
    FROM stages s
    WHERE s.id = NEW.stage_id;
    
    -- Se o estágio é do tipo 'sale', criar evento de conversão "lead"
    IF v_stage_record.type = 'sale' THEN
        
        -- Buscar integrações de advertising ativas para o projeto
        FOR v_integration_record IN
            SELECT i.id, i.platform, i.project_id
            FROM integrations i
            WHERE i.project_id = NEW.project_id
            AND i.platform_type = 'advertising'
            AND i.status = 'connected'
            AND i.platform IN ('meta', 'google', 'tiktok')
        LOOP
            -- Montar payload básico
            v_payload := jsonb_build_object(
                'event_type', 'lead',
                'contact_id', NEW.contact_id,
                'project_id', NEW.project_id,
                'stage_id', NEW.stage_id,
                'timestamp', EXTRACT(EPOCH FROM NEW.created_at)
            );
            
            -- Buscar tracking params do contato (se houver link_accesses)
            SELECT la.utm_source, la.utm_medium, la.utm_campaign, la.fbclid, la.gclid
            INTO v_payload
            FROM link_accesses la
            JOIN trackable_links tl ON la.link_id = tl.id
            JOIN contacts c ON c.origin_id = tl.origin_id
            WHERE c.id = NEW.contact_id
            LIMIT 1;
            
            -- Criar evento de conversão (status = 'pending')
            INSERT INTO conversion_events (
                project_id,
                contact_id,
                platform,
                event_type,
                status,
                payload,
                created_at
            ) VALUES (
                NEW.project_id,
                NEW.contact_id,
                v_integration_record.platform,
                'lead',
                'pending',
                v_payload,
                NOW()
            )
            -- Evitar duplicatas (um evento por contato por plataforma)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION create_conversion_event_on_stage_sale() IS 
    'Cria automaticamente eventos de conversão "lead" quando contato avança para estágio tipo "sale"';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Criar evento quando venda é completada
CREATE TRIGGER sales_completed_conversion_event_trigger
    AFTER INSERT OR UPDATE ON sales
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed'))
    EXECUTE FUNCTION create_conversion_event_on_sale();

-- Trigger: Criar evento quando contato avança para estágio "sale"
-- Nota: Este trigger depende da tabela contact_stage_history
-- Se a tabela não existir ou tiver estrutura diferente, ajustar conforme necessário
-- CREATE TRIGGER contact_stage_sale_conversion_event_trigger
--     AFTER INSERT ON contact_stage_history
--     FOR EACH ROW
--     EXECUTE FUNCTION create_conversion_event_on_stage_sale();

-- Comentários dos triggers
COMMENT ON TRIGGER sales_completed_conversion_event_trigger ON sales IS 
    'Cria evento de conversão automaticamente quando venda tem status = completed';

COMMIT;

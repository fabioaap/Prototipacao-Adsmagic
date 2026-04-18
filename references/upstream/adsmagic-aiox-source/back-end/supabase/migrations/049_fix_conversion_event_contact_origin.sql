-- Migration 049: Corrigir create_conversion_event_on_sale — coluna em contacts
-- Data: 2026-01-24
-- Descrição: A tabela contacts usa main_origin_id, não origin_id. O trigger
--            sales_completed_conversion_event_trigger chama create_conversion_event_on_sale(),
--            que fazia SELECT origin_id FROM contacts e falhava (42703), impedindo
--            o INSERT em sales (incluindo os feitos pelo trigger create_sale_on_contact_stage_sale).

BEGIN;

CREATE OR REPLACE FUNCTION create_conversion_event_on_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_integration_record RECORD;
    v_contact_origin_id UUID;
    v_payload JSONB;
BEGIN
    -- Apenas processar quando status = 'completed' (nova venda completada)
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

        -- Buscar origem do contato (contacts usa main_origin_id)
        SELECT main_origin_id INTO v_contact_origin_id
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

COMMENT ON FUNCTION create_conversion_event_on_sale() IS
    'Cria automaticamente eventos de conversão quando uma venda é completada. Usa contacts.main_origin_id.';

-- Backfill: uma venda por contato já em estágio "sale" que ainda não tem venda (idempotente).
INSERT INTO sales (project_id, contact_id, value, currency, date, status, origin_id, notes, tracking_params, metadata)
SELECT c.project_id, c.id, 0, 'BRL', NOW(), 'completed',
  (SELECT o.id FROM origins o WHERE o.id = c.main_origin_id LIMIT 1),
  NULL, '{}'::jsonb,
  jsonb_build_object('created_by', 'backfill_049', 'created_from_stage_type', 'sale')
FROM contacts c
JOIN stages s ON s.id = c.current_stage_id AND s.type = 'sale'
WHERE NOT EXISTS (SELECT 1 FROM sales sl WHERE sl.contact_id = c.id);

COMMIT;

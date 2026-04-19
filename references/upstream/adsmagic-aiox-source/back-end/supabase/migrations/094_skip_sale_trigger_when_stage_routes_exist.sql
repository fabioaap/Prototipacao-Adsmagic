-- Migration 094: Evitar duplicata de eventos quando stage routes já cobrem a plataforma
-- Data: 2026-04-18
-- Descrição:
--   O trigger create_conversion_event_on_sale() (sales.status='completed') cria eventos
--   "purchase" com payload mínimo (sem email/phone/integration_account).
--   O trigger create_conversion_events_from_stage_routes() (contacts.current_stage_id)
--   cria eventos com payload completo a partir de stages.event_config.routes.
--   Quando ambos disparam para a mesma venda, gera duplicatas — o evento do trigger 037
--   é inferior (sem dados de matching) e deve ser suprimido quando o trigger 063 já cobre
--   a mesma plataforma.

BEGIN;

-- ============================================================================
-- PARTE A: Corrigir trigger para pular quando stage routes cobrem a plataforma
-- ============================================================================

CREATE OR REPLACE FUNCTION create_conversion_event_on_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_integration_record RECORD;
    v_origin_name TEXT;
    v_resolved_platform TEXT;
    v_payload JSONB;
    v_stage_has_route BOOLEAN;
    v_contact_stage_id UUID;
BEGIN
    -- Apenas processar quando status = 'completed' (nova venda completada)
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

        -- 1. Resolver plataforma a partir de contacts.main_origin_id -> origins.name
        SELECT o.name, c.current_stage_id
        INTO v_origin_name, v_contact_stage_id
        FROM contacts c
        LEFT JOIN origins o ON o.id = c.main_origin_id
        WHERE c.id = NEW.contact_id;

        v_resolved_platform := get_ad_platform_from_origin_name(v_origin_name);

        -- 2. Fallback: checar contact_origins.source_app mais recente
        IF v_resolved_platform IS NULL THEN
            SELECT CASE co.source_app
                     WHEN 'google' THEN 'google'
                     WHEN 'facebook' THEN 'meta'
                     WHEN 'instagram' THEN 'meta'
                     WHEN 'tiktok' THEN 'tiktok'
                     ELSE NULL
                   END
            INTO v_resolved_platform
            FROM contact_origins co
            WHERE co.contact_id = NEW.contact_id
              AND co.source_app IN ('google', 'facebook', 'instagram', 'tiktok')
            ORDER BY co.acquired_at DESC NULLS LAST
            LIMIT 1;
        END IF;

        -- 3. Se nenhuma plataforma resolvida, nao criar eventos
        IF v_resolved_platform IS NULL THEN
            RETURN NEW;
        END IF;

        -- 4. Verificar se o estagio do contato ja tem routes configuradas para essa plataforma
        --    Se sim, o trigger de stage routes (063) ja cria o evento com payload completo
        IF v_contact_stage_id IS NOT NULL THEN
            SELECT EXISTS (
                SELECT 1
                FROM stages s,
                     jsonb_array_elements(COALESCE(s.event_config->'routes', '[]'::jsonb)) AS route
                WHERE s.id = v_contact_stage_id
                  AND lower(COALESCE(route->>'channel', route->>'platform', '')) = v_resolved_platform
                  AND lower(COALESCE(route->>'isActive', 'true')) = 'true'
            ) INTO v_stage_has_route;

            IF v_stage_has_route THEN
                -- Stage routes ja cobrem essa plataforma, pular para evitar duplicata
                RETURN NEW;
            END IF;
        END IF;

        -- 5. Buscar integracoes de advertising ativas para o projeto
        FOR v_integration_record IN
            SELECT i.id, i.platform, i.project_id
            FROM integrations i
            WHERE i.project_id = NEW.project_id
            AND i.platform_type = 'advertising'
            AND i.status = 'connected'
            AND i.platform = v_resolved_platform
        LOOP
            -- Montar payload basico
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

            -- Criar evento de conversao (status = 'pending')
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
    'Cria evento de conversao quando venda e completada, apenas quando stage routes nao cobrem a plataforma.';

-- ============================================================================
-- PARTE B: Cancelar eventos purchase duplicados existentes
-- ============================================================================

UPDATE conversion_events ce
SET status = 'cancelled',
    error_message = 'Cancelado pela migracao 094: duplicata — stage route ja cobre esta plataforma'
WHERE ce.event_type = 'purchase'
  AND ce.sale_id IS NOT NULL
  AND ce.status IN ('pending', 'failed')
  AND EXISTS (
    SELECT 1 FROM conversion_events ce2
    WHERE ce2.contact_id = ce.contact_id
      AND ce2.platform = ce.platform
      AND ce2.created_at = ce.created_at
      AND ce2.id != ce.id
      AND ce2.payload->>'trigger' = 'stage_event_route'
  );

COMMIT;

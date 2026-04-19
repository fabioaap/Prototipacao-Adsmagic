-- Migration 092: Fix conversion event trigger to match contact origin to platform
-- Data: 2026-04-08
-- Descrição: O trigger create_conversion_event_on_sale() criava eventos para TODAS
--            as integrações ativas sem verificar se a origem do contato corresponde
--            à plataforma. Isso gerava eventos fantasma (ex: contato WhatsApp com
--            eventos Google e Meta).

-- ============================================================================
-- PARTE A: Função helper para mapear nome de origem → plataforma
-- ============================================================================

CREATE OR REPLACE FUNCTION get_ad_platform_from_origin_name(p_origin_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN p_origin_name = 'Google Ads' THEN 'google'
    WHEN p_origin_name = 'Meta Ads' THEN 'meta'
    WHEN p_origin_name = 'TikTok Ads' THEN 'tiktok'
    WHEN p_origin_name = 'Instagram' THEN 'meta'
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_ad_platform_from_origin_name(TEXT) IS
  'Mapeia nome de origem do sistema para plataforma de advertising (google/meta/tiktok). Retorna NULL para origens não-advertising.';

-- ============================================================================
-- PARTE B: Corrigir create_conversion_event_on_sale() com verificação de origem
-- ============================================================================

CREATE OR REPLACE FUNCTION create_conversion_event_on_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_integration_record RECORD;
    v_origin_name TEXT;
    v_resolved_platform TEXT;
    v_payload JSONB;
BEGIN
    -- Apenas processar quando status = 'completed' (nova venda completada)
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

        -- 1. Resolver plataforma a partir de contacts.main_origin_id → origins.name
        SELECT o.name INTO v_origin_name
        FROM contacts c
        JOIN origins o ON o.id = c.main_origin_id
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

        -- 3. Se nenhuma plataforma resolvida, não criar eventos
        IF v_resolved_platform IS NULL THEN
            RETURN NEW;
        END IF;

        -- 4. Buscar integrações de advertising ativas para o projeto
        FOR v_integration_record IN
            SELECT i.id, i.platform, i.project_id
            FROM integrations i
            WHERE i.project_id = NEW.project_id
            AND i.platform_type = 'advertising'
            AND i.status = 'connected'
            AND i.platform = v_resolved_platform  -- só a plataforma correta
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
    'Cria evento de conversão quando venda é completada, apenas para a plataforma que corresponde à origem do contato.';

-- ============================================================================
-- PARTE C: Cleanup — cancelar eventos incorretos existentes
-- ============================================================================

-- Cancelar eventos que não correspondem à origem do contato
-- (apenas pending/sent/failed — não toca em eventos já cancelados)
UPDATE conversion_events ce
SET status = 'cancelled',
    error_message = 'Cancelado pela migração 092: origem do contato não corresponde à plataforma do evento'
WHERE ce.event_type = 'purchase'
  AND ce.sale_id IS NOT NULL
  AND ce.status IN ('pending', 'sent', 'failed')
  AND NOT EXISTS (
    SELECT 1
    FROM contacts c
    JOIN origins o ON o.id = c.main_origin_id
    WHERE c.id = ce.contact_id
      AND get_ad_platform_from_origin_name(o.name) = ce.platform
  )
  AND NOT EXISTS (
    SELECT 1
    FROM contact_origins co
    WHERE co.contact_id = ce.contact_id
      AND (
        (co.source_app = 'google' AND ce.platform = 'google')
        OR (co.source_app IN ('facebook', 'instagram') AND ce.platform = 'meta')
        OR (co.source_app = 'tiktok' AND ce.platform = 'tiktok')
      )
  );

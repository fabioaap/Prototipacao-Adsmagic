-- Migration 064: Hardening das rotas de conversão por estágio
-- Data: 2026-02-22
-- Descrição:
--   Corrige dois riscos de integridade em create_conversion_events_from_stage_routes():
--   1) integrationAccountId malformado passa a invalidar a rota (skip), sem fallback implícito.
--   2) event_type passa a ser normalizado para no máximo 50 caracteres.

BEGIN;

CREATE OR REPLACE FUNCTION create_conversion_events_from_stage_routes()
RETURNS TRIGGER AS $$
DECLARE
  v_stage_event_config JSONB;
  v_routes JSONB;
  v_route JSONB;
  v_platform TEXT;
  v_event_type TEXT;
  v_event_type_raw TEXT;
  v_is_active BOOLEAN;
  v_route_id TEXT;
  v_priority INTEGER;
  v_source_origin_id UUID;
  v_integration_account_id UUID;
  v_integration_account_id_raw TEXT;
  v_conversion_action_id TEXT;
  v_value NUMERIC;
  v_currency TEXT;
  v_payload JSONB;
  v_tracking_params JSONB := '{}'::jsonb;
  v_account_external_id TEXT;
  v_account_metadata JSONB;
BEGIN
  IF NEW.current_stage_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- No UPDATE, só processar quando o estágio mudou
  IF TG_OP = 'UPDATE' AND OLD.current_stage_id IS NOT DISTINCT FROM NEW.current_stage_id THEN
    RETURN NEW;
  END IF;

  SELECT s.event_config
  INTO v_stage_event_config
  FROM stages s
  WHERE s.id = NEW.current_stage_id
  LIMIT 1;

  IF v_stage_event_config IS NULL OR jsonb_typeof(v_stage_event_config) <> 'object' THEN
    RETURN NEW;
  END IF;

  v_routes := COALESCE(v_stage_event_config->'routes', '[]'::jsonb);
  IF jsonb_typeof(v_routes) <> 'array' THEN
    RETURN NEW;
  END IF;

  -- Tenta enriquecer com tracking params mais recentes do contato
  SELECT jsonb_strip_nulls(jsonb_build_object(
    'gclid', la.gclid,
    'gbraid', la.gbraid,
    'wbraid', la.wbraid,
    'fbclid', la.fbclid,
    'ttclid', la.ttclid,
    'utm_source', la.utm_source,
    'utm_medium', la.utm_medium,
    'utm_campaign', la.utm_campaign,
    'utm_content', la.utm_content,
    'utm_term', la.utm_term
  ))
  INTO v_tracking_params
  FROM link_accesses la
  WHERE la.contact_id = NEW.id
  ORDER BY COALESCE(la.converted_at, la.created_at) DESC
  LIMIT 1;

  v_tracking_params := COALESCE(v_tracking_params, '{}'::jsonb);

  FOR v_route IN
    SELECT value
    FROM jsonb_array_elements(v_routes)
  LOOP
    BEGIN
      -- isActive (default true)
      v_is_active := CASE
        WHEN lower(COALESCE(v_route->>'isActive', 'true')) IN ('true', 'false')
          THEN (v_route->>'isActive')::boolean
        ELSE true
      END;

      IF NOT v_is_active THEN
        CONTINUE;
      END IF;

      -- Canal/plataforma
      v_platform := lower(COALESCE(v_route->>'channel', v_route->>'platform', ''));
      IF v_platform NOT IN ('meta', 'google', 'tiktok') THEN
        CONTINUE;
      END IF;

      -- Origem opcional (match exato)
      v_source_origin_id := NULL;
      IF NULLIF(COALESCE(v_route->>'sourceOriginId', v_route->>'source_origin_id'), '') IS NOT NULL THEN
        IF COALESCE(v_route->>'sourceOriginId', v_route->>'source_origin_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
          v_source_origin_id := COALESCE(v_route->>'sourceOriginId', v_route->>'source_origin_id')::uuid;
        ELSE
          CONTINUE;
        END IF;
      END IF;

      IF v_source_origin_id IS NOT NULL AND v_source_origin_id IS DISTINCT FROM NEW.main_origin_id THEN
        CONTINUE;
      END IF;

      v_event_type_raw := COALESCE(NULLIF(v_route->>'eventType', ''), NULLIF(v_route->>'event_type', ''), 'lead');
      v_event_type := LEFT(COALESCE(NULLIF(BTRIM(v_event_type_raw), ''), 'lead'), 50);

      v_route_id := COALESCE(NULLIF(v_route->>'id', ''), gen_random_uuid()::text);
      v_priority := COALESCE((v_route->>'priority')::integer, 0);
      v_conversion_action_id := COALESCE(NULLIF(v_route->>'conversionActionId', ''), NULLIF(v_route->>'conversion_action_id', ''));

      -- Se integrationAccountId foi informado, deve ser UUID válido. Se inválido, ignora rota.
      v_integration_account_id_raw := NULLIF(BTRIM(COALESCE(v_route->>'integrationAccountId', v_route->>'integration_account_id')), '');
      v_integration_account_id := NULL;
      IF v_integration_account_id_raw IS NOT NULL THEN
        IF v_integration_account_id_raw !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
          CONTINUE;
        END IF;
        v_integration_account_id := v_integration_account_id_raw::uuid;
      END IF;

      -- Value/currency com fallback no default da etapa
      v_value := NULL;
      IF NULLIF(v_route->>'value', '') IS NOT NULL THEN
        BEGIN
          v_value := (v_route->>'value')::numeric;
        EXCEPTION WHEN OTHERS THEN
          v_value := NULL;
        END;
      END IF;

      IF v_value IS NULL AND NULLIF(v_stage_event_config->>'defaultValue', '') IS NOT NULL THEN
        BEGIN
          v_value := (v_stage_event_config->>'defaultValue')::numeric;
        EXCEPTION WHEN OTHERS THEN
          v_value := NULL;
        END;
      END IF;

      v_currency := COALESCE(
        NULLIF(v_route->>'currency', ''),
        NULLIF(v_stage_event_config->>'defaultCurrency', ''),
        'BRL'
      );

      v_account_external_id := NULL;
      v_account_metadata := NULL;

      -- Se houver conta específica na rota, valida e usa essa conta no payload
      IF v_integration_account_id IS NOT NULL THEN
        SELECT ia.external_account_id, ia.account_metadata
        INTO v_account_external_id, v_account_metadata
        FROM integration_accounts ia
        JOIN integrations i ON i.id = ia.integration_id
        WHERE ia.id = v_integration_account_id
          AND ia.project_id = NEW.project_id
          AND ia.status = 'active'
          AND i.project_id = NEW.project_id
          AND i.platform = v_platform
          AND i.platform_type = 'advertising'
          AND i.status = 'connected'
        LIMIT 1;

        -- Conta configurada não encontrada/inativa para o canal
        IF v_account_external_id IS NULL THEN
          CONTINUE;
        END IF;
      END IF;

      v_payload := jsonb_strip_nulls(
        jsonb_build_object(
          'trigger', 'stage_event_route',
          'route_id', v_route_id,
          'stage_id', NEW.current_stage_id,
          'source_origin_id', NEW.main_origin_id,
          'priority', v_priority,
          'integration_account_id', v_integration_account_id,
          'conversion_action_id', v_conversion_action_id,
          'value', v_value,
          'currency', v_currency,
          'email', NEW.email,
          'phone', NEW.phone,
          'country_code', NEW.country_code,
          'tracking_params', v_tracking_params
        )
      );

      -- Para Google, quando houver conta específica, já fixa customer_id via external_account_id
      IF v_platform = 'google' AND v_account_external_id IS NOT NULL THEN
        v_payload := v_payload || jsonb_build_object(
          'google_customer_id', v_account_external_id
        );
      END IF;

      -- Mantém metadados da conta quando útil (ex.: parentMccId)
      IF v_account_metadata IS NOT NULL THEN
        v_payload := v_payload || jsonb_build_object(
          'integration_account_metadata', v_account_metadata
        );
      END IF;

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
        NEW.id,
        v_platform,
        v_event_type,
        'pending',
        COALESCE(v_payload, '{}'::jsonb),
        NOW()
      );

    EXCEPTION
      WHEN OTHERS THEN
        -- Nunca impedir a atualização/inserção do contato por falha de configuração/envio
        RAISE LOG 'create_conversion_events_from_stage_routes failed: project_id=%, contact_id=%, stage_id=%, route_id=%, error=%',
          NEW.project_id, NEW.id, NEW.current_stage_id, COALESCE(v_route_id, 'unknown'), SQLERRM;
        CONTINUE;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, pg_catalog;

COMMENT ON FUNCTION create_conversion_events_from_stage_routes() IS
  'Cria conversion_events quando contato entra em estágio com routes configuradas em stages.event_config (match por origem/canal).';

DROP TRIGGER IF EXISTS contacts_stage_routes_conversion_event_trigger ON contacts;

CREATE TRIGGER contacts_stage_routes_conversion_event_trigger
  AFTER INSERT OR UPDATE OF current_stage_id ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION create_conversion_events_from_stage_routes();

COMMENT ON TRIGGER contacts_stage_routes_conversion_event_trigger ON contacts IS
  'Dispara conversion_events por regras de etapa/origem definidas em stages.event_config.routes.';

COMMIT;

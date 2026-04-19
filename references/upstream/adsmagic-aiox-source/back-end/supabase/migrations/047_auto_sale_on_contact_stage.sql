-- Migration 047: Criação automática de venda quando contato entra em etapa tipo "sale"
-- Data: 2026-01-24
-- Descrição: Trigger em contacts que insere em sales quando current_stage_id aponta
--            para um estágio com type = 'sale'. Elimina a necessidade de chamada HTTP
--            entre Edge Functions (contacts → sales) e de compartilhar SUPABASE_SERVICE_ROLE_KEY.

BEGIN;

-- ============================================================================
-- FUNÇÃO: Inserir venda automática quando contato está em etapa "sale"
-- ============================================================================
-- Executa após INSERT ou UPDATE em contacts. Se o (novo) current_stage_id
-- corresponde a um estágio com type = 'sale', insere uma linha em sales.
-- SECURITY DEFINER garante que o INSERT em sales seja permitido independente de RLS.

CREATE OR REPLACE FUNCTION create_sale_on_contact_stage_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_stage_type TEXT;
BEGIN
  -- Só avaliar quando há um current_stage_id definido
  IF NEW.current_stage_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- No UPDATE, só processar quando o estágio mudou
  IF TG_OP = 'UPDATE' AND OLD.current_stage_id IS NOT DISTINCT FROM NEW.current_stage_id THEN
    RETURN NEW;
  END IF;

  -- Verificar se o estágio é do tipo 'sale'
  SELECT type INTO v_stage_type
  FROM stages
  WHERE id = NEW.current_stage_id;

  IF v_stage_type = 'sale' THEN
    INSERT INTO sales (
      project_id,
      contact_id,
      value,
      currency,
      date,
      status,
      origin_id,
      notes,
      tracking_params,
      metadata
    ) VALUES (
      NEW.project_id,
      NEW.id,
      0,
      'BRL',
      NOW(),
      'completed',
      NEW.main_origin_id,
      NULL,
      '{}'::jsonb,
      jsonb_build_object(
        'created_by', 'trigger_contact_stage',
        'created_from_stage_type', 'sale'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_sale_on_contact_stage_sale() IS
  'Cria automaticamente uma venda (sales) quando o contato é criado ou atualizado para um estágio com type = sale. Substitui a chamada HTTP contacts → sales.';

-- ============================================================================
-- TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS contacts_auto_sale_on_stage_sale ON contacts;

CREATE TRIGGER contacts_auto_sale_on_stage_sale
  AFTER INSERT OR UPDATE OF current_stage_id ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION create_sale_on_contact_stage_sale();

COMMENT ON TRIGGER contacts_auto_sale_on_stage_sale ON contacts IS
  'Insere em sales quando o contato entra em um estágio do tipo sale (INSERT ou mudança de current_stage_id).';

COMMIT;

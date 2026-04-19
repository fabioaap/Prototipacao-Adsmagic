-- Migration 048: Trigger de venda automática à prova de exceção
-- Data: 2026-01-24
-- Descrição: Evita que falha no INSERT em sales (ex.: FK origin_id) reverta o UPDATE
--            do contato. O update do contato sempre persiste; a criação da venda
--            é tentada e, se falhar, apenas não cria a venda.

BEGIN;

CREATE OR REPLACE FUNCTION create_sale_on_contact_stage_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_stage_type TEXT;
  v_origin_id UUID := NULL;
BEGIN
  IF NEW.current_stage_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.current_stage_id IS NOT DISTINCT FROM NEW.current_stage_id THEN
    RETURN NEW;
  END IF;

  SELECT type INTO v_stage_type
  FROM stages
  WHERE id = NEW.current_stage_id;

  IF v_stage_type = 'sale' THEN
    BEGIN
      -- Só usar origin_id se existir em origins (evita FK violation)
      IF NEW.main_origin_id IS NOT NULL THEN
        SELECT id INTO v_origin_id FROM origins WHERE id = NEW.main_origin_id LIMIT 1;
      ELSE
        v_origin_id := NULL;
      END IF;

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
        v_origin_id,
        NULL,
        '{}'::jsonb,
        jsonb_build_object(
          'created_by', 'trigger_contact_stage',
          'created_from_stage_type', 'sale'
        )
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Não propagar: permite que o UPDATE do contato seja commitado
        NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_sale_on_contact_stage_sale() IS
  'Cria venda (sales) quando contato entra em estágio type=sale. Em caso de erro no INSERT, não reverte o UPDATE do contato.';

COMMIT;

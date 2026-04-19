-- Migration 091: Improve get_or_create_first_active_stage to prefer normal type
-- Problem: getFirstActiveStageId() returns the first active stage by display_order,
-- which could be a 'sale' or 'lost' stage if the user configured it that way.
-- Fix: Prefer stages with type='normal', fallback to any active stage.

CREATE OR REPLACE FUNCTION public.get_or_create_first_active_stage(p_project_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_stage_id uuid;
BEGIN
  -- 1. Prefer first active normal stage
  SELECT id INTO v_stage_id
  FROM stages
  WHERE project_id = p_project_id AND is_active = true AND type = 'normal'
  ORDER BY display_order ASC
  LIMIT 1;

  IF v_stage_id IS NOT NULL THEN
    RETURN v_stage_id;
  END IF;

  -- 2. Fallback: any active stage
  SELECT id INTO v_stage_id
  FROM stages
  WHERE project_id = p_project_id AND is_active = true
  ORDER BY display_order ASC
  LIMIT 1;

  IF v_stage_id IS NOT NULL THEN
    RETURN v_stage_id;
  END IF;

  -- 3. No stages exist: create defaults
  INSERT INTO stages (project_id, name, display_order, type, is_active, color)
  VALUES
    (p_project_id, 'Contato iniciado', 0, 'normal', true, '#3b82f6'),
    (p_project_id, 'Em Atendimento', 1, 'normal', true, '#f59e0b'),
    (p_project_id, 'Qualificado', 2, 'normal', true, '#8b5cf6'),
    (p_project_id, 'Venda', 3, 'sale', true, '#10b981');

  -- 4. Return the first created
  SELECT id INTO v_stage_id
  FROM stages
  WHERE project_id = p_project_id AND is_active = true AND type = 'normal'
  ORDER BY display_order ASC
  LIMIT 1;

  RETURN v_stage_id;
END;
$$;

COMMENT ON FUNCTION public.get_or_create_first_active_stage IS
  'Retorna ID do primeiro estágio ativo NORMAL do projeto. Prefere type=normal sobre sale/lost. Se não existir nenhum, cria estágios padrão.';

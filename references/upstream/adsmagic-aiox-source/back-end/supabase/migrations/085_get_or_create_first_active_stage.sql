-- Migration 085: Function para buscar/criar primeiro estágio ativo do projeto
-- Bypassa PostgREST schema cache (usa SQL nativo)
-- Chamada via .rpc() em ContactOriginService.getFirstActiveStage()

CREATE OR REPLACE FUNCTION public.get_or_create_first_active_stage(p_project_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_stage_id uuid;
BEGIN
  -- 1. Buscar primeiro estágio ativo existente
  SELECT id INTO v_stage_id
  FROM stages
  WHERE project_id = p_project_id AND is_active = true
  ORDER BY display_order ASC
  LIMIT 1;

  IF v_stage_id IS NOT NULL THEN
    RETURN v_stage_id;
  END IF;

  -- 2. Criar estágios padrão para o projeto
  INSERT INTO stages (project_id, name, display_order, type, is_active)
  VALUES
    (p_project_id, 'Novo Lead', 0, 'normal', true),
    (p_project_id, 'Em Atendimento', 1, 'normal', true),
    (p_project_id, 'Qualificado', 2, 'normal', true),
    (p_project_id, 'Venda', 3, 'sale', true);

  -- 3. Retornar o primeiro criado
  SELECT id INTO v_stage_id
  FROM stages
  WHERE project_id = p_project_id AND is_active = true
  ORDER BY display_order ASC
  LIMIT 1;

  RETURN v_stage_id;
END;
$$;

COMMENT ON FUNCTION public.get_or_create_first_active_stage IS
  'Retorna ID do primeiro estágio ativo do projeto. Se não existir nenhum, cria estágios padrão (Novo Lead, Em Atendimento, Qualificado, Venda).';

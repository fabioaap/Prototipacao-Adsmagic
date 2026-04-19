/**
 * Resolver compartilhado para buscar/criar origens de contato.
 *
 * Regra principal: origens com nomes reservados ao sistema (ex.: "WhatsApp",
 * "Meta Ads", "Google Ads", ...) NUNCA devem ser duplicadas como custom em
 * nível de projeto. O helper faz uma busca única que prioriza a origem do
 * sistema (project_id IS NULL) antes de qualquer origem específica do projeto,
 * e se apenas encontrar um nome protegido sem row no banco, lança em vez de
 * criar duplicata.
 *
 * Use este helper em todos os fluxos do messaging que precisam resolver uma
 * origem por nome — assim novos call-sites já herdam a proteção.
 */

import type { SupabaseDbClient } from '../types-db.ts'

/** Nomes reservados para origens do sistema (project_id IS NULL). */
export const SYSTEM_ORIGIN_NAMES = [
  'WhatsApp',
  'Meta Ads',
  'Google Ads',
  'TikTok Ads',
  'Orgânico',
  'Direto',
] as const

export type SystemOriginName = typeof SYSTEM_ORIGIN_NAMES[number]

export interface OriginResolverOptions {
  /** Cor padrão ao criar origem custom (ignorado se a origem já existir). */
  color?: string
  /** Ícone padrão ao criar origem custom (ignorado se a origem já existir). */
  icon?: string
}

const DEFAULT_COLORS: Record<string, string> = {
  'Meta Ads': '#0866FF',
  'Google Ads': '#4285F4',
  'TikTok Ads': '#000000',
  'WhatsApp': '#25D366',
}

const DEFAULT_ICONS: Record<string, string> = {
  'Meta Ads': 'facebook',
  'Google Ads': 'chrome',
  'TikTok Ads': 'music',
  'WhatsApp': 'message-circle',
}

function defaultColor(name: string): string {
  return DEFAULT_COLORS[name] ?? '#6B7280'
}

function defaultIcon(name: string): string {
  return DEFAULT_ICONS[name] ?? 'help-circle'
}

export function isSystemOriginName(name: string): boolean {
  return (SYSTEM_ORIGIN_NAMES as readonly string[]).includes(name)
}

/**
 * Busca uma origem ativa pelo nome considerando:
 *   1. Origem de sistema (project_id IS NULL) — preferência absoluta.
 *   2. Origem custom do projeto.
 *   3. Se não existir e o nome for reservado ao sistema: lança erro.
 *   4. Caso contrário: cria como custom para o projeto.
 *
 * Retorna o id da origem resolvida.
 */
export async function findOrCreateSystemOrProjectOrigin(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  originName: string,
  options: OriginResolverOptions = {}
): Promise<string> {
  // Query única: sistema + projeto, priorizando sistema (nulls first).
  const { data: origins, error: queryError } = await supabaseClient
    .from('origins')
    .select('id, project_id')
    .or(`project_id.is.null,project_id.eq.${projectId}`)
    .eq('name', originName)
    .eq('is_active', true)
    .order('project_id', { nullsFirst: true })
    .limit(1)

  if (queryError) {
    console.error('[origin-resolver] Erro ao buscar origem:', queryError)
    throw new Error(`Erro ao buscar origem "${originName}": ${queryError.message}`)
  }

  if (origins && origins.length > 0) {
    const originData = origins[0] as { id: string; project_id: string | null }
    return originData.id
  }

  // Nome protegido não encontrado: não criar duplicata custom.
  if (isSystemOriginName(originName)) {
    console.error(
      `[origin-resolver] Origem do sistema "${originName}" não encontrada. ` +
      `Verifique se a migration de seed foi aplicada. ` +
      `Não será criada duplicata custom.`
    )
    throw new Error(
      `Origem do sistema "${originName}" não encontrada no banco de dados. ` +
      `Execute a migration de seed (053_seed_system_stages_and_origins.sql).`
    )
  }

  // Nome não-sistema: criar como custom do projeto.
  const { data, error } = await supabaseClient
    .from('origins')
    .insert({
      project_id: projectId,
      name: originName,
      type: 'custom',
      color: options.color ?? defaultColor(originName),
      icon: options.icon ?? defaultIcon(originName),
      is_active: true,
    } as never)
    .select('id')
    .single()

  if (error || !data) {
    console.error('[origin-resolver] Erro ao criar origem custom:', error)
    throw new Error(
      `Erro ao criar origem "${originName}": ${error?.message ?? 'dados não retornados'}`
    )
  }

  return (data as { id: string }).id
}

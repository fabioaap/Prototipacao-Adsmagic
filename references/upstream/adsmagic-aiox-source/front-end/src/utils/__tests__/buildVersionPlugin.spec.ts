/**
 * Testes unitários para a lógica de resolução de versão do build (buildVersionPlugin).
 * Testa as funções puras extraídas do vite.config.ts sem montar o plugin Vite em si.
 */
import { describe, it, expect } from 'vitest'

// Extrai a lógica pura da resolução de branch/commit replicando as regras do vite.config.ts
// para testar sem depender do execSync em ambiente CI.

type BuildVersionInfo = {
  appName: string
  appVersion: string
  branch: string
  commit: string
  commitShort: string
  buildTime: string
  source: string
}

function resolveBranchFrom(env: Record<string, string | undefined>): string {
  return env.CF_PAGES_BRANCH ?? env.GITHUB_REF_NAME ?? env.GIT_BRANCH ?? 'unknown'
}

function resolveCommitFrom(env: Record<string, string | undefined>): string {
  return env.CF_PAGES_COMMIT_SHA ?? env.GITHUB_SHA ?? env.GIT_COMMIT ?? 'unknown'
}

function resolveSourceFrom(env: Record<string, string | undefined>): string {
  if (env.CF_PAGES === '1') return 'cloudflare-pages'
  if (env.GITHUB_ACTIONS === 'true') return 'github-actions'
  return 'local'
}

function buildVersionInfo(env: Record<string, string | undefined>): BuildVersionInfo {
  const branch = resolveBranchFrom(env)
  const commit = resolveCommitFrom(env)
  const commitShort = commit === 'unknown' ? 'unknown' : commit.slice(0, 7)
  const source = resolveSourceFrom(env)
  return {
    appName: 'adsmagic-frontend',
    appVersion: env.npm_package_version ?? '0.0.0',
    branch,
    commit,
    commitShort,
    buildTime: new Date().toISOString(),
    source,
  }
}

describe('buildVersionPlugin — resolveBranchFrom', () => {
  it('usa CF_PAGES_BRANCH quando disponível (Cloudflare Pages)', () => {
    expect(resolveBranchFrom({ CF_PAGES_BRANCH: 'v3' })).toBe('v3')
  })

  it('usa GITHUB_REF_NAME como fallback (GitHub Actions)', () => {
    expect(resolveBranchFrom({ GITHUB_REF_NAME: 'main' })).toBe('main')
  })

  it('usa GIT_BRANCH quando não há variáveis de CI', () => {
    expect(resolveBranchFrom({ GIT_BRANCH: 'feature/new-ui' })).toBe('feature/new-ui')
  })

  it('retorna "unknown" quando nenhuma variável está disponível', () => {
    expect(resolveBranchFrom({})).toBe('unknown')
  })

  it('CF_PAGES_BRANCH tem prioridade sobre GITHUB_REF_NAME', () => {
    expect(resolveBranchFrom({ CF_PAGES_BRANCH: 'v3', GITHUB_REF_NAME: 'main' })).toBe('v3')
  })
})

describe('buildVersionPlugin — resolveCommitFrom', () => {
  const sha = 'abc1234567890def1234567890abcdef12345678'

  it('usa CF_PAGES_COMMIT_SHA quando disponível', () => {
    expect(resolveCommitFrom({ CF_PAGES_COMMIT_SHA: sha })).toBe(sha)
  })

  it('usa GITHUB_SHA como fallback', () => {
    expect(resolveCommitFrom({ GITHUB_SHA: sha })).toBe(sha)
  })

  it('retorna "unknown" quando nenhuma variável está disponível', () => {
    expect(resolveCommitFrom({})).toBe('unknown')
  })
})

describe('buildVersionPlugin — resolveSourceFrom', () => {
  it('retorna "cloudflare-pages" quando CF_PAGES=1', () => {
    expect(resolveSourceFrom({ CF_PAGES: '1' })).toBe('cloudflare-pages')
  })

  it('retorna "github-actions" quando GITHUB_ACTIONS=true', () => {
    expect(resolveSourceFrom({ GITHUB_ACTIONS: 'true' })).toBe('github-actions')
  })

  it('retorna "local" por padrão', () => {
    expect(resolveSourceFrom({})).toBe('local')
  })

  it('cloudflare-pages tem prioridade sobre github-actions', () => {
    expect(resolveSourceFrom({ CF_PAGES: '1', GITHUB_ACTIONS: 'true' })).toBe('cloudflare-pages')
  })
})

describe('buildVersionPlugin — buildVersionInfo (integração)', () => {
  const sha = 'aeaed994fd9b569fda0d3ece59c9a7116a7b0e38'

  it('gera versão completa para ambiente Cloudflare Pages', () => {
    const info = buildVersionInfo({
      CF_PAGES: '1',
      CF_PAGES_BRANCH: 'v3',
      CF_PAGES_COMMIT_SHA: sha,
      npm_package_version: '1.2.3',
    })

    expect(info.appName).toBe('adsmagic-frontend')
    expect(info.appVersion).toBe('1.2.3')
    expect(info.branch).toBe('v3')
    expect(info.commit).toBe(sha)
    expect(info.commitShort).toBe('aeaed99')
    expect(info.source).toBe('cloudflare-pages')
    expect(info.buildTime).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('gera commitShort com 7 caracteres do SHA', () => {
    const info = buildVersionInfo({ CF_PAGES_COMMIT_SHA: sha })

    expect(info.commitShort).toHaveLength(7)
    expect(info.commitShort).toBe(sha.slice(0, 7))
  })

  it('commitShort é "unknown" quando commit é desconhecido', () => {
    const info = buildVersionInfo({})

    expect(info.commit).toBe('unknown')
    expect(info.commitShort).toBe('unknown')
  })

  it('usa "0.0.0" como versão padrão quando npm_package_version não está definido', () => {
    const info = buildVersionInfo({})

    expect(info.appVersion).toBe('0.0.0')
  })
})

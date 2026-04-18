#!/usr/bin/env node
/**
 * update-readme-status.js
 *
 * Atualiza o bloco de status entre <!-- STATUS:START --> e <!-- STATUS:END --> no README.md.
 * Detecta a branch atual automaticamente e usa o config correspondente.
 * Cada branch tem sua própria seção em CONFIGS abaixo.
 *
 * Uso:
 *   node scripts/update-readme-status.js                      # auto-detecta a branch
 *   node scripts/update-readme-status.js --branch master      # força uma branch específica
 *   node scripts/update-readme-status.js --dry-run            # só imprime, não grava
 */

const fs           = require('fs')
const path         = require('path')
const { execSync } = require('child_process')

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGS por branch — edite o "pct" de cada item para atualizar o progresso
// ─────────────────────────────────────────────────────────────────────────────
const CONFIGS = {

  // ── MASTER (produção estável) ──────────────────────────────────────────────
  master: {
    label: 'master (produção)',
    description: 'Branch de produção. Integra as features estáveis entregues até o momento.',
    frontend: [
      { area: 'Rotas & Componentes',         pct: 85,  issue: null,  note: 'Rotas principais ativas, sem rotas experimentais de v3'        },
      { area: 'Auth (login/register/OAuth)', pct: 100, issue: null,  note: 'Fluxo completo com OAuth popup (Meta, Google, TikTok)'         },
      { area: 'Contatos (lista + kanban)',   pct: 95,  issue: null,  note: 'CRUD, filtros, exportação CSV, kanban funcional'               },
      { area: 'Vendas UI',                   pct: 80,  issue: null,  note: 'UI funcional, integração parcial com backend'                   },
      { area: 'Dashboard V1',                pct: 75,  issue: null,  note: 'Dashboard com dados parcialmente reais'                         },
      { area: 'Links Rastreáveis',           pct: 100, issue: null,  note: 'UI completa, geração de UTMs'                                   },
      { area: 'Integrações',                 pct: 85,  issue: null,  note: 'OAuth Meta/Google/TikTok funcional'                            },
      { area: 'WhatsApp (Mensagens)',        pct: 70,  issue: null,  note: 'UI funcional, broker UAZAPI parcial'                            },
      { area: 'Configurações',              pct: 90,  issue: null,  note: 'Etapas, origens, settings gerais'                              },
      { area: 'Campaigns Meta Ads',          pct: 80,  issue: null,  note: 'Tabela, filtros, thumbnails de criativos, métricas de resultado' },
      { area: 'i18n EN/ES',                  pct: 55,  issue: null,  note: 'PT completo; EN/ES com gaps em vários módulos'                  },
      { area: 'Testes unitários',           pct: 70,  issue: null,  note: 'Cobertura parcial — v3 trouxe mais testes'                      },
      { area: 'Testes E2E Playwright',       pct: 0,   issue: null,  note: 'Ainda não configurado nesta branch'                             },
    ],
    backend: [
      { sessions: '1–3', area: 'Infraestrutura, Usuários, Projetos', pct: 100, issue: null,  priority: null  },
      { sessions: '4',   area: 'Contatos, Origens, Etapas',          pct: 100, issue: null,  priority: null  },
      { sessions: '5',   area: 'Vendas e Conversões',                 pct: 0,   issue: null,  priority: '🔴'  },
      { sessions: '6',   area: 'Links Rastreáveis',                   pct: 60,  issue: null,  priority: '🟡'  },
      { sessions: '7/8', area: 'Integrações OAuth',                   pct: 50,  issue: null,  priority: '🟡'  },
      { sessions: '8.5', area: 'WhatsApp Brokers',                    pct: 60,  issue: null,  priority: '🟡'  },
      { sessions: '9',   area: 'Analytics e Dashboard real',          pct: 15,  issue: null,  priority: '🔴'  },
      { sessions: '10',  area: 'Workers Assíncronos',                 pct: 10,  issue: null,  priority: '📦'  },
      { sessions: '11',  area: 'Auditoria e Monitoramento',           pct: 0,   issue: null,  priority: '📦'  },
      { sessions: '12',  area: 'Otimização e CI/CD',                  pct: 0,   issue: null,  priority: '📦'  },
    ],
  },

  // ── V3 (desenvolvimento ativo) ─────────────────────────────────────────────
  v3: {
    label: 'v3 (desenvolvimento ativo)',
    description: 'Branch de desenvolvimento. Inclui todas as features do master + E2E Playwright, refatorações e backend em andamento.',
    frontend: [
      { area: 'Rotas & Componentes',         pct: 90,  issue: null,  note: 'Build OK, guards OK, todas as rotas principais'            },
      { area: 'Auth (login/register/OAuth)', pct: 100, issue: null,  note: 'Fluxo completo com OAuth popup'                            },
      { area: 'Contatos (lista + kanban)',   pct: 100, issue: null,  note: 'CRUD, filtros, exportação CSV'                             },
      { area: 'Vendas UI',                   pct: 100, issue: null,  note: 'UI completa, conectada ao backend'                         },
      { area: 'Dashboard V2',                pct: 100, issue: null,  note: 'UI completa (dados mock até backend analytics)'            },
      { area: 'Links Rastreáveis',           pct: 100, issue: null,  note: 'UI completa'                                               },
      { area: 'Integrações',                 pct: 100, issue: null,  note: 'UI OAuth Meta/Google/TikTok completa'                     },
      { area: 'WhatsApp (Mensagens)',        pct: 100, issue: null,  note: 'UI completa'                                               },
      { area: 'Configurações',              pct: 100, issue: null,  note: 'Etapas, origens, settings gerais'                          },
      { area: 'Campaigns Meta/Google',       pct: 40,  issue: '#16', note: 'UI existe, sem dados reais'                                },
      { area: 'i18n EN/ES',                  pct: 65,  issue: '#11', note: 'PT completo; EN/ES com gaps em messages/integrations'      },
      { area: 'Testes unitários',           pct: 97,  issue: null,  note: '969/969 passando'                                          },
      { area: 'Testes E2E Playwright',       pct: 100, issue: null,  note: '37/37 passando'                                            },
    ],
    backend: [
      { sessions: '1–3', area: 'Infraestrutura, Usuários, Projetos', pct: 100, issue: null,  priority: null  },
      { sessions: '4',   area: 'Contatos, Origens, Etapas',          pct: 100, issue: null,  priority: null  },
      { sessions: '5',   area: 'Vendas e Conversões',                 pct: 0,   issue: '#6',  priority: '🔴'  },
      { sessions: '6',   area: 'Links Rastreáveis',                   pct: 0,   issue: '#8',  priority: '🔴'  },
      { sessions: '7/8', area: 'Integrações OAuth',                   pct: 53,  issue: '#9',  priority: '🟡'  },
      { sessions: '8.5', area: 'WhatsApp Brokers',                    pct: 76,  issue: '#10', priority: '🟡'  },
      { sessions: '9',   area: 'Analytics e Dashboard real',          pct: 20,  issue: '#7',  priority: '🔴'  },
      { sessions: '10',  area: 'Workers Assíncronos',                 pct: 17,  issue: '#13', priority: '📦'  },
      { sessions: '11',  area: 'Auditoria e Monitoramento',           pct: 0,   issue: '#14', priority: '📦'  },
      { sessions: '12',  area: 'Otimização e CI/CD',                  pct: 0,   issue: '#15', priority: '📦'  },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Detecta branch atual
// ─────────────────────────────────────────────────────────────────────────────
function getCurrentBranch() {
  const forceArg = process.argv.find(a => a.startsWith('--branch='))
  if (forceArg) return forceArg.split('=')[1]
  const idx = process.argv.indexOf('--branch')
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
}

const BRANCH_KEY = getCurrentBranch()
const CONFIG     = CONFIGS[BRANCH_KEY]

if (!CONFIG) {
  console.error(`⚠️  Branch "${BRANCH_KEY}" não tem config em CONFIGS. Adicione uma entrada em scripts/update-readme-status.js`)
  process.exit(1)
}

const { label: BRANCH, description: BRANCH_DESC, frontend: FRONTEND, backend: BACKEND } = CONFIG

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const BAR_LEN = 20

function asciiBar(pct) {
  const filled = Math.round((pct / 100) * BAR_LEN)
  const empty  = BAR_LEN - filled
  return '`' + '█'.repeat(filled) + '░'.repeat(empty) + '`'
}

function globalBar(pct) {
  const filled = Math.round((pct / 100) * BAR_LEN)
  const empty  = BAR_LEN - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

function dateBR() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function avg(items) {
  return Math.round(items.reduce((s, i) => s + i.pct, 0) / items.length)
}

// ─────────────────────────────────────────────────────────────────────────────
// Geradores de bloco Markdown
// ─────────────────────────────────────────────────────────────────────────────
function buildFrontendTable() {
  const header = [
    '| Área | Barra | % | Detalhe |',
    '|------|-------|---|---------|',
  ]
  const rows = FRONTEND.map(({ area, pct, issue, note }) => {
    const issueTag = issue ? ` — [${issue}]` : ''
    return `| ${area} | ${asciiBar(pct)} | ${pct}% | ${note}${issueTag} |`
  })
  return [...header, ...rows].join('\n')
}

function buildBackendTable() {
  const header = [
    '| Sessão | Área | Barra | % | Issue |',
    '|--------|------|-------|---|-------|',
  ]
  const rows = BACKEND.map(({ sessions, area, pct, issue, priority }) => {
    const issueCol = issue ? `[${issue}] ${priority}` : '—'
    return `| ${sessions} | ${area} | ${asciiBar(pct)} | ${pct}% | ${issueCol} |`
  })
  return [...header, ...rows].join('\n')
}

function buildGlobalProgress() {
  const fePct  = avg(FRONTEND)
  const bePct  = avg(BACKEND)
  const allPct = Math.round((fePct + bePct) / 2)

  return [
    '```',
    `Frontend  ${globalBar(fePct)}  ~${fePct}%`,
    `Backend   ${globalBar(bePct)}  ~${bePct}%`,
    `Projeto   ${globalBar(allPct)}  ~${allPct}%`,
    '```',
  ].join('\n')
}

function buildBlock() {
  const date   = dateBR()
  const fePct  = avg(FRONTEND)
  const bePct  = avg(BACKEND)

  return `<!-- STATUS:START -->
> **Atualizado em:** ${date} | Branch \`${BRANCH}\` | Frontend ~${fePct}% · Backend ~${bePct}%
>
> _${BRANCH_DESC}_

### Frontend

${buildFrontendTable()}

### Backend

${buildBackendTable()}

### Progresso Geral

${buildGlobalProgress()}
<!-- STATUS:END -->`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run')
const README  = path.resolve(__dirname, '..', 'README.md')

const START_MARKER = '<!-- STATUS:START -->'
const END_MARKER   = '<!-- STATUS:END -->'

let content = fs.readFileSync(README, 'utf-8')

const startIdx = content.indexOf(START_MARKER)
const endIdx   = content.indexOf(END_MARKER)

if (startIdx === -1 || endIdx === -1) {
  console.error('❌  Markers <!-- STATUS:START --> / <!-- STATUS:END --> não encontrados no README.md')
  process.exit(1)
}

// Preserva a linha do heading que fica antes do marker
const before   = content.slice(0, startIdx)
const after    = content.slice(endIdx + END_MARKER.length)
const newBlock = buildBlock()
const updated  = before + newBlock + after

if (DRY_RUN) {
  console.log('─── DRY RUN ───────────────────────────────────────────────────')
  console.log(newBlock)
  console.log('───────────────────────────────────────────────────────────────')
  console.log('✔  Dry-run concluído. Nenhum arquivo foi modificado.')
} else {
  fs.writeFileSync(README, updated, 'utf-8')
  console.log(`✅  README.md atualizado com sucesso! (${dateBR()})`)
  console.log(`    Frontend ~${avg(FRONTEND)}% · Backend ~${avg(BACKEND)}%`)
}

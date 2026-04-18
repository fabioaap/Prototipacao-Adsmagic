#!/usr/bin/env node
/**
 * sitemap-sync.cjs
 * Sincroniza screenshots do export organizado → front-end/public/sitemap/screens/ (flat)
 *
 * Uso:
 *   node scripts/sitemap-sync.cjs [--export <pasta>] [--dry-run] [--coverage]
 *
 * Padrão de export: exports/figma-sitemap-images-* (pega o mais recente)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── config ───────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'front-end', 'public', 'sitemap', 'screens');
const EXPORTS_DIR = path.join(ROOT, 'exports');

/** Rotas definidas no router que o sitemap usa — mantidas em sync com index.ts */
const ROUTER_ROUTES = [
  'login', 'register', 'email-confirmation', 'forgot-password', 'reset-password',
  'verify-otp', 'oauth-callback', 'onboarding',
  'dashboard-v2', 'contacts', 'sales', 'sales-edit', 'messages', 'tracking',
  'dashboard-legacy', 'events',
  'integrations', 'campaigns-google-ads', 'campaigns-meta-ads',
  'integrations-meta-callback', 'integrations-google-callback', 'integrations-tiktok-callback',
  'settings-general', 'settings-funnel', 'settings-origins',
  'projects', 'pricing', 'project-wizard', 'project-completion',
  'catalog',
  'test-service', 'test-components', 'test-common-components', 'test-layouts',
  'test-dashboard', 'test-contacts', 'test-radix', 'test-tokens',
  'routes-map',
];

// ─── args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const coverageOnly = args.includes('--coverage');
const exportArgIdx = args.indexOf('--export');
let exportDir = null;

if (exportArgIdx !== -1 && args[exportArgIdx + 1]) {
  exportDir = path.resolve(args[exportArgIdx + 1]);
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function resolveExportDir() {
  if (exportDir) return exportDir;

  if (!fs.existsSync(EXPORTS_DIR)) {
    console.error(`[sitemap:sync] ERRO: pasta exports/ não encontrada em ${EXPORTS_DIR}`);
    process.exit(1);
  }

  const candidates = fs.readdirSync(EXPORTS_DIR)
    .filter(d => d.startsWith('figma-sitemap-images-'))
    .map(d => ({ name: d, full: path.join(EXPORTS_DIR, d) }))
    .filter(d => fs.statSync(d.full).isDirectory())
    .sort((a, b) => b.name.localeCompare(a.name)); // mais recente primeiro

  if (!candidates.length) {
    console.error('[sitemap:sync] ERRO: nenhum diretório exports/figma-sitemap-images-* encontrado.');
    process.exit(1);
  }

  return candidates[0].full;
}

function collectImages(dir) {
  const images = {};
  if (!fs.existsSync(dir)) return images;

  function walk(current) {
    for (const entry of fs.readdirSync(current)) {
      const full = path.join(current, entry);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.toLowerCase().endsWith('.jpg') || entry.toLowerCase().endsWith('.png')) {
        const base = path.parse(entry).name;
        if (!images[base]) images[base] = full; // primeira ocorrência vence
      }
    }
  }
  walk(dir);
  return images;
}

// ─── main ─────────────────────────────────────────────────────────────────────

const source = resolveExportDir();
console.log(`[sitemap:sync] Fonte: ${path.relative(ROOT, source)}`);
console.log(`[sitemap:sync] Destino: ${path.relative(ROOT, TARGET)}`);
if (isDryRun) console.log('[sitemap:sync] MODO DRY-RUN — nenhum arquivo será copiado\n');

const sourceImages = collectImages(source);
const targetImages = fs.existsSync(TARGET)
  ? new Set(fs.readdirSync(TARGET).filter(f => f.endsWith('.jpg') || f.endsWith('.png')).map(f => path.parse(f).name))
  : new Set();

// ── sincronização ──

if (!coverageOnly) {
  if (!fs.existsSync(TARGET)) fs.mkdirSync(TARGET, { recursive: true });

  let copied = 0;
  let skipped = 0;

  for (const [name, srcPath] of Object.entries(sourceImages)) {
    const ext = path.extname(srcPath);
    const destPath = path.join(TARGET, `${name}${ext}`);
    const destExists = fs.existsSync(destPath);

    if (destExists) {
      const srcMtime = fs.statSync(srcPath).mtimeMs;
      const dstMtime = fs.statSync(destPath).mtimeMs;
      if (srcMtime <= dstMtime) {
        skipped++;
        continue;
      }
    }

    if (!isDryRun) fs.copyFileSync(srcPath, destPath);
    console.log(`  ${isDryRun ? '[dry]' : '+'} ${name}${ext}`);
    copied++;
  }

  console.log(`\n[sitemap:sync] Sincronizados: ${copied} | Já atualizados: ${skipped}\n`);
}

// ── cobertura ──

const allImages = new Set([...Object.keys(sourceImages), ...targetImages]);

const covered = ROUTER_ROUTES.filter(r => allImages.has(r));
const missing = ROUTER_ROUTES.filter(r => !allImages.has(r));
const extra = [...allImages].filter(n => !ROUTER_ROUTES.includes(n));

console.log('─── Relatório de Cobertura ───────────────────────────────────\n');
console.log(`Rotas com screenshot : ${covered.length}/${ROUTER_ROUTES.length}`);

if (missing.length) {
  console.log('\n⚠  Rotas SEM screenshot (precisam ser capturadas):');
  missing.forEach(r => console.log(`   - ${r}`));
}

if (extra.length) {
  console.log('\n📦 Imagens extras (não são rotas — ignoradas pelo sitemap):');
  extra.forEach(r => console.log(`   - ${r}`));
}

console.log('\n─────────────────────────────────────────────────────────────\n');

if (missing.length > 0) process.exit(0); // avisos, não erro
process.exit(0);

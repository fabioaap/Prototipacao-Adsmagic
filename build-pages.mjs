import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_RESERVED_TOP_LEVEL_ROUTES = new Set([
  '',
  'assets',
  'img',
  'wiki',
  'cadastro',
  'lp',
  'deck',
  'styleguide',
  'rotas',
  'kanban',
  'lps',
  'sales',
  'contacts',
  'campaigns',
  'tracking',
  'integrations',
  'journeys',
  'messages',
  'settings',
  'dashboard',
]);

function normalizeBasePath(pathValue, fallback) {
  const value = (pathValue || fallback).trim();
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function run(command, env) {
  execSync(command, {
    stdio: 'inherit',
    env,
  });
}

function copyDirectory(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });

  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    copyFileSync(sourcePath, targetPath);
  }
}

function toPosixPath(pathValue) {
  return pathValue.split(path.sep).join('/');
}

function joinPublicPath(basePath, relativePath = '') {
  const normalizedBase = normalizeBasePath(basePath, '/');
  const cleanedRelativePath = relativePath.replace(/^\/+/, '');

  if (!cleanedRelativePath) {
    return normalizedBase;
  }

  return `${normalizedBase}${cleanedRelativePath}`.replace(/\/+/g, '/');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function writeRedirectPage(outputDir, targetPath) {
  const normalizedTargetPath = targetPath.endsWith('/') ? targetPath : `${targetPath}/`;
  const safeTargetPath = escapeHtml(normalizedTargetPath);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    path.join(outputDir, 'index.html'),
    [
      '<!doctype html>',
      '<html lang="pt-BR">',
      '<head>',
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1">',
      '  <title>Redirecionando…</title>',
      `  <meta http-equiv="refresh" content="0; url=${safeTargetPath}">`,
      `  <link rel="canonical" href="${safeTargetPath}">`,
      '  <script>',
      `    const target = new URL(${JSON.stringify(normalizedTargetPath)}, window.location.origin);`,
      '    target.search = window.location.search;',
      '    target.hash = window.location.hash;',
      '    window.location.replace(target.toString());',
      '  </script>',
      '</head>',
      '<body>',
      `  <p>Redirecionando para <a href="${safeTargetPath}">${safeTargetPath}</a>.</p>`,
      '</body>',
      '</html>',
      '',
    ].join('\n'),
  );
}

function collectHtmlRoutes(currentDir, currentRoute = '') {
  const routes = [];

  for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
    const sourcePath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      const nextRoute = currentRoute ? `${currentRoute}/${entry.name}` : entry.name;
      routes.push(...collectHtmlRoutes(sourcePath, nextRoute));
      continue;
    }

    if (entry.name === 'index.html') {
      routes.push(currentRoute);
    }
  }

  return routes;
}

function shouldCreateDocsAlias(routePath) {
  if (!routePath) {
    return false;
  }

  const [topLevelRoute] = routePath.split('/');
  return !APP_RESERVED_TOP_LEVEL_ROUTES.has(topLevelRoute);
}

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, 'dist');
const docsBuildDir = path.join(rootDir, 'workspace', 'docs', 'build');

const env = {
  ...process.env,
  WORKSPACE_BASE_PATH: normalizeBasePath(process.env.WORKSPACE_BASE_PATH, '/'),
  DOCS_BASE_PATH: normalizeBasePath(process.env.DOCS_BASE_PATH, '/wiki/'),
};

const workspaceBasePath = env.WORKSPACE_BASE_PATH;

run('npm run build:workspace', env);
run('npm run docs:build', env);

if (!existsSync(distDir)) {
  throw new Error('Build do workspace não gerou a pasta dist/.');
}

if (!existsSync(docsBuildDir)) {
  throw new Error('Build da wiki não gerou a pasta workspace/docs/build/.');
}

const wikiDir = path.join(distDir, 'wiki');
const docsAliasRoutes = collectHtmlRoutes(docsBuildDir).filter(shouldCreateDocsAlias);

rmSync(wikiDir, { recursive: true, force: true });
copyDirectory(docsBuildDir, wikiDir);
copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
writeFileSync(path.join(distDir, '.nojekyll'), '');

for (const routePath of docsAliasRoutes) {
  const outputDir = path.join(distDir, ...routePath.split('/'));
  const targetPath = joinPublicPath(workspaceBasePath, `wiki/${toPosixPath(routePath)}/`);
  writeRedirectPage(outputDir, targetPath);
}

writeFileSync(
  path.join(distDir, '_redirects'),
  [
    '/wiki /wiki/ 301',
    '/wiki/wiki /wiki/ 301',
    '/wiki/wiki/* /wiki/:splat 301',
    '/intro /wiki/intro 301',
    '/constituicao /wiki/constituicao 301',
    '/setup-local /wiki/setup-local 301',
    '/jornadas /wiki/jornadas 301',
    '/workflow /wiki/workflow/prototipacao 301',
    '/workflow/* /wiki/workflow/:splat 301',
    '/product /wiki/product/as-is 301',
    '/product/* /wiki/product/:splat 301',
    '/architecture /wiki/architecture/visao-geral 301',
    '/architecture/* /wiki/architecture/:splat 301',
    '/modulos /wiki/modulos/ 301',
    '/modulos/* /wiki/modulos/:splat 301',
    '/stories /wiki/stories/antitese 301',
    '/stories/* /wiki/stories/:splat 301',
    '/wiki/* /wiki/:splat 200',
    '/* /index.html 200',
  ].join('\n') + '\n',
);
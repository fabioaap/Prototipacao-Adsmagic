import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const appRoot = join(scriptsDir, '..')
const workspaceRoot = join(appRoot, '..')
const manifestPath = join(workspaceRoot, 'marketing', 'lps.manifest.json')
const distDir = join(appRoot, 'dist')
const deliverablesRoot = join(workspaceRoot, 'deliverables', 'lps')

function copyRecursive(source, target) {
  const sourceStats = statSync(source)

  if (sourceStats.isDirectory()) {
    mkdirSync(target, { recursive: true })

    for (const entry of readdirSync(source)) {
      copyRecursive(join(source, entry), join(target, entry))
    }

    return
  }

  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(source, target)
}

function buildSitemapXml(url) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${url}</loc>`,
    '    <changefreq>weekly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
    '</urlset>',
    '',
  ].join('\n')
}

function buildRobotsTxt(url) {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${url.replace(/\/$/, '')}/sitemap.xml`,
    '',
  ].join('\n')
}

try {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

  if (!existsSync(distDir)) {
    throw new Error('Build nao encontrado em landing-pages/dist. Rode npm run build antes de empacotar as LPs.')
  }

  rmSync(deliverablesRoot, { recursive: true, force: true })
  mkdirSync(deliverablesRoot, { recursive: true })

  for (const page of manifest.pages) {
    const sourceDir = join(distDir, page.slug)
    const targetDir = join(deliverablesRoot, page.slug)
    const htmlPath = join(targetDir, 'index.html')

    if (!existsSync(sourceDir)) {
      throw new Error(`Saida da LP ${page.slug} nao encontrada em ${sourceDir}.`)
    }

    copyRecursive(sourceDir, targetDir)

    if (existsSync(join(distDir, 'assets'))) {
      copyRecursive(join(distDir, 'assets'), join(targetDir, 'assets'))
    }

    if (existsSync(join(distDir, 'img'))) {
      copyRecursive(join(distDir, 'img'), join(targetDir, 'img'))
    }

    for (const logoFile of ['logo-wordmark.svg', 'logo-wordmark-white.svg']) {
      const logoSource = join(distDir, logoFile)
      if (existsSync(logoSource)) {
        copyRecursive(logoSource, join(targetDir, logoFile))
      }
    }

    const html = readFileSync(htmlPath, 'utf8').replaceAll('../assets/', './assets/')
    writeFileSync(htmlPath, html)

    writeFileSync(
      join(targetDir, 'manifest.json'),
      JSON.stringify(page, null, 2) + '\n'
    )

    writeFileSync(
      join(targetDir, 'README-handoff.md'),
      [
        `# ${page.name}`,
        '',
        `- Slug: ${page.slug}`,
        `- URL canonica: ${page.canonicalUrl}`,
        `- Owner: ${page.owner}`,
        `- Build source: landing-pages/dist/${page.slug}`,
        '',
        '## Conteudo do pacote',
        '',
        '- index.html',
        '- assets/',
        '- img/',
        '- manifest.json',
        '',
        '## Publicacao',
        '',
        '1. Suba o conteudo desta pasta no host externo dedicado da LP.',
        '2. Preserve a estrutura relativa de arquivos do pacote.',
        '3. Valide CTA principal, imagens, tipografia e tracking antes de publicar.',
        '',
      ].join('\n')
    )

    writeFileSync(join(targetDir, 'sitemap.xml'), buildSitemapXml(page.canonicalUrl))
    writeFileSync(join(targetDir, 'robots.txt'), buildRobotsTxt(page.canonicalUrl))
  }

  console.log(`Deliverables gerados em ${deliverablesRoot}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
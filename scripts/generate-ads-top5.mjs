#!/usr/bin/env node
/**
 * Gera as 5 fotografias hero dos anúncios Top 5 Meta (Tintim) usando o
 * Nano Banana (Gemini 2.5 Flash Image) via REST API.
 *
 * Uso:
 *   export GEMINI_API_KEY=xxxxxxxx   (ou GOOGLE_API_KEY, ou use .env)
 *   npm run gen:ads
 *
 * Saída: apps/plataforma/public/img/ads-top5/slide-{1-5}.png
 *
 * Contrato:
 *   - Lê os 5 prompts diretamente de apps/plataforma/src/data/ads-top5.ts
 *     (parser regex — mantém a fonte única de verdade).
 *   - Cada imagem é salva como PNG 1024x1024 (o modelo decide a resolução
 *     exata; pedimos 1:1 no prompt).
 *   - Em caso de erro em 1 slide, os outros continuam.
 */

import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')

// ───────────────────────── .env loader (mínimo, sem dependência) ─────────────────────────
function loadDotEnv() {
  const envPath = path.join(REPO_ROOT, '.env')
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!m) continue
    const [, key, rawVal] = m
    if (process.env[key]) continue
    let val = rawVal
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}
loadDotEnv()

const API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  ''

if (!API_KEY) {
  console.error(
    '\n[gen:ads] ERRO: nenhuma API key encontrada.\n' +
      '         Defina GEMINI_API_KEY (ou GOOGLE_API_KEY) no ambiente ou no arquivo .env.\n' +
      '         Obtenha uma chave em: https://aistudio.google.com/apikey\n',
  )
  process.exit(1)
}

// ───────────────────────── Parser dos prompts ─────────────────────────
const DATA_FILE = path.join(
  REPO_ROOT,
  'apps',
  'plataforma',
  'src',
  'data',
  'ads-top5.ts',
)

function extractPrompts() {
  const src = fs.readFileSync(DATA_FILE, 'utf8')

  // Cada bloco começa em `number: N,` e termina antes do próximo `number:` ou do
  // fechamento `] satisfies`. Dentro do bloco, procuramos:
  //   nanoBananaPrompt:\s*'<conteúdo>',
  const slideBlocks = []
  const blockRe =
    /number:\s*(\d+),[\s\S]*?nanoBananaPrompt:\s*'([\s\S]*?)',\s*\n\s*(?:heroImage|\})/g

  let m
  while ((m = blockRe.exec(src))) {
    const number = Number(m[1])
    // Unescape: o fonte usa aspas simples; como não há aspas simples cruas
    // dentro dos prompts (apenas aspas duplas e hífens), não precisamos de
    // tratamento especial além de normalizar espaços.
    const prompt = m[2].replace(/\s+/g, ' ').trim()
    slideBlocks.push({number, prompt})
  }

  if (slideBlocks.length !== 5) {
    throw new Error(
      `[gen:ads] Parser encontrou ${slideBlocks.length} prompts, esperava 5. ` +
        'Verifique o formato de apps/plataforma/src/data/ads-top5.ts.',
    )
  }

  return slideBlocks.sort((a, b) => a.number - b.number)
}

// ───────────────────────── Gemini 2.5 Flash Image ─────────────────────────
// Modelo de geração de imagem (aka "Nano Banana").
// Doc: https://ai.google.dev/gemini-api/docs/image-generation
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

async function generateOne(prompt) {
  const body = {
    contents: [{parts: [{text: prompt}]}],
    generationConfig: {
      // Pedimos explicitamente saída de imagem.
      responseModalities: ['IMAGE'],
    },
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '(no body)')
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${txt.slice(0, 500)}`)
  }

  const json = await res.json()

  // Resposta: candidates[0].content.parts[].inlineData.{mimeType,data}
  const parts = json?.candidates?.[0]?.content?.parts || []
  for (const p of parts) {
    const inline = p.inlineData || p.inline_data
    if (inline?.data) {
      return {
        mimeType: inline.mimeType || inline.mime_type || 'image/png',
        base64: inline.data,
      }
    }
  }

  throw new Error(
    `Resposta sem imagem. Texto do modelo: ${JSON.stringify(parts).slice(0, 400)}`,
  )
}

// ───────────────────────── Main ─────────────────────────
async function main() {
  const outDir = path.join(
    REPO_ROOT,
    'apps',
    'plataforma',
    'public',
    'img',
    'ads-top5',
  )
  fs.mkdirSync(outDir, {recursive: true})

  const slides = extractPrompts()
  console.log(`[gen:ads] Modelo: ${MODEL}`)
  console.log(`[gen:ads] ${slides.length} prompts encontrados. Gerando…\n`)

  const results = []

  for (const slide of slides) {
    const filename = `slide-${slide.number}.png`
    const outPath = path.join(outDir, filename)
    process.stdout.write(
      `  [${slide.number}/5] ${filename}  (${slide.prompt.length} chars) … `,
    )
    const t0 = Date.now()
    try {
      const img = await generateOne(slide.prompt)
      fs.writeFileSync(outPath, Buffer.from(img.base64, 'base64'))
      const ms = Date.now() - t0
      console.log(`OK (${(ms / 1000).toFixed(1)}s, ${img.mimeType})`)
      results.push({number: slide.number, ok: true, file: outPath})
    } catch (err) {
      const ms = Date.now() - t0
      console.log(`FAIL (${(ms / 1000).toFixed(1)}s)`)
      console.error(`      ${err.message}`)
      results.push({number: slide.number, ok: false, error: err.message})
    }
  }

  console.log('\n[gen:ads] Resumo:')
  for (const r of results) {
    console.log(
      `  slide-${r.number}: ${r.ok ? '✅ ' + path.relative(REPO_ROOT, r.file) : '❌ ' + r.error}`,
    )
  }

  const failed = results.filter((r) => !r.ok).length
  process.exit(failed === 0 ? 0 : 2)
}

main().catch((err) => {
  console.error('[gen:ads] Erro fatal:', err)
  process.exit(1)
})

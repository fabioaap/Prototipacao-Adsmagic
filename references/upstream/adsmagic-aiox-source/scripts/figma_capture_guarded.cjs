#!/usr/bin/env node

const path = require('path')
const { spawnSync } = require('child_process')

function parseArgs(argv) {
  const args = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      continue
    }

    const key = token.slice(2)
    const nextToken = argv[index + 1]

    if (!nextToken || nextToken.startsWith('--')) {
      args[key] = true
      continue
    }

    args[key] = nextToken
    index += 1
  }

  return args
}

function requireArg(args, name) {
  const value = args[name]
  if (!value) {
    throw new Error(`Parametro obrigatorio ausente: --${name}`)
  }
  return value
}

function resolvePythonCommand() {
  return process.platform === 'win32' ? 'python' : 'python3'
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const routeUrl = requireArg(args, 'url')
  const frameName = requireArg(args, 'frame-name')
  const fileKey = args['file-key'] || null
  const nodeId = args['node-id'] || null
  const verifyNodeId = args['verify-node-id'] || nodeId

  const pythonCommand = resolvePythonCommand()
  const helperPath = path.resolve(__dirname, 'figma_mcp_call.py')
  const normalization = spawnSync(
    pythonCommand,
    [helperPath, 'normalize', '--url', routeUrl, '--frame-name', frameName, ...(fileKey ? ['--file-key', fileKey] : []), ...(nodeId ? ['--node-id', nodeId] : []), ...(verifyNodeId ? ['--verify-node-id', verifyNodeId] : [])],
    { encoding: 'utf8' }
  )

  if (normalization.status !== 0) {
    process.stderr.write(normalization.stderr || 'Falha ao normalizar o request de captura guardada.\n')
    process.exit(normalization.status || 1)
  }

  const normalized = JSON.parse(normalization.stdout)
  const selector = args.selector || normalized.options.selector || 'div.page-shell.section-stack-md'
  const delay = args.delay || normalized.options.captureDelayMs || 1800

  const summary = {
    mode: 'guarded-script',
    routeUrl: normalized.routeUrl,
    frameName: normalized.frameName,
    target: normalized.target,
    options: {
      ...normalized.options,
      selector,
      captureDelayMs: Number(delay),
    },
    nextStep: 'Abra a URL resultante com o hash figmacapture e acompanhe a insercao no Figma.',
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

main()

#!/usr/bin/env node

const { exec } = require('child_process')

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

function normalizeUrl(rawUrl) {
  const value = rawUrl || process.env.FIGMA_CAPTURE_URL || 'http://localhost:5200'
  return new URL(value)
}

function setHashParam(hashParams, key, value) {
  if (value === undefined || value === null || value === '' || value === false) {
    hashParams.delete(key)
    return
  }

  hashParams.set(key, String(value))
}

function toBooleanLike(value, defaultValue) {
  if (value === undefined) {
    return defaultValue
  }

  if (typeof value === 'boolean') {
    return value
  }

  const normalized = String(value).toLowerCase()
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  if (['1', 'true', 'yes', 'on', 'auto'].includes(normalized)) {
    return true
  }

  return defaultValue
}

function openUrl(targetUrl) {
  const platform = process.platform

  if (platform === 'win32') {
    exec(`start "" "${targetUrl.replace(/&/g, '^&')}"`)
    return
  }

  if (platform === 'darwin') {
    exec(`open "${targetUrl}"`)
    return
  }

  exec(`xdg-open "${targetUrl}"`)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const targetUrl = normalizeUrl(args.url)
  const hashParams = new URLSearchParams(targetUrl.hash.replace(/^#/, ''))

  setHashParam(hashParams, 'figmacapture', '1')
  setHashParam(hashParams, 'figmadelay', args.delay || 1000)
  setHashParam(hashParams, 'figmaselector', args.selector)
  setHashParam(hashParams, 'captureId', args['capture-id'])
  setHashParam(hashParams, 'fileKey', args['file-key'])
  setHashParam(hashParams, 'nodeId', args['node-id'])
  setHashParam(hashParams, 'frameName', args['frame-name'])
  targetUrl.hash = hashParams.toString()

  const shouldOpen = toBooleanLike(args.open, false)

  const summary = {
    mode: 'official-mcp',
    url: targetUrl.toString(),
    selector: args.selector || null,
    delayMs: Number(args.delay || 1000),
    captureId: args['capture-id'] || null,
    fileKey: args['file-key'] || null,
    nodeId: args['node-id'] || null,
    frameName: args['frame-name'] || null,
    opened: shouldOpen,
  }

  console.log(JSON.stringify(summary, null, 2))

  if (shouldOpen) {
    openUrl(targetUrl.toString())
  }
}

main()

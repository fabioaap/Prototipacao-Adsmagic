const runtimeBase = import.meta.env.BASE_URL || '/'

export function publicAsset(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')

  if (import.meta.env.DEV || runtimeBase !== './') {
    return `${runtimeBase}${normalizedPath}`
  }

  const assetRoot = new URL(/* @vite-ignore */ '../', import.meta.url)

  return new URL(normalizedPath, assetRoot).toString()
}
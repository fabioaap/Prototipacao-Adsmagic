import net from 'node:net'

/**
 * Finds the first available TCP port in the given range.
 * Used by vite.config.js to avoid port collisions in local dev.
 * The docs portal is pinned to 3001, so the workspace range skips it.
 */
export async function findAvailablePort(start = 3000, end = 3006, blocked = [3001]) {
  for (let port = start; port <= end; port++) {
    if (blocked.includes(port)) continue
    const available = await new Promise((resolve) => {
      const server = net.createServer()
      server.once('error', () => resolve(false))
      server.once('listening', () => {
        server.close(() => resolve(true))
      })
      server.listen(port, '127.0.0.1')
    })
    if (available) return port
  }
  return start
}

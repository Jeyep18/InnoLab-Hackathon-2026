import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Teacher files are demonstration-only. They live in the Git-ignored demo-assets/
// folder and are served by the local dev/preview server, never copied into dist/.
const DEMO_ASSETS_DIR = path.resolve(import.meta.dirname, 'demo-assets')

function serveDemoAssets(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith('/demo-assets/')) return next()
    let relative: string
    try {
      relative = decodeURIComponent(req.url.slice('/demo-assets/'.length).split('?')[0])
    } catch {
      res.statusCode = 400
      return res.end()
    }
    const filePath = path.resolve(DEMO_ASSETS_DIR, relative)
    if (!filePath.startsWith(DEMO_ASSETS_DIR + path.sep) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      res.statusCode = 404
      return res.end('Not found')
    }
    res.setHeader('Cache-Control', 'no-store')
    createReadStream(filePath).pipe(res)
  }
  return {
    name: 'cherit-demo-assets',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

export default defineConfig({
  plugins: [react(), serveDemoAssets()],
  server: { host: 'localhost' },
  preview: { host: 'localhost' },
  test: { environment: 'node' },
})

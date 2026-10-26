import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Folder-based packs: <root>/<contributor alias>/<Grade - Subject - [BOW] - Title>/<files>.
// sample-packs/ holds tracked fictional placeholders. demo-assets/packs/ holds the teachers'
// demonstration-only files; it is Git-ignored and served only by this local server, never
// copied into dist/.
const ROOTS = {
  sample: path.resolve(import.meta.dirname, 'sample-packs'),
  teacher: path.resolve(import.meta.dirname, 'demo-assets', 'packs'),
} as const
type Source = keyof typeof ROOTS

const TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  txt: 'text/plain; charset=utf-8',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  odt: 'application/vnd.oasis.opendocument.text',
  odp: 'application/vnd.oasis.opendocument.presentation',
}

const visible = (name: string) => !name.startsWith('.') && !name.startsWith('~$')
const subdirs = (dir: string) => readdirSync(dir).filter((n) => visible(n) && statSync(path.join(dir, n)).isDirectory())

function manifest() {
  const packs = []
  for (const source of Object.keys(ROOTS) as Source[]) {
    const root = ROOTS[source]
    if (!existsSync(root)) continue
    for (const alias of subdirs(root)) {
      for (const folder of subdirs(path.join(root, alias))) {
        const dir = path.join(root, alias, folder)
        const files = readdirSync(dir)
          .filter((name) => visible(name) && statSync(path.join(dir, name)).isFile())
          .filter((name) => path.extname(name).slice(1).toLowerCase() in TYPES)
          .sort((a, b) => a.localeCompare(b))
          .map((name) => ({
            name,
            sizeBytes: statSync(path.join(dir, name)).size,
            url: `/pack-files/${source}/${[alias, folder, name].map(encodeURIComponent).join('/')}`,
          }))
        if (files.length > 0) packs.push({ source, alias, folder, files })
      }
    }
  }
  return { packs }
}

function servePacks(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url?.split('?')[0] ?? ''
    if (url === '/packs-manifest.json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store')
      return res.end(JSON.stringify(manifest()))
    }
    if (!url.startsWith('/pack-files/')) return next()
    const [source, ...rest] = url.slice('/pack-files/'.length).split('/')
    const root = ROOTS[source as Source]
    let filePath = ''
    try {
      filePath = root ? path.resolve(root, ...rest.map(decodeURIComponent)) : ''
    } catch {
      filePath = ''
    }
    if (!filePath || !filePath.startsWith(root + path.sep) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain')
      return res.end('Not found')
    }
    res.setHeader('Content-Type', TYPES[path.extname(filePath).slice(1).toLowerCase()] ?? 'application/octet-stream')
    res.setHeader('Cache-Control', 'no-store')
    createReadStream(filePath).pipe(res)
  }
  return {
    name: 'cherit-folder-packs',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

export default defineConfig({
  plugins: [react(), servePacks()],
  server: { host: 'localhost' },
  preview: { host: 'localhost' },
  test: { environment: 'node' },
})

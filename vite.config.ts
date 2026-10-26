import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
// One broken link or unreadable file must not hide every other pack.
const safeStat = (p: string) => {
  try {
    return statSync(p)
  } catch {
    return undefined
  }
}
const safeList = (dir: string) => {
  try {
    return readdirSync(dir).filter(visible)
  } catch {
    return []
  }
}
const subdirs = (dir: string) => safeList(dir).filter((n) => safeStat(path.join(dir, n))?.isDirectory())

function manifest() {
  const packs = []
  for (const source of Object.keys(ROOTS) as Source[]) {
    const root = ROOTS[source]
    if (!existsSync(root)) continue
    for (const alias of subdirs(root)) {
      for (const folder of subdirs(path.join(root, alias))) {
        const dir = path.join(root, alias, folder)
        const files = safeList(dir)
          .filter((name) => safeStat(path.join(dir, name))?.isFile())
          .filter((name) => path.extname(name).slice(1).toLowerCase() in TYPES)
          .sort((a, b) => a.localeCompare(b))
          .map((name) => ({
            name,
            sizeBytes: safeStat(path.join(dir, name))?.size ?? 0,
            url: `/pack-files/${source}/${[alias, folder, name].map(encodeURIComponent).join('/')}`,
          }))
        if (files.length > 0) packs.push({ source, alias, folder, files })
      }
    }
  }
  return { packs }
}

function decodeURIComponentSafe(s: string) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

function servePacks(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url?.split('?')[0] ?? ''
    // Teacher files are reachable only through /pack-files, never as raw project paths.
    if (decodeURIComponentSafe(url).toLowerCase().startsWith('/demo-assets')) {
      res.statusCode = 404
      return res.end('Not found')
    }
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
    if (!filePath || !filePath.startsWith(root + path.sep) || !existsSync(filePath) || !safeStat(filePath)?.isFile()) {
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
  plugins: [react(), tailwindcss(), servePacks()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  server: { host: 'localhost' },
  preview: { host: 'localhost' },
  test: { environment: 'node' },
})

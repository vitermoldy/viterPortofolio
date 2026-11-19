// Serves the built site (dist/) at /viterPortofolio/, the same path GitHub Pages uses.
//   npm run build && npm run preview      then open http://localhost:5189/viterPortofolio/
// Used instead of `vite preview`, which on Vite 8 answers 404 to the browser's module script request
// (any request carrying "Sec-Fetch-Dest: script"), so the built page stays blank there.
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const BASE = '/viterPortofolio/'
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
}

export function serve(port = 5189) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname === '/' || url.pathname === BASE.slice(0, -1)) {
      res.writeHead(302, { Location: BASE })
      return res.end()
    }
    if (!url.pathname.startsWith(BASE)) {
      res.writeHead(404)
      return res.end('Not found')
    }
    let rel = decodeURIComponent(url.pathname.slice(BASE.length)) || 'index.html'
    let file = normalize(join(root, rel))
    if (!file.startsWith(root)) {
      res.writeHead(403)
      return res.end()
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file)) {
      res.writeHead(404)
      return res.end('Not found')
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' })
    createReadStream(file).pipe(res)

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

// Click-through of the built page in the laptop's own Chrome (playwright-core, no browser download).
//   npm run build && npm run check:ui     one line per check, screenshots in .shots/, exit 1 on any failure
// It serves dist/ itself on a free port; set SITE_URL to check another address instead.
// Every control is used the way a person would: nav, the sky switch, the skyline's view and range, the
// pictures, the project cards, the phone menu, the keyboard on a 3D stage, and the page at 390 and 320.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serve } from './serve.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const server = process.env.SITE_URL ? null : await serve(0)
const BASE = process.env.SITE_URL ?? `http://localhost:${server.address().port}/viterPortofolio/`
const OUT = join(root, '.shots')
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
mkdirSync(OUT, { recursive: true })

const results = []
const errors = []
const log = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `: ${detail}` : ''}`)
}
const check = async (name, fn) => {
  try {
    let timer
    const limit = new Promise((_, reject) => (timer = setTimeout(() => reject(new Error('took over 60 s')), 60000)))
    const detail = await Promise.race([fn(), limit]).finally(() => clearTimeout(timer))
    log(name, true, typeof detail === 'string' ? detail : '')
  } catch (err) {
    log(name, false, String(err?.message ?? err).split('\n')[0])
  }
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })

async function open(viewport) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  page.on('console', (m) => m.type() === 'error' && errors.push(`${viewport.width}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`${viewport.width}: ${e}`))
  page.on('response', (r) => r.status() >= 400 && errors.push(`${viewport.width}: HTTP ${r.status()} ${r.url()}`))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  return { context, page }
}


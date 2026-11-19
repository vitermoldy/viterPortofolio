// Draws public/share.png, the picture a link preview shows (og:image), from the built page's first screen.
//   npm run build && node scripts/share-image.mjs && npm run build
import { chromium } from 'playwright-core'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serve } from './serve.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const server = await serve(0)
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(`http://localhost:${server.address().port}/viterPortofolio/`, { waitUntil: 'networkidle' })
await page.waitForFunction(() => {

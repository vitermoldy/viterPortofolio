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

const pressed = (loc) => loc.getAttribute('aria-pressed')
const stageReady = (page, sel) =>
  page.waitForFunction((s) => {
    const c = document.querySelector(s + ' canvas')
    return c && getComputedStyle(c).opacity === '1'
  }, sel, { timeout: 20000 })
const settle = (page, ms = 3200) => page.waitForTimeout(ms)

// Desktop
{
  const { context, page } = await open({ width: 1440, height: 900 })

  await check('hero: real GitHub numbers', async () => {
    await page.waitForFunction(() => !document.querySelector('#top dl[aria-busy="true"]'))
    const facts = await page.locator('#top dd').allInnerTexts()
    expect(facts.length === 3 && facts.every((f) => f && !/Loading|Not loaded/.test(f)), 'facts: ' + facts.join(' | '))
    return facts.join(' | ')
  })
  await check('hero: avatar blocks fly in', async () => {
    await stageReady(page, '#top')
    await settle(page)
    await page.screenshot({ path: join(OUT, '1440-hero.png') })
  })
  await check('hero: Sunset switches the portrait', async () => {
    const b = page.getByRole('button', { name: 'Sunset', exact: true })
    await b.click()
    expect((await pressed(b)) === 'true', 'Sunset not pressed')
    expect((await pressed(page.getByRole('button', { name: 'Moon', exact: true }))) === 'false', 'Moon still pressed')
    await page.waitForTimeout(700)
    await page.locator('#top .stage-frame').screenshot({ path: join(OUT, '1440-hero-morph.png') })
    await settle(page, 1500)
    await page.locator('#top .stage-frame').screenshot({ path: join(OUT, '1440-hero-sunset.png') })
  })
  await check('hero: drag turns the avatar', async () => {
    const box = await page.locator('#top canvas').boundingBox()
    const before = await page.locator('#top canvas').screenshot()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 - 160, box.y + box.height / 2 + 40, { steps: 8 })
    await page.mouse.up()
    await settle(page, 900)
    const after = await page.locator('#top canvas').screenshot()
    expect(Buffer.compare(before, after) !== 0, 'canvas did not change')
    await page.locator('#top .stage-frame').screenshot({ path: join(OUT, '1440-hero-turned.png') })
  })
  await check('hero: arrow keys turn it and Home faces it again', async () => {
    const c = page.locator('#top canvas')
    await c.focus()
    const a = await c.screenshot()
    await page.keyboard.press('Home')
    await settle(page, 900)
    const b = await c.screenshot()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await settle(page, 900)
    const d = await c.screenshot()
    expect(Buffer.compare(a, b) !== 0 && Buffer.compare(b, d) !== 0, 'keys did not move the camera')
  })
  await check('hero: "See the commit skyline" scrolls to it', async () => {
    await page.getByRole('link', { name: 'See the commit skyline' }).click()
    await page.waitForTimeout(900)
    const top = await page.locator('#contributions').evaluate((el) => el.getBoundingClientRect().top)
    expect(Math.abs(top) < 120, 'section top at ' + top)
  })
  await check('skyline: draws the real calendar', async () => {
    await page.waitForTimeout(2600)
    const title = await page.locator('#contributions h3').innerText()
    expect(/\d/.test(title), 'title ' + title)
    await page.locator('#contributions').screenshot({ path: join(OUT, '1440-skyline-3d.png') })
    return title

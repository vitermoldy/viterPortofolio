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
  })
  await check('skyline: 2D view and back', async () => {
    await page.getByRole('button', { name: 'Flat heat map' }).click()
    await page.waitForTimeout(1800)
    await page.locator('#contributions').screenshot({ path: join(OUT, '1440-skyline-2d.png') })
    expect((await pressed(page.getByRole('button', { name: 'Flat heat map' }))) === 'true', '2D not pressed')
    await page.getByRole('button', { name: '3D skyline' }).click()
    await page.waitForTimeout(1600)
  })
  await check('skyline: hover a day shows its count', async () => {
    const cv = page.locator('#contributions canvas')
    const box = await cv.boundingBox()
    let found = ''
    for (let i = 0; i < 40 && !found; i++) {
      await page.mouse.move(box.x + box.width * (0.2 + (i % 8) * 0.08), box.y + box.height * (0.3 + Math.floor(i / 8) * 0.1))
      await page.waitForTimeout(60)
      const t = await page.locator('#contributions [role=tooltip]').innerText()
      if (/ on /.test(t)) found = t
    }
    expect(found, 'no tooltip')
    return found.replace(/\s+/g, ' ')
  })
  await check('skyline: legend isolates a level', async () => {
    const b = page.getByRole('button', { name: 'Highlight heaviest days' })
    await b.click()
    expect((await pressed(b)) === 'true', 'legend not pressed')
    await page.mouse.move(0, 0)
  })
  await check('skyline: year switch', async () => {
    const years = page.locator('#contributions [aria-label="Years shown"] button')
    const n = await years.count()
    expect(n >= 2, 'only ' + n + ' range buttons')
    await years.nth(1).click()
    await page.waitForTimeout(1800)
    const title = await page.locator('#contributions h3').innerText()
    expect(/in 20\d\d/.test(title), 'title ' + title)
    await page.locator('#contributions').screenshot({ path: join(OUT, '1440-skyline-year.png') })
    await years.nth(0).click()
    return title
  })
  await check('pixel art: the room in blocks', async () => {
    await page.locator('#pixel-art').scrollIntoViewIfNeeded()
    await stageReady(page, '#pixel-art')
    await settle(page)
    await page.locator('#pixel-art').screenshot({ path: join(OUT, '1440-room.png') })
  })
  for (const name of ['StudyCabin at night', 'Sunset field', 'The room']) {
    await check(`pixel art: ${name}`, async () => {
      const b = page.locator('#pixel-art button', { hasText: name })
      await b.click()
      expect((await pressed(b)) === 'true', 'not pressed')
      await settle(page)
      await page.locator('#pixel-art .stage-frame').screenshot({ path: join(OUT, `1440-scene-${name.split(' ')[0].toLowerCase()}.png`) })
    })
  }
  await check('projects: every card picks and its links are right', async () => {
    await page.locator('#projects').scrollIntoViewIfNeeded()
    await stageReady(page, '#projects')
    await settle(page)
    await page.locator('#projects').screenshot({ path: join(OUT, '1440-projects.png') })
    const cards = page.locator('#projects [aria-label="Project cards"] button')
    const n = await cards.count()
    const seen = []
    for (let i = 0; i < n; i++) {
      await cards.nth(i).click()
      const name = await page.locator('#projects h3').innerText()
      const links = await page.locator('#projects [aria-live] a').evaluateAll((as) => as.map((a) => a.href))
      const note = await page.locator('#projects [aria-live] p.text-muted').allInnerTexts()
      expect(links.length > 0 || note.some((t) => /private for now/.test(t)), name + ': no link and no note')
      seen.push(`${name} ${links.length ? links.length + ' link' : 'private'}`)
    }
    await settle(page, 1800)
    await page.locator('#projects .stage-frame').screenshot({ path: join(OUT, '1440-project-last.png') })
    return seen.join(', ')
  })
  await check('contact: links and footer art', async () => {
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await settle(page)
    const hrefs = await page.locator('#contact a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
    expect(hrefs.includes('mailto:vitermoldy@gmail.com'), 'no mail link')
    await page.screenshot({ path: join(OUT, '1440-contact.png') })
    return hrefs.length + ' links'
  })
  await check('nav: every link lands on its section', async () => {
    await page.evaluate(() => window.scrollTo(0, 0))
    for (const id of ['contributions', 'pixel-art', 'projects', 'contact']) {
      await page.locator(`header nav[aria-label="Sections"] a[href="#${id}"]`).click()
      await page.waitForTimeout(900)
      const top = await page.locator('#' + id).evaluate((el) => el.getBoundingClientRect().top)
      expect(Math.abs(top) < 140 || id === 'contact', `${id} top at ${top}`)
    }
  })
  await check('keyboard: Tab reaches the skip link first', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.keyboard.press('Tab')
    const t = await page.evaluate(() => document.activeElement?.textContent)
    expect(t === 'Skip to the profile', 'first Tab on ' + t)
  })
  await context.close()
}

// Phone
for (const width of [390, 320]) {
  const { context, page } = await open({ width, height: 844 })
  await check(`${width}: no sideways scroll`, async () => {
    await settle(page)
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(over <= 0, 'overflow ' + over + 'px')
    await page.screenshot({ path: join(OUT, `${width}-hero.png`), fullPage: false })
  })
  await check(`${width}: nothing wider than the screen`, async () => {
    const wide = await page.evaluate(() =>
      [...document.querySelectorAll('main *')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)
        })
        .map((el) => el.tagName + '.' + String(el.className).split(' ')[0])
        .slice(0, 5),
    )
    expect(wide.length === 0, wide.join(', '))
  })
  if (width === 390) {
    await check('390: menu opens, links land, Escape closes', async () => {
      const toggle = page.getByRole('button', { name: 'Menu' })
      await toggle.click()
      expect((await toggle.getAttribute('aria-expanded')) === 'true', 'not expanded')
      await page.screenshot({ path: join(OUT, '390-menu.png') })
      await page.keyboard.press('Escape')
      expect(await page.locator('#menu').isHidden(), 'menu still open after Escape')
      await page.getByRole('button', { name: 'Menu' }).click()
      await page.locator('#menu a[href="#projects"]').click()
      await page.waitForTimeout(900)
      expect(await page.locator('#menu').isHidden(), 'menu still open after a link')
    })
    for (const id of ['contributions', 'pixel-art', 'projects', 'contact']) {
      await check(`390: ${id} shot`, async () => {
        await page.locator('#' + id).scrollIntoViewIfNeeded()
        await settle(page, 2600)
        await page.locator('#' + id).screenshot({ path: join(OUT, `390-${id}.png`) })
      })
    }
    await check('390: tap targets at least 44px', async () => {
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('a[href], button')]
          .filter((el) => {
            const r = el.getBoundingClientRect()
            const inText = el.closest('p') && el.tagName === 'A'
            return r.width > 0 && r.height > 0 && !inText && (r.height < 43.5 || r.width < 24)
          })
          .map((el) => `${el.tagName} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`),
      )
      expect(small.length === 0, small.slice(0, 6).join('; '))
    })
  }
  await context.close()
}

// Reduced motion: everything rests, nothing stays hidden.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

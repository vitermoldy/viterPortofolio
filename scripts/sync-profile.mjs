// Pulls the GitHub profile this site draws in 3D and writes it into public/ as plain files.
//
//   node scripts/sync-profile.mjs                  profile, repositories, contributions and pixel art
//   node scripts/sync-profile.mjs --user someone   another account
//   node scripts/sync-profile.mjs --skip-pixel     data only (the pixel art is already in public/pixel)
//
// The contribution calendar is the public one the profile page shows (github.com/users/<name>/contributions),
// read year by year, so it needs no token. The account and its public repositories come from the REST API;
// GITHUB_TOKEN, when set (it is in GitHub Actions), only raises the rate limit.
// The pixel art is copied from the profile repository next to this one (../vitermoldy/assets/pixel) when it
// is there, and downloaded from that repository on GitHub when it is not.
// Standard library only. If GitHub cannot be read the script stops before writing, so the last good files stay.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCalendar } from './calendar.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i > 0 ? process.argv[i + 1] : undefined
}
const USER = arg('--user') ?? 'vitermoldy'
const SKIP_PIXEL = process.argv.includes('--skip-pixel')
const UA = 'viterPortofolio-sync'

const PIXEL = [
  'avatar.png',
  'avatar-sunset.png',
  'room.svg',
  'banner.svg',
  'character.svg',
  'footer.svg',
  'card-evit.svg',
  'card-convertion.svg',
  'card-mixer.svg',
  'card-netsim.svg',
  'card-nyxborne.svg',
  'card-agentic-factory.svg',
  'card-studycabin.svg',
  'card-songplay.svg',
  'card-pixelfolio.svg',
  'card-viygo.svg',
  'card-lanskara.svg',
  'card-cloudstead.svg',
]

async function get(url, { json = false, tries = 3 } = {}) {
  const headers = { 'User-Agent': UA }
  if (json) {
    headers.Accept = 'application/vnd.github+json'
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return json ? res.json() : res.text()
    } catch (err) {
      if (attempt >= tries) throw err
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

async function profile() {
  const u = await get(`https://api.github.com/users/${USER}`, { json: true })
  const repos = []
  for (let page = 1; page < 10; page++) {
    const batch = await get(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner&sort=pushed&page=${page}`, { json: true })
    repos.push(...batch)
    if (batch.length < 100) break
  }
  return {
    login: u.login,
    name: u.name,
    bio: u.bio,
    url: u.html_url,
    blog: u.blog || null,
    followers: u.followers,
    following: u.following,
    publicRepos: u.public_repos,
    createdAt: u.created_at,
    repos: repos
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        pushedAt: r.pushed_at,
      })),
  }
}

async function contributions(createdAt) {
  const today = new Date().toISOString().slice(0, 10)
  const first = Number(createdAt.slice(0, 4))
  const days = new Map()
  for (let year = Number(today.slice(0, 4)); year >= first; year--) {
    const html = await get(`https://github.com/users/${USER}/contributions?from=${year}-01-01&to=${year}-12-31`)
    const part = parseCalendar(html)
    if (!part.size) throw new Error(`No calendar found for ${USER} in ${year}: the page may have changed.`)
    for (const [date, cl] of part) if (date <= today && date >= createdAt.slice(0, 10)) days.set(date, cl)
  }
  const sorted = [...days.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([date, [count, level]]) => [date, count, level])
  return { today, days: sorted }
}

function pixel() {
  const out = join(root, 'public', 'pixel')
  mkdirSync(out, { recursive: true })
  const local = join(root, '..', 'vitermoldy', 'assets', 'pixel')
  return Promise.all(
    PIXEL.map(async (file) => {
      if (existsSync(join(local, file))) return copyFileSync(join(local, file), join(out, file))
      const res = await fetch(`https://raw.githubusercontent.com/${USER}/${USER}/main/assets/pixel/${file}`, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`HTTP ${res.status} for pixel/${file}`)
      writeFileSync(join(out, file), Buffer.from(await res.arrayBuffer()))
    }),
  ).then(() => (existsSync(local) ? 'copied from ../vitermoldy' : 'downloaded from GitHub'))
}

const p = await profile()
const c = await contributions(p.createdAt)
const fetchedAt = new Date().toISOString()
mkdirSync(join(root, 'public', 'data'), { recursive: true })
writeFileSync(join(root, 'public', 'data', 'profile.json'), JSON.stringify({ fetchedAt, ...p }, null, 1) + '\n')
writeFileSync(join(root, 'public', 'data', 'contributions.json'), JSON.stringify({ fetchedAt, login: p.login, today: c.today, days: c.days }) + '\n')
const total = c.days.reduce((s, d) => s + d[1], 0)
console.log(`${p.login}: ${p.repos.length} public repositories, ${c.days.length} days, ${total.toLocaleString('en-US')} contributions since ${p.createdAt.slice(0, 10)}`)
if (!SKIP_PIXEL) console.log(`pixel art: ${PIXEL.length} files ${await pixel()}`)

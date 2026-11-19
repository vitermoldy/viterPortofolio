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

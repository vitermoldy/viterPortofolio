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


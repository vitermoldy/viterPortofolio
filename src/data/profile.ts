import * as React from 'react'
import { asset } from '@/lib/utils'

// Written by scripts/sync-profile.mjs from GitHub itself; nothing here is typed in by hand.

export type Repo = {
  name: string
  description: string | null
  url: string
  homepage: string | null
  language: string | null
  stars: number
  forks: number
  pushedAt: string
}

export type Profile = {
  fetchedAt: string
  login: string
  name: string | null
  bio: string | null
  url: string
  blog: string | null
  followers: number
  following: number
  publicRepos: number
  createdAt: string
  repos: Repo[]
}

/** One row per day: date, count, and GitHub's own shade for it (0 to 4). */
export type DayRow = [date: string, count: number, level: number]

export type Contributions = {
  fetchedAt: string
  login: string
  today: string
  days: DayRow[]
}

export type ProfileData = { profile: Profile; contributions: Contributions }

export type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'ready'; data: ProfileData }

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(asset(path), { cache: 'no-cache' })
  if (!res.ok) throw new Error(`${path} answered ${res.status}`)
  return (await res.json()) as T
}

export function useProfileData(): LoadState {
  const [attempt, setAttempt] = React.useState(0)
  const [state, setState] = React.useState<LoadState>({ status: 'loading' })
  React.useEffect(() => {
    let stale = false
    setState({ status: 'loading' })
    Promise.all([getJson<Profile>('data/profile.json'), getJson<Contributions>('data/contributions.json')])
      .then(([profile, contributions]) => {
        if (!stale) setState({ status: 'ready', data: { profile, contributions } })
      })
      .catch((err: unknown) => {
        if (stale) return
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : String(err),
          retry: () => setAttempt((a) => a + 1),
        })
      })
    return () => {
      stale = true
    }
  }, [attempt])
  return state
}

/** Sum of the last 365 days up to `today`, the number GitHub prints above the graph. */
export function lastYearTotal(c: Contributions): number {
  const end = Date.parse(c.today + 'T00:00:00Z')
  const start = end - 364 * 86400000
  let total = 0
  for (const [date, count] of c.days) {
    const t = Date.parse(date + 'T00:00:00Z')

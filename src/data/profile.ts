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

import * as React from 'react'
import ContributionSkyline, { type ContributionDay } from '@/components/ui/contribution-skyline'
import { allTimeTotal, lastYearTotal, yearsOf, type LoadState } from '@/data/profile'
import { day, num, plural } from '@/lib/format'

// GitHub's own four greens, as the profile's Pac-Man graph recolours them into the Hutan palette.
const HUTAN = { light: ['#a9cf9a', '#2f8a55', '#1f6e44', '#0f3d2e'], dark: ['#174f35', '#1f6e44', '#2f8a55', '#52c879'] }

type Range = 'last' | number

export function Contributions({ state }: { state: LoadState }) {
  const [range, setRange] = React.useState<Range>('last')
  const c = state.status === 'ready' ? state.data.contributions : null

  const view = React.useMemo(() => {
    if (!c) return null
    const thisYear = Number(c.today.slice(0, 4))
    const pastYears = yearsOf(c).filter((y) => y < thisYear)
    const rows = range === 'last' ? c.days : c.days.filter(([d]) => d.startsWith(String(range)))
    const data: ContributionDay[] = rows.map(([date, count, level]) => ({ date, count, level }))
    const endDate = range === 'last' ? c.today : `${range}-12-31`
    const total = range === 'last' ? lastYearTotal(c) : rows.reduce((s, r) => s + r[1], 0)

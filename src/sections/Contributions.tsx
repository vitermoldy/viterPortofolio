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

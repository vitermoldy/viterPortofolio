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
    let busiest: [string, number] | null = null
    let quietest = Infinity
    for (const [d, n] of c.days) {
      if (n > 0 && n < quietest) quietest = n
      if (n > 0 && (!busiest || n > busiest[1])) busiest = [d, n]
    }
    return { pastYears, data, endDate, total, busiest, quietest: Number.isFinite(quietest) ? quietest : 0 }
  }, [c, range])

  return (
    <section id="contributions" aria-labelledby="contributions-title" className="border-t-2 border-forest py-20 md:py-28">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h2 id="contributions-title" className="h-pixel h-block text-[clamp(2rem,4.5vw,3.25rem)]">
              Every commit, standing up
            </h2>
            {c && view ? (
              <p className="mt-5 mb-0 max-w-[40rem] text-lg">
                {num(allTimeTotal(c))} contributions since {day(c.days[0][0])}. Each day is one block in GitHub&rsquo;s own
                shade for it, and its height follows a log scale, so a day of {plural(view.quietest, 'contribution')} still
                shows beside the busiest
                {view.busiest ? `, ${num(view.busiest[1])} on ${day(view.busiest[0])}` : ''}.
              </p>
            ) : (
              <p className="mt-5 mb-0 max-w-[40rem] text-lg">
                Each day of the contribution graph is one block in GitHub&rsquo;s own shade, and its height follows the
                count.
              </p>
            )}
          </div>
          {view && view.pastYears.length > 0 && (
            <div className="md:col-span-5 md:justify-self-end">
              <div className="seg" role="group" aria-label="Years shown">
                <button type="button" aria-pressed={range === 'last'} onClick={() => setRange('last')}>
                  Last 12 months
                </button>
                {view.pastYears.map((y) => (
                  <button key={y} type="button" aria-pressed={range === y} onClick={() => setRange(y)}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10">
          {state.status === 'loading' && (
            <div className="grid min-h-[380px] place-items-center border-2 border-moss" role="status">
              <p className="m-0 text-muted">Reading the contribution calendar</p>
            </div>
          )}

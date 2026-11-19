import { describe, expect, it } from 'vitest'
import { parseCalendar } from '../scripts/calendar.mjs'
import { allTimeTotal, lastYearTotal, yearsOf, type Contributions } from '../src/data/profile'
import { PROJECTS, publicLinks } from '../src/data/projects'

const page = `
<table><tbody><tr>
<td tabindex="0" data-ix="0" aria-selected="false" aria-describedby="contribution-graph-legend-level-0" style="width: 10px" data-date="2026-11-11" id="contribution-day-component-0-0" data-level="4" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>
<tool-tip id="tooltip-1" for="contribution-day-component-0-0" popover="manual" data-direction="n" data-type="label" data-view-component="true" class="sr-only position-absolute">5,246 contributions on November 11th.</tool-tip>
<td tabindex="-1" data-ix="1" data-date="2026-11-12" id="contribution-day-component-0-1" data-level="0" role="gridcell" class="ContributionCalendar-day"></td>
<tool-tip id="tooltip-2" for="contribution-day-component-0-1" class="sr-only">No contributions on November 12th.</tool-tip>
<td data-date="2026-11-13" id="contribution-day-component-0-2" data-level="1" class="ContributionCalendar-day"></td>
<tool-tip for="contribution-day-component-0-2" class="sr-only">1 contribution on November 13th.</tool-tip>
</tr></tbody></table>`

describe('parseCalendar', () => {
  it('reads count and GitHub level per day, with thousands separators', () => {
    const days = parseCalendar(page)
    expect([...days.entries()]).toEqual([
      ['2026-11-11', [5246, 4]],
      ['2026-11-12', [0, 0]],
      ['2026-11-13', [1, 1]],
    ])
  })
  it('returns nothing for a page without a calendar', () => {
    expect(parseCalendar('<html></html>').size).toBe(0)
  })
})

const c: Contributions = {
  fetchedAt: '2026-11-19T12:00:00Z',
  login: 'someone',
  today: '2026-11-19',
  days: [
    ['2025-08-31', 4, 1],
    ['2025-11-19', 10, 1],
    ['2025-11-20', 7, 1],
    ['2026-11-19', 2, 1],
  ],
}

describe('contribution totals', () => {
  it('counts the last 365 days like the profile graph', () => {
    // 2025-11-20 is exactly 364 days before 2026-11-19; 2025-11-19 falls outside.
    expect(lastYearTotal(c)).toBe(9)
  })
  it('sums every day', () => {
    expect(allTimeTotal(c)).toBe(23)

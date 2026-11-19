import { describe, expect, it } from 'vitest'
import { parseCalendar } from '../scripts/calendar.mjs'
import { allTimeTotal, lastYearTotal, yearsOf, type Contributions } from '../src/data/profile'
import { PROJECTS, publicLinks } from '../src/data/projects'

const page = `
<table><tbody><tr>
<td tabindex="0" data-ix="0" aria-selected="false" aria-describedby="contribution-graph-legend-level-0" style="width: 10px" data-date="2026-11-11" id="contribution-day-component-0-0" data-level="4" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>

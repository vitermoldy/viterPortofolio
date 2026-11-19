import { describe, expect, it } from 'vitest'
import { parseCalendar } from '../scripts/calendar.mjs'
import { allTimeTotal, lastYearTotal, yearsOf, type Contributions } from '../src/data/profile'
import { PROJECTS, publicLinks } from '../src/data/projects'

const page = `

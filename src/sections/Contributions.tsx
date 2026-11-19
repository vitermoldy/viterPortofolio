import * as React from 'react'
import ContributionSkyline, { type ContributionDay } from '@/components/ui/contribution-skyline'
import { allTimeTotal, lastYearTotal, yearsOf, type LoadState } from '@/data/profile'
import { day, num, plural } from '@/lib/format'

// GitHub's own four greens, as the profile's Pac-Man graph recolours them into the Hutan palette.

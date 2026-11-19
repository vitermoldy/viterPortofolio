"use client"

import * as React from "react"

/**
 * Contribution Skyline — a year of activity as a GitHub-style heat map that
 * folds up into an isometric skyline, and back down again.
 *
 * It is one scene, not two charts. Every day is a box on a grid; the 2D view
 * is that grid seen straight down, the 3D view is the same grid seen from the
 * corner. Switching views swings one camera between the two while each week's
 * bars rise (or settle) in a wave from the oldest week to the newest, so the
 * flat heat map visibly becomes the skyline — nothing is swapped or cut.
 *
 * Hover or tap a day for its count, arrow keys walk the grid, hover a legend
 * swatch to isolate that level, and in 3D drag to orbit (double-click resets).
 * Palette and theme changes blend rather than flip.
 *
 * Canvas + DOM, React is the only import. Pass `data` as `{ date, count }[]`;
 * without it a seeded, believable year is generated so the demo is never empty.
 */

// #region contributions
// Pure: dates, grid, stats, levels, camera and colour maths. Lifted out and run by the test.

/** `level` (0 to 4) is optional: when the data carries GitHub's own shades, they are used as given. */
export type ContributionDay = { date: string; count: number; level?: number }
export type Cell = { date: string; count: number; level: number; week: number; day: number }
export type Streak = { days: number; start: string | null; end: string | null }
export type ContributionStats = {
  total: number

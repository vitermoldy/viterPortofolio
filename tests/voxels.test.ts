import { describe, expect, it } from 'vitest'
import { visibleCount, voxelize, type PixelGrid } from '../src/components/voxel/pixels'
import { barHeight, buildGrid, computeStats } from '../src/components/ui/contribution-skyline'

const grid = (w: number, h: number, px: [number, number, number, number][]): PixelGrid => ({
  w,
  h,
  data: new Uint8ClampedArray(px.flat()),
})

describe('voxelize', () => {
  const g = grid(2, 2, [
    [0, 0, 0, 255],
    [255, 255, 255, 255],
    [255, 0, 0, 255],
    [10, 20, 30, 0],
  ])
  const v = voxelize(g, { relief: 0.5, base: 0.6 })

  it('makes one block per pixel, centred, y up', () => {
    expect(v.count).toBe(4)
    expect(Array.from(v.xy)).toEqual([-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5])
  })
  it('keeps the exact colour on each block', () => {
    expect(Array.from(v.col.slice(3, 6))).toEqual([1, 1, 1])
    expect(Array.from(v.col.slice(6, 9))).toEqual([1, 0, 0])
  })
  it('pushes brighter pixels further out', () => {
    const depth = (k: number) => v.dga[k * 3]
    expect(depth(0)).toBeCloseTo(0.6)
    expect(depth(1)).toBeCloseTo(0.6 + 0.5 * 2)
    expect(depth(1)).toBeGreaterThan(depth(2))
    expect(depth(2)).toBeGreaterThan(depth(0))
  })
  it('keeps transparent pixels as hidden slots so two pictures can morph', () => {
    expect(v.dga[3 * 3 + 2]).toBe(0)
    expect(visibleCount(v)).toBe(3)
  })
})

describe('skyline with GitHub levels and a log scale', () => {
  const end = Date.UTC(2026, 10, 19)
  it('uses the level GitHub gave a day', () => {
    const { cells } = buildGrid(
      [
        { date: '2026-11-18', count: 1730, level: 1 },
        { date: '2026-11-19', count: 2, level: 1 },
      ],
      end,
    )
    expect(cells.find((c) => c.date === '2026-11-18')!.level).toBe(1)
    expect(cells.find((c) => c.date === '2026-11-19')!.level).toBe(1)
  })

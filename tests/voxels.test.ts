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

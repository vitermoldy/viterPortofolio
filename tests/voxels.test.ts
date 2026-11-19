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

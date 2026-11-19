import * as React from 'react'
import { cn } from '@/lib/utils'
import { loadPixels, voxelize, type VoxelOptions, type Voxels } from './pixels'
import type { View, VoxelEngine } from './voxel-engine'

export type VoxelPicture = {
  /** Image file in public/, already resolved against the base path. */
  src: string
  /** Pixel-art size: the SVG's viewBox, or the PNG's cell count. */
  w: number
  h: number
  /** Read out for screen readers; the same words as the picture's alt text on the profile. */
  alt: string
}

type Status = 'loading' | 'ready' | 'flat' | 'error'

type Props = {
  picture: VoxelPicture
  options?: VoxelOptions

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
  /** Where a same-size switch starts its wave. */
  wave?: 'corner' | 'centre'
  /** Resting camera angle, in radians. */
  view?: View
  className?: string
  onVoxels?: (v: Voxels) => void
}

const reducedQuery = '(prefers-reduced-motion: reduce)'

/**
 * A pixel-art picture as a relief of blocks. The flat picture shows first (it is the loading state and
 * the fallback when WebGL is missing), then the blocks fly in over it once the stage is on screen.
 */
export function VoxelStage({ picture, options, wave = 'corner', view, className, onVoxels }: Props) {
  const boxRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const engineRef = React.useRef<VoxelEngine | null>(null)
  const [status, setStatus] = React.useState<Status>('loading')
  const [attempt, setAttempt] = React.useState(0)
  const [engineReady, setEngineReady] = React.useState(false)
  const onVoxelsRef = React.useRef(onVoxels)
  onVoxelsRef.current = onVoxels
  const viewRef = React.useRef(view)

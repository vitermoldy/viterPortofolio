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
  const relief = options?.relief
  const base = options?.base

  // The engine lives as long as the stage. three.js is loaded with it, so the first screen paints first.
  React.useEffect(() => {
    const canvas = canvasRef.current
    const box = boxRef.current
    if (!canvas || !box) return
    let disposed = false
    let ro: ResizeObserver | null = null
    let io: IntersectionObserver | null = null
    const mq = window.matchMedia(reducedQuery)
    const onReduce = () => engineRef.current?.setReducedMotion(mq.matches)

    import('./voxel-engine')
      .then(({ VoxelEngine }) => {
        if (disposed) return
        let engine: VoxelEngine
        try {
          engine = new VoxelEngine(canvas, { reducedMotion: mq.matches, view: viewRef.current })
        } catch {
          setStatus('flat')
          return
        }
        engineRef.current = engine
        const fit = () => engine.resize(Math.round(box.clientWidth), Math.round(box.clientHeight))
        fit()
        ro = new ResizeObserver(fit)
        ro.observe(box)
        io = new IntersectionObserver(
          (entries) => {
            const on = entries.some((e) => e.isIntersecting)
            engine.setVisible(on)
            if (on) engine.play()
          },
          { threshold: 0.25 },
        )
        io.observe(box)
        mq.addEventListener('change', onReduce)

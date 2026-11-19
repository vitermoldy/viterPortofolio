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
        setEngineReady(true)
      })
      .catch(() => {
        if (!disposed) setStatus('flat')
      })

    return () => {
      disposed = true
      ro?.disconnect()
      io?.disconnect()
      mq.removeEventListener('change', onReduce)
      engineRef.current?.dispose()
      engineRef.current = null
      setEngineReady(false)
    }
  }, [])

  // Every new picture is read pixel by pixel and handed to the engine.
  React.useEffect(() => {
    if (!engineReady) return
    let stale = false
    loadPixels(picture.src, picture.w, picture.h)
      .then((grid) => {
        if (stale) return
        const v = voxelize(grid, { relief, base })
        const engine = engineRef.current
        if (!engine) return
        engine.setVoxels(v, wave)
        const box = boxRef.current
        if (box) {
          const r = box.getBoundingClientRect()
          if (r.bottom > 0 && r.top < window.innerHeight) engine.play()
        }
        onVoxelsRef.current?.(v)
        setStatus('ready')
      })
      .catch(() => {
        if (!stale) setStatus('error')
      })
    return () => {
      stale = true
    }
  }, [engineReady, picture.src, picture.w, picture.h, relief, base, wave, attempt])

  const showCanvas = status === 'ready'

  return (
    <div
      ref={boxRef}
      className={cn('voxel-stage relative w-full overflow-hidden', className)}
      style={{ aspectRatio: `${picture.w} / ${picture.h}` }}
    >
      <img
        src={picture.src}
        width={picture.w * 4}
        height={picture.h * 4}
        alt={status === 'ready' ? '' : picture.alt}
        aria-hidden={status === 'ready' ? true : undefined}
        decoding="async"
        className={cn(
          'pixelated absolute inset-0 h-full w-full object-contain transition-opacity duration-700 motion-reduce:transition-none',
          showCanvas ? 'opacity-0' : status === 'loading' ? 'opacity-60' : 'opacity-100',
        )}
      />
      <canvas
        ref={canvasRef}
        tabIndex={showCanvas ? 0 : -1}
        role="img"
        aria-label={picture.alt + ' Built from blocks: drag or use the arrow keys to turn it, double-click or Home to face it again.'}
        className={cn(
          'absolute inset-0 block h-full w-full cursor-grab touch-pan-y transition-opacity duration-500 motion-reduce:transition-none',
          showCanvas ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      {status === 'loading' && (
        <p className="absolute bottom-3 left-3 m-0 bg-ink/85 px-2 py-1 text-xs text-muted" role="status">
          Reading the pixels
        </p>
      )}
      {status === 'error' && (
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-3 bg-ink/90 p-3 text-sm" role="alert">
          <span>The blocks could not be built from this picture.</span>
          <button type="button" className="btn btn-quiet" onClick={() => setAttempt((a) => a + 1)}>
            Try the picture again
          </button>
        </div>
      )}
      {status === 'flat' && (
        <p className="absolute bottom-3 left-3 m-0 bg-ink/85 px-2 py-1 text-xs text-muted">
          This browser has no WebGL, so the picture stays flat.
        </p>
      )}
    </div>
  )

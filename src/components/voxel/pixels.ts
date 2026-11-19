// Pixel art in, voxels out. The maths is pure so the tests can run it without a browser;
// only loadPixels touches the DOM.

export type PixelGrid = { w: number; h: number; data: Uint8ClampedArray | Uint8Array }

/**
 * One block per pixel. `xy` is the block's centre on the wall (y up, the picture centred on 0),
 * `col` its sRGB colour (0 to 1), `dga` its depth, glow and alpha.
 */
export type Voxels = {
  w: number
  h: number
  count: number
  xy: Float32Array
  col: Float32Array
  dga: Float32Array
}

export type VoxelOptions = {
  /** Deepest block, as a share of the picture's longer side. */
  relief?: number
  /** Depth every visible block keeps, in cells. */
  base?: number
}

export const luma = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * Every pixel becomes a block whose depth follows its brightness, like a pin-art toy pressed from
 * behind: lit screens, the moon and the neon stand forward, the night sky stays at the wall.
 * Transparent pixels keep their slot (alpha 0) so two pictures of one size can morph block by block.
 */
export function voxelize(grid: PixelGrid, opts: VoxelOptions = {}): Voxels {
  const { w, h, data } = grid
  const relief = (opts.relief ?? 0.07) * Math.max(w, h)
  const base = opts.base ?? 0.6
  const count = w * h
  const xy = new Float32Array(count * 2)
  const col = new Float32Array(count * 3)
  const dga = new Float32Array(count * 3)
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i
      const r = data[k * 4]
      const g = data[k * 4 + 1]
      const b = data[k * 4 + 2]
      const a = data[k * 4 + 3]
      xy[k * 2] = i - w / 2 + 0.5
      xy[k * 2 + 1] = h / 2 - j - 0.5
      col[k * 3] = r / 255
      col[k * 3 + 1] = g / 255
      col[k * 3 + 2] = b / 255
      const l = luma(r, g, b)
      dga[k * 3] = base + relief * Math.pow(l, 1.15)
      dga[k * 3 + 1] = smooth(0.62, 0.95, Math.max(r, g, b) / 255) * smooth(0.45, 0.8, l)
      dga[k * 3 + 2] = a >= 128 ? 1 : 0
    }
  }

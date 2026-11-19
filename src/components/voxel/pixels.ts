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

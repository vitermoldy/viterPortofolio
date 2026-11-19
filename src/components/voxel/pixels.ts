// Pixel art in, voxels out. The maths is pure so the tests can run it without a browser;
// only loadPixels touches the DOM.

export type PixelGrid = { w: number; h: number; data: Uint8ClampedArray | Uint8Array }

/**

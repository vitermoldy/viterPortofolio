import * as THREE from 'three'
import type { Voxels } from './pixels'

// One instanced box per pixel, drawn by a small shader. Two states live on the GPU at once (A and B),

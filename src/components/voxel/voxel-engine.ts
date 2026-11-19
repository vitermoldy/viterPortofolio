import * as THREE from 'three'
import type { Voxels } from './pixels'

// One instanced box per pixel, drawn by a small shader. Two states live on the GPU at once (A and B),
// so switching between two pictures of the same size is a wave that recolours and re-presses every
// block; a picture of another size flies in instead. The front face of every block keeps the pixel's
// exact colour, so seen head-on the relief is the original pixel art.

const VERT = /* glsl */ `
attribute vec2 aXY;
attribute vec3 aColA;
attribute vec3 aColB;
attribute vec3 aDgaA;
attribute vec3 aDgaB;
attribute vec4 aRand;
uniform float uAssemble;
uniform float uMorph;
uniform float uSpan;
uniform vec2 uWaveFrom;
uniform vec3 uPointer;
uniform float uPointerR;
uniform float uPush;
uniform float uBump;
varying vec3 vColor;
varying vec3 vNormal;
varying float vGlow;

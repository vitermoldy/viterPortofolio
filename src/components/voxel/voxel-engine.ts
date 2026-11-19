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
varying float vZ;

float easeOut(float t) { return 1.0 - pow(1.0 - t, 3.0); }
float easeInOut(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }

void main() {
  float d = clamp(length(aXY - uWaveFrom) / uSpan, 0.0, 1.0);
  float m = easeInOut(clamp(uMorph * 1.6 - d * 0.6, 0.0, 1.0));
  vec3 col = mix(aColA, aColB, m);
  vec3 dga = mix(aDgaA, aDgaB, m);
  float alpha = step(0.5, dga.z);

  vec2 dp = aXY - uPointer.xy;
  float depth = dga.x + sin(m * 3.14159265) * uBump + uPointer.z * uPush * exp(-dot(dp, dp) / (uPointerR * uPointerR));

  float a = easeOut(clamp((uAssemble - aRand.x * 0.55) / 0.45, 0.0, 1.0));
  vec3 local = vec3(position.xy * 0.94 * alpha, (position.z + 0.5) * depth * alpha);
  float ang = (1.0 - a) * (aRand.y * 6.0 - 3.0);
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  local.xz = R * local.xz;
  vec3 n = normal;
  n.xz = R * n.xz;

  vec3 from = vec3(aXY * 1.35 + (aRand.yz - 0.5) * uSpan * 0.7, uSpan * (0.45 + aRand.w * 0.6));
  vec3 world = mix(from, vec3(aXY, 0.0), a) + local;

  vColor = col;
  vNormal = n;
  vGlow = dga.y;
  vZ = position.z + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`

const FRAG = /* glsl */ `
varying vec3 vColor;
varying vec3 vNormal;
varying float vGlow;
varying float vZ;

void main() {
  vec3 n = normalize(vNormal);
  float shade;
  if (n.z > 0.5) {
    shade = 1.0;
  } else if (n.z < -0.5) {
    shade = 0.3;
  } else {
    shade = n.y > 0.5 ? 0.84 : n.y < -0.5 ? 0.44 : n.x < -0.5 ? 0.66 : 0.54;
    shade *= mix(0.5, 1.0, vZ);
    shade = mix(shade, 1.0, vGlow * 0.85);
  }
  gl_FragColor = vec4(vColor * shade, 1.0);
}
`

/** The resting view: a little from the right and above, so the relief reads as depth before anyone drags. */
export type View = { yaw: number; pitch: number }
const DEFAULT_VIEW: View = { yaw: -0.34, pitch: 0.2 }
const YAW_LIMIT: [number, number] = [-1.05, 1.05]
const PITCH_LIMIT: [number, number] = [-0.45, 0.8]

export type EngineOptions = {
  reducedMotion: boolean
  /** Seconds the first picture takes to fly in. */
  assembleSeconds?: number
  /** Seconds a same-size switch takes. */
  morphSeconds?: number
  view?: View
}

export class VoxelEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(32, 1, 0.5, 5000)
  private material: THREE.ShaderMaterial
  private mesh: THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial> | null = null
  private box = new THREE.BoxGeometry(1, 1, 1)
  private current: Voxels | null = null
  private raycaster = new THREE.Raycaster()
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  private hitPoint = new THREE.Vector3()
  private ndc = new THREE.Vector2()
  private corners = Array.from({ length: 8 }, () => new THREE.Vector3())
  private probe = new THREE.Vector3()
  private target = new THREE.Vector3()
  private depthMax = 1
  private base: View

  private reduced: boolean
  private assembleSeconds: number
  private morphSeconds: number
  private raf = 0
  private last = 0
  private visible = true
  private assemble = 1
  private assembling = false
  private morph = 1
  private yaw: number
  private pitch: number
  private yawGoal: number
  private pitchGoal: number
  private push = 0
  private pushGoal = 0
  private pushDecay = false
  private drag: { id: number; x: number; y: number; yaw: number; pitch: number; moved: boolean; mouse: boolean } | null = null
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, opts: EngineOptions) {
    this.canvas = canvas
    this.reduced = opts.reducedMotion
    this.assembleSeconds = opts.assembleSeconds ?? 2.4
    this.morphSeconds = opts.morphSeconds ?? 1.3
    this.base = opts.view ?? DEFAULT_VIEW
    this.yaw = this.yawGoal = this.base.yaw
    this.pitch = this.pitchGoal = this.base.pitch
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    this.renderer.setClearColor(0x000000, 0)
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uAssemble: { value: 1 },
        uMorph: { value: 1 },
        uSpan: { value: 100 },
        uWaveFrom: { value: new THREE.Vector2() },
        uPointer: { value: new THREE.Vector3(0, 0, 0) },
        uPointerR: { value: 4 },
        uPush: { value: 4 },
        uBump: { value: 3 },
      },
    })
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onCancel)
    canvas.addEventListener('pointerleave', this.onLeave)
    canvas.addEventListener('dblclick', this.reset)
    canvas.addEventListener('keydown', this.onKey)
  }

  get isEmpty() {
    return this.current === null
  }

  setReducedMotion(v: boolean) {
    this.reduced = v
    this.kick()
  }

  /** Shows a picture: a same-size picture morphs in a wave, anything else flies in block by block. */
  setVoxels(v: Voxels, wave: 'corner' | 'centre' = 'corner') {
    const same = this.current && this.mesh && this.current.w === v.w && this.current.h === v.h
    if (same && this.mesh) {
      const g = this.mesh.geometry
      const prev = this.current!
      ;(g.getAttribute('aColA') as THREE.InstancedBufferAttribute).copyArray(prev.col).needsUpdate = true
      ;(g.getAttribute('aDgaA') as THREE.InstancedBufferAttribute).copyArray(prev.dga).needsUpdate = true
      ;(g.getAttribute('aColB') as THREE.InstancedBufferAttribute).copyArray(v.col).needsUpdate = true
      ;(g.getAttribute('aDgaB') as THREE.InstancedBufferAttribute).copyArray(v.dga).needsUpdate = true
      const u = this.material.uniforms
      u.uWaveFrom.value.set(wave === 'corner' ? -v.w / 2 : 0, wave === 'corner' ? v.h / 2 : 0)
      u.uSpan.value = wave === 'corner' ? Math.hypot(v.w, v.h) : Math.hypot(v.w, v.h) / 2
      this.morph = this.reduced ? 1 : 0
      this.current = v
      this.measure(v)
      this.kick()
      return
    }
    this.build(v)
  }

  /** Starts the fly-in. Called once the stage scrolls into view, so the arrival is seen. */
  play() {
    if (!this.mesh || !this.assembling) return
    if (this.reduced) {
      this.assemble = 1
      this.assembling = false
    }
    this.kick()
  }

  setVisible(v: boolean) {
    this.visible = v
    if (v) this.kick()
  }

  resize(w: number, h: number) {
    if (w < 2 || h < 2) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.render()
  }

  reset = () => {
    this.yawGoal = this.base.yaw
    this.pitchGoal = this.base.pitch
    this.kick()
  }

  /** Turns the relief by a step, for the keyboard. */
  turn(dYaw: number, dPitch: number) {
    this.yawGoal = clamp(this.yawGoal + dYaw, YAW_LIMIT)
    this.pitchGoal = clamp(this.pitchGoal + dPitch, PITCH_LIMIT)
    this.kick()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    const c = this.canvas
    c.removeEventListener('pointerdown', this.onDown)
    c.removeEventListener('pointermove', this.onMove)
    c.removeEventListener('pointerup', this.onUp)
    c.removeEventListener('pointercancel', this.onCancel)
    c.removeEventListener('pointerleave', this.onLeave)
    c.removeEventListener('dblclick', this.reset)
    c.removeEventListener('keydown', this.onKey)
    this.mesh?.geometry.dispose()
    this.box.dispose()
    this.material.dispose()
    this.renderer.dispose()
  }

  private build(v: Voxels) {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
    }
    const g = new THREE.InstancedBufferGeometry()
    g.index = this.box.index
    g.setAttribute('position', this.box.getAttribute('position'))
    g.setAttribute('normal', this.box.getAttribute('normal'))
    const rand = new Float32Array(v.count * 4)
    for (let k = 0; k < rand.length; k++) rand[k] = Math.random()
    // The fly-in sweeps roughly top-left to bottom-right, with some scatter so it never looks mechanical.
    for (let k = 0; k < v.count; k++) {
      const x = (v.xy[k * 2] + v.w / 2) / v.w
      const y = (v.h / 2 - v.xy[k * 2 + 1]) / v.h
      rand[k * 4] = Math.min(1, (x * 0.55 + y * 0.45) * 0.7 + rand[k * 4] * 0.3)
    }
    g.setAttribute('aXY', new THREE.InstancedBufferAttribute(v.xy, 2))
    g.setAttribute('aColA', new THREE.InstancedBufferAttribute(v.col.slice(), 3))
    g.setAttribute('aColB', new THREE.InstancedBufferAttribute(v.col.slice(), 3))
    g.setAttribute('aDgaA', new THREE.InstancedBufferAttribute(v.dga.slice(), 3))
    g.setAttribute('aDgaB', new THREE.InstancedBufferAttribute(v.dga.slice(), 3))
    g.setAttribute('aRand', new THREE.InstancedBufferAttribute(rand, 4))
    g.instanceCount = v.count
    const span = Math.max(v.w, v.h)
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, span * 0.2), span * 1.6)
    this.mesh = new THREE.Mesh(g, this.material)
    this.mesh.frustumCulled = false
    this.scene.add(this.mesh)

    const u = this.material.uniforms
    u.uSpan.value = Math.hypot(v.w, v.h)
    u.uPointerR.value = span * 0.055
    u.uPush.value = span * 0.06
    u.uBump.value = span * 0.035
    this.current = v
    this.measure(v)
    this.morph = 1
    this.assemble = this.reduced ? 1 : 0
    this.assembling = !this.reduced
    this.render()
    this.kick()
  }

  private measure(v: Voxels) {
    let deepest = 0
    for (let k = 0; k < v.count; k++) if (v.dga[k * 3 + 2] > 0.5 && v.dga[k * 3] > deepest) deepest = v.dga[k * 3]
    this.depthMax = deepest
    const x = v.w / 2
    const y = v.h / 2
    let i = 0
    for (const sx of [-x, x]) for (const sy of [-y, y]) for (const sz of [0, deepest]) this.corners[i++].set(sx, sy, sz)
  }

  /**
   * Puts the camera on its orbit at the nearest distance where the whole relief, depth included, still
   * fits the frame. Turned pictures pull the camera back instead of losing an edge.
   */
  private place() {
    const v = this.current
    if (!v) return
    this.target.set(0, 0, this.depthMax * 0.5)
    const dx = Math.sin(this.yaw) * Math.cos(this.pitch)
    const dy = Math.sin(this.pitch)
    const dz = Math.cos(this.yaw) * Math.cos(this.pitch)
    const t = Math.tan((this.camera.fov * Math.PI) / 360)
    let hi = (Math.max(v.h, v.w / this.camera.aspect) / t) * 1.5 + this.depthMax * 2
    let lo = (Math.min(v.h, v.w / this.camera.aspect) / 2 / t) * 0.8
    const limit = 0.92
    const fits = (d: number) => {
      this.camera.position.set(this.target.x + dx * d, this.target.y + dy * d, this.target.z + dz * d)
      this.camera.lookAt(this.target)
      this.camera.updateMatrixWorld()
      for (const c of this.corners) {
        this.probe.copy(c).project(this.camera)
        if (this.probe.z > 1 || Math.abs(this.probe.x) > limit || Math.abs(this.probe.y) > limit) return false
      }
      return true
    }
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2
      if (fits(mid)) hi = mid
      else lo = mid
    }
    fits(hi)
  }

  private render() {
    if (!this.current) return
    const u = this.material.uniforms
    u.uAssemble.value = this.assemble
    u.uMorph.value = this.morph
    u.uPointer.value.z = this.push
    this.place()
    this.renderer.render(this.scene, this.camera)
  }

  private kick() {
    if (this.raf || !this.visible) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  private tick = (now: number) => {
    this.raf = 0
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000))
    this.last = now
    let moving = false

    if (this.assembling) {
      this.assemble = Math.min(1, this.assemble + dt / this.assembleSeconds)
      if (this.assemble >= 1) this.assembling = false
      moving = true
    }
    if (this.morph < 1) {
      this.morph = this.reduced ? 1 : Math.min(1, this.morph + dt / this.morphSeconds)
      moving = true
    }
    const k = this.reduced ? 1 : 1 - Math.exp(-dt * 9)
    this.yaw += (this.yawGoal - this.yaw) * k
    this.pitch += (this.pitchGoal - this.pitch) * k
    if (Math.abs(this.yawGoal - this.yaw) > 1e-4 || Math.abs(this.pitchGoal - this.pitch) > 1e-4) moving = true
    else {
      this.yaw = this.yawGoal
      this.pitch = this.pitchGoal
    }
    if (this.pushDecay && this.pushGoal > 0) this.pushGoal = Math.max(0, this.pushGoal - dt * 1.4)
    const kp = 1 - Math.exp(-dt * 10)
    this.push += (this.pushGoal - this.push) * kp
    if (Math.abs(this.pushGoal - this.push) > 1e-3 || (this.pushDecay && this.pushGoal > 0)) moving = true
    else this.push = this.pushGoal


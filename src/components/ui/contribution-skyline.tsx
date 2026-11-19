"use client"

import * as React from "react"

/**
 * Contribution Skyline — a year of activity as a GitHub-style heat map that
 * folds up into an isometric skyline, and back down again.
 *
 * It is one scene, not two charts. Every day is a box on a grid; the 2D view
 * is that grid seen straight down, the 3D view is the same grid seen from the
 * corner. Switching views swings one camera between the two while each week's
 * bars rise (or settle) in a wave from the oldest week to the newest, so the
 * flat heat map visibly becomes the skyline — nothing is swapped or cut.
 *
 * Hover or tap a day for its count, arrow keys walk the grid, hover a legend
 * swatch to isolate that level, and in 3D drag to orbit (double-click resets).
 * Palette and theme changes blend rather than flip.
 *
 * Canvas + DOM, React is the only import. Pass `data` as `{ date, count }[]`;
 * without it a seeded, believable year is generated so the demo is never empty.
 */

// #region contributions
// Pure: dates, grid, stats, levels, camera and colour maths. Lifted out and run by the test.

/** `level` (0 to 4) is optional: when the data carries GitHub's own shades, they are used as given. */
export type ContributionDay = { date: string; count: number; level?: number }
export type Cell = { date: string; count: number; level: number; week: number; day: number }
export type Streak = { days: number; start: string | null; end: string | null }
export type ContributionStats = {
  total: number
  first: string | null
  last: string | null
  busiest: { count: number; date: string | null }
  longest: Streak
  current: Streak
}
export type RGB = [number, number, number]

export const DAY_MS = 86400000

export const clamp01 = (v: number): number => (v > 0 ? (v < 1 ? v : 1) : 0)
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
export const easeInOutCubic = (x: number): number => {
  const t = clamp01(x)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - clamp01(x), 3)
export const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** UTC midnight → "YYYY-MM-DD". */
export const toKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

/**
 * Any date-ish value → UTC midnight of its calendar day. "YYYY-MM-DD" strings
 * are read literally (no timezone drift), Date objects by their local day,
 * numbers as UTC timestamps.
 */
export const dayMs = (v: string | number | Date): number => {
  if (typeof v === "number") return Math.floor(v / DAY_MS) * DAY_MS
  if (typeof v === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
    if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3])
    v = new Date(v)
  }
  return Date.UTC(v.getFullYear(), v.getMonth(), v.getDate())
}

/** mulberry32 — small, fast, deterministic. */
export const rng = (seed: number) => {
  let a = seed >>> 0
  return (): number => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A believable year for demos: quiet weekends, a few busy seasons, a mood that
 * drifts week to week, and the odd enormous day.
 */
export const generateContributions = (endMs: number, seed = 7, days = 371): ContributionDay[] => {
  const r = rng(seed)
  const bursts = Array.from({ length: 4 }, () => ({ at: r(), width: 0.035 + r() * 0.07, gain: 0.6 + r() * 1.1 }))
  const out: ContributionDay[] = []
  let mood = 0.5
  for (let i = 0; i < days; i++) {
    const ms = endMs - (days - 1 - i) * DAY_MS
    const x = i / Math.max(1, days - 1)
    const dow = new Date(ms).getUTCDay()
    const weekend = dow === 0 || dow === 6
    let heat = 0.2
    for (const b of bursts) heat += b.gain * Math.exp(-((x - b.at) ** 2) / (2 * b.width ** 2))
    mood = mood * 0.85 + r() * 0.15
    heat *= 0.55 + mood * 0.9
    const pActive = Math.min(0.94, (weekend ? 0.22 : 0.5) + heat * 0.4)
    let count = 0
    if (r() < pActive) count = 1 + Math.floor(-Math.log(1 - r()) * (1.2 + heat * 7) * (weekend ? 0.5 : 1))
    if (r() < 0.01) count += 18 + Math.floor(r() * 24)
    out.push({ date: toKey(ms), count })
  }
  return out
}

/**
 * The grid: columns are weeks, rows are weekdays (row 0 = `weekStart`). It
 * ends on `endMs` and starts on the week containing the day one year earlier.
 * Levels 1–4 split the non-zero days by their share of a busy day — the 95th
 * percentile, so one freak day can't wash every other day out to level 1.
 */
export const buildGrid = (data: ContributionDay[], endMs: number, weekStart = 0) => {
  const counts = new Map<string, number>()
  const given = new Map<string, number>()
  for (const d of data) {
    if (!d || typeof d.date !== "string") continue
    const ms = dayMs(d.date)
    const c = Number(d.count)
    if (!Number.isFinite(ms) || !(c > 0) || !Number.isFinite(c)) continue
    const k = toKey(ms)
    counts.set(k, (counts.get(k) ?? 0) + c)
    const l = Number(d.level)
    if (Number.isFinite(l) && l > 0) given.set(k, Math.max(given.get(k) ?? 0, Math.min(4, Math.round(l))))
  }
  let start = endMs - 364 * DAY_MS
  start -= ((new Date(start).getUTCDay() - weekStart + 7) % 7) * DAY_MS
  const cells: Cell[] = []
  for (let ms = start, i = 0; ms <= endMs; ms += DAY_MS, i++) {
    const date = toKey(ms)
    cells.push({ date, count: counts.get(date) ?? 0, level: 0, week: Math.floor(i / 7), day: i % 7 })
  }
  const nz = cells.map((c) => c.count).filter((c) => c > 0).sort((a, b) => a - b)
  const busy = nz.length ? nz[Math.floor(0.95 * (nz.length - 1))] : 0
  for (const c of cells) c.level = c.count > 0 && given.has(c.date) ? given.get(c.date)! : levelOf(c.count, busy)
  return { cells, weeks: cells.length ? cells[cells.length - 1].week + 1 : 0, max: nz.length ? nz[nz.length - 1] : 0 }
}

/** 0 for an empty day, else 1–4 by quarters of `busy`. Anything at or past `busy` is 4. */
export const levelOf = (count: number, busy: number): number =>
  count <= 0 ? 0 : busy <= 0 ? 4 : 1 + Math.min(3, Math.floor((count / busy) * 4))

/** Total, busiest day, longest run, and the run that reaches today (or yesterday — today isn't over). */
export const computeStats = (cells: Cell[]): ContributionStats => {
  let total = 0
  let best = 0
  let bestDate: string | null = null
  let run = 0
  let runStart: string | null = null
  let longest: Streak = { days: 0, start: null, end: null }
  for (const c of cells) {
    total += c.count
    if (c.count > best) {
      best = c.count
      bestDate = c.date
    }
    if (c.count > 0) {
      if (run === 0) runStart = c.date
      run++
      if (run > longest.days) longest = { days: run, start: runStart, end: c.date }
    } else run = 0
  }
  let j = cells.length - 1
  if (j >= 0 && cells[j].count === 0) j--
  const endAt = j
  while (j >= 0 && cells[j].count > 0) j--
  const days = endAt - j
  const current: Streak = days > 0 ? { days, start: cells[j + 1].date, end: cells[endAt].date } : { days: 0, start: null, end: null }
  return {
    total,
    first: cells.length ? cells[0].date : null,
    last: cells.length ? cells[cells.length - 1].date : null,
    busiest: { count: best, date: bestDate },
    longest,
    current,
  }
}

/** A label on each week whose first day starts a new month; a cramped first label is dropped. */
export const monthLabels = (cells: Cell[], weeks: number, locale = "en-US") => {
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" })
  const out: { week: number; label: string }[] = []
  let prev = -1
  for (let w = 0; w < weeks; w++) {
    const c = cells[w * 7]
    if (!c) break
    const m = +c.date.slice(5, 7)
    if (m !== prev) out.push({ week: w, label: fmt.format(dayMs(c.date)) })
    prev = m
  }
  if (out.length > 1 && out[1].week - out[0].week < 3) out.shift()
  return out
}

export type HeightCurve = "power" | "log"

/**
 * Box height in grid units. Empty days are thin slabs; the busiest day is ~7.6 cells tall.
 * "log" keeps a quiet day visible beside a day thousands of times busier.
 */
export const barHeight = (count: number, max: number, scale = 1, curve: HeightCurve = "power"): number => {
  if (!(count > 0 && max > 0)) return 0.2
  const share = curve === "log" ? Math.log1p(count) / Math.log1p(max) : Math.pow(count / max, 0.85)
  return 0.4 + share * 7.2 * scale
}

/** Share of the morph each bar spends waiting — the wave sweeps oldest week → newest. */
export const WAVE = 0.42

/** 0 → 1 as a bar rises during the morph. Every bar is flat at t=0 and fully up at t=1. */
export const riseAt = (t: number, week: number, weeks: number, day: number): number => {
  const d = (weeks > 1 ? week / (weeks - 1) : 0) * 0.36 + (day / 6) * 0.06
  return easeOutCubic((t - d) / (1 - WAVE))
}

export const YAW_3D = Math.PI / 4
export const ELEV_3D = (34 * Math.PI) / 180
export const YAW_RANGE: [number, number] = [(8 * Math.PI) / 180, (82 * Math.PI) / 180]
export const ELEV_RANGE: [number, number] = [(18 * Math.PI) / 180, (62 * Math.PI) / 180]

export type Cam = { cs: number; sn: number; se: number; ce: number }

/**
 * e=0 looks straight down (yaw 0, elevation 90°): x across, y down, height
 * invisible — a plain heat map. e=1 is the isometric corner view. Orbit
 * offsets only apply in proportion to e, so the flat view never tilts.
 */
export const camera = (e: number, dYaw = 0, dElev = 0): Cam => {
  const yaw = Math.min(YAW_RANGE[1], Math.max(0, lerp(0, YAW_3D + dYaw, e)))
  const elev = lerp(Math.PI / 2, Math.min(ELEV_RANGE[1], Math.max(ELEV_RANGE[0], ELEV_3D + dElev)), e)
  return { cs: Math.cos(yaw), sn: Math.sin(yaw), se: Math.sin(elev), ce: Math.cos(elev) }
}

/** World (x = week, y = weekday, z = up) → screen, before scale/offset. */
export const project = (c: Cam, x: number, y: number, z: number): [number, number] => [
  x * c.cs - y * c.sn,
  (x * c.sn + y * c.cs) * c.se - z * c.ce,
]

/** Painter's depth for yaw in [0°, 90°]: larger is nearer the viewer, so draw ascending. */
export const depthOf = (c: Cam, x: number, y: number): number => x * c.sn + y * c.cs

export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
export const luminance = (c: RGB): number => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255

export type PaletteName = "github" | "halloween" | "ocean" | "ember" | "grape" | "mono"
export type PaletteInput = PaletteName | string[] | { light: string[]; dark: string[] }

/** Four colours per theme, lightest activity → heaviest. */
export const PALETTES: Record<PaletteName, { light: string[]; dark: string[] }> = {
  github: { light: ["#c6e48b", "#7bc96f", "#239a3b", "#196127"], dark: ["#0e4429", "#006d32", "#26a641", "#39d353"] },
  halloween: { light: ["#ffee4a", "#ffc501", "#fe9600", "#b33c00"], dark: ["#631c03", "#bd561d", "#fa7a18", "#fddf68"] },
  ocean: { light: ["#b8e3f5", "#6ec3eb", "#2a8fd1", "#0b4f8a"], dark: ["#0c2d4a", "#12508a", "#2a88d8", "#7cc7ff"] },
  ember: { light: ["#fde2c4", "#fbad6e", "#f06b3a", "#b3261e"], dark: ["#4a1a10", "#8f2f16", "#e0572a", "#ffa46b"] },
  grape: { light: ["#e4d4fb", "#b794f4", "#805ad5", "#44337a"], dark: ["#2d1f4f", "#553c9a", "#8b5cf6", "#c4b5fd"] },
  mono: { light: ["#d4d4d4", "#a3a3a3", "#525252", "#171717"], dark: ["#333333", "#5c5c5c", "#a3a3a3", "#fafafa"] },
}

export const resolvePalette = (p: PaletteInput | undefined, dark: boolean): string[] => {
  const pick = Array.isArray(p) ? p : typeof p === "object" && p ? (dark ? p.dark : p.light) : PALETTES[(p as PaletteName) ?? "github"] ? PALETTES[p as PaletteName][dark ? "dark" : "light"] : PALETTES.github[dark ? "dark" : "light"]
  const base = PALETTES.github[dark ? "dark" : "light"]
  return [0, 1, 2, 3].map((i) => pick[i] ?? pick[pick.length - 1] ?? base[i])
}
// #endregion

type View = "2d" | "3d"

export interface ContributionSkylineProps {
  /** One entry per day, `YYYY-MM-DD`. Repeated dates add up. Omit for a generated sample year. */
  data?: ContributionDay[]
  /** Last day shown. Defaults to the latest date in `data`, or today. */
  endDate?: string | Date
  /** Controlled view. */
  view?: View
  /** Uncontrolled starting view. The 3D view rises out of the flat one when it first scrolls into sight. */
  defaultView?: View
  onViewChange?: (view: View) => void
  /** A preset, four colours, or `{ light, dark }` sets of four. */
  palette?: PaletteInput
  /** Heading. Defaults to "{total} contributions in the last year". */
  title?: React.ReactNode
  /** Singular noun for a unit of activity. */
  unit?: string
  /** Plural noun. Defaults to `unit + "s"`. */
  unitPlural?: string
  /** Multiplies bar heights in 3D. */
  heightScale?: number
  /** How a count becomes a height: "power" (default) or "log" for data with a few enormous days. */
  heightCurve?: HeightCurve
  /** Colour of the big stat numbers. Defaults to the heaviest palette colour. */
  accent?: string
  /** Morph length, ms. */
  duration?: number
  /** 0 puts Sunday on the top row, 1 puts Monday there. */
  weekStart?: 0 | 1
  /** Drag to orbit in 3D. */
  orbit?: boolean
  showStats?: boolean
  showLegend?: boolean
  showToggle?: boolean
  /** Replaces the hint under the chart. `null` renders none. */
  footer?: React.ReactNode
  locale?: string
  /** Seed for the generated sample year. */
  seed?: number
  onCellClick?: (day: ContributionDay) => void
  className?: string
}

const FG_FALLBACK: RGB = [23, 23, 23]
const BG_FALLBACK: RGB = [255, 255, 255]

// Any CSS colour → sRGB, by letting the browser paint it. Handles oklch, color-mix, names…
let probe: CanvasRenderingContext2D | null = null
const toRGB = (color: string, fallback: RGB | null): RGB | null => {
  if (!probe) {
    const c = document.createElement("canvas")
    c.width = c.height = 1
    probe = c.getContext("2d", { willReadFrequently: true })
  }
  if (!probe) return fallback
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "rgba(0,0,0,0)"
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const d = probe.getImageData(0, 0, 1, 1).data
  if (d[3] < 8) return fallback
  return [d[0], d[1], d[2]]
}

const rgbString = (r: number, g: number, b: number) => "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")"

const pointInQuad = (p: Float32Array, o: number, x: number, y: number): boolean => {
  let sign = 0
  for (let k = 0; k < 4; k++) {
    const ax = p[o + k * 2]
    const ay = p[o + k * 2 + 1]
    const bx = p[o + ((k + 1) % 4) * 2]
    const by = p[o + ((k + 1) % 4) * 2 + 1]
    const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax)
    if (Math.abs(cross) < 1e-9) continue
    const s = cross > 0 ? 1 : -1
    if (sign === 0) sign = s
    else if (s !== sign) return false
  }
  return sign !== 0
}

const quadPath = (ctx: CanvasRenderingContext2D, p: Float32Array, o: number, r: number) => {
  if (r < 0.3) {
    ctx.moveTo(p[o], p[o + 1])
    ctx.lineTo(p[o + 2], p[o + 3])
    ctx.lineTo(p[o + 4], p[o + 5])
    ctx.lineTo(p[o + 6], p[o + 7])
    ctx.closePath()
    return
  }
  ctx.moveTo((p[o + 6] + p[o]) / 2, (p[o + 7] + p[o + 1]) / 2)
  for (let k = 0; k < 4; k++) {
    const b = (k + 1) % 4
    ctx.arcTo(p[o + k * 2], p[o + k * 2 + 1], p[o + b * 2], p[o + b * 2 + 1], r)
  }
  ctx.closePath()
}

const GridIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={{ maxWidth: "none" }}>
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
  </svg>
)

const CubeIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={{ maxWidth: "none" }}>
    <path d="M8 1.2 14.2 4.6v6.8L8 14.8 1.8 11.4V4.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M1.8 4.6 8 8l6.2-3.4M8 8v6.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

const MUTED = "var(--color-muted-foreground, #737373)"

function Stat({
  label,
  value,
  unit,
  sub,
  accent,
  size,
  align,
}: {
  label: string
  value: string
  unit: string
  sub: string
  accent: string
  size: number
  align: "start" | "end" | "stack"
}) {
  if (align === "stack") {
    return (
      <div className="min-w-0">
        <div className="text-[13px] leading-tight" style={{ color: MUTED }}>
          {label}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <span
            className="font-semibold tabular-nums transition-colors duration-500 motion-reduce:transition-none"
            style={{ color: accent, fontSize: size, lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            {value}
          </span>
          <span className="text-[14px]">{unit}</span>
        </div>
        <div className="mt-0.5 truncate text-[12px]" style={{ color: MUTED }}>
          {sub}
        </div>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-[auto_auto] items-end gap-x-2" style={{ justifyContent: align }}>
      {align === "end" ? (
        <>
          <div className="text-right text-[13px] leading-tight" style={{ color: MUTED }}>
            {label}
          </div>
          <div />
        </>
      ) : (
        <div className="col-span-2 text-[13px] leading-tight" style={{ color: MUTED }}>
          {label}
        </div>
      )}
      <div
        className="text-right font-semibold tabular-nums transition-colors duration-500 motion-reduce:transition-none"
        style={{ color: accent, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.02em" }}
      >
        {value}
      </div>
      <div className="pb-[0.15em] leading-tight">
        <div className="text-[15px]">{unit}</div>
        <div className="whitespace-nowrap text-[13px]" style={{ color: MUTED }}>
          {sub}
        </div>
      </div>
    </div>
  )
}

export default function ContributionSkyline({
  data,
  endDate,
  view: viewProp,
  defaultView = "3d",
  onViewChange,
  palette = "github",
  title,
  unit = "contribution",
  unitPlural,
  heightScale = 1,
  heightCurve = "power",
  accent,
  duration = 1300,
  weekStart = 0,
  orbit = true,
  showStats = true,
  showLegend = true,
  showToggle = true,
  footer,
  locale = "en-US",
  seed = 7,
  onCellClick,
  className = "",
}: ContributionSkylineProps) {
  const endKey = endDate == null ? null : dayMs(endDate)
  const model = React.useMemo(() => {
    const dates = (data ?? []).map((d) => dayMs(d.date)).filter(Number.isFinite)
    const end = endKey ?? (dates.length ? Math.max(...dates) : dayMs(new Date()))
    const days = data ?? generateContributions(end, seed)
    const grid = buildGrid(days, end, weekStart)
    return { ...grid, stats: computeStats(grid.cells), months: monthLabels(grid.cells, grid.weeks, locale) }
  }, [data, endKey, seed, weekStart, locale])

  const [innerView, setInnerView] = React.useState<View>(defaultView)
  const view = viewProp ?? innerView
  const setView = (v: View) => {
    if (viewProp === undefined) setInnerView(v)
    onViewChange?.(v)
  }

  const [theme, setTheme] = React.useState<{ dark: boolean; swatches: string[]; accent: string }>(() => {
    const p = resolvePalette(palette, false)
    return { dark: false, swatches: ["#ebedf0", ...p], accent: p[3] }
  })
  const [width, setWidth] = React.useState(0)
  const [active, setActive] = React.useState(-1)
  const [legendLevel, setLegendLevel] = React.useState(-1)
  const [announce, setAnnounce] = React.useState("")

  const rootRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const tipRef = React.useRef<HTMLDivElement>(null)
  const engine = React.useRef<{ kick: () => void; load: () => void; retheme: () => void; tipWidth: (w: number) => void } | null>(null)

  const plural = unitPlural ?? unit + "s"
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const df = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }), [locale])
  const dfy = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }), [locale])
  const dfl = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }), [locale])
  const noun = (n: number) => (n === 1 ? unit : plural)
  const describe = (i: number) => {
    const c = model.cells[i]
    if (!c) return ""
    return (c.count ? nf.format(c.count) + " " + noun(c.count) : "No " + plural) + " on " + dfl.format(dayMs(c.date))
  }

  // Everything the render loop reads, refreshed every render so the loop never closes over stale props.
  const cfg = React.useRef({ model, duration, heightScale, heightCurve, orbit, palette, legendLevel, onCellClick, target: view === "3d" ? 1 : 0, setActive, setWidth, setTheme, setAnnounce, describe })
  cfg.current = { model, duration, heightScale, heightCurve, orbit, palette, legendLevel, onCellClick, target: view === "3d" ? 1 : 0, setActive, setWidth, setTheme, setAnnounce, describe }

  React.useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    const tip = tipRef.current
    if (!root || !stage || !canvas || !tip) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const darkMq = window.matchMedia("(prefers-color-scheme: dark)")
    let reduced = reduceMq.matches

    // morph: t is linear time 0 (2D) → 1 (3D); the camera eases it, the bars wave it
    let t = 0
    let target = 0
    let entered = false
    // orbit offsets, eased toward their goals
    let yaw = 0
    let elev = 0
    let yawGoal = 0
    let elevGoal = 0
    // layout
    let W = 0
    let H2 = 0
    let H3 = 0
    let Hmax = 0
    let lastH = -1
    let dpr = 1
    let gutter = 30
    let labelW = 30
    let font = "10px sans-serif"
    // colours: [empty, l1, l2, l3, l4] × rgb, eased toward the goal
    const col = new Float32Array(15)
    const colGoal = new Float32Array(15)
    let colReady = false
    let fg: RGB = FG_FALLBACK
    let bg: RGB = BG_FALLBACK
    let isDark = false
    // cells
    let n = 0
    let weeks = 0
    let wk = new Float32Array(0)
    let dy = new Float32Array(0)
    let lv = new Uint8Array(0)
    let hgt = new Float32Array(0)
    let zs = new Float32Array(0)
    let hover = new Float32Array(0)
    let dim = new Float32Array(0)
    let polys = new Float32Array(0)
    let faces = new Uint8Array(0)
    let order: number[] = []
    let months: { week: number; label: string }[] = []
    let weekdayRows: { day: number; label: string }[] = []
    // interaction
    let hovered = -1
    let pinned = -1
    let activeIdx = -1
    let tipW = 0
    let raf = 0
    let last = 0

    const load = () => {

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import PlantSVG from './PlantSVG'
import BushSVG from './BushSVG'
import WhiteRoseSVG from './WhiteRoseSVG'
import TrophySVG, { trophyVariantFromId, trophyTier, getTrophyConfig } from './TrophySVG'
import AuditBouquetSVG from './AuditBouquetSVG'
import { plantStage } from '../../hooks/useHabitTemplates'
import type { Grind, Pomodoro, PlantHealth, Task, TimeAudit } from '../../types'

// ── Constants ────────────────────────────────────────────────
const CELL = 44
const MIN_SIDE = 7
const MAX_SIDE = 14
const ZEN_FILL = 0.35
const LS_KEY = 'terrarium-grid-positions'

// ── Helpers ──────────────────────────────────────────────────
function hashId(id: string): number {
  let h = 0; for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0; return h >>> 0
}
function cellHash(r: number, c: number): number {
  let h = r * 7919 + c * 104729; h = ((h >> 16) ^ h) * 0x45d9f3b; h = ((h >> 16) ^ h) * 0x45d9f3b; return ((h >> 16) ^ h) & 0x7fffffff
}
function pomodoroStage(d: number): 0 | 1 | 2 | 3 | 4 {
  if (d >= 60) return 4; if (d >= 30) return 3; if (d >= 15) return 2; return 1
}
function organicOffset(id: string): { dx: number; dy: number } {
  const h = hashId(id)
  return { dx: ((h % 7) - 3) * 1.5, dy: (((h >> 3) % 7) - 3) * 1.5 }
}
// Manhattan distance from a corner
function distFromCorner(r: number, c: number, cr: number, cc: number): number {
  return Math.abs(r - cr) + Math.abs(c - cc)
}

// ── Types ────────────────────────────────────────────────────
type TooltipInfo =
  | { type: 'habit'; title: string; createdAt: string; streak: number; bestStreak: number; health: PlantHealth }
  | { type: 'pomodoro'; taskTitle: string; durationMinutes: number; completedAt: string }
  | { type: 'trophy'; title: string; completedAt: string; stepCount: number; trophyName: string }
  | { type: 'audit'; completedAt: string; entryCount: number }
  | { type: 'prayer' }

type CellItem =
  | { kind: 'habit'; grind: Grind; corner: 'tl' | 'tr' | 'bl' | 'br'; health: PlantHealth; key: string }
  | { kind: 'pomodoro'; pomodoro: Pomodoro; colorIndex: number; key: string }
  | { kind: 'trophy'; task: Task; key: string }
  | { kind: 'audit'; audit: TimeAudit; key: string }
  | { kind: 'prayer'; index: number; key: string }

type GroundFeature = 'moss' | 'clover' | 'pebble' | 'mushroom' | 'wildflower' | 'gravel' | 'stone' | 'water' | null

interface Cell { item: CellItem | null; ground: GroundFeature }

interface Props {
  grinds: Grind[]
  retiredGrinds: Grind[]
  pomodoros: Pomodoro[]
  prayerCount: number
  healthMap: Map<string, PlantHealth>
  completedHydras?: Task[]
  completedAudits?: TimeAudit[]
}

// ── Persistence ──────────────────────────────────────────────
function loadPositions(): Record<string, { r: number; c: number }> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function savePositions(pos: Record<string, { r: number; c: number }>) {
  localStorage.setItem(LS_KEY, JSON.stringify(pos))
}

// ══════════════════════════════════════════════════════════════
// Garden Builder
// ══════════════════════════════════════════════════════════════
//
// With rotateZ(45deg), the grid diamond looks like:
//
//         (0,0) BACK
//        /            \
//   (N,0) LEFT    (0,N) RIGHT
//        \            /
//         (N,N) FRONT
//
// Each zone radiates from its corner.
// Items are placed closest to their corner first, spiraling outward.
// The center of the grid is where zones meet — water flows here.

function buildGarden(
  allHabits: Grind[],
  pomodoros: Pomodoro[],
  trophies: Task[],
  audits: TimeAudit[],
  prayerCount: number,
  healthMap: Map<string, PlantHealth>,
) {
  const totalUnits = allHabits.length * 4 + prayerCount + trophies.length + audits.length + pomodoros.length
  const desiredCells = Math.max(MIN_SIDE * MIN_SIDE, Math.ceil(totalUnits / ZEN_FILL))
  const side = Math.min(MAX_SIDE, Math.max(MIN_SIDE, Math.ceil(Math.sqrt(desiredCells))))
  const last = side - 1

  // Corner anchors
  const BACK = { r: 0, c: 0 }       // top-left grid = back of diamond
  const FRONT = { r: last, c: last } // bottom-right = front of diamond
  const LEFT = { r: last, c: 0 }     // bottom-left = screen left
  const RIGHT = { r: 0, c: last }    // top-right = screen right

  const grid: Cell[][] = Array.from({ length: side }, () =>
    Array.from({ length: side }, () => ({ item: null, ground: null }))
  )

  const saved = loadPositions()
  const occupied = new Set<string>()

  function place(r: number, c: number, item: CellItem): boolean {
    if (r < 0 || r >= side || c < 0 || c >= side) return false
    if (occupied.has(`${r},${c}`)) return false
    grid[r][c].item = item
    occupied.add(`${r},${c}`)
    return true
  }

  function placeHabit(r: number, c: number, grind: Grind, health: PlantHealth): boolean {
    if (r + 1 >= side || c + 1 >= side) return false
    const cells = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]]
    if (cells.some(([cr, cc]) => occupied.has(`${cr},${cc}`))) return false
    const corners: Array<'tl' | 'tr' | 'bl' | 'br'> = ['tl', 'tr', 'bl', 'br']
    const key = `habit:${grind.id}`
    cells.forEach(([cr, cc], i) => {
      grid[cr][cc].item = { kind: 'habit', grind, corner: corners[i], health, key }
      occupied.add(`${cr},${cc}`)
    })
    return true
  }

  // Sort cells by distance from a corner (for zone placement)
  function cellsByCorner(corner: { r: number; c: number }, side: number): [number, number][] {
    const cells: [number, number][] = []
    for (let r = 0; r < side; r++) for (let c = 0; c < side; c++) cells.push([r, c])
    cells.sort((a, b) => {
      const da = Math.sqrt((a[0] - corner.r) ** 2 + (a[1] - corner.c) ** 2)
      const db = Math.sqrt((b[0] - corner.r) ** 2 + (b[1] - corner.c) ** 2)
      if (Math.abs(da - db) > 0.7) return da - db
      // Same distance band: order by angle for spiral
      const aa = Math.atan2(a[0] - corner.r, a[1] - corner.c)
      const ab = Math.atan2(b[0] - corner.r, b[1] - corner.c)
      return aa - ab
    })
    return cells
  }

  // ── Waterway — procedural streams dividing quadrants ──
  // Two drunken-walk streams along the diagonals cross at center,
  // forming an X that separates the four garden zones.
  // On the rotated grid: main diagonal = vertical on screen,
  // anti-diagonal = horizontal on screen → forms a + cross.
  const waterSet = new Set<string>()

  // Stream 1: anti-diagonal LEFT(last,0) → RIGHT(0,last)
  for (let t = 1; t < last; t++) {
    const baseR = last - t
    const baseC = t
    const h = cellHash(baseR, baseC + 200)
    const wobble = (h % 3) - 1
    const r = Math.max(1, Math.min(last - 1, baseR + wobble))
    const c = Math.max(1, Math.min(last - 1, baseC))
    waterSet.add(`${r},${c}`)
    if (h % 4 === 0) {
      const wr = Math.max(1, Math.min(last - 1, r + (h % 2 === 0 ? 1 : -1)))
      waterSet.add(`${wr},${c}`)
    }
  }

  // Stream 2: main diagonal BACK(0,0) → FRONT(last,last)
  for (let t = 1; t < last; t++) {
    const baseR = t
    const baseC = t
    const h = cellHash(baseR + 300, baseC)
    const wobble = (h % 3) - 1
    const r = Math.max(1, Math.min(last - 1, baseR))
    const c = Math.max(1, Math.min(last - 1, baseC + wobble))
    waterSet.add(`${r},${c}`)
    if (h % 4 === 0) {
      const wc = Math.max(1, Math.min(last - 1, c + (h % 2 === 0 ? 1 : -1)))
      waterSet.add(`${r},${wc}`)
    }
  }

  // Widen at center intersection → small pond
  const mid = (side - 1) / 2
  for (const wKey of [...waterSet]) {
    const [wr, wc] = wKey.split(',').map(Number)
    if (Math.abs(wr - mid) + Math.abs(wc - mid) < 2) {
      for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]] as const) {
        const nr = wr + dr, nc = wc + dc
        if (nr >= 1 && nr < last && nc >= 1 && nc < last) {
          waterSet.add(`${nr},${nc}`)
        }
      }
    }
  }

  // Apply water — prevents items from being placed on water
  for (const wKey of waterSet) {
    const [wr, wc] = wKey.split(',').map(Number)
    grid[wr][wc].ground = 'water'
    occupied.add(wKey)
  }

  // ── Habits → BACK corner (0,0) ──
  const activeHabits = allHabits.filter(g => !g.retired)
  const retiredHabits = allHabits.filter(g => g.retired)
  const habitCells = cellsByCorner(BACK, side)

  for (const g of [...activeHabits, ...retiredHabits]) {
    const key = `habit:${g.id}`
    const health = healthMap.get(g.id) ?? 'healthy'
    const sv = saved[key]
    if (sv && placeHabit(sv.r, sv.c, g, health)) continue
    for (const [r, c] of habitCells) {
      if (placeHabit(r, c, g, health)) break
    }
  }

  // ── Prayers → FRONT corner (N,N) ──
  const prayerCells = cellsByCorner(FRONT, side)
  for (let i = 0; i < prayerCount; i++) {
    const key = `prayer:${i}`
    const sv = saved[key]
    if (sv && place(sv.r, sv.c, { kind: 'prayer', index: i, key })) continue
    for (const [r, c] of prayerCells) {
      if (place(r, c, { kind: 'prayer', index: i, key })) break
    }
  }

  // ── Trophies + audits → RIGHT corner (0,N) ──
  const sortedTrophies = [...trophies].sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())
  const sortedAudits = [...audits].sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())
  const rightCells = cellsByCorner(RIGHT, side)
  const rightItems: CellItem[] = [
    ...sortedTrophies.map(t => ({ kind: 'trophy' as const, task: t, key: `trophy:${t.id}` })),
    ...sortedAudits.map(a => ({ kind: 'audit' as const, audit: a, key: `audit:${a.id}` })),
  ]
  for (const item of rightItems) {
    const sv = saved[item.key]
    if (sv && place(sv.r, sv.c, item)) continue
    for (const [r, c] of rightCells) {
      if (place(r, c, item)) break
    }
  }

  // ── Pomodoros → LEFT corner (N,0) ──
  const sortedPomos = [...pomodoros].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
  const pomoCells = cellsByCorner(LEFT, side)
  for (const p of sortedPomos) {
    const key = `pomodoro:${p.id}`
    const sv = saved[key]
    if (sv && place(sv.r, sv.c, { kind: 'pomodoro', pomodoro: p, colorIndex: hashId(p.id) % 10, key })) continue
    for (const [r, c] of pomoCells) {
      if (place(r, c, { kind: 'pomodoro', pomodoro: p, colorIndex: hashId(p.id) % 10, key })) break
    }
  }

  // ── Ground features ──
  // Zone-specific ground cover (water already placed by waterway generator)
  for (let r = 0; r < side; r++) {
    for (let c = 0; c < side; c++) {
      if (grid[r][c].item || grid[r][c].ground) continue // skip items and water
      const h = cellHash(r, c)

      const dBack = distFromCorner(r, c, BACK.r, BACK.c)
      const dFront = distFromCorner(r, c, FRONT.r, FRONT.c)
      const dLeft = distFromCorner(r, c, LEFT.r, LEFT.c)
      const dRight = distFromCorner(r, c, RIGHT.r, RIGHT.c)
      const minDist = Math.min(dBack, dFront, dLeft, dRight)

      if (minDist === dLeft) {
        // Pomodoro zone: clover and pebbles
        if (h % 6 === 0) grid[r][c].ground = 'clover'
        else if (h % 13 === 0) grid[r][c].ground = 'pebble'
      } else if (minDist === dRight) {
        // Trophy zone: gravel and stones
        if (h % 5 === 0) grid[r][c].ground = 'gravel'
        else if (h % 11 === 0) grid[r][c].ground = 'stone'
      } else if (minDist === dFront) {
        // Prayer zone: moss and wildflowers
        if (h % 5 === 0) grid[r][c].ground = 'moss'
        else if (h % 9 === 0) grid[r][c].ground = 'wildflower'
      } else {
        // Habit zone: moss and mushrooms
        if (h % 7 === 0) grid[r][c].ground = 'moss'
        else if (h % 17 === 0) grid[r][c].ground = 'mushroom'
      }
    }
  }

  return { grid, side }
}

// ── Ground Feature SVGs ─────────────────────────────────────
function GroundSVG({ feature }: { feature: GroundFeature }) {
  if (!feature) return null
  const s = { position: 'absolute' as const, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }

  switch (feature) {
    case 'water': return (
      <svg style={{ position: 'absolute' as const, left: 0, top: 0, width: '100%', height: '100%' }} viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" fill="rgba(55,120,170,0.18)" />
        <ellipse cx="26" cy="18" rx="14" ry="9" fill="rgba(85,155,200,0.06)" />
        <ellipse cx="14" cy="30" rx="10" ry="6" fill="rgba(100,170,215,0.04)" />
      </svg>
    )
    case 'stone': return (
      <svg style={s} width="18" height="12" viewBox="0 0 18 12" fill="none">
        <ellipse cx="9" cy="6" rx="7" ry="4.5" fill="rgba(145,138,125,0.18)" />
        <ellipse cx="8" cy="5" rx="4.5" ry="3" fill="rgba(160,153,140,0.12)" />
      </svg>
    )
    case 'moss': return (
      <svg style={s} width="16" height="12" viewBox="0 0 16 12" fill="none">
        <ellipse cx="5" cy="7" rx="4" ry="3" fill="rgba(90,130,65,0.16)" />
        <ellipse cx="11" cy="6" rx="3.5" ry="2.5" fill="rgba(100,140,72,0.12)" />
        <ellipse cx="8" cy="9" rx="3" ry="2" fill="rgba(80,120,58,0.09)" />
      </svg>
    )
    case 'clover': return (
      <svg style={s} width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="4" cy="4" r="2" fill="rgba(75,130,50,0.16)" />
        <circle cx="8" cy="4" r="2" fill="rgba(75,130,50,0.13)" />
        <circle cx="6" cy="7" r="2" fill="rgba(75,130,50,0.18)" />
      </svg>
    )
    case 'pebble': return (
      <svg style={s} width="14" height="10" viewBox="0 0 14 10" fill="none">
        <ellipse cx="5" cy="5" rx="3" ry="2" fill="rgba(130,125,110,0.14)" />
        <ellipse cx="10" cy="6" rx="2.5" ry="1.5" fill="rgba(120,115,100,0.11)" />
      </svg>
    )
    case 'mushroom': return (
      <svg style={s} width="10" height="12" viewBox="0 0 10 12" fill="none">
        <rect x="4" y="7" width="2" height="4" rx="0.5" fill="rgba(200,190,170,0.2)" />
        <ellipse cx="5" cy="7" rx="3.5" ry="2.5" fill="rgba(160,115,85,0.16)" />
        <ellipse cx="4" cy="6.5" rx="1" ry="0.6" fill="rgba(240,235,225,0.1)" />
      </svg>
    )
    case 'wildflower': return (
      <svg style={s} width="10" height="14" viewBox="0 0 10 14" fill="none">
        <line x1="5" y1="8" x2="5" y2="13" stroke="rgba(90,130,65,0.16)" strokeWidth="0.5" />
        <circle cx="5" cy="6" r="2.5" fill="rgba(250,245,240,0.2)" />
        <circle cx="5" cy="6" r="1" fill="rgba(235,215,175,0.22)" />
      </svg>
    )
    case 'gravel': return (
      <svg style={s} width="16" height="10" viewBox="0 0 16 10" fill="none">
        <ellipse cx="4" cy="5" rx="2" ry="1.2" fill="rgba(148,142,128,0.12)" />
        <ellipse cx="9" cy="4" rx="1.5" ry="1" fill="rgba(138,132,118,0.1)" />
        <ellipse cx="12" cy="6" rx="1.8" ry="1" fill="rgba(142,136,122,0.1)" />
      </svg>
    )
    default: return null
  }
}

// ── Component ────────────────────────────────────────────────
export default function TerrariumGrid({ grinds, retiredGrinds, pomodoros, prayerCount, healthMap, completedHydras = [], completedAudits = [] }: Props) {
  const [tooltip, setTooltip] = useState<{ info: TooltipInfo; x: number; y: number } | null>(null)
  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window

  const allHabits = useMemo(() =>
    [...grinds, ...retiredGrinds].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [grinds, retiredGrinds]
  )

  const layout = useMemo(() =>
    buildGarden(allHabits, pomodoros, completedHydras, completedAudits, prayerCount, healthMap),
    [allHabits, pomodoros, completedHydras, completedAudits, prayerCount, healthMap]
  )

  const [grid, setGrid] = useState(layout.grid)
  const [side, setSide] = useState(layout.side)
  useEffect(() => { setGrid(layout.grid); setSide(layout.side) }, [layout])

  // ── Drag (desktop only) ──────────────────────────────────
  const dragSrc = useRef<{ r: number; c: number; key: string } | null>(null)
  const [ghostPos, setGhostPos] = useState<{ r: number; c: number } | null>(null)

  const handleDragStart = useCallback((r: number, c: number, key: string) => { dragSrc.current = { r, c, key } }, [])
  const handleDragOver = useCallback((e: React.DragEvent, r: number, c: number) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setGhostPos({ r, c }) }, [])
  const handleDragEnd = useCallback(() => { dragSrc.current = null; setGhostPos(null) }, [])

  const handleDrop = useCallback((r: number, c: number) => {
    const src = dragSrc.current
    if (!src || (src.r === r && src.c === c)) { dragSrc.current = null; setGhostPos(null); return }
    const srcCell = grid[src.r]?.[src.c]
    const dstCell = grid[r]?.[c]
    if (!srcCell?.item || !dstCell) { dragSrc.current = null; setGhostPos(null); return }

    if (srcCell.item.kind === 'habit') {
      const habit = srcCell.item
      if (habit.corner !== 'tl') { dragSrc.current = null; setGhostPos(null); return }
      if (r + 1 >= side || c + 1 >= side) { dragSrc.current = null; setGhostPos(null); return }
      const destCells = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]]
      const srcCells = [[src.r, src.c], [src.r, src.c + 1], [src.r + 1, src.c], [src.r + 1, src.c + 1]]
      const srcSet = new Set(srcCells.map(([cr, cc]) => `${cr},${cc}`))
      if (destCells.some(([cr, cc]) => { const cell = grid[cr]?.[cc]; return !cell || (cell.item && !srcSet.has(`${cr},${cc}`)) })) {
        dragSrc.current = null; setGhostPos(null); return
      }
      setGrid(prev => {
        const next = prev.map(row => row.map(cell => ({ ...cell })))
        srcCells.forEach(([cr, cc]) => { next[cr][cc].item = null })
        const corners: Array<'tl' | 'tr' | 'bl' | 'br'> = ['tl', 'tr', 'bl', 'br']
        destCells.forEach(([cr, cc], i) => { next[cr][cc].item = { ...habit, corner: corners[i] } })
        return next
      })
      const pos = loadPositions(); pos[habit.key] = { r, c }; savePositions(pos)
    } else {
      setGrid(prev => {
        const next = prev.map(row => row.map(cell => ({ ...cell })))
        next[r][c].item = prev[src.r][src.c].item
        next[src.r][src.c].item = prev[r][c].item
        return next
      })
      const pos = loadPositions()
      if (srcCell.item) pos[srcCell.item.key] = { r, c }
      if (dstCell.item) pos[dstCell.item.key] = { r: src.r, c: src.c }
      savePositions(pos)
    }
    dragSrc.current = null; setGhostPos(null)
  }, [grid, side])

  // ── Tooltip ──────────────────────────────────────────────
  const handleItemClick = useCallback((info: TooltipInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).closest('.terrarium-container')?.getBoundingClientRect()
    if (!rect) return
    setTooltip({ info, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])
  const dismissTooltip = useCallback(() => setTooltip(null), [])

  const gridPx = side * CELL

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Garden</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      <div className="flex justify-center pb-6" style={{ perspective: '900px', perspectiveOrigin: '50% 40%' }}>
        <div
          className="terrarium-container"
          style={{ width: gridPx, height: gridPx, transform: 'rotateX(55deg) rotateZ(45deg)', transformStyle: 'preserve-3d', position: 'relative' }}
          onClick={dismissTooltip}
        >
          {/* Ground */}
          <div className="absolute inset-0 rounded-lg" style={{
            background: 'linear-gradient(135deg, #bcc5aa 0%, #a3b08e 30%, #8aad7d 50%, #95a383 80%, #8a9472 100%)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          }} />

          {/* Cells */}
          {grid.map((row, r) => row.map((cell, c) => {
            const key = `${r}-${c}`
            const isGhost = ghostPos?.r === r && ghostPos?.c === c
            const item = cell.item
            const zIdx = r + c // isometric depth: higher r+c = closer to viewer

            if (!item) {
              return (
                <div key={key} className={`absolute ${isGhost ? 'bg-sage-300/20 rounded' : ''}`}
                  style={{ left: c * CELL, top: r * CELL, width: CELL, height: CELL, transition: 'background 0.2s' }}
                  onDragOver={!isMobile ? (e) => handleDragOver(e, r, c) : undefined}
                  onDrop={!isMobile ? () => handleDrop(r, c) : undefined}>
                  <GroundSVG feature={cell.ground} />
                </div>
              )
            }

            // ── Habit (2x2) ──
            if (item.kind === 'habit') {
              if (item.corner !== 'tl') return null
              const stage = plantStage(item.grind.current_streak)
              return (
                <div key={key} className="absolute" style={{
                  left: c * CELL, top: r * CELL, width: CELL * 2, height: CELL * 2,
                  transformStyle: 'preserve-3d', zIndex: zIdx + 10, pointerEvents: 'none',
                }}>
                  <div
                    className={!isMobile ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                    style={{
                      position: 'absolute', left: '50%', top: '50%',
                      transform: 'translateZ(3px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -85%)',
                      transformOrigin: '0 0', transformStyle: 'preserve-3d', pointerEvents: 'auto',
                    }}
                    draggable={!isMobile}
                    onDragStart={!isMobile ? () => handleDragStart(r, c, item.key) : undefined}
                    onDragEnd={!isMobile ? handleDragEnd : undefined}
                    onClick={(e) => handleItemClick({
                      type: 'habit', title: item.grind.title, createdAt: item.grind.created_at,
                      streak: item.grind.current_streak, bestStreak: item.grind.best_streak, health: item.health,
                    }, e)}>
                    <PlantSVG stage={stage} size="md" colorVariant={item.grind.color_variant} health={item.health} />
                  </div>
                </div>
              )
            }

            // ── 1x1 items — lifted well above ground ──
            const { dx, dy } = organicOffset(item.key)
            const cfg = {
              pomodoro: { lift: '-85%', z: 3, sz: 42 },
              trophy:   { lift: '-85%', z: 3, sz: 40 },
              audit:    { lift: '-85%', z: 3, sz: 40 },
              prayer:   { lift: '-82%', z: 3, sz: 38 },
            }[item.kind]

            return (
              <div key={key} className="absolute" style={{
                left: c * CELL + dx, top: r * CELL + dy, width: CELL, height: CELL,
                transformStyle: 'preserve-3d', zIndex: zIdx, pointerEvents: 'none',
                transition: 'left 0.3s ease, top 0.3s ease',
              }}
                onDragOver={!isMobile ? (e) => handleDragOver(e, r, c) : undefined}
                onDrop={!isMobile ? () => handleDrop(r, c) : undefined}>
                <div
                  className={`${!isMobile ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${isGhost ? 'ring-2 ring-sage-400/50 rounded-full' : ''}`}
                  style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: `translateZ(${cfg.z}px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, ${cfg.lift})`,
                    transformOrigin: '0 0', pointerEvents: 'auto',
                  }}
                  draggable={!isMobile}
                  onDragStart={!isMobile ? () => handleDragStart(r, c, item.key) : undefined}
                  onDragEnd={!isMobile ? handleDragEnd : undefined}
                  onClick={(e) => {
                    if (item.kind === 'pomodoro') handleItemClick({ type: 'pomodoro', taskTitle: item.pomodoro.task_title, durationMinutes: item.pomodoro.duration_minutes, completedAt: item.pomodoro.completed_at }, e)
                    else if (item.kind === 'trophy') { const v = trophyVariantFromId(item.task.id), t = trophyTier(item.task.steps?.length ?? 0); handleItemClick({ type: 'trophy', title: item.task.title, completedAt: item.task.completed_at!, stepCount: item.task.steps?.length ?? 0, trophyName: getTrophyConfig(v, t).name }, e) }
                    else if (item.kind === 'audit') handleItemClick({ type: 'audit', completedAt: item.audit.completed_at!, entryCount: item.audit.entries.length }, e)
                    else if (item.kind === 'prayer') handleItemClick({ type: 'prayer' }, e)
                  }}>
                  {item.kind === 'pomodoro' && <BushSVG stage={pomodoroStage(item.pomodoro.duration_minutes)} size={cfg.sz} colorVariant={item.colorIndex} />}
                  {item.kind === 'trophy' && <TrophySVG size={cfg.sz} variant={trophyVariantFromId(item.task.id)} tier={trophyTier(item.task.steps?.length ?? 0)} />}
                  {item.kind === 'audit' && <AuditBouquetSVG size={cfg.sz} />}
                  {item.kind === 'prayer' && <WhiteRoseSVG size={cfg.sz} />}
                </div>
              </div>
            )
          }))}

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute" style={{ left: tooltip.x, top: tooltip.y - 10, transform: 'rotateZ(-45deg) rotateX(-55deg) translateZ(20px)', transformStyle: 'preserve-3d', zIndex: 200 }}>
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 px-3 py-2 text-left" style={{ transform: 'translate(-50%, -100%)', minWidth: 140, maxWidth: 200 }} onClick={(e) => e.stopPropagation()}>
                {tooltip.info.type === 'habit' && (<div className="space-y-1"><p className="text-sm font-medium text-stone-800">{tooltip.info.title}</p><p className="text-xs text-stone-400">Planted {new Date(tooltip.info.createdAt).toLocaleDateString()}</p><div className="flex items-center gap-2 text-xs"><span className="text-sage-600 font-medium">{tooltip.info.streak}d streak</span><span className="text-stone-300">best {tooltip.info.bestStreak}d</span></div>{tooltip.info.health !== 'healthy' && <p className="text-xs text-amber-600 capitalize">{tooltip.info.health}</p>}</div>)}
                {tooltip.info.type === 'pomodoro' && (<div className="space-y-1"><p className="text-sm font-medium text-stone-800">{tooltip.info.taskTitle}</p><p className="text-xs text-stone-400">{tooltip.info.durationMinutes} min focus</p><p className="text-xs text-stone-300">{new Date(tooltip.info.completedAt).toLocaleDateString()} {new Date(tooltip.info.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p></div>)}
                {tooltip.info.type === 'trophy' && (<div className="space-y-1"><p className="text-sm font-medium text-stone-800">{tooltip.info.title}</p><p className="text-xs text-amber-600 font-medium">{tooltip.info.trophyName}</p><p className="text-xs text-stone-400">{tooltip.info.stepCount} steps conquered</p><p className="text-xs text-stone-300">{new Date(tooltip.info.completedAt).toLocaleDateString()}</p></div>)}
                {tooltip.info.type === 'audit' && (<div className="space-y-1"><p className="text-sm font-medium text-stone-800">Time Audit</p><p className="text-xs text-stone-400">{tooltip.info.entryCount} entries logged</p><p className="text-xs text-stone-300">{new Date(tooltip.info.completedAt).toLocaleDateString()}</p></div>)}
                {tooltip.info.type === 'prayer' && (<div><p className="text-sm font-medium text-stone-800">Prayer completed</p></div>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {(pomodoros.length > 0 || prayerCount > 0 || completedHydras.length > 0 || completedAudits.length > 0 || allHabits.length > 0) && (
        <p className="text-center text-[10px] text-stone-300">
          {[
            allHabits.length > 0 && `${allHabits.length} plant${allHabits.length !== 1 ? 's' : ''}`,
            pomodoros.length > 0 && `${pomodoros.length} pomodoro${pomodoros.length !== 1 ? 's' : ''}`,
            completedHydras.length > 0 && `${completedHydras.length} troph${completedHydras.length !== 1 ? 'ies' : 'y'}`,
            completedAudits.length > 0 && `${completedAudits.length} audit${completedAudits.length !== 1 ? 's' : ''}`,
            prayerCount > 0 && `${prayerCount} rose${prayerCount !== 1 ? 's' : ''}`,
          ].filter(Boolean).join(' · ')}
          {!isMobile && ' · drag to rearrange'}
        </p>
      )}
    </div>
  )
}

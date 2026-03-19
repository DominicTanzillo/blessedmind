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

type GroundFeature = 'moss' | 'clover' | 'pebble' | 'pond' | 'mushroom' | 'wildflower' | 'gravel' | 'stone' | 'stream' | null

interface Cell {
  item: CellItem | null
  ground: GroundFeature
  zone: 'habit' | 'prayer' | 'trophy' | 'pomodoro' | 'open'
}

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

// ── Garden Builder ───────────────────────────────────────────
// Zones (in isometric view):
//   BACK (top rows, far from viewer)  → Habit plants (2×2)
//   LEFT columns                      → Prayer roses
//   RIGHT columns                     → Trophies + audits
//   FRONT (bottom rows, close)        → Pomodoro bushes
//   Between zones: flowing water stream + stepping stones

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

  // Zone boundaries
  const habitZoneEnd = 2        // rows 0-2 for habits (back/top)
  const pomoZoneStart = side - 2 // bottom 2 rows for pomodoros (front)
  const leftZoneEnd = Math.floor(side * 0.4)  // left ~40% for prayers
  const rightZoneStart = Math.ceil(side * 0.6) // right ~40% for trophies

  const grid: Cell[][] = Array.from({ length: side }, (_, r) =>
    Array.from({ length: side }, (_, c) => {
      let zone: Cell['zone'] = 'open'
      if (r <= habitZoneEnd && c < side) zone = 'habit'
      else if (r >= pomoZoneStart) zone = 'pomodoro'
      else if (c < leftZoneEnd) zone = 'prayer'
      else if (c >= rightZoneStart) zone = 'trophy'
      return { item: null, ground: null, zone }
    })
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

  // ── Place habits (BACK / top rows, starting from row 0) ──
  const activeHabits = allHabits.filter(g => !g.retired)
  const retiredHabits = allHabits.filter(g => g.retired)

  for (const g of activeHabits) {
    const key = `habit:${g.id}`
    const health = healthMap.get(g.id) ?? 'healthy'
    const sv = saved[key]
    if (sv && placeHabit(sv.r, sv.c, g, health)) continue
    let placed = false
    for (let r = 0; r <= habitZoneEnd && !placed; r++) {
      for (let c = 0; c < side - 1 && !placed; c++) {
        placed = placeHabit(r, c, g, health)
      }
    }
    // Overflow
    if (!placed) {
      for (let r = habitZoneEnd + 1; r < side - 1 && !placed; r++) {
        for (let c = 0; c < side - 1 && !placed; c++) placed = placeHabit(r, c, g, health)
      }
    }
  }
  for (const g of retiredHabits) {
    const key = `habit:${g.id}`
    const health = healthMap.get(g.id) ?? 'healthy'
    const sv = saved[key]
    if (sv && placeHabit(sv.r, sv.c, g, health)) continue
    let placed = false
    for (let r = 0; r <= habitZoneEnd && !placed; r++) {
      for (let c = 0; c < side - 1 && !placed; c++) placed = placeHabit(r, c, g, health)
    }
  }

  // ── Place prayers (LEFT, starting from far-left column) ──
  for (let i = 0; i < prayerCount; i++) {
    const key = `prayer:${i}`
    const sv = saved[key]
    if (sv && place(sv.r, sv.c, { kind: 'prayer', index: i, key })) continue
    let placed = false
    // Fill from left edge, top to bottom within prayer zone
    for (let c = 0; c < leftZoneEnd && !placed; c++) {
      for (let r = habitZoneEnd + 1; r < pomoZoneStart && !placed; r++) {
        placed = place(r, c, { kind: 'prayer', index: i, key })
      }
    }
  }

  // ── Place trophies + audits (RIGHT, starting from far-right column) ──
  const sortedTrophies = [...trophies].sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())
  const sortedAudits = [...audits].sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())

  const rightItems: CellItem[] = [
    ...sortedTrophies.map(t => ({ kind: 'trophy' as const, task: t, key: `trophy:${t.id}` })),
    ...sortedAudits.map(a => ({ kind: 'audit' as const, audit: a, key: `audit:${a.id}` })),
  ]
  for (const item of rightItems) {
    const sv = saved[item.key]
    if (sv && place(sv.r, sv.c, item)) continue
    let placed = false
    // Fill from right edge, top to bottom
    for (let c = side - 1; c >= rightZoneStart && !placed; c--) {
      for (let r = habitZoneEnd + 1; r < pomoZoneStart && !placed; r++) {
        placed = place(r, c, item)
      }
    }
  }

  // ── Place pomodoros (FRONT / bottom rows, starting from bottom) ──
  const sortedPomos = [...pomodoros].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
  for (const p of sortedPomos) {
    const key = `pomodoro:${p.id}`
    const sv = saved[key]
    if (sv && place(sv.r, sv.c, { kind: 'pomodoro', pomodoro: p, colorIndex: hashId(p.id) % 10, key })) continue
    let placed = false
    // Fill from bottom row upward
    for (let r = side - 1; r >= pomoZoneStart && !placed; r--) {
      for (let c = 0; c < side && !placed; c++) {
        placed = place(r, c, { kind: 'pomodoro', pomodoro: p, colorIndex: hashId(p.id) % 10, key })
      }
    }
    // Overflow into open zone
    if (!placed) {
      for (let r = pomoZoneStart - 1; r > habitZoneEnd && !placed; r--) {
        for (let c = leftZoneEnd; c < rightZoneStart && !placed; c++) {
          placed = place(r, c, { kind: 'pomodoro', pomodoro: p, colorIndex: hashId(p.id) % 10, key })
        }
      }
    }
  }

  // ── Ground features + flowing water between zones ──
  for (let r = 0; r < side; r++) {
    for (let c = 0; c < side; c++) {
      if (grid[r][c].item) continue
      const h = cellHash(r, c)
      const zone = grid[r][c].zone

      // Stream flows through the gap between zones (open area in middle)
      const inMiddle = c >= leftZoneEnd && c < rightZoneStart && r > habitZoneEnd && r < pomoZoneStart
      if (inMiddle) {
        // Flowing stream through center gap
        if (h % 3 === 0) { grid[r][c].ground = 'stream'; continue }
        if (h % 5 === 0) { grid[r][c].ground = 'stone'; continue }
        if (h % 11 === 0) { grid[r][c].ground = 'moss'; continue }
        continue
      }

      // Zone-appropriate ground cover
      if (zone === 'prayer') {
        if (h % 5 === 0) grid[r][c].ground = 'moss'
        else if (h % 9 === 0) grid[r][c].ground = 'wildflower'
      } else if (zone === 'trophy') {
        if (h % 5 === 0) grid[r][c].ground = 'gravel'
        else if (h % 11 === 0) grid[r][c].ground = 'stone'
      } else if (zone === 'pomodoro') {
        if (h % 6 === 0) grid[r][c].ground = 'clover'
        else if (h % 13 === 0) grid[r][c].ground = 'pebble'
      } else if (zone === 'habit') {
        if (h % 7 === 0) grid[r][c].ground = 'moss'
        else if (h % 15 === 0) grid[r][c].ground = 'mushroom'
      } else {
        if (h % 8 === 0) grid[r][c].ground = 'clover'
        else if (h % 19 === 0) grid[r][c].ground = 'pond'
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
    case 'stream': return (
      <svg style={s} width="38" height="32" viewBox="0 0 38 32" fill="none">
        <ellipse cx="19" cy="16" rx="16" ry="12" fill="rgba(80,140,180,0.22)" />
        <ellipse cx="17" cy="14" rx="10" ry="7" fill="rgba(100,160,200,0.18)" />
        <ellipse cx="15" cy="12" rx="5" ry="3" fill="rgba(150,200,230,0.14)" />
        {/* Water shimmer */}
        <ellipse cx="22" cy="18" rx="4" ry="1.5" fill="rgba(180,220,245,0.12)" />
      </svg>
    )
    case 'pond': return (
      <svg style={s} width="28" height="22" viewBox="0 0 28 22" fill="none">
        <ellipse cx="14" cy="12" rx="12" ry="8" fill="rgba(70,130,170,0.2)" />
        <ellipse cx="13" cy="11" rx="8" ry="5" fill="rgba(90,155,195,0.16)" />
        <ellipse cx="11" cy="10" rx="4" ry="2" fill="rgba(140,195,225,0.12)" />
        <ellipse cx="16" cy="13" rx="3" ry="1.2" fill="rgba(160,210,235,0.1)" />
      </svg>
    )
    case 'stone': return (
      <svg style={s} width="18" height="12" viewBox="0 0 18 12" fill="none">
        <ellipse cx="9" cy="6" rx="7" ry="4.5" fill="rgba(145,138,125,0.2)" />
        <ellipse cx="8" cy="5" rx="4.5" ry="3" fill="rgba(160,153,140,0.14)" />
      </svg>
    )
    case 'moss': return (
      <svg style={s} width="16" height="12" viewBox="0 0 16 12" fill="none">
        <ellipse cx="5" cy="7" rx="4" ry="3" fill="rgba(90,130,65,0.18)" />
        <ellipse cx="11" cy="6" rx="3.5" ry="2.5" fill="rgba(100,140,72,0.14)" />
        <ellipse cx="8" cy="9" rx="3" ry="2" fill="rgba(80,120,58,0.1)" />
      </svg>
    )
    case 'clover': return (
      <svg style={s} width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="4" cy="4" r="2" fill="rgba(75,130,50,0.18)" />
        <circle cx="8" cy="4" r="2" fill="rgba(75,130,50,0.15)" />
        <circle cx="6" cy="7" r="2" fill="rgba(75,130,50,0.2)" />
        <line x1="6" y1="7" x2="6" y2="11" stroke="rgba(75,130,50,0.12)" strokeWidth="0.5" />
      </svg>
    )
    case 'pebble': return (
      <svg style={s} width="14" height="10" viewBox="0 0 14 10" fill="none">
        <ellipse cx="5" cy="5" rx="3" ry="2" fill="rgba(130,125,110,0.16)" />
        <ellipse cx="10" cy="6" rx="2.5" ry="1.5" fill="rgba(120,115,100,0.13)" />
      </svg>
    )
    case 'mushroom': return (
      <svg style={s} width="10" height="12" viewBox="0 0 10 12" fill="none">
        <rect x="4" y="7" width="2" height="4" rx="0.5" fill="rgba(200,190,170,0.22)" />
        <ellipse cx="5" cy="7" rx="3.5" ry="2.5" fill="rgba(160,115,85,0.18)" />
        <ellipse cx="4" cy="6.5" rx="1" ry="0.6" fill="rgba(240,235,225,0.12)" />
      </svg>
    )
    case 'wildflower': return (
      <svg style={s} width="10" height="14" viewBox="0 0 10 14" fill="none">
        <line x1="5" y1="8" x2="5" y2="13" stroke="rgba(90,130,65,0.18)" strokeWidth="0.5" />
        <circle cx="5" cy="6" r="2.5" fill="rgba(250,245,240,0.22)" />
        <circle cx="5" cy="6" r="1" fill="rgba(235,215,175,0.25)" />
      </svg>
    )
    case 'gravel': return (
      <svg style={s} width="16" height="10" viewBox="0 0 16 10" fill="none">
        <ellipse cx="4" cy="5" rx="2" ry="1.2" fill="rgba(148,142,128,0.14)" />
        <ellipse cx="9" cy="4" rx="1.5" ry="1" fill="rgba(138,132,118,0.11)" />
        <ellipse cx="12" cy="6" rx="1.8" ry="1" fill="rgba(142,136,122,0.12)" />
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

  // ── Drag state (desktop only) ────────────────────────────
  const dragSrc = useRef<{ r: number; c: number; key: string } | null>(null)
  const [ghostPos, setGhostPos] = useState<{ r: number; c: number } | null>(null)

  const handleDragStart = useCallback((r: number, c: number, key: string) => {
    dragSrc.current = { r, c, key }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, r: number, c: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setGhostPos({ r, c })
  }, [])

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
      if (destCells.some(([cr, cc]) => {
        const cell = grid[cr]?.[cc]
        if (!cell) return true
        if (cell.item && !srcSet.has(`${cr},${cc}`)) return true
        return false
      })) { dragSrc.current = null; setGhostPos(null); return }

      setGrid(prev => {
        const next = prev.map(row => row.map(cell => ({ ...cell })))
        srcCells.forEach(([cr, cc]) => { next[cr][cc].item = null })
        const corners: Array<'tl' | 'tr' | 'bl' | 'br'> = ['tl', 'tr', 'bl', 'br']
        destCells.forEach(([cr, cc], i) => {
          next[cr][cc].item = { ...habit, corner: corners[i] }
        })
        return next
      })
      const positions = loadPositions()
      positions[habit.key] = { r, c }
      savePositions(positions)
    } else {
      setGrid(prev => {
        const next = prev.map(row => row.map(cell => ({ ...cell })))
        next[r][c].item = prev[src.r][src.c].item
        next[src.r][src.c].item = prev[r][c].item
        return next
      })
      const positions = loadPositions()
      if (srcCell.item) positions[srcCell.item.key] = { r, c }
      if (dstCell.item) positions[dstCell.item.key] = { r: src.r, c: src.c }
      savePositions(positions)
    }

    dragSrc.current = null
    setGhostPos(null)
  }, [grid, side])

  const handleDragEnd = useCallback(() => {
    dragSrc.current = null
    setGhostPos(null)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

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

      <div className="flex justify-center" style={{ perspective: '900px', perspectiveOrigin: '50% 40%' }}>
        <div
          className="terrarium-container"
          style={{
            width: gridPx, height: gridPx,
            transform: 'rotateX(55deg) rotateZ(45deg)',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
          onClick={dismissTooltip}
        >
          {/* Ground */}
          <div className="absolute inset-0 rounded-lg" style={{
            background: 'linear-gradient(135deg, #bcc5aa 0%, #a3b08e 30%, #8aad7d 50%, #95a383 80%, #8a9472 100%)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          }} />
          <div className="absolute inset-0 rounded-lg" style={{
            background: 'radial-gradient(ellipse at 25% 35%, rgba(200,220,190,0.2) 0%, transparent 50%), radial-gradient(ellipse at 75% 65%, rgba(180,200,170,0.12) 0%, transparent 40%)',
          }} />

          {/* Subtle grid */}
          {Array.from({ length: side + 1 }).map((_, i) => (
            <div key={`g${i}`}>
              <div className="absolute" style={{ left: 0, right: 0, top: i * CELL, height: 1, background: 'rgba(30,80,20,0.03)' }} />
              <div className="absolute" style={{ top: 0, bottom: 0, left: i * CELL, width: 1, background: 'rgba(30,80,20,0.03)' }} />
            </div>
          ))}

          {/* Cells */}
          {grid.map((row, r) => row.map((cell, c) => {
            const key = `${r}-${c}`
            const isGhost = ghostPos?.r === r && ghostPos?.c === c
            const item = cell.item
            const zIdx = r * 2 + (item?.kind === 'habit' ? 1 : 0)

            // ── Ground features ──
            if (!item) {
              return (
                <div
                  key={key}
                  className={`absolute transition-colors duration-300 ${isGhost ? 'bg-sage-300/20 rounded' : ''}`}
                  style={{ left: c * CELL, top: r * CELL, width: CELL, height: CELL }}
                  onDragOver={!isMobile ? (e) => handleDragOver(e, r, c) : undefined}
                  onDrop={!isMobile ? () => handleDrop(r, c) : undefined}
                >
                  <GroundSVG feature={cell.ground} />
                </div>
              )
            }

            // ── Habit (2x2) ──
            if (item.kind === 'habit') {
              if (item.corner !== 'tl') return null
              const stage = plantStage(item.grind.current_streak)
              const isDraggable = !isMobile
              return (
                <div key={key} className="absolute" style={{
                  left: c * CELL, top: r * CELL, width: CELL * 2, height: CELL * 2,
                  transformStyle: 'preserve-3d', zIndex: zIdx, pointerEvents: 'none',
                }}>
                  <div
                    className={isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                    style={{
                      position: 'absolute', left: '50%', top: '50%',
                      transform: 'translateZ(2px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -80%)',
                      transformOrigin: '0 0', transformStyle: 'preserve-3d', pointerEvents: 'auto',
                    }}
                    draggable={isDraggable}
                    onDragStart={isDraggable ? () => handleDragStart(r, c, item.key) : undefined}
                    onDragEnd={isDraggable ? handleDragEnd : undefined}
                    onClick={(e) => handleItemClick({
                      type: 'habit', title: item.grind.title, createdAt: item.grind.created_at,
                      streak: item.grind.current_streak, bestStreak: item.grind.best_streak, health: item.health,
                    }, e)}
                    onContextMenu={handleContextMenu}
                  >
                    <PlantSVG stage={stage} size="md" colorVariant={item.grind.color_variant} health={item.health} />
                  </div>
                </div>
              )
            }

            // ── 1x1 items ──
            const { dx, dy } = organicOffset(item.key)
            const isDraggable = !isMobile

            // Bush lift is less aggressive so they sit ON the ground
            const liftMap = {
              pomodoro: '-50%',
              trophy: '-75%',
              audit: '-65%',
              prayer: '-55%',
            }
            const sizeMap = {
              pomodoro: 42,
              trophy: 40,
              audit: 40,
              prayer: 38,
            }
            const zMap = { pomodoro: 3, trophy: 4, audit: 4, prayer: 2 }

            const lift = liftMap[item.kind]
            const sz = sizeMap[item.kind]
            const zLift = zMap[item.kind]

            return (
              <div key={key} className="absolute" style={{
                left: c * CELL + dx, top: r * CELL + dy, width: CELL, height: CELL,
                transformStyle: 'preserve-3d', zIndex: zIdx, pointerEvents: 'none',
                transition: 'left 0.3s ease, top 0.3s ease',
              }}
                onDragOver={isDraggable ? (e) => handleDragOver(e, r, c) : undefined}
                onDrop={isDraggable ? () => handleDrop(r, c) : undefined}
              >
                <div
                  className={`${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${isGhost ? 'ring-2 ring-sage-400/50 rounded-full' : ''}`}
                  style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: `translateZ(${zLift}px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, ${lift})`,
                    transformOrigin: '0 0', pointerEvents: 'auto',
                    transition: 'transform 0.2s ease',
                  }}
                  draggable={isDraggable}
                  onDragStart={isDraggable ? () => handleDragStart(r, c, item.key) : undefined}
                  onDragEnd={isDraggable ? handleDragEnd : undefined}
                  onContextMenu={handleContextMenu}
                  onClick={(e) => {
                    if (item.kind === 'pomodoro') handleItemClick({ type: 'pomodoro', taskTitle: item.pomodoro.task_title, durationMinutes: item.pomodoro.duration_minutes, completedAt: item.pomodoro.completed_at }, e)
                    else if (item.kind === 'trophy') {
                      const v = trophyVariantFromId(item.task.id), t = trophyTier(item.task.steps?.length ?? 0)
                      handleItemClick({ type: 'trophy', title: item.task.title, completedAt: item.task.completed_at!, stepCount: item.task.steps?.length ?? 0, trophyName: getTrophyConfig(v, t).name }, e)
                    }
                    else if (item.kind === 'audit') handleItemClick({ type: 'audit', completedAt: item.audit.completed_at!, entryCount: item.audit.entries.length }, e)
                    else if (item.kind === 'prayer') handleItemClick({ type: 'prayer' }, e)
                  }}
                >
                  {item.kind === 'pomodoro' && <BushSVG stage={pomodoroStage(item.pomodoro.duration_minutes)} size={sz} colorVariant={item.colorIndex} />}
                  {item.kind === 'trophy' && <TrophySVG size={sz} variant={trophyVariantFromId(item.task.id)} tier={trophyTier(item.task.steps?.length ?? 0)} />}
                  {item.kind === 'audit' && <AuditBouquetSVG size={sz} />}
                  {item.kind === 'prayer' && <WhiteRoseSVG size={sz} />}
                </div>
              </div>
            )
          }))}

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute" style={{
              left: tooltip.x, top: tooltip.y - 10,
              transform: 'rotateZ(-45deg) rotateX(-55deg) translateZ(20px)',
              transformStyle: 'preserve-3d', zIndex: 100,
            }}>
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 px-3 py-2 text-left"
                style={{ transform: 'translate(-50%, -100%)', minWidth: 140, maxWidth: 200 }}
                onClick={(e) => e.stopPropagation()}>
                {tooltip.info.type === 'habit' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-800">{tooltip.info.title}</p>
                    <p className="text-xs text-stone-400">Planted {new Date(tooltip.info.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-sage-600 font-medium">{tooltip.info.streak}d streak</span>
                      <span className="text-stone-300">best {tooltip.info.bestStreak}d</span>
                    </div>
                    {tooltip.info.health !== 'healthy' && <p className="text-xs text-amber-600 capitalize">{tooltip.info.health}</p>}
                  </div>
                )}
                {tooltip.info.type === 'pomodoro' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-800">{tooltip.info.taskTitle}</p>
                    <p className="text-xs text-stone-400">{tooltip.info.durationMinutes} min focus</p>
                    <p className="text-xs text-stone-300">{new Date(tooltip.info.completedAt).toLocaleDateString()} {new Date(tooltip.info.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                )}
                {tooltip.info.type === 'trophy' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-800">{tooltip.info.title}</p>
                    <p className="text-xs text-amber-600 font-medium">{tooltip.info.trophyName}</p>
                    <p className="text-xs text-stone-400">{tooltip.info.stepCount} steps conquered</p>
                    <p className="text-xs text-stone-300">{new Date(tooltip.info.completedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {tooltip.info.type === 'audit' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-800">Time Audit</p>
                    <p className="text-xs text-stone-400">{tooltip.info.entryCount} entries logged</p>
                    <p className="text-xs text-stone-300">{new Date(tooltip.info.completedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {tooltip.info.type === 'prayer' && (
                  <div><p className="text-sm font-medium text-stone-800">Prayer completed</p></div>
                )}
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

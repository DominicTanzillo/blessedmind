import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import PlantSVG from './PlantSVG'
import BushSVG from './BushSVG'
import WhiteRoseSVG from './WhiteRoseSVG'
import TrophySVG, { trophyVariantFromId, trophyTier, getTrophyConfig } from './TrophySVG'
import AuditBouquetSVG from './AuditBouquetSVG'
import { plantStage } from '../../hooks/useHabitTemplates'
import type { Grind, Pomodoro, PlantHealth, Task, TimeAudit } from '../../types'

const CELL = 44

function pomodoroStage(d: number): 0 | 1 | 2 | 3 | 4 {
  if (d >= 60) return 4; if (d >= 30) return 3; if (d >= 15) return 2; return 1
}
function colorFromId(id: string): number {
  let h = 0; for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0; return (h >>> 0) % 10
}
function cellHash(r: number, c: number): number {
  let h = r * 7919 + c * 104729; h = ((h >> 16) ^ h) * 0x45d9f3b; h = ((h >> 16) ^ h) * 0x45d9f3b; return ((h >> 16) ^ h) & 0x7fffffff
}

type TooltipInfo =
  | { type: 'habit'; title: string; createdAt: string; streak: number; bestStreak: number; health: PlantHealth }
  | { type: 'pomodoro'; taskTitle: string; durationMinutes: number; completedAt: string }
  | { type: 'trophy'; title: string; completedAt: string; stepCount: number; trophyName: string }
  | { type: 'audit'; completedAt: string; entryCount: number }
  | { type: 'prayer' }

type CellContent =
  | { type: 'habit'; grind: Grind; corner: 'tl' | 'tr' | 'bl' | 'br'; health: PlantHealth }
  | { type: 'pomodoro'; pomodoro: Pomodoro; colorIndex: number }
  | { type: 'trophy'; task: Task }
  | { type: 'audit'; audit: TimeAudit }
  | { type: 'prayer'; title: string }
  | { type: 'path' }
  | { type: 'empty' }

interface Props {
  grinds: Grind[]
  retiredGrinds: Grind[]
  pomodoros: Pomodoro[]
  prayerCount: number
  healthMap: Map<string, PlantHealth>
  completedHydras?: Task[]
  completedAudits?: TimeAudit[]
}

// ── Zone layout ──────────────────────────────────────────────
// Back (top): Habits — large 2×2 plants
// Left: Prayer garden — white roses
// Center: Stone path running top to bottom
// Right: Trophy display — trophies + audits
// Front (bottom): Pomodoro grove — bushes

function buildZonedGrid(
  habits: Grind[],
  pomodoros: Pomodoro[],
  trophies: Task[],
  audits: TimeAudit[],
  prayerCount: number,
  healthMap: Map<string, PlantHealth>,
) {
  const trophyItems = trophies.length + audits.length
  const prayerItems = prayerCount

  // Zone column allocation: [prayers] [path] [trophies]
  const prayerCols = Math.max(2, Math.ceil(Math.sqrt(prayerItems)))
  const trophyCols = Math.max(2, Math.ceil(Math.sqrt(trophyItems)))
  const pathCol = prayerCols // path is one column wide
  const gridW = prayerCols + 1 + trophyCols

  // Zone row allocation
  const habitRows = habits.length > 0 ? 3 : 0 // 2 rows for 2×2 + 1 gap
  const prayerRows = prayerItems > 0 ? Math.ceil(prayerItems / prayerCols) : 0
  const trophyRows = trophyItems > 0 ? Math.ceil(trophyItems / trophyCols) : 0
  const middleRows = Math.max(prayerRows, trophyRows, 1)
  const pomodoroRowWidth = gridW
  const pomoRows = pomodoros.length > 0 ? Math.max(1, Math.ceil(pomodoros.length / pomodoroRowWidth)) : 0
  const gridH = Math.max(habitRows + middleRows + (pomoRows > 0 ? 1 + pomoRows : 0), 6)

  // Build empty grid
  const g: CellContent[][] = Array.from({ length: gridH }, () =>
    Array.from({ length: gridW }, () => ({ type: 'empty' as const }))
  )

  // Place path (vertical center column, full height)
  for (let r = 0; r < gridH; r++) {
    if (pathCol < gridW) g[r][pathCol] = { type: 'path' }
  }

  // Place habits (back/top, centered across grid, 2×2 each)
  const allHabits = [...habits].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(0, 4)
  allHabits.forEach((grind, i) => {
    // Position 2×2 blocks across the top, centered
    const startCol = i * 2
    if (startCol + 1 >= gridW) return
    const health = healthMap.get(grind.id) ?? 'healthy'
    const r = 0
    const c = Math.min(startCol, gridW - 2)
    // Skip if overlaps path
    if (c === pathCol || c + 1 === pathCol) return
    g[r][c] = { type: 'habit', grind, corner: 'tl', health }
    g[r][c + 1] = { type: 'habit', grind, corner: 'tr', health }
    g[r + 1][c] = { type: 'habit', grind, corner: 'bl', health }
    g[r + 1][c + 1] = { type: 'habit', grind, corner: 'br', health }
  })

  // Place prayers (left zone, below habits)
  const prayerStartRow = habitRows
  let prayerPlaced = 0
  for (let r = prayerStartRow; r < gridH && prayerPlaced < prayerCount; r++) {
    for (let c = 0; c < pathCol && prayerPlaced < prayerCount; c++) {
      if (g[r][c].type === 'empty') {
        g[r][c] = { type: 'prayer', title: 'Prayer' }
        prayerPlaced++
      }
    }
  }

  // Place trophies + audits (right zone, below habits)
  const trophyStartRow = habitRows
  const trophyStartCol = pathCol + 1
  const sortedTrophies = [...trophies].sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())
  const sortedAudits = [...audits].sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())

  let tIdx = 0, aIdx = 0
  for (let r = trophyStartRow; r < gridH; r++) {
    for (let c = trophyStartCol; c < gridW; c++) {
      if (g[r][c].type !== 'empty') continue
      if (tIdx < sortedTrophies.length) {
        g[r][c] = { type: 'trophy', task: sortedTrophies[tIdx++] }
      } else if (aIdx < sortedAudits.length) {
        g[r][c] = { type: 'audit', audit: sortedAudits[aIdx++] }
      }
    }
  }

  // Place pomodoros (front/bottom rows, full width)
  const pomoStartRow = habitRows + middleRows
  const sortedPomos = [...pomodoros].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
  let pIdx = 0
  for (let r = pomoStartRow; r < gridH && pIdx < sortedPomos.length; r++) {
    for (let c = 0; c < gridW && pIdx < sortedPomos.length; c++) {
      if (g[r][c].type === 'empty') {
        g[r][c] = { type: 'pomodoro', pomodoro: sortedPomos[pIdx], colorIndex: colorFromId(sortedPomos[pIdx].id) }
        pIdx++
      }
    }
  }

  return { grid: g, gridW, gridH }
}

// ── Component ────────────────────────────────────────────────

export default function TerrariumGrid({ grinds, retiredGrinds, pomodoros, prayerCount, healthMap, completedHydras = [], completedAudits = [] }: Props) {
  const [tooltip, setTooltip] = useState<{ info: TooltipInfo; x: number; y: number } | null>(null)

  const allHabits = useMemo(() =>
    [...grinds, ...retiredGrinds].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(0, 4),
    [grinds, retiredGrinds]
  )

  const initialLayout = useMemo(() =>
    buildZonedGrid(allHabits, pomodoros, completedHydras, completedAudits, prayerCount, healthMap),
    [allHabits, pomodoros, completedHydras, completedAudits, prayerCount, healthMap]
  )

  const [grid, setGrid] = useState(initialLayout.grid)
  const [gridW, setGridW] = useState(initialLayout.gridW)
  const [gridH, setGridH] = useState(initialLayout.gridH)

  useEffect(() => {
    setGrid(initialLayout.grid)
    setGridW(initialLayout.gridW)
    setGridH(initialLayout.gridH)
  }, [initialLayout])

  // ── Drag and drop ────────────────────────────────────────
  const dragSrc = useRef<{ r: number; c: number } | null>(null)
  const [dragOver, setDragOver] = useState<{ r: number; c: number } | null>(null)

  const handleDragStart = useCallback((r: number, c: number) => {
    dragSrc.current = { r, c }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, r: number, c: number) => {
    e.preventDefault()
    setDragOver({ r, c })
  }, [])

  const handleDrop = useCallback((r: number, c: number) => {
    const src = dragSrc.current
    if (!src || (src.r === r && src.c === c)) {
      dragSrc.current = null
      setDragOver(null)
      return
    }
    // Don't allow swapping with habit sub-cells or path
    const srcCell = grid[src.r]?.[src.c]
    const dstCell = grid[r]?.[c]
    if (!srcCell || !dstCell) { dragSrc.current = null; setDragOver(null); return }
    if (srcCell.type === 'habit' || dstCell.type === 'habit') { dragSrc.current = null; setDragOver(null); return }
    if (srcCell.type === 'path' || dstCell.type === 'path') { dragSrc.current = null; setDragOver(null); return }

    setGrid(prev => {
      const next = prev.map(row => [...row])
      next[r][c] = prev[src.r][src.c]
      next[src.r][src.c] = prev[r][c]
      return next
    })
    dragSrc.current = null
    setDragOver(null)
  }, [grid])

  const handleDragEnd = useCallback(() => {
    dragSrc.current = null
    setDragOver(null)
  }, [])

  // ── Tooltip ──────────────────────────────────────────────
  const handlePlantClick = useCallback((info: TooltipInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).closest('.terrarium-container')?.getBoundingClientRect()
    if (!rect) return
    setTooltip({ info, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const dismissTooltip = useCallback(() => setTooltip(null), [])

  const gridPx = gridW * CELL
  const gridPxH = gridH * CELL

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
            width: gridPx, height: gridPxH,
            transform: 'rotateX(55deg) rotateZ(45deg)',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
          onClick={dismissTooltip}
        >
          {/* Ground */}
          <div className="absolute inset-0 rounded-lg" style={{
            background: 'linear-gradient(135deg, #b3bda3 0%, #95a383 30%, #7ba887 60%, #788764 100%)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          }} />
          <div className="absolute inset-0 rounded-lg" style={{
            background: 'radial-gradient(ellipse at 30% 40%, rgba(200,220,190,0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(180,200,170,0.15) 0%, transparent 40%)',
          }} />

          {/* Grid lines */}
          {Array.from({ length: Math.max(gridW, gridH) + 1 }).map((_, i) => (
            <div key={`line-${i}`}>
              {i <= gridH && <div className="absolute" style={{ left: 0, right: 0, top: i * CELL, height: 1, background: 'rgba(30,80,20,0.06)' }} />}
              {i <= gridW && <div className="absolute" style={{ top: 0, bottom: 0, left: i * CELL, width: 1, background: 'rgba(30,80,20,0.06)' }} />}
            </div>
          ))}

          {/* Cells */}
          {grid.map((row, r) => row.map((cell, c) => {
            const key = `${r}-${c}`
            const isDragTarget = dragOver?.r === r && dragOver?.c === c

            // ── Path stones ──
            if (cell.type === 'path') {
              return (
                <div key={key} className="absolute" style={{ left: c * CELL, top: r * CELL, width: CELL, height: CELL }}>
                  <svg className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <ellipse cx="18" cy="18" rx="14" ry="12" fill="rgba(160,150,130,0.35)" />
                    <ellipse cx="16" cy="16" rx="10" ry="8" fill="rgba(180,170,150,0.25)" />
                    <ellipse cx="20" cy="20" rx="8" ry="6" fill="rgba(170,160,140,0.2)" />
                  </svg>
                </div>
              )
            }

            // ── Habit plants (2×2, only render from top-left) ──
            if (cell.type === 'habit') {
              if (cell.corner !== 'tl') return null
              const stage = plantStage(cell.grind.current_streak)
              return (
                <div key={key} className="absolute" style={{
                  left: c * CELL, top: r * CELL, width: CELL * 2, height: CELL * 2,
                  transformStyle: 'preserve-3d', zIndex: 5, pointerEvents: 'none',
                }}>
                  <div className="cursor-pointer" style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(2px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -80%)',
                    transformOrigin: '0 0', transformStyle: 'preserve-3d', pointerEvents: 'auto',
                  }} onClick={(e) => handlePlantClick({
                    type: 'habit', title: cell.grind.title, createdAt: cell.grind.created_at,
                    streak: cell.grind.current_streak, bestStreak: cell.grind.best_streak, health: cell.health,
                  }, e)}>
                    <PlantSVG stage={stage} size="md" colorVariant={cell.grind.color_variant} health={cell.health} />
                  </div>
                </div>
              )
            }

            // Draggable wrapper for non-habit, non-path items
            const isDraggable = cell.type !== 'empty'
            const canDrop = cell.type === 'empty' || isDraggable

            const dragProps = isDraggable ? {
              draggable: true,
              onDragStart: () => handleDragStart(r, c),
              onDragEnd: handleDragEnd,
            } : {}

            const dropProps = canDrop ? {
              onDragOver: (e: React.DragEvent) => handleDragOver(e, r, c),
              onDrop: () => handleDrop(r, c),
            } : {}

            // ── Pomodoro bush ──
            if (cell.type === 'pomodoro') {
              const stage = pomodoroStage(cell.pomodoro.duration_minutes)
              return (
                <div key={key} className="absolute" style={{
                  left: c * CELL, top: r * CELL, width: CELL, height: CELL,
                  transformStyle: 'preserve-3d', zIndex: 3, pointerEvents: 'none',
                }} {...dropProps}>
                  <div className={`cursor-grab active:cursor-grabbing ${isDragTarget ? 'ring-2 ring-sage-400 ring-offset-1 rounded-full' : ''}`} style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(4px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -60%)',
                    transformOrigin: '0 0', pointerEvents: 'auto',
                  }} {...dragProps} onClick={(e) => handlePlantClick({
                    type: 'pomodoro', taskTitle: cell.pomodoro.task_title,
                    durationMinutes: cell.pomodoro.duration_minutes, completedAt: cell.pomodoro.completed_at,
                  }, e)}>
                    <BushSVG stage={stage} size={42} colorVariant={cell.colorIndex} />
                  </div>
                </div>
              )
            }

            // ── Trophy ──
            if (cell.type === 'trophy') {
              const variant = trophyVariantFromId(cell.task.id)
              const tier = trophyTier(cell.task.steps?.length ?? 0)
              const { name: trophyName } = getTrophyConfig(variant, tier)
              return (
                <div key={key} className="absolute" style={{
                  left: c * CELL, top: r * CELL, width: CELL, height: CELL,
                  transformStyle: 'preserve-3d', zIndex: 3, pointerEvents: 'none',
                }} {...dropProps}>
                  <div className={`cursor-grab active:cursor-grabbing ${isDragTarget ? 'ring-2 ring-sage-400 ring-offset-1 rounded-full' : ''}`} style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(4px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -75%)',
                    transformOrigin: '0 0', pointerEvents: 'auto',
                  }} {...dragProps} onClick={(e) => handlePlantClick({
                    type: 'trophy', title: cell.task.title, completedAt: cell.task.completed_at!,
                    stepCount: cell.task.steps?.length ?? 0, trophyName,
                  }, e)}>
                    <TrophySVG size={40} variant={variant} tier={tier} />
                  </div>
                </div>
              )
            }

            // ── Audit bouquet ──
            if (cell.type === 'audit') {
              return (
                <div key={key} className="absolute" style={{
                  left: c * CELL, top: r * CELL, width: CELL, height: CELL,
                  transformStyle: 'preserve-3d', zIndex: 3, pointerEvents: 'none',
                }} {...dropProps}>
                  <div className={`cursor-grab active:cursor-grabbing ${isDragTarget ? 'ring-2 ring-sage-400 ring-offset-1 rounded-full' : ''}`} style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(4px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -65%)',
                    transformOrigin: '0 0', pointerEvents: 'auto',
                  }} {...dragProps} onClick={(e) => handlePlantClick({
                    type: 'audit', completedAt: cell.audit.completed_at!, entryCount: cell.audit.entries.length,
                  }, e)}>
                    <AuditBouquetSVG size={40} />
                  </div>
                </div>
              )
            }

            // ── Prayer rose ──
            if (cell.type === 'prayer') {
              return (
                <div key={key} className="absolute" style={{
                  left: c * CELL, top: r * CELL, width: CELL, height: CELL,
                  transformStyle: 'preserve-3d', zIndex: 3, pointerEvents: 'none',
                }} {...dropProps}>
                  <div className={`cursor-grab active:cursor-grabbing ${isDragTarget ? 'ring-2 ring-sage-400 ring-offset-1 rounded-full' : ''}`} style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(2px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -60%)',
                    transformOrigin: '0 0', pointerEvents: 'auto',
                  }} {...dragProps} onClick={(e) => handlePlantClick({ type: 'prayer' }, e)}>
                    <WhiteRoseSVG size={38} />
                  </div>
                </div>
              )
            }

            // ── Empty cell (drop target + ambient decoration) ──
            const hash = cellHash(r, c)
            return (
              <div
                key={key}
                className={`absolute ${isDragTarget ? 'bg-sage-300/30 rounded' : ''}`}
                style={{ left: c * CELL, top: r * CELL, width: CELL, height: CELL }}
                {...dropProps}
              >
                {hash % 7 === 0 && (
                  <svg className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M6 9 L4 3 L6 5 L8 2 L6 5 L9 4 L6 9Z" fill="rgba(80,140,50,0.25)" />
                  </svg>
                )}
                {hash % 11 === 0 && (
                  <svg className="absolute" style={{ left: '40%', top: '55%', transform: 'translate(-50%, -50%)' }} width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <ellipse cx="4" cy="3" rx="3.5" ry="2.5" fill="rgba(120,115,100,0.2)" />
                  </svg>
                )}
                {hash % 17 === 0 && (
                  <svg className="absolute" style={{ left: '60%', top: '45%', transform: 'translate(-50%, -50%)' }} width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <circle cx="4" cy="4" r="2" fill="rgba(255,220,180,0.3)" />
                    <circle cx="4" cy="4" r="0.8" fill="rgba(220,180,100,0.4)" />
                  </svg>
                )}
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
                onClick={(e) => e.stopPropagation()}
              >
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

      {(pomodoros.length > 0 || prayerCount > 0 || completedHydras.length > 0 || completedAudits.length > 0) && (
        <p className="text-center text-[10px] text-stone-300">
          {[
            pomodoros.length > 0 && `${pomodoros.length} pomodoro${pomodoros.length !== 1 ? 's' : ''}`,
            completedHydras.length > 0 && `${completedHydras.length} troph${completedHydras.length !== 1 ? 'ies' : 'y'}`,
            completedAudits.length > 0 && `${completedAudits.length} audit${completedAudits.length !== 1 ? 's' : ''}`,
            prayerCount > 0 && `${prayerCount} rose${prayerCount !== 1 ? 's' : ''}`,
          ].filter(Boolean).join(' · ')}
          {' · drag to rearrange'}
        </p>
      )}
    </div>
  )
}

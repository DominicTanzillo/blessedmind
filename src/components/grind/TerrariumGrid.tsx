import { useMemo, useState, useCallback } from 'react'
import PlantSVG from './PlantSVG'
import BushSVG from './BushSVG'
import WhiteRoseSVG from './WhiteRoseSVG'
import TrophySVG, { trophyVariantFromId, trophyTier, getTrophyConfig } from './TrophySVG'
import AuditBouquetSVG from './AuditBouquetSVG'
import { plantStage } from '../../hooks/useGrinds'
import type { Grind, Pomodoro, PlantHealth, Task, TimeAudit } from '../../types'

const MIN_GRID = 8
const CELL_SIZE = 44

function pomodoroStage(durationMinutes: number): 0 | 1 | 2 | 3 | 4 {
  if (durationMinutes >= 60) return 4
  if (durationMinutes >= 30) return 3
  if (durationMinutes >= 15) return 2
  return 1
}

/** Stable color from pomodoro ID so it never changes */
function pomodoroColorFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 10)
}

/** Deterministic pseudo-random from cell coords */
function cellHash(r: number, c: number): number {
  let h = r * 7919 + c * 104729
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = ((h >> 16) ^ h) * 0x45d9f3b
  return ((h >> 16) ^ h) & 0x7fffffff
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

export default function TerrariumGrid({ grinds, retiredGrinds, pomodoros, prayerCount, healthMap, completedHydras = [], completedAudits = [] }: Props) {
  const [tooltip, setTooltip] = useState<{ info: TooltipInfo; x: number; y: number } | null>(null)

  const { grid, gridSize, totalItems } = useMemo(() => {
    // Merge and sort all habits by creation date for stable positions
    const allHabits = [...grinds, ...retiredGrinds]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 4)
    const total = allHabits.length * 4 + pomodoros.length + completedHydras.length + completedAudits.length + prayerCount
    let size = MIN_GRID
    while (size * size < total + 8) size += 2

    const center = size / 2
    // Fixed habit positions — sorted by creation date, each always in the same quadrant
    const habitPositions: [number, number][] = [
      [center - 2, center - 2],
      [center - 2, center],
      [center, center - 2],
      [center, center],
    ]

    // Spiral order from center — stable because offset from center is constant
    const spiralCells: [number, number][] = []
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        spiralCells.push([r, c])
      }
    }
    spiralCells.sort((a, b) => {
      const dA = Math.abs(a[0] - center + 0.5) + Math.abs(a[1] - center + 0.5)
      const dB = Math.abs(b[0] - center + 0.5) + Math.abs(b[1] - center + 0.5)
      return dA - dB
    })

    const g: CellContent[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({ type: 'empty' as const }))
    )
    const occupied = new Set<string>()

    // Place habits (active + retired)
    allHabits.forEach((grind, i) => {
      const [r, c] = habitPositions[i]
      const health = healthMap.get(grind.id) ?? 'healthy'
      g[r][c] = { type: 'habit', grind, corner: 'tl', health }
      g[r][c + 1] = { type: 'habit', grind, corner: 'tr', health }
      g[r + 1][c] = { type: 'habit', grind, corner: 'bl', health }
      g[r + 1][c + 1] = { type: 'habit', grind, corner: 'br', health }
      for (const [dr, dc] of [[0,0],[0,1],[1,0],[1,1]]) occupied.add(`${r+dr},${c+dc}`)
    })

    // Place pomodoros — oldest first so existing plants keep their positions
    const sorted = [...pomodoros].sort(
      (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    )
    let pi = 0
    for (const [r, c] of spiralCells) {
      if (pi >= sorted.length) break
      if (occupied.has(`${r},${c}`)) continue
      g[r][c] = { type: 'pomodoro', pomodoro: sorted[pi], colorIndex: pomodoroColorFromId(sorted[pi].id) }
      occupied.add(`${r},${c}`)
      pi++
    }

    // Place trophies — completed hydra tasks
    const sortedHydras = [...completedHydras].sort(
      (a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime()
    )
    let ti = 0
    for (const [r, c] of spiralCells) {
      if (ti >= sortedHydras.length) break
      if (occupied.has(`${r},${c}`)) continue
      g[r][c] = { type: 'trophy', task: sortedHydras[ti] }
      occupied.add(`${r},${c}`)
      ti++
    }

    // Place audit bouquets
    const sortedAudits = [...completedAudits].sort(
      (a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime()
    )
    let ai = 0
    for (const [r, c] of spiralCells) {
      if (ai >= sortedAudits.length) break
      if (occupied.has(`${r},${c}`)) continue
      g[r][c] = { type: 'audit', audit: sortedAudits[ai] }
      occupied.add(`${r},${c}`)
      ai++
    }

    // Place prayer roses
    let prayersPlaced = 0
    for (const [r, c] of spiralCells) {
      if (prayersPlaced >= prayerCount) break
      if (occupied.has(`${r},${c}`)) continue
      g[r][c] = { type: 'prayer', title: 'Prayer' }
      occupied.add(`${r},${c}`)
      prayersPlaced++
    }

    return { grid: g, gridSize: size, totalItems: total }
  }, [grinds, retiredGrinds, pomodoros, prayerCount, healthMap, completedHydras, completedAudits])

  const handlePlantClick = useCallback((info: TooltipInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).closest('.terrarium-container')?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      info,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const dismissTooltip = useCallback(() => setTooltip(null), [])

  const gridPx = gridSize * CELL_SIZE

  // Decoration thresholds
  const showStream = totalItems >= 10
  const showBirdbath = totalItems >= 20

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Garden</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      <div
        className="flex justify-center"
        style={{ perspective: '900px', perspectiveOrigin: '50% 40%' }}
      >
        <div
          className="terrarium-container"
          style={{
            width: gridPx,
            height: gridPx,
            transform: 'rotateX(55deg) rotateZ(45deg)',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
          onClick={dismissTooltip}
        >
          {/* Sage lawn ground — matches app palette */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #b3bda3 0%, #95a383 30%, #7ba887 60%, #788764 100%)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          />

          {/* Subtle lighter patches */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'radial-gradient(ellipse at 30% 40%, rgba(200,220,190,0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(180,200,170,0.15) 0%, transparent 40%)',
            }}
          />

          {/* Grid lines */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <div key={`line-${i}`}>
              <div className="absolute" style={{ left: 0, right: 0, top: i * CELL_SIZE, height: 1, background: 'rgba(30,80,20,0.08)' }} />
              <div className="absolute" style={{ top: 0, bottom: 0, left: i * CELL_SIZE, width: 1, background: 'rgba(30,80,20,0.08)' }} />
            </div>
          ))}

          {/* Stream decoration */}
          {showStream && (
            <svg
              className="absolute"
              style={{ left: 0, top: 0, width: gridPx, height: gridPx, pointerEvents: 'none', zIndex: 1 }}
              viewBox={`0 0 ${gridPx} ${gridPx}`}
            >
              <defs>
                <linearGradient id="stream-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6ab8d7" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#5aaac8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#4a9ab8" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path
                d={`M0,${gridPx * 0.3} Q${gridPx * 0.2},${gridPx * 0.25} ${gridPx * 0.35},${gridPx * 0.4} Q${gridPx * 0.5},${gridPx * 0.55} ${gridPx * 0.65},${gridPx * 0.5} Q${gridPx * 0.8},${gridPx * 0.45} ${gridPx},${gridPx * 0.6}`}
                stroke="url(#stream-grad)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d={`M0,${gridPx * 0.3} Q${gridPx * 0.2},${gridPx * 0.25} ${gridPx * 0.35},${gridPx * 0.4} Q${gridPx * 0.5},${gridPx * 0.55} ${gridPx * 0.65},${gridPx * 0.5} Q${gridPx * 0.8},${gridPx * 0.45} ${gridPx},${gridPx * 0.6}`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="4 8"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="3s" repeatCount="indefinite" />
              </path>
            </svg>
          )}

          {/* Birdbath decoration */}
          {showBirdbath && (
            <div
              className="absolute"
              style={{
                left: CELL_SIZE * 1,
                top: CELL_SIZE * 1,
                width: CELL_SIZE,
                height: CELL_SIZE,
                transformStyle: 'preserve-3d',
                zIndex: 2,
              }}
            >
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translateZ(3px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -50%)',
                transformOrigin: '0 0',
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  {/* Pedestal */}
                  <rect x="14" y="20" width="4" height="8" rx="1" fill="#a0968a" />
                  <rect x="11" y="27" width="10" height="3" rx="1" fill="#8a8078" />
                  {/* Bowl */}
                  <ellipse cx="16" cy="20" rx="10" ry="4" fill="#b0a698" />
                  <ellipse cx="16" cy="19.5" rx="8" ry="3" fill="#c8e0f0" />
                  {/* Water shimmer */}
                  <ellipse cx="14" cy="19" rx="3" ry="1" fill="rgba(255,255,255,0.3)" />
                </svg>
              </div>
            </div>
          )}

          {/* Plants and decorations */}
          {grid.flat().map((cell, i) => {
            const r = Math.floor(i / gridSize)
            const c = i % gridSize

            if (cell.type === 'habit') {
              if (cell.corner !== 'tl') return null
              const stage = plantStage(cell.grind.current_streak)
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute cursor-pointer"
                  style={{
                    left: c * CELL_SIZE,
                    top: r * CELL_SIZE,
                    width: CELL_SIZE * 2,
                    height: CELL_SIZE * 2,
                    transformStyle: 'preserve-3d',
                    zIndex: 5,
                  }}
                  onClick={(e) => handlePlantClick({
                    type: 'habit',
                    title: cell.grind.title,
                    createdAt: cell.grind.created_at,
                    streak: cell.grind.current_streak,
                    bestStreak: cell.grind.best_streak,
                    health: cell.health,
                  }, e)}
                >
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(2px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -80%)',
                    transformOrigin: '0 0', transformStyle: 'preserve-3d',
                  }}>
                    <PlantSVG stage={stage} size="lg" colorVariant={cell.grind.color_variant} health={cell.health} />
                  </div>
                </div>
              )
            }

            if (cell.type === 'pomodoro') {
              const stage = pomodoroStage(cell.pomodoro.duration_minutes)
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute cursor-pointer"
                  style={{
                    left: c * CELL_SIZE, top: r * CELL_SIZE,
                    width: CELL_SIZE, height: CELL_SIZE,
                    transformStyle: 'preserve-3d',
                    zIndex: 3,
                  }}
                  onClick={(e) => handlePlantClick({
                    type: 'pomodoro',
                    taskTitle: cell.pomodoro.task_title,
                    durationMinutes: cell.pomodoro.duration_minutes,
                    completedAt: cell.pomodoro.completed_at,
                  }, e)}
                >
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(4px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -50%)',
                    transformOrigin: '0 0',
                  }}>
                    <BushSVG stage={stage} size={40} colorVariant={cell.colorIndex} />
                  </div>
                </div>
              )
            }

            if (cell.type === 'trophy') {
              const variant = trophyVariantFromId(cell.task.id)
              const tier = trophyTier(cell.task.steps?.length ?? 0)
              const { name: trophyName } = getTrophyConfig(variant, tier)
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute cursor-pointer"
                  style={{
                    left: c * CELL_SIZE, top: r * CELL_SIZE,
                    width: CELL_SIZE, height: CELL_SIZE,
                    transformStyle: 'preserve-3d',
                    zIndex: 3,
                  }}
                  onClick={(e) => handlePlantClick({
                    type: 'trophy',
                    title: cell.task.title,
                    completedAt: cell.task.completed_at!,
                    stepCount: cell.task.steps?.length ?? 0,
                    trophyName,
                  }, e)}
                >
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(4px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -50%)',
                    transformOrigin: '0 0',
                  }}>
                    <TrophySVG size={36} variant={variant} tier={tier} />
                  </div>
                </div>
              )
            }

            if (cell.type === 'audit') {
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute cursor-pointer"
                  style={{
                    left: c * CELL_SIZE, top: r * CELL_SIZE,
                    width: CELL_SIZE, height: CELL_SIZE,
                    transformStyle: 'preserve-3d',
                    zIndex: 3,
                  }}
                  onClick={(e) => handlePlantClick({
                    type: 'audit',
                    completedAt: cell.audit.completed_at!,
                    entryCount: cell.audit.entries.length,
                  }, e)}
                >
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(4px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -50%)',
                    transformOrigin: '0 0',
                  }}>
                    <AuditBouquetSVG size={36} />
                  </div>
                </div>
              )
            }

            if (cell.type === 'prayer') {
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute cursor-pointer"
                  style={{
                    left: c * CELL_SIZE, top: r * CELL_SIZE,
                    width: CELL_SIZE, height: CELL_SIZE,
                    transformStyle: 'preserve-3d',
                    zIndex: 3,
                  }}
                  onClick={(e) => handlePlantClick({ type: 'prayer' }, e)}
                >
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(2px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -50%)',
                    transformOrigin: '0 0',
                  }}>
                    <WhiteRoseSVG size={36} />
                  </div>
                </div>
              )
            }

            // Empty cell — ambient decorations
            const hash = cellHash(r, c)
            return (
              <div
                key={`${r}-${c}`}
                className="absolute"
                style={{ left: c * CELL_SIZE, top: r * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
              >
                {hash % 7 === 0 && (
                  // Grass tuft
                  <svg className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M6 9 L4 3 L6 5 L8 2 L6 5 L9 4 L6 9Z" fill="rgba(80,140,50,0.25)" />
                  </svg>
                )}
                {hash % 11 === 0 && (
                  // Small stone
                  <svg className="absolute" style={{ left: '40%', top: '55%', transform: 'translate(-50%, -50%)' }} width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <ellipse cx="4" cy="3" rx="3.5" ry="2.5" fill="rgba(120,115,100,0.2)" />
                  </svg>
                )}
                {hash % 17 === 0 && (
                  // Tiny flower
                  <svg className="absolute" style={{ left: '60%', top: '45%', transform: 'translate(-50%, -50%)' }} width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <circle cx="4" cy="4" r="2" fill="rgba(255,220,180,0.3)" />
                    <circle cx="4" cy="4" r="0.8" fill="rgba(220,180,100,0.4)" />
                  </svg>
                )}
                {hash % 23 === 0 && (
                  // Mushroom
                  <svg className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <rect x="4.2" y="6" width="1.6" height="3" rx="0.5" fill="rgba(200,190,170,0.3)" />
                    <ellipse cx="5" cy="6" rx="3" ry="2" fill="rgba(180,100,80,0.2)" />
                    <ellipse cx="4" cy="5.5" rx="0.5" ry="0.4" fill="rgba(255,255,255,0.2)" />
                  </svg>
                )}
              </div>
            )
          })}

          {/* Tooltip overlay */}
          {tooltip && (
            <div
              className="absolute"
              style={{
                left: tooltip.x,
                top: tooltip.y - 10,
                transform: 'rotateZ(-45deg) rotateX(-55deg) translateZ(20px)',
                transformStyle: 'preserve-3d',
                zIndex: 100,
              }}
            >
              <div
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 px-3 py-2 text-left"
                style={{
                  transform: 'translate(-50%, -100%)',
                  minWidth: 140,
                  maxWidth: 200,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {tooltip.info.type === 'habit' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-800">{tooltip.info.title}</p>
                    <p className="text-xs text-stone-400">
                      Planted {new Date(tooltip.info.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-sage-600 font-medium">{tooltip.info.streak}d streak</span>
                      <span className="text-stone-300">best {tooltip.info.bestStreak}d</span>
                    </div>
                    {tooltip.info.health !== 'healthy' && (
                      <p className="text-xs text-amber-600 capitalize">{tooltip.info.health}</p>
                    )}
                  </div>
                )}
                {tooltip.info.type === 'pomodoro' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-800">{tooltip.info.taskTitle}</p>
                    <p className="text-xs text-stone-400">{tooltip.info.durationMinutes} min focus</p>
                    <p className="text-xs text-stone-300">
                      {new Date(tooltip.info.completedAt).toLocaleDateString()}{' '}
                      {new Date(tooltip.info.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                )}
                {tooltip.info.type === 'trophy' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-800">{tooltip.info.title}</p>
                    <p className="text-xs text-amber-600 font-medium">{tooltip.info.trophyName}</p>
                    <p className="text-xs text-stone-400">{tooltip.info.stepCount} steps conquered</p>
                    <p className="text-xs text-stone-300">
                      {new Date(tooltip.info.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {tooltip.info.type === 'audit' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-800">Time Audit</p>
                    <p className="text-xs text-stone-400">{tooltip.info.entryCount} entries logged</p>
                    <p className="text-xs text-stone-300">
                      {new Date(tooltip.info.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {tooltip.info.type === 'prayer' && (
                  <div>
                    <p className="text-sm font-medium text-stone-800">Prayer completed</p>
                  </div>
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
        </p>
      )}
    </div>
  )
}

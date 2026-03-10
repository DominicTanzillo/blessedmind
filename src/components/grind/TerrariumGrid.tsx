import { useMemo } from 'react'
import PlantSVG from './PlantSVG'
import WhiteRoseSVG from './WhiteRoseSVG'
import { plantStage } from '../../hooks/useGrinds'
import type { Grind, Pomodoro, PlantHealth } from '../../types'

const MIN_GRID = 8
const CELL_SIZE = 44 // slightly larger for breathing room

function pomodoroStage(durationMinutes: number): 0 | 1 | 2 | 3 | 4 {
  if (durationMinutes >= 60) return 4
  if (durationMinutes >= 30) return 3
  if (durationMinutes >= 15) return 2
  return 1
}

function pomodoroColorVariant(index: number): number {
  return index % 5
}

type CellContent =
  | { type: 'habit'; grind: Grind; corner: 'tl' | 'tr' | 'bl' | 'br'; health: PlantHealth }
  | { type: 'pomodoro'; pomodoro: Pomodoro; colorIndex: number }
  | { type: 'prayer'; title: string }
  | { type: 'empty' }

interface Props {
  grinds: Grind[]
  retiredGrinds: Grind[]
  pomodoros: Pomodoro[]
  prayerCount: number
  healthMap: Map<string, PlantHealth>
}

export default function TerrariumGrid({ grinds, retiredGrinds, pomodoros, prayerCount, healthMap }: Props) {
  const { grid, gridSize } = useMemo(() => {
    const allHabits = [...grinds, ...retiredGrinds].slice(0, 4)
    const totalItems = allHabits.length * 4 + pomodoros.length + prayerCount
    // Expand grid if needed — always even so habits center nicely
    let size = MIN_GRID
    while (size * size < totalItems + 8) size += 2

    const center = size / 2
    // 2x2 habit positions near center
    const habitPositions: [number, number][] = [
      [center - 2, center - 2],
      [center - 2, center],
      [center, center - 2],
      [center, center],
    ]

    // Spiral order from center
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

    // Place habits
    allHabits.forEach((grind, i) => {
      const [r, c] = habitPositions[i]
      const health = healthMap.get(grind.id) ?? 'healthy'
      g[r][c] = { type: 'habit', grind, corner: 'tl', health }
      g[r][c + 1] = { type: 'habit', grind, corner: 'tr', health }
      g[r + 1][c] = { type: 'habit', grind, corner: 'bl', health }
      g[r + 1][c + 1] = { type: 'habit', grind, corner: 'br', health }
      for (const [dr, dc] of [[0,0],[0,1],[1,0],[1,1]]) occupied.add(`${r+dr},${c+dc}`)
    })

    // Place pomodoros (newest first, closest to center)
    const sorted = [...pomodoros].sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )
    let pi = 0
    for (const [r, c] of spiralCells) {
      if (pi >= sorted.length) break
      if (occupied.has(`${r},${c}`)) continue
      g[r][c] = { type: 'pomodoro', pomodoro: sorted[pi], colorIndex: pi }
      occupied.add(`${r},${c}`)
      pi++
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

    return { grid: g, gridSize: size }
  }, [grinds, retiredGrinds, pomodoros, prayerCount, healthMap])

  const gridPx = gridSize * CELL_SIZE

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Terrarium</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      <div
        className="flex justify-center"
        style={{ perspective: '900px', perspectiveOrigin: '50% 40%' }}
      >
        <div
          style={{
            width: gridPx,
            height: gridPx,
            transform: 'rotateX(55deg) rotateZ(45deg)',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          {/* Soil */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 50%, #ddd5c5 100%)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          />

          {/* Grid lines */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <div key={`line-${i}`}>
              <div className="absolute bg-amber-900/8" style={{ left: 0, right: 0, top: i * CELL_SIZE, height: 1 }} />
              <div className="absolute bg-amber-900/8" style={{ top: 0, bottom: 0, left: i * CELL_SIZE, width: 1 }} />
            </div>
          ))}

          {/* Plants */}
          {grid.flat().map((cell, i) => {
            const r = Math.floor(i / gridSize)
            const c = i % gridSize

            if (cell.type === 'habit') {
              if (cell.corner !== 'tl') return null
              const stage = plantStage(cell.grind.current_streak)
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute"
                  style={{
                    left: c * CELL_SIZE,
                    top: r * CELL_SIZE,
                    width: CELL_SIZE * 2,
                    height: CELL_SIZE * 2,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(2px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -100%)',
                    transformOrigin: '0 0', transformStyle: 'preserve-3d',
                  }}>
                    <div className="flex flex-col items-center">
                      <PlantSVG stage={stage} size="lg" colorVariant={cell.grind.color_variant} health={cell.health} />
                      <span className="text-[8px] text-stone-600 font-medium truncate text-center leading-tight mt-0.5 whitespace-nowrap" style={{ maxWidth: '90px' }}>
                        {cell.grind.title}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }

            if (cell.type === 'pomodoro') {
              const stage = pomodoroStage(cell.pomodoro.duration_minutes)
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute"
                  style={{
                    left: c * CELL_SIZE, top: r * CELL_SIZE,
                    width: CELL_SIZE, height: CELL_SIZE,
                    transformStyle: 'preserve-3d',
                  }}
                  title={`${cell.pomodoro.task_title} (${cell.pomodoro.duration_minutes}m)`}
                >
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(2px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -100%)',
                    transformOrigin: '0 0',
                  }}>
                    <PlantSVG stage={stage} size="sm" colorVariant={pomodoroColorVariant(cell.colorIndex)} />
                  </div>
                </div>
              )
            }

            if (cell.type === 'prayer') {
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute"
                  style={{
                    left: c * CELL_SIZE, top: r * CELL_SIZE,
                    width: CELL_SIZE, height: CELL_SIZE,
                    transformStyle: 'preserve-3d',
                  }}
                  title="Prayer completed"
                >
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translateZ(2px) rotateZ(-45deg) rotateX(-55deg) translate(-50%, -100%)',
                    transformOrigin: '0 0',
                  }}>
                    <WhiteRoseSVG size={40} />
                  </div>
                </div>
              )
            }

            // Empty — subtle grass
            return (
              <div
                key={`${r}-${c}`}
                className="absolute"
                style={{ left: c * CELL_SIZE, top: r * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
              >
                {(r + c) % 3 === 0 && (
                  <div className="absolute rounded-full bg-sage-300/15"
                    style={{ width: 4, height: 4, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {(pomodoros.length > 0 || prayerCount > 0) && (
        <p className="text-center text-[10px] text-stone-300">
          {pomodoros.length > 0 && `${pomodoros.length} pomodoro${pomodoros.length !== 1 ? 's' : ''}`}
          {pomodoros.length > 0 && prayerCount > 0 && ' · '}
          {prayerCount > 0 && `${prayerCount} rose${prayerCount !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  )
}

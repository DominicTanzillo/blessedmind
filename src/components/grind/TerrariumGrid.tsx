import PlantSVG from './PlantSVG'
import { plantStage } from '../../hooks/useGrinds'
import type { Grind, Pomodoro, PlantHealth } from '../../types'

const GRID_SIZE = 8

// 2x2 habit positions (top-left corners) — centered in grid
const HABIT_POSITIONS: [number, number][] = [
  [2, 2], [2, 4], [4, 2], [4, 4],
]

// Spiral out from center for pomodoro placement
function getSpiralOrder(): [number, number][] {
  const center = GRID_SIZE / 2
  const cells: { r: number; c: number; dist: number }[] = []

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const dist = Math.abs(r - center + 0.5) + Math.abs(c - center + 0.5)
      cells.push({ r, c, dist })
    }
  }

  cells.sort((a, b) => a.dist - b.dist)
  return cells.map(({ r, c }) => [r, c])
}

const SPIRAL = getSpiralOrder()

function pomodoroStage(durationMinutes: number): 0 | 1 | 2 | 3 | 4 {
  if (durationMinutes >= 60) return 4
  if (durationMinutes >= 30) return 3
  if (durationMinutes >= 15) return 2
  return 1 // sprout for < 15
}

function pomodoroColorVariant(index: number): number {
  return index % 5
}

interface Props {
  grinds: Grind[]
  retiredGrinds: Grind[]
  pomodoros: Pomodoro[]
  healthMap: Map<string, PlantHealth>
}

type CellContent =
  | { type: 'habit'; grind: Grind; corner: 'tl' | 'tr' | 'bl' | 'br'; health: PlantHealth }
  | { type: 'pomodoro'; pomodoro: Pomodoro; colorIndex: number }
  | { type: 'empty' }

// The ground tilts but plants must stand upright.
// Parent applies: rotateX(55deg) rotateZ(45deg)
// To undo on children: rotateZ(-45deg) rotateX(-55deg)
// preserve-3d must chain through all ancestors.

export default function TerrariumGrid({ grinds, retiredGrinds, pomodoros, healthMap }: Props) {
  const grid: CellContent[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ type: 'empty' as const }))
  )

  const allHabits = [...grinds, ...retiredGrinds].slice(0, 4)
  const occupiedCells = new Set<string>()

  allHabits.forEach((grind, i) => {
    const [r, c] = HABIT_POSITIONS[i]
    const health = healthMap.get(grind.id) ?? 'healthy'
    grid[r][c] = { type: 'habit', grind, corner: 'tl', health }
    grid[r][c + 1] = { type: 'habit', grind, corner: 'tr', health }
    grid[r + 1][c] = { type: 'habit', grind, corner: 'bl', health }
    grid[r + 1][c + 1] = { type: 'habit', grind, corner: 'br', health }
    occupiedCells.add(`${r},${c}`)
    occupiedCells.add(`${r},${c + 1}`)
    occupiedCells.add(`${r + 1},${c}`)
    occupiedCells.add(`${r + 1},${c + 1}`)
  })

  const sortedPomodoros = [...pomodoros].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  )
  let pomIndex = 0
  for (const [r, c] of SPIRAL) {
    if (pomIndex >= sortedPomodoros.length) break
    if (occupiedCells.has(`${r},${c}`)) continue
    grid[r][c] = { type: 'pomodoro', pomodoro: sortedPomodoros[pomIndex], colorIndex: pomIndex }
    occupiedCells.add(`${r},${c}`)
    pomIndex++
  }

  const cellSize = 40
  const gridPx = GRID_SIZE * cellSize

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Terrarium</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      {/* Isometric wrapper — perspective on the outermost container */}
      <div
        className="flex justify-center"
        style={{ perspective: '900px', perspectiveOrigin: '50% 40%' }}
      >
        {/* Ground plane — rotated into isometric view */}
        <div
          style={{
            width: gridPx,
            height: gridPx,
            transform: 'rotateX(55deg) rotateZ(45deg)',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          {/* Soil surface */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 50%, #ddd5c5 100%)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          />

          {/* Grid lines on the ground */}
          {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
            <div key={`line-${i}`}>
              <div
                className="absolute bg-amber-900/8"
                style={{ left: 0, right: 0, top: i * cellSize, height: 1 }}
              />
              <div
                className="absolute bg-amber-900/8"
                style={{ top: 0, bottom: 0, left: i * cellSize, width: 1 }}
              />
            </div>
          ))}

          {/* Plants — each cell positioned absolutely, plant counter-rotated */}
          {grid.flat().map((cell, i) => {
            const r = Math.floor(i / GRID_SIZE)
            const c = i % GRID_SIZE

            if (cell.type === 'habit') {
              if (cell.corner !== 'tl') return null
              const stage = plantStage(cell.grind.current_streak)
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute"
                  style={{
                    left: c * cellSize,
                    top: r * cellSize,
                    width: cellSize * 2,
                    height: cellSize * 2,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'rotateZ(-45deg) rotateX(-55deg) translate(-50%, -50%)',
                      transformOrigin: '0 0',
                      transformStyle: 'preserve-3d',
                    }}
                  >
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
                    left: c * cellSize,
                    top: r * cellSize,
                    width: cellSize,
                    height: cellSize,
                    transformStyle: 'preserve-3d',
                  }}
                  title={`${cell.pomodoro.task_title} (${cell.pomodoro.duration_minutes}m)`}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'rotateZ(-45deg) rotateX(-55deg) translate(-50%, -50%)',
                      transformOrigin: '0 0',
                    }}
                  >
                    <PlantSVG stage={stage} size="sm" colorVariant={pomodoroColorVariant(cell.colorIndex)} />
                  </div>
                </div>
              )
            }

            // Empty soil — subtle dots
            return (
              <div
                key={`${r}-${c}`}
                className="absolute"
                style={{
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              >
                {(r + c) % 3 === 0 && (
                  <div
                    className="absolute rounded-full bg-sage-300/15"
                    style={{
                      width: 4, height: 4,
                      left: '50%', top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {pomodoros.length > 0 && (
        <p className="text-center text-[10px] text-stone-300">
          {pomodoros.length} pomodoro{pomodoros.length !== 1 ? 's' : ''} planted
        </p>
      )}
    </div>
  )
}

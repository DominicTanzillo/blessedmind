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

export default function TerrariumGrid({ grinds, retiredGrinds, pomodoros, healthMap }: Props) {
  // Build grid
  const grid: CellContent[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ type: 'empty' as const }))
  )

  // Place up to 4 habits (active first, then retired)
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

  // Place pomodoros in spiral order, newest first
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

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Terrarium</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      <div
        className="grid gap-0.5 mx-auto rounded-2xl bg-gradient-to-b from-amber-50/50 to-sage-50/30 border border-stone-200 p-2 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          maxWidth: '360px',
        }}
      >
        {grid.flat().map((cell, i) => {
          const r = Math.floor(i / GRID_SIZE)
          const c = i % GRID_SIZE

          if (cell.type === 'habit') {
            // Only render from top-left corner, span 2x2
            if (cell.corner !== 'tl') {
              return <div key={`${r}-${c}`} className="hidden" />
            }
            const stage = plantStage(cell.grind.current_streak)
            return (
              <div
                key={`${r}-${c}`}
                className="flex items-center justify-center bg-sage-50/50 rounded-lg"
                style={{ gridColumn: 'span 2', gridRow: 'span 2' }}
              >
                <div className="flex flex-col items-center gap-0.5 p-1">
                  <PlantSVG stage={stage} size="md" colorVariant={cell.grind.color_variant} health={cell.health} />
                  <span className="text-[9px] text-stone-500 font-medium truncate max-w-[70px] leading-tight text-center">
                    {cell.grind.title}
                  </span>
                </div>
              </div>
            )
          }

          if (cell.type === 'pomodoro') {
            const stage = pomodoroStage(cell.pomodoro.duration_minutes)
            return (
              <div
                key={`${r}-${c}`}
                className="flex items-end justify-center aspect-square"
                title={`${cell.pomodoro.task_title} (${cell.pomodoro.duration_minutes}m)`}
              >
                <PlantSVG stage={stage} size="sm" colorVariant={pomodoroColorVariant(cell.colorIndex)} />
              </div>
            )
          }

          // Empty cell — soil
          return (
            <div key={`${r}-${c}`} className="aspect-square rounded-sm bg-amber-50/30" />
          )
        })}
      </div>

      {pomodoros.length > 0 && (
        <p className="text-center text-[10px] text-stone-300">
          {pomodoros.length} pomodoro{pomodoros.length !== 1 ? 's' : ''} planted
        </p>
      )}
    </div>
  )
}

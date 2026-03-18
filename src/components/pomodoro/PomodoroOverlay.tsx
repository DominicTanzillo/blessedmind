import BushSVG from '../grind/BushSVG'

interface Props {
  taskTitle: string
  remainingSeconds: number
  durationMinutes: number
  colorVariant: number
  onCancel: () => void
}

function getGrowthStage(progress: number): 0 | 1 | 2 | 3 | 4 {
  if (progress >= 0.9) return 4
  if (progress >= 0.65) return 3
  if (progress >= 0.4) return 2
  if (progress >= 0.15) return 1
  return 0
}

export default function PomodoroOverlay({ taskTitle, remainingSeconds, durationMinutes, colorVariant, onCancel }: Props) {
  const totalSeconds = durationMinutes * 60
  const elapsed = totalSeconds - remainingSeconds
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const stage = getGrowthStage(progress)

  return (
    <div className="fixed top-14 left-0 right-0 z-50 px-4 py-0 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-b-2xl shadow-lg border border-t-0 border-stone-200 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Growing bush */}
            <div className="flex-shrink-0">
              <BushSVG stage={stage} size={44} colorVariant={colorVariant} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-400 truncate">{taskTitle}</p>
              <span className="text-lg font-semibold text-stone-800 tabular-nums">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Cancel */}
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-terracotta hover:bg-red-50 transition"
            >
              Cancel
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-stone-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-sage-400 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

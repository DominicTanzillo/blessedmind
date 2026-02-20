import type { MissedDay } from '../../types'

interface Props {
  missedDays: MissedDay[]
  onReconcile: (grindId: string, date: string, didComplete: boolean) => void
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function MissedDaysDialog({ missedDays, onReconcile }: Props) {
  if (missedDays.length === 0) return null

  const current = missedDays[0]

  return (
    <div className="fixed inset-0 z-50 bg-sage-50/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 max-w-sm w-full text-center space-y-6 animate-fade-up">
        <div>
          <p className="text-stone-400 text-xs uppercase tracking-wide mb-2">Catch-up</p>
          <p className="text-stone-400 text-sm mb-1">{missedDays.length} day{missedDays.length > 1 ? 's' : ''} to check</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-1">
            Did you {current.grindTitle}
          </h2>
          <p className="text-stone-500">
            on {formatDate(current.date)}?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onReconcile(current.grindId, current.date, false)}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-500 font-medium hover:bg-stone-50 transition-all duration-200"
          >
            No
          </button>
          <button
            onClick={() => onReconcile(current.grindId, current.date, true)}
            className="flex-1 py-3 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all duration-200"
          >
            Yes
          </button>
        </div>

        <p className="text-xs text-stone-300 italic">
          "No" resets the streak and skips remaining days for this grind.
        </p>
      </div>
    </div>
  )
}

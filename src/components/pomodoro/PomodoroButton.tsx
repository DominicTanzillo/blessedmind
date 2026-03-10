import { useState } from 'react'

const DURATIONS = [5, 10, 15, 20, 25, 30, 45, 60]

interface Props {
  taskTitle: string
  grindId?: string | null
  onStart: (minutes: number, title: string, grindId: string | null) => void
  disabled?: boolean
}

export default function PomodoroButton({ taskTitle, grindId, onStart, disabled }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        disabled={disabled}
        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-300 hover:text-sage-500 hover:bg-sage-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        title="Start pomodoro timer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="13" r="8" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeWidth={1.5} d="M12 9v4l2.5 2.5" />
          <path strokeLinecap="round" strokeWidth={1.5} d="M12 5V3" />
          <path strokeLinecap="round" strokeWidth={1.5} d="M10 3h4" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-stone-200 p-2 min-w-[140px] animate-fade-up">
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider px-2 pb-1">Focus for</p>
            <div className="grid grid-cols-2 gap-1">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation()
                    onStart(d, taskTitle, grindId ?? null)
                    setOpen(false)
                  }}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-sage-50 hover:text-sage-700 transition text-center"
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

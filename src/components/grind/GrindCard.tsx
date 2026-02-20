import { useState } from 'react'
import PlantSVG from './PlantSVG'
import { plantStage, STAGE_NAMES } from '../../hooks/useGrinds'
import { playGrindComplete } from '../../lib/sounds'
import { getGrindCompletionMessage, shouldShowInsight } from '../../lib/celebrations'
import type { Grind } from '../../types'

interface Props {
  grind: Grind
  onComplete: (id: string) => void
  index: number
}

export default function GrindCard({ grind, onComplete, index }: Props) {
  const [animating, setAnimating] = useState(false)
  const [msg, setMsg] = useState('')
  const stage = plantStage(grind.current_streak)

  function handleComplete() {
    if (animating) return
    setAnimating(true)

    const newStreak = grind.current_streak + 1
    playGrindComplete(newStreak)

    if (shouldShowInsight()) {
      setMsg(getGrindCompletionMessage(newStreak))
    }

    setTimeout(() => {
      onComplete(grind.id)
      setAnimating(false)
    }, 500)
  }

  return (
    <div
      className="animate-reveal rounded-2xl border border-sage-200 p-5 bg-gradient-to-r from-sage-50 to-white hover:shadow-md hover:border-sage-300 transition-all duration-500"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Plant */}
        <PlantSVG stage={stage} size="sm" />

        {/* Title + streak */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-800 leading-snug">{grind.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-sage-600 font-medium">{STAGE_NAMES[stage]}</span>
            <span className="text-xs text-stone-400">
              {grind.current_streak}d streak
            </span>
          </div>
          {msg && (
            <p className="text-sm text-sage-600 mt-1.5 animate-fade-up italic">{msg}</p>
          )}
        </div>

        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={animating}
          className={`relative w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-500 ${
            animating
              ? 'bg-complete border-complete text-white scale-110'
              : 'border-sage-300 hover:border-sage-500 hover:scale-110 hover:bg-sage-50'
          }`}
          title="Complete today"
        >
          {animating ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path className="animate-check" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

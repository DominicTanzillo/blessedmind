import { useState, useEffect, useRef } from 'react'
import TaskCard from './TaskCard'
import GrindCard from '../grind/GrindCard'
import { getGreeting, getTimeContext, getBatchCompleteMessage, getEmptyStateMessage } from '../../lib/celebrations'
import { playBlessedDay, playRefresh } from '../../lib/sounds'
import type { Task, Grind, PlantHealth } from '../../types'

interface Props {
  batchTasks: Task[]
  completedInBatch: number
  allCompleted: boolean
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  onCompleteStep: (id: string) => void
  onConvertToWaiting: (id: string) => void
  onNextBatch: () => void
  loading: boolean
  totalIncomplete: number
  activeGrinds: Grind[]
  enabledGrindCount: number
  completedGrindCount: number
  onCompleteGrind: (id: string) => void
  healthMap: Map<string, PlantHealth>
}

export default function DashboardView({
  batchTasks,
  completedInBatch,
  allCompleted,
  onComplete,
  onUncomplete,
  onCompleteStep,
  onConvertToWaiting,
  onNextBatch,
  loading,
  totalIncomplete,
  activeGrinds,
  enabledGrindCount,
  completedGrindCount,
  onCompleteGrind,
  healthMap,
}: Props) {
  const [blessedMessage] = useState(() => getBatchCompleteMessage())
  const greeting = getGreeting()
  const timeContext = getTimeContext()
  const grindsAllDone = completedGrindCount === enabledGrindCount
  const everythingCompleted = (allCompleted || batchTasks.length === 0) && grindsAllDone && (batchTasks.length > 0 || enabledGrindCount > 0)
  const prevAllCompleted = useRef(false)

  // Play blessed day sound when everything just completed
  useEffect(() => {
    if (everythingCompleted && !prevAllCompleted.current) {
      playBlessedDay()
    }
    prevAllCompleted.current = everythingCompleted
  }, [everythingCompleted])

  function handleNextBatch() {
    playRefresh()
    onNextBatch()
  }

  function handleRefreshBatch() {
    playRefresh()
    onNextBatch()
  }

  // Sort: incomplete first, completed at bottom
  const sortedBatch = [...batchTasks].sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 rounded-full bg-sage-500 animate-breathe" />
        <p className="text-stone-400 text-sm mt-6">Preparing your focus...</p>
      </div>
    )
  }

  // ============================================================
  // EMPTY STATE - Nothing to do
  // ============================================================
  if (batchTasks.length === 0 && totalIncomplete === 0 && enabledGrindCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-sage-100 flex items-center justify-center mb-6 animate-float">
          <div className="w-10 h-10 rounded-full bg-sage-400 animate-breathe" />
        </div>
        <h2 className="text-xl font-semibold text-stone-700 mb-2">{getEmptyStateMessage()}</h2>
        <p className="text-stone-400 text-sm max-w-xs leading-relaxed mt-2">
          When the weight returns, bring it here. He cares for you, and so do we.
        </p>
      </div>
    )
  }

  // ============================================================
  // ALL 3 COMPLETED - Blessed Day celebration
  // ============================================================
  if (everythingCompleted) {
    return (
      <div className="space-y-8 py-4">
        <div className="text-center py-6 animate-shimmer rounded-3xl">
          <div className="w-24 h-24 rounded-full bg-complete-light/50 flex items-center justify-center mx-auto mb-6 animate-glow">
            <div className="w-14 h-14 rounded-full bg-complete/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-complete" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="animate-check" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-stone-700 mb-3">Blessed Day</h2>
          <p className="text-stone-500 text-sm max-w-xs mx-auto leading-relaxed mb-2">
            {blessedMessage}
          </p>
          <p className="text-stone-400 text-xs italic">{timeContext}</p>
        </div>

        {/* Completed tasks - visible, checked off */}
        <div className="space-y-3">
          {sortedBatch.map((task, i) => (
            <TaskCard key={task.id} task={task} onComplete={onComplete} onUncomplete={onUncomplete} onCompleteStep={onCompleteStep} onConvertToWaiting={onConvertToWaiting} index={i} />
          ))}
        </div>

        {/* Mental load + next batch */}
        {totalIncomplete > 0 && (
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-stone-400 mb-2">
              <span>Mental load</span>
              <span>{totalIncomplete} thoughts remaining</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.max(5, 100 - (totalIncomplete * 10))}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          {totalIncomplete > 0 ? (
            <button
              onClick={handleNextBatch}
              className="px-8 py-3.5 rounded-2xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md"
            >
              I'm ready for the next tasks
            </button>
          ) : (
            <div className="animate-fade-up">
              <p className="text-complete font-medium">Your mind is clear. Go in peace.</p>
              <p className="text-stone-400 text-xs mt-1">Return when the burden grows heavy again.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // FOCUS STATE - Show all 3 tasks. Completed ones checked off at bottom.
  // ============================================================
  return (
    <div className="space-y-6 py-2">
      <div className="text-center space-y-2">
        <p className="text-stone-400 text-sm">{greeting}</p>
        <h1 className="text-xl font-semibold text-stone-800">Your Focus</h1>

        {/* Progress dots — grind dots (sage) + task dots */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {Array.from({ length: enabledGrindCount }).map((_, i) => (
            <div key={`g-${i}`} className="relative">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i < completedGrindCount ? 'bg-complete scale-125' : 'bg-sage-300'
                }`}
              />
              {i < completedGrindCount && (
                <div className="absolute inset-0 rounded-full bg-complete/20 animate-ripple" />
              )}
            </div>
          ))}
          {batchTasks.map(t => (
            <div key={t.id} className="relative">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  t.completed ? 'bg-complete scale-125' : 'bg-stone-200'
                }`}
              />
              {t.completed && (
                <div className="absolute inset-0 rounded-full bg-complete/20 animate-ripple" />
              )}
            </div>
          ))}
        </div>
        <p className="text-stone-400 text-xs">
          {completedGrindCount + completedInBatch} of {enabledGrindCount + batchTasks.length}
        </p>
      </div>

      {/* Active grinds first, then task cards */}
      <div className="space-y-3">
        {activeGrinds.map((g, i) => (
          <GrindCard key={g.id} grind={g} health={healthMap.get(g.id)} onComplete={onCompleteGrind} index={i} />
        ))}
        {sortedBatch.map((task, i) => (
          <TaskCard key={task.id} task={task} onComplete={onComplete} onUncomplete={onUncomplete} onCompleteStep={onCompleteStep} onConvertToWaiting={onConvertToWaiting} index={activeGrinds.length + i} />
        ))}
      </div>

      {/* Refresh batch + hint */}
      <div className="text-center space-y-3">
        <p className="text-xs text-stone-400 leading-relaxed">
          Whatever your hand finds to do, do it with all your might.
          <br />
          The rest is safely held.
        </p>

        {/* Refresh batch button - subtle, always available */}
        {totalIncomplete > batchTasks.filter(t => !t.completed).length && (
          <button
            onClick={handleRefreshBatch}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-sage-600 hover:bg-white border border-transparent hover:border-sage-200 transition-all duration-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Reprioritize tasks
          </button>
        )}
      </div>
    </div>
  )
}

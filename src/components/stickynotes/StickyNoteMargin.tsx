import { useState, useEffect } from 'react'
import { noteColor } from '../../hooks/useStickyNotes'
import type { Item } from '../../types'

interface Props {
  items: Item[]
  noteId: string
  side: 'left' | 'right'
  onToggle: (id: string, completed: boolean) => void
}

export default function StickyNoteMargin({ items, noteId, side, onToggle }: Props) {
  const [drifting, setDrifting] = useState(false)
  const [hidden, setHidden] = useState(false)
  const allDone = items.length > 0 && items.every(i => i.completed)
  const c = noteColor(noteId)
  const rot = side === 'left' ? -2 : 2

  useEffect(() => {
    if (allDone && !drifting) {
      const t = setTimeout(() => setDrifting(true), 800)
      return () => clearTimeout(t)
    }
    if (!allDone) { setDrifting(false); setHidden(false) }
  }, [allDone, drifting])

  if (hidden || items.length === 0) return null

  return (
    <div
      className={drifting ? (side === 'left' ? 'animate-drift-left' : 'animate-drift-right') : 'animate-sticky-in'}
      onAnimationEnd={() => { if (drifting) setHidden(true) }}
    >
      <div
        className="w-44 p-3 rounded-sm shadow-md relative"
        style={{ background: `linear-gradient(135deg, ${c.bg}, ${c.accent})`, transform: `rotate(${rot}deg)` }}
      >
        {/* Fold corner */}
        <div className="absolute top-0 right-0 w-5 h-5" style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%)',
        }} />

        <div className="space-y-1.5">
          {items.slice(0, 5).map(item => (
            <label key={item.id} className="flex items-start gap-2 cursor-pointer group">
              <button
                onClick={() => onToggle(item.id, item.completed)}
                className="w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                style={{ borderColor: item.completed ? c.check : 'rgba(0,0,0,0.2)', backgroundColor: item.completed ? c.check : 'transparent' }}
              >
                {item.completed && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`text-xs leading-snug transition-all ${item.completed ? 'line-through opacity-50' : ''}`} style={{ color: c.text }}>
                {item.title}
              </span>
            </label>
          ))}
        </div>

        {items.length > 5 && (
          <p className="text-[10px] mt-2 opacity-50" style={{ color: c.text }}>+{items.length - 5} more</p>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import type { Item } from '../../types'

const COLORS = [
  { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', text: '#78350f', check: '#b45309' },
  { bg: 'linear-gradient(135deg, #ffedd5, #fdba74)', text: '#7c2d12', check: '#c2410c' },
]

interface Props {
  items: Item[]
  side: 'left' | 'right'
  onToggle: (id: string, completed: boolean) => void
  colorIndex: number
}

export default function StickyNoteMargin({ items, side, onToggle, colorIndex }: Props) {
  const [drifting, setDrifting] = useState(false)
  const [hidden, setHidden] = useState(false)
  const allDone = items.length > 0 && items.every(i => i.completed)

  useEffect(() => {
    if (allDone && !drifting) {
      const t = setTimeout(() => setDrifting(true), 600)
      return () => clearTimeout(t)
    }
    if (!allDone) { setDrifting(false); setHidden(false) }
  }, [allDone, drifting])

  if (hidden || items.length === 0) return null
  const c = COLORS[colorIndex % COLORS.length]
  const rot = side === 'left' ? -2 : 2

  return (
    <div
      className={drifting ? (side === 'left' ? 'animate-drift-left' : 'animate-drift-right') : 'animate-sticky-in'}
      onAnimationEnd={() => { if (drifting) setHidden(true) }}
      style={{ '--note-rot': `${rot}deg` } as React.CSSProperties}
    >
      <div
        className="w-44 p-3 rounded-sm shadow-md transition-transform duration-300"
        style={{ background: c.bg, transform: `rotate(${rot}deg)` }}
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
                style={{
                  borderColor: item.completed ? c.check : 'rgba(0,0,0,0.2)',
                  backgroundColor: item.completed ? c.check : 'transparent',
                }}
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
          <p className="text-[10px] mt-2 opacity-50" style={{ color: c.text }}>
            +{items.length - 5} more
          </p>
        )}
      </div>
    </div>
  )
}

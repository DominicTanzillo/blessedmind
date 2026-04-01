import { useState, type FormEvent } from 'react'
import { useStickyNotes } from '../../hooks/useStickyNotes'
import type { Item } from '../../types'

const NOTE_COLORS = [
  { bg: '#fef3c7', accent: '#fde68a', text: '#78350f', check: '#b45309' },
  { bg: '#ffedd5', accent: '#fdba74', text: '#7c2d12', check: '#c2410c' },
  { bg: '#fef9c3', accent: '#fde047', text: '#713f12', check: '#a16207' },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function NoteItem({ item, color, onToggle, onPromote, onDelete }: {
  item: Item
  color: typeof NOTE_COLORS[0]
  onToggle: (id: string, completed: boolean) => void
  onPromote: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="group flex items-center gap-2 py-1">
      <button
        onClick={() => onToggle(item.id, item.completed)}
        className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          borderColor: item.completed ? color.check : 'rgba(0,0,0,0.2)',
          backgroundColor: item.completed ? color.check : 'transparent',
        }}
      >
        {item.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm leading-snug transition-all ${item.completed ? 'line-through opacity-50' : ''}`} style={{ color: color.text }}>
        {item.title}
      </span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onPromote(item.id)} className="p-0.5 rounded opacity-40 hover:opacity-100 transition" style={{ color: color.text }} title="Promote to task">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
        <button onClick={() => onDelete(item.id)} className="p-0.5 rounded opacity-40 hover:opacity-100 transition" style={{ color: color.text }} title="Remove">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function StickyCard({ items, color, rotation, label, onToggle, onPromote, onDelete, children }: {
  items?: Item[]
  color: typeof NOTE_COLORS[0]
  rotation: number
  label?: string
  onToggle: (id: string, completed: boolean) => void
  onPromote: (id: string) => void
  onDelete: (id: string) => void
  children?: React.ReactNode
}) {
  const done = items?.filter(i => i.completed).length ?? 0
  return (
    <div
      className="rounded-sm shadow-md p-4 relative transition-transform duration-300 hover:shadow-lg"
      style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.accent})`, transform: `rotate(${rotation}deg)` }}
    >
      {/* Fold corner */}
      <div className="absolute top-0 right-0 w-6 h-6" style={{
        background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)',
      }} />

      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium opacity-60" style={{ color: color.text }}>{label}</span>
          {items && items.length > 0 && (
            <span className="text-[10px] opacity-40" style={{ color: color.text }}>{done}/{items.length}</span>
          )}
        </div>
      )}

      {children}

      {items && (
        <div className="space-y-0.5">
          {items.map(item => (
            <NoteItem key={item.id} item={item} color={color} onToggle={onToggle} onPromote={onPromote} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function StickyNotesView() {
  const { todayItems, groupedPrevious, loading, addItem, toggleItem, deleteItem, promoteToTask, showOnFocus, toggleShowOnFocus } = useStickyNotes()
  const [newItem, setNewItem] = useState('')
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newItem.trim()) return
    addItem(newItem.trim())
    setNewItem('')
  }

  function toggleDate(date: string) {
    setExpandedDates(prev => { const n = new Set(prev); if (n.has(date)) n.delete(date); else n.add(date); return n })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + Toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Sticky Notes</h1>
          <p className="text-sm text-stone-400 mt-1">{today}</p>
        </div>
        {/* Show on Focus toggle — desktop only */}
        <label className="hidden lg:flex items-center gap-2 cursor-pointer select-none mt-1">
          <span className="text-xs text-stone-400">Show on Focus</span>
          <div onClick={toggleShowOnFocus} className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${showOnFocus ? 'bg-amber-400' : 'bg-stone-200'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${showOnFocus ? 'translate-x-4' : ''}`} />
          </div>
        </label>
      </div>

      {/* Add input — styled like writing on a fresh note */}
      <form onSubmit={handleAdd}>
        <StickyCard color={NOTE_COLORS[0]} rotation={0} onToggle={toggleItem} onPromote={promoteToTask} onDelete={deleteItem}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="Jot a note..."
              className="flex-1 bg-transparent border-b border-amber-800/20 text-sm py-1 px-0 placeholder-amber-800/30 focus:outline-none focus:border-amber-800/40 transition"
              style={{ color: NOTE_COLORS[0].text }}
            />
            <button type="submit" disabled={!newItem.trim()} className="text-xs font-medium px-2 py-1 rounded transition disabled:opacity-30" style={{ color: NOTE_COLORS[0].check }}>
              +
            </button>
          </div>
        </StickyCard>
      </form>

      {/* Today's note */}
      {todayItems.length > 0 && (
        <StickyCard
          items={todayItems}
          color={NOTE_COLORS[0]}
          rotation={-1}
          label="Today"
          onToggle={toggleItem}
          onPromote={promoteToTask}
          onDelete={deleteItem}
        />
      )}

      {/* Previous days — growing stack */}
      {groupedPrevious.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Previous</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="space-y-3">
            {groupedPrevious.map(([date, dateItems], i) => {
              const color = NOTE_COLORS[(i + 1) % NOTE_COLORS.length]
              const expanded = expandedDates.has(date)
              const done = dateItems.filter(d => d.completed).length
              const rotation = i % 2 === 0 ? 1.5 : -1

              if (!expanded) {
                return (
                  <button
                    key={date}
                    onClick={() => toggleDate(date)}
                    className="w-full rounded-sm shadow-sm p-3 text-left transition-all hover:shadow-md"
                    style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.accent})`, transform: `rotate(${rotation}deg)` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: color.text }}>{formatDate(date)}</span>
                      <span className="text-xs opacity-50" style={{ color: color.text }}>{done}/{dateItems.length} done</span>
                    </div>
                  </button>
                )
              }

              return (
                <div key={date}>
                  <button onClick={() => toggleDate(date)} className="text-xs text-stone-400 mb-1 hover:text-stone-600 transition">
                    {formatDate(date)} −
                  </button>
                  <StickyCard
                    items={dateItems}
                    color={color}
                    rotation={rotation}
                    onToggle={toggleItem}
                    onPromote={promoteToTask}
                    onDelete={deleteItem}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

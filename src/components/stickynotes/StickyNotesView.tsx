import { useState, type FormEvent } from 'react'
import { useStickyNotes, noteColor, noteHasLines, noteRotation, type NoteGroup } from '../../hooks/useStickyNotes'
import type { Item } from '../../types'

function NoteItem({ item, color, onToggle, onPromote, onDelete }: {
  item: Item
  color: ReturnType<typeof noteColor>
  onToggle: (id: string, completed: boolean) => void
  onPromote: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="group flex items-center gap-2 py-0.5 relative">
      <button
        onClick={() => onToggle(item.id, item.completed)}
        className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all"
        style={{ borderColor: item.completed ? color.check : 'rgba(0,0,0,0.2)', backgroundColor: item.completed ? color.check : 'transparent' }}
      >
        {item.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm leading-snug transition-all ${item.completed ? 'line-through opacity-40' : ''}`} style={{ color: color.text }}>{item.title}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onPromote(item.id)} className="p-0.5 rounded opacity-40 hover:opacity-100 transition" style={{ color: color.text }} title="Promote to task">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>
        <button onClick={() => onDelete(item.id)} className="p-0.5 rounded opacity-40 hover:opacity-100 transition" style={{ color: color.text }} title="Remove">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  )
}

function ActiveNote({ note, slot, onAdd, onToggle, onPromote, onDelete }: {
  note: NoteGroup | null
  slot: number
  onAdd: (title: string, slot: number) => void
  onToggle: (id: string, completed: boolean) => void
  onPromote: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [input, setInput] = useState('')
  // Stable color for empty slots — don't use Date.now() which changes every render
  const color = note ? noteColor(note.id) : noteColor(`empty-slot-${slot}`)
  const hasLines = note ? noteHasLines(note.id) : false
  const rot = note ? noteRotation(note.id) : (slot === 0 ? -1 : 1)
  const allDone = note !== null && note.items.length > 0 && note.items.every(i => i.completed)

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input.trim(), slot)
    setInput('')
  }

  return (
    <div
      className={`rounded-sm shadow-md p-4 relative min-h-[120px] transition-all duration-700 ${allDone ? 'opacity-30 scale-[0.97]' : ''}`}
      style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.accent})`, transform: `rotate(${rot}deg)` }}
    >
      <div className="absolute top-0 right-0 w-6 h-6" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)' }} />

      {hasLines && (
        <div className="absolute inset-x-4 top-10 bottom-4 pointer-events-none" style={{ opacity: 0.07 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b" style={{ borderColor: color.text, height: '22px' }} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-2 relative">
        <span className="text-xs font-medium opacity-50" style={{ color: color.text }}>Note {slot + 1}</span>
        {note && note.items.length > 0 && (
          <span className="text-[10px] opacity-35" style={{ color: color.text }}>
            {note.items.filter(i => i.completed).length}/{note.items.length}
          </span>
        )}
      </div>

      {note && note.items.length > 0 && (
        <div className="space-y-0.5 mb-2 relative">
          {note.items.map(item => (
            <NoteItem key={item.id} item={item} color={color} onToggle={onToggle} onPromote={onPromote} onDelete={onDelete} />
          ))}
        </div>
      )}

      {!allDone && (
        <form onSubmit={handleAdd} className="flex gap-1 relative">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={note ? 'Add to note...' : 'Start a note...'}
            className="flex-1 bg-transparent border-b border-current/20 text-sm py-1 px-0 placeholder:opacity-25 focus:outline-none focus:border-current/40 transition"
            style={{ color: color.text }} />
          <button type="submit" disabled={!input.trim()} className="text-sm font-bold px-1.5 transition disabled:opacity-20" style={{ color: color.check }}>+</button>
        </form>
      )}

      {allDone && (
        <p className="text-xs text-center opacity-40 mt-2" style={{ color: color.text }}>All done!</p>
      )}
    </div>
  )
}

/** Profile-view tower of completed notes — grows taller like a trophy */
function NoteStackTower({ notes }: { notes: NoteGroup[] }) {
  const noteHeight = 6
  const maxWidth = 200
  return (
    <div className="flex flex-col-reverse items-center" style={{ minHeight: notes.length * (noteHeight + 2) + 16 }}>
      {/* Base surface */}
      <div className="w-48 h-2 rounded-sm bg-stone-200/60 mb-1" />
      {notes.map((note, i) => {
        const color = noteColor(note.id)
        const h = note.id.length * 31 + i * 7
        const widthVar = maxWidth - 20 + (h % 30)
        const xOffset = ((h % 7) - 3) * 1.5
        return (
          <div
            key={note.id}
            className="rounded-[2px] shadow-sm flex-shrink-0"
            style={{
              width: Math.min(widthVar, maxWidth),
              height: noteHeight,
              marginBottom: 1,
              marginLeft: xOffset,
              background: `linear-gradient(90deg, ${color.bg}, ${color.accent})`,
              border: '0.5px solid rgba(0,0,0,0.06)',
            }}
          />
        )
      })}
    </div>
  )
}

export default function StickyNotesView() {
  const {
    activeNote1, activeNote2, completedNotes,
    loading, addItem, toggleItem, deleteItem, promoteToTask, retireStack,
    showOnFocus, toggleShowOnFocus,
  } = useStickyNotes()
  const [retiringName, setRetiringName] = useState<string | null>(null)

  function handleRetire() {
    const season = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    setRetiringName(season)
  }

  async function confirmRetire() {
    if (retiringName === null) return
    await retireStack(retiringName)
    setRetiringName(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + Toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Sticky Notes</h1>
          <p className="text-sm text-stone-400 mt-1">Fill them up, cross them off, watch the stack grow.</p>
        </div>
        <label className="hidden lg:flex items-center gap-2 cursor-pointer select-none mt-1">
          <span className="text-xs text-stone-400">Show on Focus</span>
          <div onClick={toggleShowOnFocus} className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${showOnFocus ? 'bg-amber-400' : 'bg-stone-200'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${showOnFocus ? 'translate-x-4' : ''}`} />
          </div>
        </label>
      </div>

      {/* Two active note slots — sticky so they freeze partway down */}
      <div className="sticky top-16 z-10 bg-sage-50/90 backdrop-blur-sm py-3 -mx-4 px-4 rounded-b-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActiveNote note={activeNote1} slot={0} onAdd={addItem} onToggle={toggleItem} onPromote={promoteToTask} onDelete={deleteItem} />
          <ActiveNote note={activeNote2} slot={1} onAdd={addItem} onToggle={toggleItem} onPromote={promoteToTask} onDelete={deleteItem} />
        </div>
      </div>

      {/* Completed stack — profile-view tower */}
      {completedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
              {completedNotes.length} note{completedNotes.length !== 1 ? 's' : ''} completed
            </span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          {/* Tower */}
          <div className="flex justify-center py-4">
            <NoteStackTower notes={completedNotes} />
          </div>

          {/* Retire to garden */}
          {completedNotes.length >= 3 && (
            <div className="text-center">
              {retiringName !== null ? (
                <div className="inline-flex items-center gap-2 bg-white rounded-xl border border-stone-200 px-4 py-2 shadow-sm">
                  <input
                    type="text"
                    value={retiringName}
                    onChange={e => setRetiringName(e.target.value)}
                    className="text-sm text-stone-800 bg-transparent border-b border-stone-300 focus:outline-none focus:border-sage-500 px-1 py-0.5 w-40"
                    placeholder="Name this stack..."
                    autoFocus
                  />
                  <button onClick={confirmRetire} className="text-xs font-medium text-sage-600 hover:text-sage-800 transition">
                    Plant
                  </button>
                  <button onClick={() => setRetiringName(null)} className="text-xs text-stone-400 hover:text-stone-600 transition">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRetire}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-sage-600 hover:bg-white border border-transparent hover:border-sage-200 transition-all duration-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19V6m0 0c-2-3-6-3-6 0 0 4 6 4 6 0zm0 0c2-3 6-3 6 0 0 4-6 4-6 0z" />
                  </svg>
                  Retire stack to Garden
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

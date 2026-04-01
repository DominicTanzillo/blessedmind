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
      <span className={`flex-1 text-sm leading-snug transition-all ${item.completed ? 'line-through opacity-40' : ''}`} style={{ color: color.text }}>
        {item.title}
      </span>
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

function StickyNoteCard({ note, onAdd, onToggle, onPromote, onDelete, slotLabel }: {
  note: NoteGroup | null
  onAdd: (title: string, slot: number) => void
  onToggle: (id: string, completed: boolean) => void
  onPromote: (id: string) => void
  onDelete: (id: string) => void
  slotLabel: string
}) {
  const [input, setInput] = useState('')
  const slot = note?.slot ?? (slotLabel === 'Note 1' ? 0 : 1)
  const color = note ? noteColor(note.id) : noteColor('empty-' + slot)
  const hasLines = note ? noteHasLines(note.id) : false
  const rot = note ? noteRotation(note.id) : (slot === 0 ? -1 : 1)

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input.trim(), slot)
    setInput('')
  }

  const done = note?.items.filter(i => i.completed).length ?? 0
  const total = note?.items.length ?? 0

  return (
    <div
      className="rounded-sm shadow-md p-4 relative transition-all duration-300 hover:shadow-lg min-h-[120px]"
      style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.accent})`, transform: `rotate(${rot}deg)` }}
    >
      {/* Fold corner */}
      <div className="absolute top-0 right-0 w-6 h-6" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)' }} />

      {/* Ruled lines */}
      {hasLines && (
        <div className="absolute inset-x-4 top-10 bottom-4 pointer-events-none" style={{ opacity: 0.08 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b" style={{ borderColor: color.text, height: '22px' }} />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative">
        <span className="text-xs font-medium opacity-50" style={{ color: color.text }}>{slotLabel}</span>
        {total > 0 && <span className="text-[10px] opacity-35" style={{ color: color.text }}>{done}/{total}</span>}
      </div>

      {/* Items */}
      {note && note.items.length > 0 && (
        <div className="space-y-0.5 mb-2 relative">
          {note.items.map(item => (
            <NoteItem key={item.id} item={item} color={color} onToggle={onToggle} onPromote={onPromote} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* Add input — always visible so user can add to active note or start new one */}
      <form onSubmit={handleAdd} className="flex gap-1 relative">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={note ? 'Add to note...' : 'Start a note...'}
          className="flex-1 bg-transparent border-b border-current/20 text-sm py-1 px-0 placeholder:opacity-25 focus:outline-none focus:border-current/40 transition"
          style={{ color: color.text }}
        />
        <button type="submit" disabled={!input.trim()} className="text-sm font-bold px-1.5 transition disabled:opacity-20" style={{ color: color.check }}>+</button>
      </form>
    </div>
  )
}

function CompletedNote({ note, index }: { note: NoteGroup; index: number }) {
  const color = noteColor(note.id)
  const hasLines = noteHasLines(note.id)
  const rot = noteRotation(note.id) + (index % 2 === 0 ? 0.5 : -0.3)

  return (
    <div
      className="rounded-sm shadow-sm p-3 relative"
      style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.accent})`, transform: `rotate(${rot}deg)` }}
    >
      <div className="absolute top-0 right-0 w-5 h-5" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.04) 50%)' }} />

      {hasLines && (
        <div className="absolute inset-x-3 top-8 bottom-3 pointer-events-none" style={{ opacity: 0.06 }}>
          {Array.from({ length: Math.min(note.items.length, 6) }).map((_, i) => (
            <div key={i} className="border-b" style={{ borderColor: color.text, height: '18px' }} />
          ))}
        </div>
      )}

      <div className="space-y-0.5 relative">
        {note.items.map(item => (
          <div key={item.id} className="flex items-center gap-2 py-0.5">
            <div className="w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: color.check, backgroundColor: color.check }}>
              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs leading-snug line-through opacity-40" style={{ color: color.text }}>{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StickyNotesView() {
  const {
    activeNote1, activeNote2, completedNotes,
    loading, addItem, toggleItem, deleteItem, promoteToTask,
    showOnFocus, toggleShowOnFocus,
  } = useStickyNotes()

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
          <p className="text-sm text-stone-400 mt-1">Fill them up, cross them off, start fresh.</p>
        </div>
        <label className="hidden lg:flex items-center gap-2 cursor-pointer select-none mt-1">
          <span className="text-xs text-stone-400">Show on Focus</span>
          <div onClick={toggleShowOnFocus} className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${showOnFocus ? 'bg-amber-400' : 'bg-stone-200'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${showOnFocus ? 'translate-x-4' : ''}`} />
          </div>
        </label>
      </div>

      {/* Two active note slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StickyNoteCard note={activeNote1} slotLabel="Note 1" onAdd={addItem} onToggle={toggleItem} onPromote={promoteToTask} onDelete={deleteItem} />
        <StickyNoteCard note={activeNote2} slotLabel="Note 2" onAdd={addItem} onToggle={toggleItem} onPromote={promoteToTask} onDelete={deleteItem} />
      </div>

      {/* Completed pile */}
      {completedNotes.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
              {completedNotes.length} completed
            </span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="space-y-2">
            {[...completedNotes].reverse().map((note, i) => (
              <CompletedNote key={note.id} note={note} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

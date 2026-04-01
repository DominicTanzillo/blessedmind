import { useState, type FormEvent } from 'react'
import { useFriction } from '../../hooks/useFriction'
import type { Item } from '../../types'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function FrictionItem({ item, onToggle, onPromote, onDelete }: {
  item: Item
  onToggle: (id: string, completed: boolean) => void
  onPromote: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="group flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-stone-50 transition-colors duration-150">
      <button
        onClick={() => onToggle(item.id, item.completed)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          item.completed
            ? 'bg-complete border-complete text-white'
            : 'border-stone-300 hover:border-sage-400'
        }`}
      >
        {item.completed && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span className={`flex-1 text-sm leading-snug transition-all duration-200 ${
        item.completed ? 'line-through text-stone-400' : 'text-stone-700'
      }`}>
        {item.title}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onPromote(item.id)}
          className="p-1 rounded text-stone-300 hover:text-sage-600 hover:bg-sage-100 transition"
          title="Promote to task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 rounded text-stone-300 hover:text-terracotta hover:bg-red-50 transition"
          title="Remove"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function FrictionView() {
  const { todayItems, groupedPrevious, loading, addItem, toggleItem, deleteItem, promoteToTask } = useFriction()
  const [newItem, setNewItem] = useState('')
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newItem.trim()) return
    addItem(newItem.trim())
    setNewItem('')
  }

  function toggleDate(date: string) {
    setExpandedDates(prev => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const doneToday = todayItems.filter(i => i.completed).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-stone-800">Friction Log</h1>
        <p className="text-sm text-stone-400 mt-1">{today}</p>
        <p className="text-sm text-stone-500 mt-2">
          Small stressors and rough edges. Note them, move on.
        </p>
      </div>

      {/* Add item */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="What's creating friction?"
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={!newItem.trim()}
          className="px-4 py-2.5 rounded-xl bg-sage-500 text-white text-sm font-medium hover:bg-sage-600 disabled:opacity-40 disabled:hover:bg-sage-500 transition"
        >
          Add
        </button>
      </form>

      {/* Today's items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wider">Today</h2>
          {todayItems.length > 0 && (
            <span className="text-xs text-stone-400">
              {doneToday}/{todayItems.length} resolved
            </span>
          )}
        </div>

        {todayItems.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-3 opacity-40">~</div>
            <p className="text-sm text-stone-400">Nothing logged yet. A smooth day so far.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {todayItems.map(item => (
              <FrictionItem
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onPromote={promoteToTask}
                onDelete={deleteItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Previous days */}
      {groupedPrevious.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Previous</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="space-y-1">
            {groupedPrevious.map(([date, dateItems]) => {
              const expanded = expandedDates.has(date)
              const done = dateItems.filter(i => i.completed).length
              return (
                <div key={date}>
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-50 transition text-left"
                  >
                    <span className="text-sm text-stone-600">{formatDate(date)}</span>
                    <span className="text-xs text-stone-400">
                      {done}/{dateItems.length} resolved
                      <span className="ml-2">{expanded ? '−' : '+'}</span>
                    </span>
                  </button>
                  {expanded && (
                    <div className="divide-y divide-stone-100 ml-2">
                      {dateItems.map(item => (
                        <FrictionItem
                          key={item.id}
                          item={item}
                          onToggle={toggleItem}
                          onPromote={promoteToTask}
                          onDelete={deleteItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import SearchBar from './SearchBar'
import TaskRow from './TaskRow'
import type { Task, TaskFilter } from '../../types'

interface Props {
  tasks: Task[]
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, updates: Partial<Task>) => void
  onStar: (id: string) => void
  onUnstar: (id: string) => void
  onAddClick: () => void
}

export default function InboxView({ tasks, onComplete, onUncomplete, onDelete, onEdit, onStar, onUnstar, onAddClick }: Props) {
  const [filter, setFilter] = useState<TaskFilter>({
    search: '',
    category: '',
    priority: null,
    showCompleted: false,
  })

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (!filter.showCompleted && t.completed) return false
      if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
      if (filter.category && t.category !== filter.category) return false
      if (filter.priority !== null && t.priority !== filter.priority) return false
      return true
    })
  }, [tasks, filter])

  const incomplete = filtered.filter(t => !t.completed)
  const completed = filtered.filter(t => t.completed)
  const totalIncomplete = tasks.filter(t => !t.completed).length
  const totalCompleted = tasks.filter(t => t.completed).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Your Mind</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Everything captured. Nothing forgotten.
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-500 text-white text-sm font-medium hover:bg-sage-600 transition"
        >
          <span className="text-lg leading-none">+</span> Brain Dump
        </button>
      </div>

      <SearchBar filter={filter} onChange={setFilter} />

      <div className="space-y-1">
        {incomplete.length === 0 && !filter.showCompleted && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 rounded-full bg-sage-400 animate-breathe" />
            </div>
            <p className="text-stone-500 text-sm font-medium">Your mind is empty</p>
            <p className="text-stone-400 text-xs mt-1">
              When something comes up, dump it here. We'll process it.
            </p>
          </div>
        )}
        {incomplete.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onComplete={onComplete}
            onUncomplete={onUncomplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onStar={onStar}
            onUnstar={onUnstar}
          />
        ))}
      </div>

      {filter.showCompleted && completed.length > 0 && (
        <div className="space-y-1 pt-4 border-t border-stone-200">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide px-3 pb-1">
            Processed
          </p>
          {completed.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onStar={onStar}
              onUnstar={onUnstar}
            />
          ))}
        </div>
      )}

      <div className="text-center pt-2 space-y-1">
        <p className="text-xs text-stone-400">
          {totalIncomplete} open loop{totalIncomplete !== 1 ? 's' : ''} &middot; {totalCompleted} processed
        </p>
        {totalIncomplete > 0 && (
          <p className="text-xs text-stone-400 italic">
            All {totalIncomplete} are safely captured. Your focus shows only what matters now.
          </p>
        )}
      </div>
    </div>
  )
}

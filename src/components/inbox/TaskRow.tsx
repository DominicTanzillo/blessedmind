import { useState } from 'react'
import Badge from '../ui/Badge'
import { PRIORITIES, CATEGORIES, CATEGORY_EMOJI } from '../../lib/constants'
import { playComplete } from '../../lib/sounds'
import type { Task, Step } from '../../types'
import type { Category } from '../../lib/constants'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, updates: Partial<Task>) => void
  onPin: (id: string) => void
  onUnpin: (id: string) => void
  isPinned: boolean
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff <= 7) return `${diff}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskRow({ task, onComplete, onUncomplete, onDelete, onEdit, onPin, onUnpin, isPinned }: Props) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description)
  const [editDueDate, setEditDueDate] = useState(task.due_date ?? '')
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editCategory, setEditCategory] = useState(task.category)
  const [editSteps, setEditSteps] = useState<Step[]>(task.steps ?? [])
  const [newStepInput, setNewStepInput] = useState('')

  const priorityInfo = PRIORITIES.find(p => p.value === task.priority)
  const emoji = CATEGORY_EMOJI[task.category as Category] ?? '📋'

  function startEditing() {
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditDueDate(task.due_date ?? '')
    setEditPriority(task.priority)
    setEditCategory(task.category)
    setEditSteps(task.steps ?? [])
    setNewStepInput('')
    setEditing(true)
  }

  function addNewStep() {
    const text = newStepInput.trim()
    if (!text) return
    setEditSteps(prev => [...prev, { id: `step-${Date.now()}`, title: text, completed: false }])
    setNewStepInput('')
  }

  function updateStepTitle(index: number, title: string) {
    setEditSteps(prev => prev.map((s, i) => i === index ? { ...s, title } : s))
  }

  function removeStep(index: number) {
    setEditSteps(prev => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    if (!editTitle.trim()) return
    onEdit(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      due_date: editDueDate || null,
      priority: editPriority,
      category: editCategory,
      steps: editSteps.length > 0 ? editSteps : null,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="p-3 rounded-xl bg-white border border-sage-200 space-y-3">
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 transition"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={e => setEditDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 transition resize-none"
          placeholder="Notes"
        />

        {/* Steps editor */}
        <div className="space-y-2 pl-2 border-l-2 border-sage-200">
          <p className="text-xs font-medium text-stone-500">Steps</p>
          {editSteps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <span className={`text-xs w-5 text-right ${step.completed ? 'text-complete' : 'text-stone-400'}`}>
                {step.completed ? '✓' : `${i + 1}.`}
              </span>
              <input
                type="text"
                value={step.title}
                onChange={e => updateStepTitle(i, e.target.value)}
                className={`flex-1 px-2 py-1 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-sage-400 transition ${step.completed ? 'line-through text-stone-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="text-stone-300 hover:text-terracotta transition text-sm"
              >
                &times;
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 w-5 text-right">{editSteps.length + 1}.</span>
            <input
              type="text"
              value={newStepInput}
              onChange={e => setNewStepInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNewStep() } }}
              className="flex-1 px-2 py-1 rounded-lg border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-sage-400 transition"
              placeholder="Add a step..."
            />
            <button
              type="button"
              onClick={addNewStep}
              disabled={!newStepInput.trim()}
              className="text-sage-500 hover:text-sage-700 disabled:text-stone-300 transition text-lg font-medium"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="date"
            value={editDueDate}
            onChange={e => setEditDueDate(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-stone-200 bg-sage-50 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-sage-400"
          />
          <select
            value={editPriority}
            onChange={e => setEditPriority(Number(e.target.value) as 1 | 2 | 3)}
            className="px-2 py-1.5 rounded-lg border border-stone-200 bg-sage-50 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-sage-400"
          >
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            value={editCategory}
            onChange={e => setEditCategory(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-stone-200 bg-sage-50 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-sage-400"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-medium hover:bg-stone-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editTitle.trim()}
            className="flex-1 py-1.5 rounded-lg bg-sage-500 text-white text-xs font-medium hover:bg-sage-600 disabled:opacity-50 transition"
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition group ${
      task.completed ? 'opacity-60 hover:opacity-100' : 'hover:bg-white'
    }`}>
      <button
        onClick={() => { if (task.completed) { onUncomplete(task.id) } else { playComplete(); onComplete(task.id) } }}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
          task.completed
            ? 'bg-complete border-complete text-white hover:bg-complete/60 hover:border-complete/60'
            : 'border-stone-300 hover:border-sage-400'
        }`}
        title={task.completed ? 'Undo completion' : 'Complete'}
      >
        {task.completed && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm text-stone-800 ${task.completed ? 'line-through' : ''}`}>
          {emoji} {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {priorityInfo && task.priority !== 2 && (
            <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
          )}
          {task.steps && task.steps.length > 0 && (
            <span className="text-xs text-stone-400">
              {task.steps.filter(s => s.completed).length}/{task.steps.length} steps
            </span>
          )}
          {task.due_date && (
            <span className={`text-xs ${
              formatRelativeDate(task.due_date).includes('overdue') ? 'text-terracotta font-medium' : 'text-stone-400'
            }`}>
              {formatRelativeDate(task.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons - visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        {/* Pin/unpin to focus */}
        {!task.completed && (
          <button
            onClick={() => isPinned ? onUnpin(task.id) : onPin(task.id)}
            className={`p-1 rounded transition ${
              isPinned
                ? 'text-sage-500 hover:text-sage-700'
                : 'text-stone-300 hover:text-sage-500'
            }`}
            title={isPinned ? 'Remove from focus' : 'Pin to focus'}
          >
            <svg className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        )}

        {/* Edit */}
        {!task.completed && (
          <button
            onClick={startEditing}
            className="p-1 rounded text-stone-300 hover:text-stone-600 transition"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded text-stone-300 hover:text-terracotta transition"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

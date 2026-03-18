import { useState, useEffect, useRef } from 'react'
import Badge from '../ui/Badge'
import PomodoroButton from '../pomodoro/PomodoroButton'
import { PRIORITIES, CATEGORIES, CATEGORY_EMOJI } from '../../lib/constants'
import { getCompletionMessage, shouldShowInsight } from '../../lib/celebrations'
import { playComplete, playStepComplete } from '../../lib/sounds'
import { getEffectiveStepDueDate } from '../../lib/hydra'
import type { Task, Step } from '../../types'
import type { Category } from '../../lib/constants'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  onCompleteStep: (id: string) => void
  onConvertToWaiting: (id: string) => void
  onEdit?: (id: string, updates: Partial<Task>) => void
  index: number
  onStartPomodoro?: (minutes: number, title: string, grindId: string | null) => void
  pomodoroActive?: boolean
  stepIndex?: number | null
  onCompleteSpecificStep?: (taskId: string, stepIndex: number) => void
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'No deadline'
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  if (diff <= 7) return `Due in ${diff} days`
  return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function ensureTrailingEmpty(steps: Step[]): Step[] {
  if (steps.length === 0 || steps[steps.length - 1].title.trim() !== '') {
    return [...steps, { id: `step-new-${Date.now()}`, title: '', completed: false }]
  }
  return steps
}

export default function TaskCard({ task, onComplete, onUncomplete, onCompleteStep, onConvertToWaiting, onEdit, index, onStartPomodoro, pomodoroActive, stepIndex, onCompleteSpecificStep }: Props) {
  const [animatingComplete, setAnimatingComplete] = useState(false)
  const [completionMsg, setCompletionMsg] = useState('')
  const [showRipple, setShowRipple] = useState(false)
  const [editing, setEditing] = useState(false)
  const prevCompleted = useRef(task.completed)

  // Edit state
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description)
  const [editDueDate, setEditDueDate] = useState(task.due_date ?? '')
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editCategory, setEditCategory] = useState(task.category)
  const [editSteps, setEditSteps] = useState<Step[]>(task.steps ?? [])
  const [hasSteps, setHasSteps] = useState((task.steps ?? []).length > 0)

  // Drag state for step reorder in edit mode
  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Clear animation state when task prop changes
  useEffect(() => {
    if (task.completed !== prevCompleted.current) {
      setAnimatingComplete(false)
      setShowRipple(false)
    }
    prevCompleted.current = task.completed
  }, [task.completed])

  // Determine if we're in step-specific mode
  const hasSpecificStep = stepIndex != null
  const specificStep = hasSpecificStep && task.steps ? task.steps[stepIndex] : null
  const specificStepCompleted = specificStep?.completed ?? false

  const isCompleted = hasSpecificStep ? specificStepCompleted : task.completed

  const priorityInfo = PRIORITIES.find(p => p.value === task.priority)
  const emoji = CATEGORY_EMOJI[task.category as Category] ?? '📋'
  const isHydra = task.steps && task.steps.length > 1
  const effectiveDue = isHydra ? getEffectiveStepDueDate(task) : { date: task.due_date, isDefault: false }
  const dateText = formatRelativeDate(effectiveDue.date)
  const isOverdue = dateText.includes('overdue')

  // Multi-step logic (used for non-step-specific mode)
  const taskHasSteps = task.steps && task.steps.length > 0
  const currentStepIndex = taskHasSteps ? task.steps!.findIndex(s => !s.completed) : -1
  const currentStep = taskHasSteps && currentStepIndex !== -1 ? task.steps![currentStepIndex] : null
  const completedSteps = taskHasSteps ? task.steps!.filter(s => s.completed).length : 0
  const totalSteps = taskHasSteps ? task.steps!.length : 0
  const isLastStep = taskHasSteps && currentStepIndex === totalSteps - 1
  const hasCompletedSteps = completedSteps > 0

  function startEditing() {
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditDueDate(task.due_date ?? '')
    setEditPriority(task.priority)
    setEditCategory(task.category)
    const existing = task.steps ?? []
    setEditSteps(ensureTrailingEmpty(existing))
    setHasSteps(existing.length > 0)
    setEditing(true)
  }

  function updateEditStepTitle(i: number, title: string) {
    setEditSteps(prev => {
      const next = prev.map((s, j) => j === i ? { ...s, title } : s)
      if (i === prev.length - 1 && title.trim()) {
        next.push({ id: `step-new-${Date.now()}`, title: '', completed: false })
      }
      return next
    })
  }

  function removeEditStep(i: number) {
    setEditSteps(prev => prev.filter((_, j) => j !== i))
  }

  function handleEditStepDragStart(i: number) {
    dragIndexRef.current = i
  }

  function handleEditStepDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    setDragOverIndex(i)
  }

  function handleEditStepDrop(i: number) {
    const from = dragIndexRef.current
    if (from === null || from === i) {
      dragIndexRef.current = null
      setDragOverIndex(null)
      return
    }
    setEditSteps(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(i, 0, moved)
      return next
    })
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  function handleEditStepDragEnd() {
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  function handleSave() {
    if (!editTitle.trim() || !onEdit) return
    const filledSteps = editSteps.filter(s => s.title.trim())
    const steps = hasSteps && filledSteps.length > 0 ? filledSteps : null
    onEdit(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      due_date: editDueDate || null,
      priority: editPriority,
      category: editCategory,
      steps,
    })
    setEditing(false)
  }

  function handleMainClick() {
    if (isCompleted) {
      setCompletionMsg('')
      onUncomplete(task.id)
      return
    }
    if (animatingComplete) return

    // Step-specific mode: complete that specific step
    if (hasSpecificStep && onCompleteSpecificStep && specificStep && !specificStepCompleted) {
      setShowRipple(true)
      setAnimatingComplete(true)
      // Check if this is the last incomplete step
      const allOthersDone = task.steps!.every((s, i) => i === stepIndex || s.completed)
      if (allOthersDone) { playComplete() } else { playStepComplete() }
      if (shouldShowInsight()) {
        setCompletionMsg(allOthersDone ? getCompletionMessage() : `Step ${stepIndex + 1} of ${totalSteps} done.`)
      }
      setTimeout(() => {
        onCompleteSpecificStep(task.id, stepIndex)
        setShowRipple(false)
        setAnimatingComplete(false)
      }, 500)
      return
    }

    // Original multi-step logic
    if (taskHasSteps && currentStep) {
      setShowRipple(true)
      setAnimatingComplete(true)
      if (isLastStep) { playComplete() } else { playStepComplete() }
      if (shouldShowInsight()) {
        setCompletionMsg(isLastStep ? getCompletionMessage() : `Step ${completedSteps + 1} of ${totalSteps} done.`)
      }
      setTimeout(() => {
        onCompleteStep(task.id)
        setShowRipple(false)
        setAnimatingComplete(false)
      }, 500)
    } else {
      playComplete()
      setShowRipple(true)
      setAnimatingComplete(true)
      if (shouldShowInsight()) { setCompletionMsg(getCompletionMessage()) }
      setTimeout(() => {
        onComplete(task.id)
        setShowRipple(false)
        setAnimatingComplete(false)
      }, 500)
    }
  }

  function handleUndoStep() {
    setCompletionMsg('')
    onUncomplete(task.id)
  }

  // ── Edit mode ──────────────────────────────────
  if (editing) {
    const filledEditSteps = editSteps.filter(s => s.title.trim())
    return (
      <div
        className="animate-reveal rounded-2xl border border-sage-200 bg-white p-5 space-y-3"
        style={{ animationDelay: `${index * 150}ms` }}
      >
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

        {/* Steps toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setHasSteps(!hasSteps)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${hasSteps ? 'bg-sage-500' : 'bg-stone-200'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${hasSteps ? 'translate-x-4' : ''}`} />
          </div>
          <span className="text-sm text-stone-600">Has steps</span>
        </label>

        {/* Steps editor */}
        {hasSteps && (
          <div className="space-y-2 pl-2 border-l-2 border-sage-200">
            {editSteps.map((step, i) => {
              const isFilled = step.title.trim() !== ''
              const isLast = i === editSteps.length - 1
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 flex-1 ${dragOverIndex === i && isFilled ? 'border-t-2 border-sage-400' : ''}`}
                    onDragOver={isFilled ? (e) => handleEditStepDragOver(e, i) : undefined}
                    onDrop={isFilled ? () => handleEditStepDrop(i) : undefined}
                  >
                    {isFilled ? (
                      <span
                        draggable
                        onDragStart={() => handleEditStepDragStart(i)}
                        onDragEnd={handleEditStepDragEnd}
                        className={`text-sm w-5 text-center cursor-grab active:cursor-grabbing select-none ${step.completed ? 'text-complete' : 'text-stone-300 hover:text-stone-500'}`}
                        title="Drag to reorder"
                      >
                        &#x2261;
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 w-5 text-right">{filledEditSteps.length + 1}.</span>
                    )}
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => updateEditStepTitle(i, e.target.value)}
                      className={`flex-1 px-2 py-1 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-sage-400 transition ${isLast && !isFilled ? 'bg-sage-50' : 'bg-white'} ${step.completed ? 'line-through text-stone-400' : ''}`}
                      placeholder={isLast && !isFilled ? 'Add a step...' : ''}
                    />
                  </div>
                  {isFilled && (
                    <button
                      type="button"
                      onClick={() => removeEditStep(i)}
                      className="text-stone-300 hover:text-terracotta transition text-sm"
                    >
                      &times;
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

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
            className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-500 text-xs font-medium hover:bg-stone-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editTitle.trim()}
            className="flex-1 py-2 rounded-xl bg-sage-500 text-white text-xs font-medium hover:bg-sage-600 disabled:opacity-50 transition"
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  // ── Display mode ──────────────────────────────────

  // Step-specific display mode
  if (hasSpecificStep && specificStep) {
    return (
      <div
        className={`animate-reveal rounded-2xl border p-5 transition-all duration-500 ${
          specificStepCompleted
            ? 'bg-complete-light/30 border-complete/20'
            : 'bg-white border-stone-200 hover:shadow-md hover:border-sage-300'
        }`}
        style={{ animationDelay: `${index * 150}ms` }}
      >
        <div className="flex items-start gap-4">
          {/* Completion circle */}
          <div className="relative mt-1">
            <button
              onClick={handleMainClick}
              disabled={animatingComplete}
              className={`relative z-10 w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-500 ${
                specificStepCompleted
                  ? 'bg-complete border-complete text-white scale-110 hover:bg-complete/60 hover:border-complete/60'
                  : animatingComplete
                    ? 'bg-complete border-complete text-white scale-110'
                    : 'border-stone-300 hover:border-sage-500 hover:scale-110 hover:bg-sage-50'
              }`}
              title={specificStepCompleted ? 'Undo completion' : `Complete: ${specificStep.title}`}
            >
              {(specificStepCompleted || animatingComplete) && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="animate-check" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            {showRipple && (
              <div className="absolute inset-0 rounded-full bg-complete/30 animate-ripple" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Parent title in smaller/lighter font */}
            <p className="text-xs text-stone-400 leading-snug">
              {emoji} {task.title} &middot; Step {stepIndex + 1}
            </p>

            {/* Step title as main content */}
            <p className={`font-medium leading-snug mt-0.5 transition-all duration-500 ${
              specificStepCompleted ? 'line-through text-stone-400' : 'text-stone-800'
            }`}>
              {specificStep.title}
            </p>

            {completionMsg && (
              <p className="text-sm text-complete mt-2 animate-fade-up italic">
                {completionMsg}
              </p>
            )}

            {!specificStepCompleted && (
              <div className="flex items-center gap-2 mt-3">
                {priorityInfo && (
                  <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
                )}
                <span className={`text-xs ${isOverdue ? 'text-terracotta font-medium' : effectiveDue.isDefault ? 'text-stone-300' : 'text-stone-400'}`}>
                  {dateText}
                </span>
                {onStartPomodoro && (
                  <div className="ml-auto flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={startEditing}
                        className="p-1.5 rounded-lg text-stone-300 hover:text-stone-500 transition"
                        title="Edit task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                    )}
                    <PomodoroButton taskTitle={`${task.title} - ${specificStep.title}`} onStart={onStartPomodoro} disabled={pomodoroActive} />
                  </div>
                )}
              </div>
            )}

            {specificStepCompleted && (
              <button
                onClick={(e) => { e.stopPropagation(); onConvertToWaiting(task.id) }}
                className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-xs font-medium text-stone-400 hover:text-sage-600 hover:bg-sage-100 transition"
                title="Convert to follow-up"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                F/U
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Original display mode (no stepIndex) ──────────────────────────────────
  return (
    <div
      className={`animate-reveal rounded-2xl border p-5 transition-all duration-500 ${
        isCompleted
          ? 'bg-complete-light/30 border-complete/20'
          : 'bg-white border-stone-200 hover:shadow-md hover:border-sage-300'
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Completion circle */}
        <div className="relative mt-1">
          <button
            onClick={handleMainClick}
            disabled={animatingComplete}
            className={`relative z-10 w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-500 ${
              isCompleted
                ? 'bg-complete border-complete text-white scale-110 hover:bg-complete/60 hover:border-complete/60'
                : animatingComplete
                  ? 'bg-complete border-complete text-white scale-110'
                  : 'border-stone-300 hover:border-sage-500 hover:scale-110 hover:bg-sage-50'
            }`}
            title={isCompleted ? 'Undo completion' : taskHasSteps && currentStep ? `Complete: ${currentStep.title}` : 'Complete'}
          >
            {(isCompleted || animatingComplete) && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="animate-check" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          {showRipple && (
            <div className="absolute inset-0 rounded-full bg-complete/30 animate-ripple" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-medium leading-snug transition-all duration-500 ${
            isCompleted ? 'line-through text-stone-400' : 'text-stone-800'
          }`}>
            {emoji} {task.title}
          </p>

          {/* Current step display for multi-step tasks */}
          {taskHasSteps && !isCompleted && currentStep && (
            <div className="mt-2 pl-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-stone-400">
                  Step {completedSteps + 1} of {totalSteps}
                </span>
                <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden max-w-20">
                  <div
                    className="h-full bg-sage-400 rounded-full transition-all duration-500"
                    style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                  />
                </div>
                {hasCompletedSteps && (
                  <button
                    onClick={handleUndoStep}
                    className="text-stone-300 hover:text-terracotta transition text-xs flex items-center gap-0.5"
                    title="Undo last step"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-sage-700 font-medium">
                {currentStep.title}
              </p>
            </div>
          )}

          {task.description && !isCompleted && !currentStep && (
            <p className="text-sm text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          {isCompleted && (
            <button
              onClick={(e) => { e.stopPropagation(); onConvertToWaiting(task.id) }}
              className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-xs font-medium text-stone-400 hover:text-sage-600 hover:bg-sage-100 transition"
              title="Convert to follow-up"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              F/U
            </button>
          )}

          {completionMsg && (
            <p className="text-sm text-complete mt-2 animate-fade-up italic">
              {completionMsg}
            </p>
          )}

          {!isCompleted && !currentStep && (
            <div className="flex items-center gap-2 mt-3">
              {priorityInfo && (
                <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
              )}
              <span className={`text-xs ${isOverdue ? 'text-terracotta font-medium' : effectiveDue.isDefault ? 'text-stone-300' : 'text-stone-400'}`}>
                {dateText}
              </span>
              {onStartPomodoro && (
                <div className="ml-auto flex items-center gap-1">
                  {onEdit && (
                    <button
                      onClick={startEditing}
                      className="p-1.5 rounded-lg text-stone-300 hover:text-stone-500 transition"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                  )}
                  <PomodoroButton taskTitle={task.title} onStart={onStartPomodoro} disabled={pomodoroActive} />
                </div>
              )}
            </div>
          )}

          {/* Edit button for step tasks (shown below step display) */}
          {!isCompleted && currentStep && onEdit && (
            <button
              onClick={startEditing}
              className="mt-2 p-1 rounded text-stone-300 hover:text-stone-500 transition"
              title="Edit task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

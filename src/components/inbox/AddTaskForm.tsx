import { useState, type FormEvent } from 'react'
import { PRIORITIES, CATEGORIES } from '../../lib/constants'
import { getBrainDumpMessage } from '../../lib/celebrations'
import { playCapture } from '../../lib/sounds'
import type { NewTask, Step } from '../../types'

interface Props {
  onAdd: (task: NewTask) => Promise<unknown>
  onClose: () => void
  taskCount: number
}

export default function AddTaskForm({ onAdd, onClose, taskCount }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<1 | 2 | 3>(2)
  const [category, setCategory] = useState('general')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [reliefMsg, setReliefMsg] = useState('')
  const [savedCount, setSavedCount] = useState(0)

  // Steps (multi-step toggle)
  const [hasSteps, setHasSteps] = useState(false)
  const [steps, setSteps] = useState<string[]>([''])
  const [stepInput, setStepInput] = useState('')

  function addStep() {
    const text = stepInput.trim()
    if (!text) return
    setSteps(prev => [...prev.filter(s => s !== ''), text, ''])
    setStepInput('')
  }

  function removeStep(index: number) {
    setSteps(prev => prev.filter((_, i) => i !== index))
  }

  function updateStep(index: number, value: string) {
    setSteps(prev => prev.map((s, i) => (i === index ? value : s)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    const filledSteps = steps.filter(s => s.trim())
    const taskSteps: Step[] | null = hasSteps && filledSteps.length > 0
      ? filledSteps.map((s, i) => ({ id: `step-${i}-${Date.now()}`, title: s.trim(), completed: false }))
      : null

    await onAdd({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate || null,
      priority,
      category,
      steps: taskSteps,
    })
    setSaving(false)
    playCapture()
    const newCount = savedCount + 1
    setSavedCount(newCount)

    setReliefMsg(getBrainDumpMessage(newCount))
    setJustSaved(true)

    // Reset for next entry
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority(2)
    setCategory('general')
    setHasSteps(false)
    setSteps([''])
    setStepInput('')

    setTimeout(() => setJustSaved(false), 3000)
  }

  const totalCaptured = taskCount + savedCount

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-stone-400 text-xs text-center leading-relaxed">
        Cast all your anxieties on Him, for He cares for you.
      </p>

      <div>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-sage-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sage-400 transition text-base"
          placeholder="What's on your mind?"
          autoFocus
        />
      </div>

      <div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-sage-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sage-400 transition resize-none text-sm"
          placeholder="Notes (optional)"
        />
      </div>

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

      {/* Steps builder */}
      {hasSteps && (
        <div className="space-y-2 pl-2 border-l-2 border-sage-200">
          {steps.filter(s => s.trim()).map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-stone-400 w-5 text-right">{i + 1}.</span>
              <input
                type="text"
                value={step}
                onChange={e => updateStep(i, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-sage-400 transition"
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
            <span className="text-xs text-stone-400 w-5 text-right">{steps.filter(s => s.trim()).length + 1}.</span>
            <input
              type="text"
              value={stepInput}
              onChange={e => setStepInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStep() } }}
              className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-sage-400 transition"
              placeholder="Add a step..."
            />
            <button
              type="button"
              onClick={addStep}
              disabled={!stepInput.trim()}
              className="text-sage-500 hover:text-sage-700 disabled:text-stone-300 transition text-lg font-medium"
            >
              +
            </button>
          </div>
          <p className="text-xs text-stone-400 pl-7">
            Steps show one at a time on the dashboard.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">When</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Weight</label>
          <select
            value={priority}
            onChange={e => setPriority(Number(e.target.value) as 1 | 2 | 3)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 transition"
          >
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Area</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 transition"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {justSaved && (
        <div className="text-center animate-fade-up">
          <p className="text-complete text-sm font-medium">{reliefMsg}</p>
          <p className="text-stone-400 text-xs mt-1">Keep going, or close when you're done.</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 font-medium hover:bg-stone-50 transition"
        >
          {savedCount > 0 ? 'Done' : 'Cancel'}
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex-1 py-2.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 disabled:opacity-50 transition"
        >
          {saving ? 'Capturing...' : 'Capture'}
        </button>
      </div>

      <p className="text-center text-xs text-stone-400">
        {totalCaptured} thought{totalCaptured !== 1 ? 's' : ''} safely stored
      </p>
    </form>
  )
}

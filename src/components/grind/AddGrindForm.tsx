import { useState } from 'react'
import type { NewGrind } from '../../types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  onAdd: (grind: NewGrind) => Promise<void> | void
  onClose: () => void
}

export default function AddGrindForm({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [disabledDays, setDisabledDays] = useState<number[]>([])

  function toggleDay(day: number) {
    setDisabledDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await onAdd({ title: title.trim(), description: description.trim(), disabled_days: disabledDays })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          What will you tend daily?
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Morning prayer, 20 pushups, Read 10 pages"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-sage-400 focus:ring-1 focus:ring-sage-400 outline-none transition text-stone-800 placeholder:text-stone-300"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Description <span className="text-stone-400 font-normal">(links, details)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. https://example.com/workout-plan or notes about this habit"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-sage-400 focus:ring-1 focus:ring-sage-400 outline-none transition text-stone-800 placeholder:text-stone-300 resize-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Days off <span className="text-stone-400 font-normal">(tap to disable)</span>
        </label>
        <div className="flex gap-1.5">
          {DAYS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                disabledDays.includes(i)
                  ? 'bg-stone-200 text-stone-400 line-through'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
        className="w-full py-3 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all duration-300 disabled:opacity-40 disabled:hover:bg-sage-500"
      >
        Plant Seed
      </button>
    </form>
  )
}

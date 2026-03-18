import { useState } from 'react'

interface Props {
  taskTitle: string
  onConfirm: (date: string) => void
  onCancel: () => void
}

export default function WaitingDatePrompt({ taskTitle, onConfirm, onCancel }: Props) {
  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 7)
  const [date, setDate] = useState(defaultDate.toLocaleDateString('en-CA'))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 w-full max-w-sm mx-4 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h3 className="text-sm font-semibold text-stone-800">Follow up on:</h3>
          <p className="text-sm text-stone-500 mt-1 line-clamp-2">{taskTitle}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Reminder date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 transition"
            autoFocus
          />
          <p className="text-[10px] text-stone-400 mt-1">Badge appears when this date is reached</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 font-medium hover:bg-stone-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(date)}
            className="flex-1 py-2.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition text-sm"
          >
            Move to Waiting
          </button>
        </div>
      </div>
    </div>
  )
}

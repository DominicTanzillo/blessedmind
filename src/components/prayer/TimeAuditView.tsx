import { useState } from 'react'
import type { TimeAudit } from '../../types'

interface Props {
  activeAudit: TimeAudit
  currentBlock: number
  remainingSeconds: number
  onRecord: (note: string) => void
  onComplete: () => void
  onCancel: () => void
  onBack: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatElapsed(startedAt: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const TOTAL_BLOCKS = 32

export default function TimeAuditView({ activeAudit, currentBlock, remainingSeconds, onRecord, onComplete, onCancel, onBack }: Props) {
  const [note, setNote] = useState('')
  const [confirmEnd, setConfirmEnd] = useState(false)

  function handleRecord() {
    if (!note.trim()) return
    onRecord(note.trim())
    setNote('')
  }

  const progress = activeAudit.entries.length / TOTAL_BLOCKS
  const circumference = 2 * Math.PI * 42
  const blockProgress = 1 - remainingSeconds / (15 * 60)

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-stone-800">Time Audit</h1>
          <p className="text-xs text-stone-400">{formatElapsed(activeAudit.started_at)} elapsed</p>
        </div>
      </div>

      {/* Circular countdown */}
      <div className="flex justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e7e5e4" strokeWidth="4" />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="#95a383"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - blockProgress)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-stone-800 tabular-nums">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-xs text-stone-400 mt-1">
              Block {currentBlock} of {TOTAL_BLOCKS}
            </span>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-stone-400">
          <span>{activeAudit.entries.length} entries</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-400 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Note input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-600">What did you accomplish?</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleRecord() }}
            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-sage-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 transition"
            placeholder="e.g. Reviewed PR #42, wrote tests..."
            autoFocus
          />
          <button
            onClick={handleRecord}
            disabled={!note.trim()}
            className="px-4 py-3 rounded-xl bg-sage-500 text-white font-medium text-sm hover:bg-sage-600 disabled:opacity-50 transition"
          >
            Log
          </button>
        </div>
      </div>

      {/* Past entries log */}
      {activeAudit.entries.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Log</p>
          {[...activeAudit.entries].reverse().map((entry, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white border border-stone-100">
              <span className="text-xs font-medium text-sage-600 bg-sage-100 px-2 py-0.5 rounded-full flex-shrink-0">
                #{entry.block}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-700">{entry.note}</p>
                <p className="text-[10px] text-stone-300 mt-0.5">
                  {new Date(entry.recorded_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End Audit */}
      <div className="pt-2 flex gap-3">
        {!confirmEnd ? (
          <button
            onClick={() => setConfirmEnd(true)}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-500 font-medium hover:bg-stone-50 transition"
          >
            End Audit
          </button>
        ) : (
          <>
            <button
              onClick={() => setConfirmEnd(false)}
              className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-500 font-medium hover:bg-stone-50 transition"
            >
              Keep Going
            </button>
            <button
              onClick={onComplete}
              className="flex-1 py-3 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition"
            >
              Complete
            </button>
            <button
              onClick={onCancel}
              className="py-3 px-4 rounded-xl border border-terracotta/30 text-terracotta text-sm font-medium hover:bg-terracotta/5 transition"
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  )
}

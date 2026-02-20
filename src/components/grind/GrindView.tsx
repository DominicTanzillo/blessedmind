import { useState } from 'react'
import PlantSVG from './PlantSVG'
import AddGrindForm from './AddGrindForm'
import Modal from '../ui/Modal'
import { plantStage, STAGE_NAMES } from '../../hooks/useGrinds'
import type { Grind, NewGrind, PlantHealth } from '../../types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Turn plain-text URLs into clickable links */
function Linkify({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return (
    <>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-sage-600 underline underline-offset-2 hover:text-sage-800 break-all">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

interface Props {
  grinds: Grind[]
  retiredGrinds: Grind[]
  healthMap: Map<string, PlantHealth>
  onAdd: (grind: NewGrind) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Pick<Grind, 'title' | 'description' | 'disabled_days'>>) => void
  onRetire: (id: string) => void
  onReactivate: (id: string) => void
  onUncomplete: (id: string) => void
}

export default function GrindView({ grinds, retiredGrinds, healthMap, onAdd, onDelete, onUpdate, onRetire, onReactivate, onUncomplete }: Props) {
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedRetiredId, setSelectedRetiredId] = useState<string | null>(null)

  const canAddActive = grinds.length < 2
  const totalGrinds = grinds.length + retiredGrinds.length

  if (grinds.length === 0 && retiredGrinds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PlantSVG stage={0} size="lg" />
        <h2 className="text-xl font-semibold text-stone-700 mt-6 mb-2">Plant your first seed</h2>
        <p className="text-stone-400 text-sm max-w-xs leading-relaxed mb-6">
          Daily habits take root here. Add a grind and watch it grow with your consistency.
        </p>
        <button
          onClick={() => setAddOpen(true)}
          className="px-6 py-3 rounded-2xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all duration-300 hover:scale-[1.02]"
        >
          Plant a Seed
        </button>
        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Plant a Seed">
          <AddGrindForm onAdd={onAdd} onClose={() => setAddOpen(false)} />
        </Modal>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-2">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold text-stone-800">Your Garden</h1>
        <p className="text-stone-400 text-sm">Daily habits take root here.</p>
      </div>

      {/* Active grinds */}
      <div className="space-y-4">
        {grinds.map(g => (
          <GrindGardenCard
            key={g.id}
            grind={g}
            health={healthMap.get(g.id) ?? 'healthy'}
            editing={editingId === g.id}
            onEdit={() => setEditingId(editingId === g.id ? null : g.id)}
            onUpdate={onUpdate}
            onRetire={onRetire}
            onUncomplete={onUncomplete}
          />
        ))}
      </div>

      {canAddActive && (
        <div className="text-center pt-2">
          <button
            onClick={() => setAddOpen(true)}
            disabled={totalGrinds >= 10}
            className="px-6 py-3 rounded-2xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Plant a Seed
          </button>
        </div>
      )}

      {/* Terrarium */}
      {retiredGrinds.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Terrarium</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {retiredGrinds.map(g => (
              <RetiredPlantCard
                key={g.id}
                grind={g}
                selected={selectedRetiredId === g.id}
                onSelect={() => setSelectedRetiredId(selectedRetiredId === g.id ? null : g.id)}
                onReactivate={() => { onReactivate(g.id); setSelectedRetiredId(null) }}
                onDelete={() => { onDelete(g.id); setSelectedRetiredId(null) }}
                canReactivate={canAddActive}
              />
            ))}
          </div>

          {retiredGrinds.length >= 10 && (
            <p className="text-center text-xs text-stone-400 italic">Terrarium is full</p>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Plant a Seed">
        <AddGrindForm onAdd={onAdd} onClose={() => setAddOpen(false)} />
      </Modal>
    </div>
  )
}

// ── Active garden card ──────────────────────────────────────

interface CardProps {
  grind: Grind
  health: PlantHealth
  editing: boolean
  onEdit: () => void
  onUpdate: (id: string, updates: Partial<Pick<Grind, 'title' | 'description' | 'disabled_days'>>) => void
  onRetire: (id: string) => void
  onUncomplete: (id: string) => void
}

function GrindGardenCard({ grind, health, editing, onEdit, onUpdate, onRetire, onUncomplete }: CardProps) {
  const stage = plantStage(grind.current_streak)
  const [title, setTitle] = useState(grind.title)
  const [description, setDescription] = useState(grind.description)
  const [disabledDays, setDisabledDays] = useState(grind.disabled_days)
  const [confirmRetire, setConfirmRetire] = useState(false)
  const completedToday = grind.last_completed_date === new Date().toLocaleDateString('en-CA')

  function toggleDay(day: number) {
    setDisabledDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function handleSave() {
    if (!title.trim()) return
    onUpdate(grind.id, { title: title.trim(), description: description.trim(), disabled_days: disabledDays })
    onEdit() // close edit
  }

  return (
    <div className="rounded-2xl border border-sage-200 bg-gradient-to-r from-sage-50 to-white p-5 transition-all duration-300">
      <div className="flex items-center gap-5">
        <PlantSVG stage={stage} size="md" colorVariant={grind.color_variant} health={health} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-800">{grind.title}</p>
          {grind.description && !editing && (
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed line-clamp-2">
              <Linkify text={grind.description} />
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-sage-600 font-medium">{STAGE_NAMES[stage]}</span>
            <span className="text-stone-400">{grind.current_streak}d streak</span>
            <span className="text-stone-300">best {grind.best_streak}d</span>
          </div>
          {completedToday && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-complete font-medium">Done today</span>
              <button
                onClick={() => onUncomplete(grind.id)}
                className="text-xs text-stone-400 hover:text-terracotta transition"
              >
                Undo
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onEdit}
          className="text-stone-300 hover:text-stone-500 transition p-1"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-stone-100 space-y-4 animate-fade-up">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-sage-400 focus:ring-1 focus:ring-sage-400 outline-none text-sm text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Description / Links</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notes, links, or details about this habit"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-sage-400 focus:ring-1 focus:ring-sage-400 outline-none text-sm text-stone-800 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Days off</label>
            <div className="flex gap-1.5">
              {DAYS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
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

          <div className="flex items-center justify-between">
            {!confirmRetire ? (
              <button
                onClick={() => setConfirmRetire(true)}
                className="text-xs text-stone-400 hover:text-terracotta transition"
              >
                Retire to Terrarium
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-terracotta">Retire?</span>
                <button
                  onClick={() => onRetire(grind.id)}
                  className="text-xs text-terracotta font-medium hover:underline"
                >
                  Yes, retire it
                </button>
                <button
                  onClick={() => setConfirmRetire(false)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  No
                </button>
              </div>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-sage-500 text-white text-xs font-medium hover:bg-sage-600 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Retired plant card (terrarium grid) ─────────────────────

interface RetiredCardProps {
  grind: Grind
  selected: boolean
  onSelect: () => void
  onReactivate: () => void
  onDelete: () => void
  canReactivate: boolean
}

function RetiredPlantCard({ grind, selected, onSelect, onReactivate, onDelete, canReactivate }: RetiredCardProps) {
  const stage = plantStage(grind.current_streak)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className={`rounded-xl border p-4 text-center transition-all duration-300 cursor-pointer ${
        selected ? 'border-sage-400 bg-sage-50 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-center mb-2">
        <PlantSVG stage={stage} size="md" colorVariant={grind.color_variant} />
      </div>
      <p className="text-sm font-medium text-stone-700 truncate">{grind.title}</p>
      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-stone-400">
        <span>{STAGE_NAMES[stage]}</span>
        <span>{grind.best_streak}d best</span>
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 animate-fade-up" onClick={e => e.stopPropagation()}>
          {canReactivate && (
            <button
              onClick={onReactivate}
              className="w-full py-1.5 rounded-lg bg-sage-100 text-sage-700 text-xs font-medium hover:bg-sage-200 transition"
            >
              Reactivate
            </button>
          )}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-1.5 rounded-lg text-xs text-stone-400 hover:text-terracotta transition"
            >
              Remove
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-terracotta">Sure?</span>
              <button onClick={onDelete} className="text-xs text-terracotta font-medium hover:underline">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-stone-400">No</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

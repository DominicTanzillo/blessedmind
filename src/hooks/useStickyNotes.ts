import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Item } from '../types'

const LS_KEY = 'stickynotes-show-on-focus'

export interface NoteGroup {
  id: string
  slot: number
  items: Item[]
  allDone: boolean
  createdAt: string
}

// Color palette: mostly warm, rare blue/green streaks
const NOTE_PALETTE = [
  { bg: '#fef3c7', accent: '#fde68a', text: '#78350f', check: '#b45309' },  // yellow
  { bg: '#ffedd5', accent: '#fdba74', text: '#7c2d12', check: '#c2410c' },  // orange
  { bg: '#fef9c3', accent: '#fef08a', text: '#713f12', check: '#a16207' },  // warm yellow
  { bg: '#fff1f2', accent: '#fecdd3', text: '#881337', check: '#be123c' },  // rose
  { bg: '#e0f2fe', accent: '#bae6fd', text: '#0c4a6e', check: '#0369a1' },  // sky blue (rare)
  { bg: '#dcfce7', accent: '#bbf7d0', text: '#14532d', check: '#15803d' },  // mint green (rare)
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return h >>> 0
}

export function noteColor(noteId: string) {
  const h = hashStr(noteId)
  const roll = h % 100
  if (roll === 0) return NOTE_PALETTE[5]             // mint green (1/100!)
  if (roll < 3) return NOTE_PALETTE[4]               // sky blue (2/100 ≈ 1/50)
  if (roll < 8) return NOTE_PALETTE[3]               // rose (5/100 ≈ 1/20)
  if (roll < 40) return NOTE_PALETTE[1 + (h >> 4) % 2]  // orange or warm yellow
  return NOTE_PALETTE[0]                              // yellow (most common)
}

export function noteHasLines(noteId: string): boolean {
  return hashStr(noteId + 'lines') % 5 < 2  // 40%
}

export function noteRotation(noteId: string): number {
  return ((hashStr(noteId + 'rot') % 5) - 2) * 0.8  // -1.6 to 1.6 degrees
}

export function useStickyNotes() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnFocus, setShowOnFocus] = useState(() => localStorage.getItem(LS_KEY) === 'true')

  const toggleShowOnFocus = useCallback(() => {
    setShowOnFocus(prev => { const n = !prev; localStorage.setItem(LS_KEY, String(n)); return n })
  }, [])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('items').select('*').eq('item_type', 'friction')
      .order('created_at', { ascending: true })
    if (data) setItems(data as Item[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  useEffect(() => {
    const channel = supabase
      .channel('stickynotes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (payload) => {
        const row = payload.new as Item
        if (payload.eventType === 'INSERT' && row.item_type === 'friction') {
          setItems(prev => prev.some(i => i.id === row.id) ? prev : [...prev, row])
        } else if (payload.eventType === 'UPDATE') {
          if (row.item_type !== 'friction') {
            setItems(prev => prev.filter(i => i.id !== row.id))
          } else {
            setItems(prev => prev.map(i => i.id === row.id ? row : i))
          }
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as { id: string }).id
          setItems(prev => prev.filter(i => i.id !== oldId))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Group items into note sessions by description field
  const noteGroups = useMemo(() => {
    const groups = new Map<string, NoteGroup>()
    for (const item of items) {
      const id = item.description || 'default'
      if (!groups.has(id)) {
        groups.set(id, { id, slot: item.position ?? 0, items: [], allDone: true, createdAt: item.created_at })
      }
      const g = groups.get(id)!
      g.items.push(item)
      if (!item.completed) g.allDone = false
    }
    return [...groups.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [items])

  // Active note per slot: the latest note in that slot with incomplete items
  const activeNote1 = useMemo(() => {
    const slot0 = noteGroups.filter(g => g.slot === 0 && !g.allDone)
    return slot0.length > 0 ? slot0[slot0.length - 1] : null
  }, [noteGroups])

  const activeNote2 = useMemo(() => {
    const slot1 = noteGroups.filter(g => g.slot === 1 && !g.allDone)
    return slot1.length > 0 ? slot1[slot1.length - 1] : null
  }, [noteGroups])

  // Completed notes (the pile) — all notes where every item is done
  const completedNotes = useMemo(() =>
    noteGroups.filter(g => g.allDone && g.items.length > 0),
    [noteGroups]
  )

  // Can start a new note in a slot only if no active note exists there
  const canStartNote1 = activeNote1 === null
  const canStartNote2 = activeNote2 === null

  const addItem = useCallback(async (title: string, slot: number) => {
    // Find active note for this slot, or start a new one
    const slotItems = items.filter(i => (i.position ?? 0) === slot)
    const noteIds = [...new Set(slotItems.map(i => i.description || ''))]
    let activeNoteId = ''
    for (const nid of noteIds) {
      if (slotItems.filter(i => (i.description || '') === nid).some(i => !i.completed)) {
        activeNoteId = nid
        break
      }
    }
    const noteId = activeNoteId || `note-${Date.now()}`

    const { data, error } = await supabase.from('items').insert({
      title, description: noteId, item_type: 'friction', priority: 3, category: 'general', position: slot,
    }).select().single()
    if (!error && data) {
      setItems(prev => prev.some(i => i.id === data.id) ? prev : [...prev, data as Item])
    }
  }, [items])

  const toggleItem = useCallback(async (id: string, currentlyCompleted: boolean) => {
    const now = new Date().toISOString()
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, completed: !currentlyCompleted, completed_at: !currentlyCompleted ? now : null, updated_at: now } : i
    ))
    await supabase.from('items').update({
      completed: !currentlyCompleted, completed_at: !currentlyCompleted ? now : null, updated_at: now,
    }).eq('id', id)
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('items').delete().eq('id', id)
  }, [])

  const promoteToTask = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('items').update({
      item_type: 'task', priority: 2, updated_at: new Date().toISOString(),
    }).eq('id', id)
  }, [])

  return {
    activeNote1, activeNote2, completedNotes, canStartNote1, canStartNote2,
    loading, addItem, toggleItem, deleteItem, promoteToTask, showOnFocus, toggleShowOnFocus,
  }
}

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Item } from '../types'

const LS_KEY = 'stickynotes-show-on-focus'

export function useStickyNotes() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnFocus, setShowOnFocus] = useState(() => localStorage.getItem(LS_KEY) === 'true')

  const toggleShowOnFocus = useCallback(() => {
    setShowOnFocus(prev => {
      const next = !prev
      localStorage.setItem(LS_KEY, String(next))
      return next
    })
  }, [])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('item_type', 'friction')
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false })
    if (data) setItems(data as Item[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  useEffect(() => {
    const channel = supabase
      .channel('stickynotes-realtime')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'items',
      }, (payload) => {
        const row = payload.new as Item
        if (payload.eventType === 'INSERT' && row.item_type === 'friction') {
          setItems(prev => prev.some(i => i.id === row.id) ? prev : [row, ...prev])
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

  const today = new Date().toLocaleDateString('en-CA')

  // Two sticky notes: position 0 = note 1 (left), position 1 = note 2 (right)
  const note1Items = useMemo(() =>
    items.filter(i => i.created_at.split('T')[0] === today && (i.position ?? 0) === 0),
    [items, today]
  )
  const note2Items = useMemo(() =>
    items.filter(i => i.created_at.split('T')[0] === today && i.position === 1),
    [items, today]
  )

  const groupedPrevious = useMemo(() => {
    const groups: Record<string, Item[]> = {}
    for (const item of items) {
      const date = item.created_at.split('T')[0]
      if (date === today) continue
      if (!groups[date]) groups[date] = []
      groups[date].push(item)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [items, today])

  const addItem = useCallback(async (title: string, noteIndex: number = 0) => {
    const { data, error } = await supabase.from('items').insert({
      title, description: '', item_type: 'friction', priority: 3, category: 'general',
      position: noteIndex,
    }).select().single()
    if (!error && data) {
      setItems(prev => prev.some(i => i.id === data.id) ? prev : [data as Item, ...prev])
    }
  }, [])

  const toggleItem = useCallback(async (id: string, currentlyCompleted: boolean) => {
    const now = new Date().toISOString()
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, completed: !currentlyCompleted, completed_at: !currentlyCompleted ? now : null, updated_at: now } : i
    ))
    await supabase.from('items').update({
      completed: !currentlyCompleted,
      completed_at: !currentlyCompleted ? now : null,
      updated_at: now,
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

  return { note1Items, note2Items, groupedPrevious, loading, addItem, toggleItem, deleteItem, promoteToTask, showOnFocus, toggleShowOnFocus }
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Item } from '../types'

export interface Prayer {
  id: string
  completed_at: string
  created_at: string
}

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

export function usePrayers() {
  const [prayers, setPrayers] = useState<Prayer[]>([])

  // Fetch prayer items from last 2 weeks
  useEffect(() => {
    const cutoff = new Date(Date.now() - TWO_WEEKS_MS).toISOString()
    supabase
      .from('items')
      .select('id, completed_at, created_at')
      .eq('item_type', 'prayer')
      .gte('completed_at', cutoff)
      .order('completed_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setPrayers(data.map((d: Record<string, string>) => ({
            id: d.id,
            completed_at: d.completed_at,
            created_at: d.created_at,
          })))
        }
      })
  }, [])

  // Realtime subscription — listen for prayer items
  useEffect(() => {
    const channel = supabase
      .channel('prayer-items-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as Item
          if (row.item_type === 'prayer') {
            const prayer: Prayer = {
              id: row.id,
              completed_at: row.completed_at ?? row.created_at,
              created_at: row.created_at,
            }
            setPrayers(prev => prev.some(p => p.id === prayer.id) ? prev : [prayer, ...prev])
          }
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as { id: string }).id
          setPrayers(prev => prev.filter(p => p.id !== oldId))
        }
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const recordPrayer = useCallback(async () => {
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('items')
      .insert({
        title: 'Prayer',
        item_type: 'prayer',
        completed: true,
        completed_at: now,
        description: '',
      })
      .select()
      .single()

    if (data) {
      const row = data as Item
      const prayer: Prayer = {
        id: row.id,
        completed_at: row.completed_at ?? row.created_at,
        created_at: row.created_at,
      }
      setPrayers(prev => prev.some(p => p.id === prayer.id) ? prev : [prayer, ...prev])
    }
  }, [])

  return { prayers, prayerCount: prayers.length, recordPrayer }
}

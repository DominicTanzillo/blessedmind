import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Prayer {
  id: string
  completed_at: string
  created_at: string
}

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

export function usePrayers() {
  const [prayers, setPrayers] = useState<Prayer[]>([])

  // Fetch prayers from last 2 weeks
  useEffect(() => {
    const cutoff = new Date(Date.now() - TWO_WEEKS_MS).toISOString()
    supabase
      .from('prayers')
      .select('*')
      .gte('completed_at', cutoff)
      .order('completed_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPrayers(data as Prayer[])
      })
  }, [])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('prayers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayers' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as Prayer
          setPrayers(prev => prev.some(p => p.id === row.id) ? prev : [row, ...prev])
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as { id: string }).id
          setPrayers(prev => prev.filter(p => p.id !== oldId))
        }
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const recordPrayer = useCallback(async () => {
    const { data } = await supabase
      .from('prayers')
      .insert({})
      .select()
      .single()

    if (data) {
      setPrayers(prev => prev.some(p => p.id === (data as Prayer).id) ? prev : [data as Prayer, ...prev])
    }
  }, [])

  return { prayers, prayerCount: prayers.length, recordPrayer }
}

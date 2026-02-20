import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Grind, NewGrind, MissedDay } from '../types'

function todayStr(): string {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
}

/** Map streak length to plant stage 0–4 */
export function plantStage(streak: number): 0 | 1 | 2 | 3 | 4 {
  if (streak >= 30) return 4
  if (streak >= 14) return 3
  if (streak >= 7) return 2
  if (streak >= 3) return 1
  return 0
}

export const STAGE_NAMES = ['Seed', 'Sprout', 'Sapling', 'Bloom', 'Tree'] as const

export function useGrinds() {
  const [grinds, setGrinds] = useState<Grind[]>([])
  const [missedDays, setMissedDays] = useState<MissedDay[]>([])
  const [loading, setLoading] = useState(true)

  const today = todayStr()

  // ── Fetch ────────────────────────────────────────────────
  const fetchGrinds = useCallback(async () => {
    const { data } = await supabase
      .from('grinds')
      .select('*')
      .order('created_at', { ascending: true })

    if (data) setGrinds(data as Grind[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchGrinds() }, [fetchGrinds])

  // ── Missed days detection (runs once after fetch) ────────
  useEffect(() => {
    if (loading || grinds.length === 0) return

    const missed: MissedDay[] = []
    const updates: { id: string; last_checked_date: string }[] = []

    for (const g of grinds) {
      const lastChecked = g.last_checked_date ?? g.created_at.slice(0, 10)
      const startDate = new Date(lastChecked + 'T00:00:00')
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      // Walk each day from day-after-last-checked to yesterday
      const d = new Date(startDate)
      d.setDate(d.getDate() + 1) // start from day after last checked

      while (d <= yesterday) {
        const dayOfWeek = d.getDay()
        const dateStr = d.toLocaleDateString('en-CA')

        // Skip disabled days and the already-completed date
        if (!g.disabled_days.includes(dayOfWeek) && dateStr !== g.last_completed_date) {
          missed.push({
            grindId: g.id,
            grindTitle: g.title,
            date: dateStr,
          })
        }
        d.setDate(d.getDate() + 1)
      }

      updates.push({ id: g.id, last_checked_date: today })
    }

    if (missed.length > 0) {
      setMissedDays(missed)
    }

    // Batch-update last_checked_date to today
    updates.forEach(({ id, last_checked_date }) => {
      supabase.from('grinds').update({ last_checked_date }).eq('id', id).then()
    })

    // Update local state
    setGrinds(prev => prev.map(g => ({ ...g, last_checked_date: today })))
  }, [loading, grinds.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Computed ─────────────────────────────────────────────
  const completedTodayMap = new Map<string, boolean>()
  for (const g of grinds) {
    completedTodayMap.set(g.id, g.last_completed_date === today)
  }

  /** Grinds active today: not completed + not disabled for today's day-of-week */
  const dayOfWeek = new Date().getDay()
  const activeGrinds = grinds.filter(g =>
    !completedTodayMap.get(g.id) && !g.disabled_days.includes(dayOfWeek)
  )

  /** Grinds enabled today (regardless of completion) */
  const enabledToday = grinds.filter(g => !g.disabled_days.includes(dayOfWeek))
  const enabledGrindCount = enabledToday.length
  const completedGrindCount = enabledToday.filter(g => completedTodayMap.get(g.id)).length

  // ── Actions ──────────────────────────────────────────────

  const completeGrind = useCallback(async (id: string) => {
    const grind = grinds.find(g => g.id === id)
    if (!grind) return

    const newStreak = grind.current_streak + 1
    const newBest = Math.max(grind.best_streak, newStreak)

    const updates = {
      last_completed_date: today,
      current_streak: newStreak,
      best_streak: newBest,
      updated_at: new Date().toISOString(),
    }

    await supabase.from('grinds').update(updates).eq('id', id)
    setGrinds(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
  }, [grinds, today])

  const reconcileMissedDay = useCallback((grindId: string, date: string, didComplete: boolean) => {
    if (didComplete) {
      // "Yes" — streak continues, remove this missed day
      setMissedDays(prev => prev.filter(m => !(m.grindId === grindId && m.date === date)))
    } else {
      // "No" — reset streak, discard ALL remaining missed days for this grind
      setMissedDays(prev => prev.filter(m => m.grindId !== grindId))
      // Reset streak in DB + local
      const updates = {
        current_streak: 0,
        updated_at: new Date().toISOString(),
      }
      supabase.from('grinds').update(updates).eq('id', grindId).then()
      setGrinds(prev => prev.map(g => g.id === grindId ? { ...g, ...updates } : g))
    }
  }, [])

  const addGrind = useCallback(async (newGrind: NewGrind) => {
    const { data } = await supabase
      .from('grinds')
      .insert({
        title: newGrind.title,
        disabled_days: newGrind.disabled_days ?? [],
        last_checked_date: today,
      })
      .select()
      .single()

    if (data) setGrinds(prev => [...prev, data as Grind])
  }, [today])

  const deleteGrind = useCallback(async (id: string) => {
    await supabase.from('grinds').delete().eq('id', id)
    setGrinds(prev => prev.filter(g => g.id !== id))
  }, [])

  const updateGrind = useCallback(async (id: string, updates: Partial<Pick<Grind, 'title' | 'disabled_days'>>) => {
    const merged = { ...updates, updated_at: new Date().toISOString() }
    await supabase.from('grinds').update(merged).eq('id', id)
    setGrinds(prev => prev.map(g => g.id === id ? { ...g, ...merged } : g))
  }, [])

  return {
    grinds,
    activeGrinds,
    enabledGrindCount,
    completedGrindCount,
    completedTodayMap,
    missedDays,
    loading,
    completeGrind,
    reconcileMissedDay,
    addGrind,
    deleteGrind,
    updateGrind,
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Pomodoro } from '../types'

const TIMER_KEY = 'pomodoro-timer'

interface TimerState {
  taskTitle: string
  grindId: string | null
  durationMinutes: number
  targetTime: number // Date.now() timestamp when timer ends
}

function loadTimer(): TimerState | null {
  try {
    const stored = localStorage.getItem(TIMER_KEY)
    if (!stored) return null
    const state = JSON.parse(stored) as TimerState
    // Still valid if target is in the future
    if (state.targetTime > Date.now()) return state
    // Timer expired while away — we'll handle completion on load
    localStorage.removeItem(TIMER_KEY)
    return { ...state, targetTime: -1 } // signal expired
  } catch { return null }
}

function saveTimer(state: TimerState | null) {
  if (state) {
    localStorage.setItem(TIMER_KEY, JSON.stringify(state))
  } else {
    localStorage.removeItem(TIMER_KEY)
  }
}

export function usePomodoro() {
  const [pomodoros, setPomodoros] = useState<Pomodoro[]>([])
  const [timer, setTimer] = useState<TimerState | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const completedRef = useRef(false)

  // Fetch pomodoros
  useEffect(() => {
    supabase
      .from('pomodoros')
      .select('*')
      .order('completed_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPomodoros(data as Pomodoro[])
        setLoading(false)
      })
  }, [])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('pomodoros-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pomodoros' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as Pomodoro
          setPomodoros(prev => prev.some(p => p.id === row.id) ? prev : [row, ...prev])
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as { id: string }).id
          setPomodoros(prev => prev.filter(p => p.id !== oldId))
        }
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Restore timer from localStorage on mount
  useEffect(() => {
    const restored = loadTimer()
    if (!restored) return
    if (restored.targetTime === -1) {
      // Timer expired while app was closed — record the pomodoro
      completePomodoro(restored.taskTitle, restored.grindId, restored.durationMinutes)
    } else {
      setTimer(restored)
      setRemainingSeconds(Math.ceil((restored.targetTime - Date.now()) / 1000))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Countdown interval
  useEffect(() => {
    if (!timer || timer.targetTime <= 0) return
    completedRef.current = false

    const interval = setInterval(() => {
      const remaining = Math.ceil((timer.targetTime - Date.now()) / 1000)
      if (remaining <= 0) {
        clearInterval(interval)
        setRemainingSeconds(0)
        if (!completedRef.current) {
          completedRef.current = true
          completePomodoro(timer.taskTitle, timer.grindId, timer.durationMinutes)
          setTimer(null)
          saveTimer(null)
        }
      } else {
        setRemainingSeconds(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer])

  async function completePomodoro(taskTitle: string, grindId: string | null, durationMinutes: number) {
    // Play a completion sound
    try {
      const c = new AudioContext()
      if (c.state === 'suspended') await c.resume()
      const t = c.currentTime
      // Bell-like tone
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(784, t) // G5
      g.gain.setValueAtTime(0.15, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      osc.connect(g).connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.8)
      // Second tone
      const osc2 = c.createOscillator()
      const g2 = c.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1047, t + 0.15) // C6
      g2.gain.setValueAtTime(0.12, t + 0.15)
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.9)
      osc2.connect(g2).connect(c.destination)
      osc2.start(t + 0.15)
      osc2.stop(t + 0.9)
    } catch { /* silent */ }

    // Haptic
    try { navigator?.vibrate?.(100) } catch { /* */ }

    const { data } = await supabase
      .from('pomodoros')
      .insert({ task_title: taskTitle, grind_id: grindId, duration_minutes: durationMinutes })
      .select()
      .single()

    if (data) {
      setPomodoros(prev => prev.some(p => p.id === (data as Pomodoro).id) ? prev : [data as Pomodoro, ...prev])
    }
  }

  const startTimer = useCallback((durationMinutes: number, taskTitle: string, grindId: string | null = null) => {
    const state: TimerState = {
      taskTitle,
      grindId,
      durationMinutes,
      targetTime: Date.now() + durationMinutes * 60 * 1000,
    }
    setTimer(state)
    setRemainingSeconds(durationMinutes * 60)
    saveTimer(state)
  }, [])

  const cancelTimer = useCallback(() => {
    setTimer(null)
    setRemainingSeconds(0)
    saveTimer(null)
  }, [])

  const timerActive = timer !== null && timer.targetTime > 0
  const timerTaskTitle = timer?.taskTitle ?? ''

  return {
    pomodoros,
    loading,
    timerActive,
    timerTaskTitle,
    timerGrindId: timer?.grindId ?? null,
    timerDuration: timer?.durationMinutes ?? 0,
    remainingSeconds,
    startTimer,
    cancelTimer,
  }
}

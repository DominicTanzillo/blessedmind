import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Pomodoro } from '../types'

const TIMER_KEY = 'pomodoro-timer'
const COMPLETED_KEY = 'pomodoro-completed'

interface TimerState {
  taskTitle: string
  grindId: string | null
  durationMinutes: number
  targetTime: number // Date.now() timestamp when timer ends
  timerId: string // unique id to prevent duplicate completions
  colorVariant: number // bush color variant for consistent display
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadTimer(): TimerState | null {
  try {
    const stored = localStorage.getItem(TIMER_KEY)
    if (!stored) return null
    const state = JSON.parse(stored) as TimerState
    const completed = localStorage.getItem(COMPLETED_KEY)
    if (completed === state.timerId) {
      localStorage.removeItem(TIMER_KEY)
      return null
    }
    if (state.targetTime > Date.now()) return state
    localStorage.removeItem(TIMER_KEY)
    return { ...state, targetTime: -1 }
  } catch { return null }
}

function saveTimer(state: TimerState | null) {
  if (state) {
    localStorage.setItem(TIMER_KEY, JSON.stringify(state))
  } else {
    localStorage.removeItem(TIMER_KEY)
  }
}

function markCompleted(timerId: string) {
  localStorage.setItem(COMPLETED_KEY, timerId)
}

export function usePomodoro() {
  const [pomodoros, setPomodoros] = useState<Pomodoro[]>([])
  const [timer, setTimer] = useState<TimerState | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const completedRef = useRef(false)

  // Fetch pomodoros from new table
  useEffect(() => {
    supabase
      .from('pomodoros_v2')
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
      .channel('pomodoros-v2-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pomodoros_v2' }, (payload) => {
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
      completePomodoro(restored.taskTitle, restored.grindId, restored.durationMinutes, restored.timerId)
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
        const completed = localStorage.getItem(COMPLETED_KEY)
        if (!completedRef.current && completed !== timer.timerId) {
          completedRef.current = true
          completePomodoro(timer.taskTitle, timer.grindId, timer.durationMinutes, timer.timerId)
          setTimer(null)
          saveTimer(null)
        } else {
          setTimer(null)
        }
      } else {
        setRemainingSeconds(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer])

  async function completePomodoro(taskTitle: string, grindId: string | null, durationMinutes: number, timerId: string) {
    markCompleted(timerId)

    // Play completion sound
    try {
      const c = new AudioContext()
      if (c.state === 'suspended') await c.resume()
      const t = c.currentTime
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(784, t)
      g.gain.setValueAtTime(0.15, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      osc.connect(g).connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.8)
      const osc2 = c.createOscillator()
      const g2 = c.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1047, t + 0.15)
      g2.gain.setValueAtTime(0.12, t + 0.15)
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.9)
      osc2.connect(g2).connect(c.destination)
      osc2.start(t + 0.15)
      osc2.stop(t + 0.9)
    } catch { /* silent */ }

    // Haptic
    try { navigator?.vibrate?.(100) } catch { /* */ }

    // Write to pomodoros_v2 with template_id (maps from grindId)
    const { data } = await supabase
      .from('pomodoros_v2')
      .insert({
        task_title: taskTitle,
        template_id: grindId,
        duration_minutes: durationMinutes,
      })
      .select()
      .single()

    if (data) {
      setPomodoros(prev => prev.some(p => p.id === (data as Pomodoro).id) ? prev : [data as Pomodoro, ...prev])
    }
  }

  const startTimer = useCallback((durationMinutes: number, taskTitle: string, grindId: string | null = null): void => {
    const state: TimerState = {
      taskTitle,
      grindId,
      durationMinutes,
      targetTime: Date.now() + durationMinutes * 60 * 1000,
      timerId: generateId(),
      colorVariant: pomodoros.length % 10,
    }
    setTimer(state)
    setRemainingSeconds(durationMinutes * 60)
    saveTimer(state)
  }, [pomodoros.length])

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
    timerColorVariant: timer?.colorVariant ?? 0,
    remainingSeconds,
    startTimer,
    cancelTimer,
  }
}

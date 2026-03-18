import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { playAuditPing } from '../lib/sounds'
import type { TimeAudit, AuditEntry } from '../types'

const BLOCK_DURATION = 15 * 60 // 15 minutes in seconds
const TOTAL_BLOCKS = 32
const LS_KEY = 'allostatic-audit-timer'

export function useTimeAudit(recordPrayer?: () => Promise<void>) {
  const [audits, setAudits] = useState<TimeAudit[]>([])
  const [activeAudit, setActiveAudit] = useState<TimeAudit | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(BLOCK_DURATION)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const notifiedBlockRef = useRef(0)

  // Current block based on elapsed time
  const currentBlock = activeAudit
    ? Math.min(
        Math.floor((Date.now() - new Date(activeAudit.started_at).getTime()) / (BLOCK_DURATION * 1000)) + 1,
        TOTAL_BLOCKS,
      )
    : 0

  // Fetch completed audits (last 30 days)
  useEffect(() => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    supabase
      .from('time_audits')
      .select('*')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const all = data as TimeAudit[]
          setAudits(all.filter(a => a.completed_at))
          const active = all.find(a => !a.completed_at)
          if (active) {
            setActiveAudit(active)
            localStorage.setItem(LS_KEY, JSON.stringify({
              auditId: active.id,
              startedAt: new Date(active.started_at).getTime(),
            }))
          }
        }
      })
  }, [])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('time-audits-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_audits' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as TimeAudit
          if (row.completed_at) {
            setAudits(prev => prev.some(a => a.id === row.id) ? prev : [row, ...prev])
          }
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as TimeAudit
          if (row.completed_at) {
            setAudits(prev => prev.some(a => a.id === row.id)
              ? prev.map(a => a.id === row.id ? row : a)
              : [row, ...prev],
            )
          }
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as { id: string }).id
          setAudits(prev => prev.filter(a => a.id !== oldId))
        }
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Timer tick
  useEffect(() => {
    if (!activeAudit) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    function tick() {
      if (!activeAudit) return
      const elapsed = (Date.now() - new Date(activeAudit.started_at).getTime()) / 1000
      const currentBlockNum = Math.min(Math.floor(elapsed / BLOCK_DURATION) + 1, TOTAL_BLOCKS)
      const elapsedInBlock = elapsed - (currentBlockNum - 1) * BLOCK_DURATION
      const remaining = Math.max(0, BLOCK_DURATION - elapsedInBlock)
      setRemainingSeconds(Math.ceil(remaining))

      // Ping when entering a new block (except block 1)
      if (currentBlockNum > notifiedBlockRef.current && currentBlockNum > 1) {
        notifiedBlockRef.current = currentBlockNum
        playAuditPing()
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Time Audit', {
            body: `Block ${currentBlockNum} of ${TOTAL_BLOCKS} — What did you accomplish?`,
            tag: 'audit-ping',
          })
        }
      }
    }

    notifiedBlockRef.current = Math.floor(
      (Date.now() - new Date(activeAudit.started_at).getTime()) / (BLOCK_DURATION * 1000),
    )
    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeAudit])

  const startAudit = useCallback(async () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const { data } = await supabase
      .from('time_audits')
      .insert({ entries: [] })
      .select()
      .single()

    if (data) {
      const audit = data as TimeAudit
      setActiveAudit(audit)
      localStorage.setItem(LS_KEY, JSON.stringify({
        auditId: audit.id,
        startedAt: new Date(audit.started_at).getTime(),
      }))
    }
  }, [])

  const recordEntry = useCallback(async (note: string) => {
    if (!activeAudit) return

    const entry: AuditEntry = {
      block: currentBlock,
      note,
      recorded_at: new Date().toISOString(),
    }
    const updatedEntries = [...activeAudit.entries, entry]

    const { data } = await supabase
      .from('time_audits')
      .update({ entries: updatedEntries })
      .eq('id', activeAudit.id)
      .select()
      .single()

    if (data) {
      setActiveAudit(data as TimeAudit)
    }
  }, [activeAudit, currentBlock])

  const completeAudit = useCallback(async () => {
    if (!activeAudit) return

    const { data } = await supabase
      .from('time_audits')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', activeAudit.id)
      .select()
      .single()

    if (data) {
      const completed = data as TimeAudit
      setAudits(prev => [completed, ...prev])
      setActiveAudit(null)
      localStorage.removeItem(LS_KEY)

      // Count as a prayer
      if (recordPrayer) await recordPrayer()
    }
  }, [activeAudit, recordPrayer])

  const cancelAudit = useCallback(async () => {
    if (!activeAudit) return

    await supabase.from('time_audits').delete().eq('id', activeAudit.id)
    setActiveAudit(null)
    localStorage.removeItem(LS_KEY)
  }, [activeAudit])

  return {
    audits,
    auditCount: audits.length,
    activeAudit,
    currentBlock,
    remainingSeconds,
    startAudit,
    recordEntry,
    completeAudit,
    cancelAudit,
  }
}

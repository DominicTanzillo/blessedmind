import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { rankTasks } from '../lib/prioritize'
import { BATCH_SIZE } from '../lib/constants'
import type { Task, ActiveBatch } from '../types'

export function useActiveBatch(tasks: Task[], enabledGrindCount: number = 0) {
  const [batch, setBatch] = useState<ActiveBatch | null>(null)
  const [loading, setLoading] = useState(true)
  const generatingRef = useRef(false)

  const fetchBatch = useCallback(async () => {
    const { data } = await supabase
      .from('active_batch')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setBatch(data as ActiveBatch | null)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBatch()
  }, [fetchBatch])

  // ── Realtime subscription ──────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('active-batch-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_batch' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setBatch(payload.new as ActiveBatch)
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id
            setBatch(prev => prev?.id === oldId ? null : prev)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Get the tasks in the current batch
  const batchTasks = batch
    ? tasks.filter(t => batch.task_ids.includes(t.id) && !t.waiting)
    : []

  const completedInBatch = batchTasks.filter(t => t.completed).length
  const allCompleted = batchTasks.length > 0 && completedInBatch === batchTasks.length

  // The set of task IDs currently in the batch
  const batchTaskIds = new Set(batch?.task_ids ?? [])

  // Create a new batch from the top-ranked tasks
  const generateNewBatch = useCallback(async () => {
    if (generatingRef.current) return
    generatingRef.current = true
    try {
      const ranked = rankTasks(tasks)
      const effectiveSize = Math.max(0, BATCH_SIZE - enabledGrindCount)
      const topIds = ranked.slice(0, effectiveSize).map(t => t.id)

      if (topIds.length === 0) {
        if (batch?.id) {
          await supabase.from('active_batch').delete().eq('id', batch.id)
        }
        setBatch(null)
        return
      }

      if (batch?.id) {
        await supabase.from('active_batch').delete().eq('id', batch.id)
      }

      const { data } = await supabase
        .from('active_batch')
        .insert({ task_ids: topIds, completed_task_ids: [] })
        .select()
        .single()

      if (data) {
        setBatch(data as ActiveBatch)
      }
    } finally {
      generatingRef.current = false
    }
  }, [tasks, batch?.id, enabledGrindCount])

  // Initialize batch if none exists
  useEffect(() => {
    if (!loading && !batch && tasks.filter(t => !t.completed && !t.waiting).length > 0) {
      generateNewBatch()
    }
  }, [loading, batch, tasks, generateNewBatch])

  return {
    batchTasks,
    completedInBatch,
    allCompleted,
    generateNewBatch,
    batchTaskIds,
    loading,
    hasBatch: !!batch,
  }
}

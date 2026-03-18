import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { rankTasks } from '../lib/prioritize'
import { BATCH_SIZE } from '../lib/constants'
import type { Task, ActiveBatch } from '../types'

export function useActiveBatch(tasks: Task[]) {
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

  // Get the tasks in the current batch — exclude waiting tasks
  const batchTasks = batch
    ? tasks.filter(t => batch.task_ids.includes(t.id) && !t.waiting)
    : []

  // Count how many batch tasks are completed
  const completedInBatch = batchTasks.filter(t => t.completed).length
  const allCompleted = batchTasks.length > 0 && completedInBatch === batchTasks.length

  // The set of task IDs currently in the batch
  const batchTaskIds = new Set(batch?.task_ids ?? [])

  // Helper to save a new batch
  async function saveBatch(taskIds: string[], oldBatchId?: string) {
    if (oldBatchId) {
      await supabase.from('active_batch').delete().eq('id', oldBatchId)
    }
    const { data } = await supabase
      .from('active_batch')
      .insert({ task_ids: taskIds, completed_task_ids: [] })
      .select()
      .single()
    if (data) setBatch(data as ActiveBatch)
  }

  // Create a new batch from the top-ranked tasks (full refresh)
  const generateNewBatch = useCallback(async () => {
    if (generatingRef.current) return
    generatingRef.current = true
    try {
      const ranked = rankTasks(tasks)
      const topIds = ranked.slice(0, BATCH_SIZE).map(t => t.id)

      if (topIds.length === 0) {
        if (batch?.id) {
          await supabase.from('active_batch').delete().eq('id', batch.id)
        }
        setBatch(null)
        return
      }

      await saveBatch(topIds, batch?.id)
    } finally {
      generatingRef.current = false
    }
  }, [tasks, batch?.id])

  // Initialize batch if none exists
  useEffect(() => {
    if (!loading && !batch && tasks.filter(t => !t.completed && !t.waiting).length > 0) {
      generateNewBatch()
    }
  }, [loading, batch, tasks, generateNewBatch])

  // Auto-refresh batch when ALL batch tasks are completed —
  // replace completed tasks with the next best candidates
  useEffect(() => {
    if (!loading && batch && allCompleted) {
      const incompleteCount = tasks.filter(t => !t.completed && !t.waiting).length
      if (incompleteCount > 0) {
        generateNewBatch()
      }
    }
  }, [loading, batch, allCompleted, tasks, generateNewBatch])

  // On load, if the batch contains tasks that are now completed,
  // swap them out for fresh incomplete tasks
  const hasRefreshedRef = useRef(false)
  useEffect(() => {
    if (loading || !batch || hasRefreshedRef.current) return
    if (tasks.length === 0) return
    hasRefreshedRef.current = true

    const incompleteBatchTasks = batchTasks.filter(t => !t.completed)

    // If some batch tasks are completed, fill their slots with new tasks
    if (incompleteBatchTasks.length < BATCH_SIZE && completedInBatch > 0) {
      const ranked = rankTasks(tasks)
      const currentIds = new Set(incompleteBatchTasks.map(t => t.id))
      const newTasks = ranked.filter(t => !currentIds.has(t.id))
      const slotsToFill = BATCH_SIZE - incompleteBatchTasks.length
      const fillIds = newTasks.slice(0, slotsToFill).map(t => t.id)
      const newBatchIds = [...incompleteBatchTasks.map(t => t.id), ...fillIds]

      if (fillIds.length > 0) {
        saveBatch(newBatchIds, batch.id)
      }
    }
  }, [loading, batch, tasks, batchTasks, completedInBatch])

  // Refresh batch when tasks are edited — keep completed tasks pinned,
  // re-rank incomplete slots with the best available candidates
  const refreshBatch = useCallback(async () => {
    if (!batch) return

    const completedIds = batchTasks.filter(t => t.completed).map(t => t.id)
    const incompleteSlots = BATCH_SIZE - completedIds.length

    if (incompleteSlots <= 0) return

    const ranked = rankTasks(tasks)
    const completedSet = new Set(completedIds)
    const newIncomplete = ranked.filter(t => !completedSet.has(t.id))
    const fillIds = newIncomplete.slice(0, incompleteSlots).map(t => t.id)
    const newBatchIds = [...completedIds, ...fillIds]

    await saveBatch(newBatchIds, batch.id)
  }, [batch, batchTasks, tasks])

  return {
    batchTasks,
    completedInBatch,
    allCompleted,
    generateNewBatch,
    refreshBatch,
    batchTaskIds,
    loading,
    hasBatch: !!batch,
  }
}

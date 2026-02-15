import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { rankTasks } from '../lib/prioritize'
import { BATCH_SIZE } from '../lib/constants'
import type { Task, ActiveBatch } from '../types'

export function useActiveBatch(tasks: Task[]) {
  const [batch, setBatch] = useState<ActiveBatch | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Get the tasks in the current batch
  const batchTasks = batch
    ? tasks.filter(t => batch.task_ids.includes(t.id))
    : []

  const completedInBatch = batchTasks.filter(t => t.completed).length
  const allCompleted = batchTasks.length > 0 && completedInBatch === batchTasks.length

  // The set of task IDs currently in the batch
  const batchTaskIds = new Set(batch?.task_ids ?? [])

  // Create a new batch from the top-ranked tasks
  const generateNewBatch = useCallback(async () => {
    const ranked = rankTasks(tasks)
    const topIds = ranked.slice(0, BATCH_SIZE).map(t => t.id)

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
  }, [tasks, batch?.id])

  // Initialize batch if none exists
  useEffect(() => {
    if (!loading && !batch && tasks.filter(t => !t.completed).length > 0) {
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

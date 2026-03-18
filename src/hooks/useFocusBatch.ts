import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { rankTasks } from '../lib/prioritize'
import { BATCH_SIZE } from '../lib/constants'
import type { Item, FocusBatch } from '../types'

export function useFocusBatch(tasks: Item[]) {
  const [batch, setBatch] = useState<FocusBatch | null>(null)
  const [loading, setLoading] = useState(true)
  const generatingRef = useRef(false)

  const fetchBatch = useCallback(async () => {
    const { data } = await supabase
      .from('focus_batch')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setBatch(data as FocusBatch | null)
    setLoading(false)
  }, [])

  useEffect(() => { fetchBatch() }, [fetchBatch])

  // ── Realtime subscription ──────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('focus-batch-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'focus_batch' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setBatch(payload.new as FocusBatch)
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id
            setBatch(prev => prev?.id === oldId ? null : prev)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Lookup map for fast ID resolution
  const taskMap = new Map(tasks.map(t => [t.id, t]))

  // Get the tasks in the current batch
  const batchTasks = batch
    ? batch.item_ids.map(id => taskMap.get(id)).filter((t): t is Item => !!t && !t.waiting)
    : []

  const completedInBatch = batchTasks.filter(t => t.completed).length
  const allCompleted = batchTasks.length > 0 && completedInBatch === batchTasks.length

  const batchTaskIds = new Set(batch?.item_ids ?? [])

  // Helper to save a new batch
  async function saveBatch(itemIds: string[], oldBatchId?: string) {
    if (oldBatchId) {
      await supabase.from('focus_batch').delete().eq('id', oldBatchId)
    }
    const { data } = await supabase
      .from('focus_batch')
      .insert({ item_ids: itemIds })
      .select()
      .single()
    if (data) setBatch(data as FocusBatch)
  }

  // Create a new batch from the top-ranked items
  const generateNewBatch = useCallback(async () => {
    if (generatingRef.current) return
    generatingRef.current = true
    try {
      const ranked = rankTasks(tasks)
      const topIds = ranked.slice(0, BATCH_SIZE).map(t => t.id)

      if (topIds.length === 0) {
        if (batch?.id) {
          await supabase.from('focus_batch').delete().eq('id', batch.id)
        }
        setBatch(null)
        return
      }

      await saveBatch(topIds, batch?.id)
    } finally {
      generatingRef.current = false
    }
  }, [tasks, batch?.id])

  // Initialize or regenerate batch if none exists or batch is stale
  // (stale = batch IDs don't match any known items, e.g. after migration)
  useEffect(() => {
    if (loading || tasks.length === 0) return

    if (!batch) {
      // No batch — generate if there are incomplete items
      if (tasks.filter(t => !t.completed && !t.waiting).length > 0) {
        generateNewBatch()
      }
      return
    }

    // Stale batch detection: if none of the batch IDs resolve to items, regenerate
    const resolved = batch.item_ids.filter(id => taskMap.has(id))
    if (resolved.length === 0 && tasks.filter(t => !t.completed && !t.waiting).length > 0) {
      generateNewBatch()
    }
  }, [loading, batch, tasks, generateNewBatch])

  // Refresh batch when explicitly requested (edit or reprioritize)
  const refreshBatch = useCallback(async () => {
    if (!batch) return
    await generateNewBatch()
  }, [batch, generateNewBatch])

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

export const useActiveBatch = useFocusBatch

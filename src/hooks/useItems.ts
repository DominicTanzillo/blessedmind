import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { calculateDefaultStepDates } from '../lib/hydra'
import type { Item, NewTask, Step } from '../types'

/**
 * Build backward-compat `steps` from an Item's children array.
 */
function childrenToSteps(children: Item[]): Step[] | null {
  if (children.length === 0) return null
  return children.map(c => ({
    id: c.id,
    title: c.title,
    completed: c.completed,
    due_date: c.due_date,
  }))
}

export function useItems() {
  const [rawItems, setRawItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  // ── Fetch tasks + steps ──────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .in('item_type', ['task', 'step'])
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRawItems(data as Item[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  // ── Realtime subscription ──────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('items-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          const row = payload.new as Item
          if (payload.eventType === 'INSERT') {
            if (row.item_type === 'task' || row.item_type === 'step') {
              setRawItems(prev => prev.some(i => i.id === row.id) ? prev : [row, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            setRawItems(prev => prev.map(i => i.id === row.id ? row : i))
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id
            setRawItems(prev => prev.filter(i => i.id !== oldId))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Build parent-child tree ──────────────────────────────
  const tasks = useMemo(() => {
    const childMap = new Map<string, Item[]>()
    for (const item of rawItems) {
      if (item.parent_id) {
        const siblings = childMap.get(item.parent_id) || []
        siblings.push(item)
        childMap.set(item.parent_id, siblings)
      }
    }

    return rawItems
      .filter(i => !i.parent_id && i.item_type === 'task')
      .map(p => {
        const children = (childMap.get(p.id) || [])
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        return {
          ...p,
          children,
          steps: childrenToSteps(children),
        }
      })
  }, [rawItems])

  // ── Scoreable items: simple tasks + individual steps ─────
  // Steps get effective due_date computed from parent.
  // These are what the focus batch ranks and displays.
  const scoreableItems = useMemo(() => {
    const result: Item[] = []
    for (const task of tasks) {
      if (task.children && task.children.length > 0) {
        // Multi-step: each child is individually scoreable
        const defaults = task.due_date
          ? calculateDefaultStepDates(task.children.length, task.due_date)
          : []
        for (let i = 0; i < task.children.length; i++) {
          const child = task.children[i]
          result.push({
            ...child,
            // Fill in effective due_date if step doesn't have one
            due_date: child.due_date ?? defaults[i] ?? task.due_date,
          })
        }
      } else {
        // Simple task: scoreable directly
        result.push(task)
      }
    }
    return result
  }, [tasks])

  // ── Parent lookup map (for display context of steps) ─────
  const parentMap = useMemo(() => {
    const map = new Map<string, Item>()
    for (const task of tasks) {
      map.set(task.id, task)
    }
    return map
  }, [tasks])

  // ── Add item (parent + children) ─────────────────────────
  const addTask = useCallback(async (task: NewTask) => {
    const { data, error } = await supabase
      .from('items')
      .insert({
        title: task.title,
        description: task.description ?? '',
        due_date: task.due_date ?? null,
        priority: task.priority ?? 2,
        category: task.category ?? 'general',
        item_type: 'task',
      })
      .select()
      .single()

    if (error || !data) return null
    const parent = data as Item

    // Create children if steps provided
    if (task.steps && task.steps.length > 0) {
      const children = task.steps.map((s, i) => ({
        title: s.title,
        completed: s.completed,
        due_date: s.due_date ?? null,
        parent_id: parent.id,
        position: i,
        item_type: 'step' as const,
        priority: task.priority ?? 2,
        category: task.category ?? 'general',
        description: '',
      }))
      await supabase.from('items').insert(children)
    }

    await fetchItems()
    return parent
  }, [fetchItems])

  // ── Update item ──────────────────────────────────────────
  const updateTask = useCallback(async (id: string, updates: Partial<Item> & { steps?: Step[] | null }) => {
    const { steps: newSteps, children: _, ...itemUpdates } = updates
    const cleanUpdates = { ...itemUpdates, updated_at: new Date().toISOString() }

    delete (cleanUpdates as Record<string, unknown>)['children']

    await supabase.from('items').update(cleanUpdates).eq('id', id)

    // Sync children if steps provided
    if (newSteps !== undefined) {
      const existingChildren = rawItems.filter(i => i.parent_id === id)
      const existingIds = new Set(existingChildren.map(c => c.id))
      const parentItem = rawItems.find(i => i.id === id)

      if (!newSteps || newSteps.length === 0) {
        if (existingChildren.length > 0) {
          await supabase.from('items').delete().eq('parent_id', id)
        }
      } else {
        const keptIds = new Set<string>()

        for (let i = 0; i < newSteps.length; i++) {
          const step = newSteps[i]
          if (existingIds.has(step.id)) {
            keptIds.add(step.id)
            await supabase.from('items').update({
              title: step.title,
              completed: step.completed,
              due_date: step.due_date ?? null,
              position: i,
              updated_at: new Date().toISOString(),
            }).eq('id', step.id)
          } else {
            await supabase.from('items').insert({
              title: step.title,
              completed: step.completed || false,
              due_date: step.due_date ?? null,
              parent_id: id,
              position: i,
              item_type: 'step',
              priority: parentItem?.priority ?? 2,
              category: parentItem?.category ?? 'general',
              description: '',
            })
          }
        }

        const toDelete = existingChildren.filter(c => !keptIds.has(c.id))
        if (toDelete.length > 0) {
          await supabase.from('items').delete().in('id', toDelete.map(c => c.id))
        }
      }
    }

    await fetchItems()
  }, [rawItems, fetchItems])

  // ── Complete item (works for both tasks and steps) ────────
  // Optimistic update — no refetch, no stutter.
  // If completing a step, auto-completes parent when all siblings done.
  const completeTask = useCallback(async (id: string) => {
    const now = new Date().toISOString()
    const item = rawItems.find(i => i.id === id)

    // Optimistic: update local state immediately
    const idsToComplete = [id]
    if (item?.parent_id) {
      const siblings = rawItems.filter(i => i.parent_id === item.parent_id)
      const allDone = siblings.every(s => s.id === id || s.completed)
      if (allDone) idsToComplete.push(item.parent_id)
    }
    setRawItems(prev => prev.map(i =>
      idsToComplete.includes(i.id)
        ? { ...i, completed: true, completed_at: now, updated_at: now }
        : i
    ))

    // Persist to DB
    await supabase.from('items').update({
      completed: true, completed_at: now, updated_at: now,
    }).eq('id', id)

    if (idsToComplete.length > 1) {
      await supabase.from('items').update({
        completed: true, completed_at: now, updated_at: now,
      }).eq('id', idsToComplete[1])
    }
  }, [rawItems])

  // ── Uncomplete item ──────────────────────────────────────
  // Optimistic update. If uncompleting a step whose parent was auto-completed, uncomplete parent too.
  const uncompleteTask = useCallback(async (id: string) => {
    const now = new Date().toISOString()
    const item = rawItems.find(i => i.id === id)

    // Optimistic: update local state immediately
    const idsToUncomplete = [id]
    if (item?.parent_id) {
      const parent = rawItems.find(i => i.id === item.parent_id)
      if (parent?.completed) idsToUncomplete.push(item.parent_id)
    }
    setRawItems(prev => prev.map(i =>
      idsToUncomplete.includes(i.id)
        ? { ...i, completed: false, completed_at: null, updated_at: now }
        : i
    ))

    // Persist to DB
    await supabase.from('items').update({
      completed: false, completed_at: null, updated_at: now,
    }).eq('id', id)

    if (idsToUncomplete.length > 1) {
      await supabase.from('items').update({
        completed: false, completed_at: null, updated_at: now,
      }).eq('id', idsToUncomplete[1])
    }
  }, [rawItems])

  // ── Delete item ──────────────────────────────────────────
  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (!error) {
      setRawItems(prev => prev.filter(i => i.id !== id && i.parent_id !== id))
    }
  }, [])

  // ── Star / Unstar ────────────────────────────────────────
  const starTask = useCallback(async (id: string) => {
    await updateTask(id, { starred: true, starred_at: new Date().toISOString() })
  }, [updateTask])

  const unstarTask = useCallback(async (id: string) => {
    await updateTask(id, { starred: false, starred_at: null })
  }, [updateTask])

  // ── Waiting ──────────────────────────────────────────────
  const convertToWaiting = useCallback(async (id: string, reminderDate?: string) => {
    const defaultReminder = new Date()
    defaultReminder.setDate(defaultReminder.getDate() + 7)
    const date = reminderDate || defaultReminder.toLocaleDateString('en-CA')
    await updateTask(id, {
      waiting: true,
      completed: false,
      completed_at: null,
      waiting_reminder_date: date,
    })
  }, [updateTask])

  const reactivateTask = useCallback(async (id: string) => {
    await updateTask(id, { waiting: false, waiting_reminder_date: null })
  }, [updateTask])

  return {
    tasks,
    scoreableItems,
    parentMap,
    loading,
    fetchTasks: fetchItems,
    addTask,
    updateTask,
    completeTask,
    uncompleteTask,
    deleteTask,
    starTask,
    unstarTask,
    convertToWaiting,
    reactivateTask,
  }
}

export const useTasks = useItems

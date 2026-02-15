import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, NewTask, Step } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTasks(data as Task[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = useCallback(async (task: NewTask) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description ?? '',
        due_date: task.due_date ?? null,
        priority: task.priority ?? 2,
        category: task.category ?? 'general',
        steps: task.steps ?? null,
      })
      .select()
      .single()

    if (!error && data) {
      setTasks(prev => [data as Task, ...prev])
      return data as Task
    }
    return null
  }, [])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
      )
    }
  }, [])

  const completeTask = useCallback(async (id: string) => {
    const now = new Date().toISOString()
    await updateTask(id, { completed: true, completed_at: now })
  }, [updateTask])

  const uncompleteTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)

    if (task?.steps && task.steps.length > 0) {
      // Reopen the last completed step
      const lastCompletedIndex = [...task.steps]
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.completed)
        .pop()?.i

      if (lastCompletedIndex !== undefined) {
        const updatedSteps: Step[] = task.steps.map((s, i) =>
          i === lastCompletedIndex ? { ...s, completed: false } : s
        )
        await updateTask(id, { steps: updatedSteps, completed: false, completed_at: null })
      } else {
        await updateTask(id, { completed: false, completed_at: null })
      }
    } else {
      await updateTask(id, { completed: false, completed_at: null })
    }
  }, [tasks, updateTask])

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
  }, [])

  // Complete the current step of a multi-step task.
  // If it's the last step, complete the whole task.
  const completeStep = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task?.steps) return

    const currentIndex = task.steps.findIndex(s => !s.completed)
    if (currentIndex === -1) return

    const updatedSteps: Step[] = task.steps.map((s, i) =>
      i === currentIndex ? { ...s, completed: true } : s
    )

    const allDone = updatedSteps.every(s => s.completed)

    if (allDone) {
      // Last step done → complete the whole task
      const now = new Date().toISOString()
      await updateTask(taskId, { steps: updatedSteps, completed: true, completed_at: now })
    } else {
      await updateTask(taskId, { steps: updatedSteps })
    }
  }, [tasks, updateTask])

  const starTask = useCallback(async (id: string) => {
    await updateTask(id, { starred: true, starred_at: new Date().toISOString() })
  }, [updateTask])

  const unstarTask = useCallback(async (id: string) => {
    await updateTask(id, { starred: false, starred_at: null })
  }, [updateTask])

  return { tasks, loading, fetchTasks, addTask, updateTask, completeTask, uncompleteTask, deleteTask, completeStep, starTask, unstarTask }
}

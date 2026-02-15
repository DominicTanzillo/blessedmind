import type { Task } from '../types'

export function scoreTask(task: Task): number {
  let score = 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Due date factor (60% weight) - lower = more pressing
  if (task.due_date) {
    const due = new Date(task.due_date + 'T00:00:00')
    const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      score += daysUntil * 15 // Strongly negative for overdue
    } else if (daysUntil === 0) {
      score += 0 // Due today
    } else if (daysUntil <= 3) {
      score += daysUntil * 5 // Due soon
    } else if (daysUntil <= 7) {
      score += 30
    } else {
      score += 60
    }
  } else {
    score += 100 // No date = least urgent by date
  }

  // Priority factor (30% weight)
  if (task.priority === 1) score += 0   // Urgent
  if (task.priority === 2) score += 20  // Normal
  if (task.priority === 3) score += 40  // Low

  // Age factor (10% weight) - older tasks bubble up to prevent neglect
  const created = new Date(task.created_at)
  const ageDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  if (ageDays > 7) {
    score -= Math.min(ageDays - 7, 15) // Up to -15 bonus for old tasks
  }

  return score
}

/**
 * Rank tasks for the focus batch.
 * Starred tasks always come first, ordered by starred_at (FIFO).
 * Remaining slots filled by the scoring algorithm.
 */
export function rankTasks(tasks: Task[]): Task[] {
  const incomplete = tasks.filter(t => !t.completed)

  const starred = incomplete
    .filter(t => t.starred)
    .sort((a, b) => {
      const aTime = a.starred_at ? new Date(a.starred_at).getTime() : 0
      const bTime = b.starred_at ? new Date(b.starred_at).getTime() : 0
      return aTime - bTime // earliest starred first (FIFO)
    })

  const unstarred = incomplete
    .filter(t => !t.starred)
    .sort((a, b) => scoreTask(a) - scoreTask(b))

  return [...starred, ...unstarred]
}

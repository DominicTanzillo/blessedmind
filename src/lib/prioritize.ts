import type { Task } from '../types'

/**
 * Score a task for prioritization. Lower score = higher priority.
 *
 * Strategy:
 * 1. Overdue and due-today tasks are URGENT (strongly negative scores)
 * 2. Due within 3 days gets moderate priority
 * 3. Due within a week gets mild priority
 * 4. Once immediate tasks are handled, older tasks in the queue
 *    bubble up to prevent neglect
 * 5. No-due-date tasks rely on priority + age
 */
export function scoreTask(task: Task): number {
  let score = 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // ── Due date factor (primary driver) ──────────────────
  if (task.due_date) {
    const due = new Date(task.due_date + 'T00:00:00')
    const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      // Overdue — escalates sharply the more overdue it is
      score += -50 + daysUntil * 20
    } else if (daysUntil === 0) {
      // Due today — very high priority
      score += -40
    } else if (daysUntil === 1) {
      // Due tomorrow
      score += -20
    } else if (daysUntil <= 3) {
      // Due in 2-3 days
      score += daysUntil * 5
    } else if (daysUntil <= 7) {
      // Due this week
      score += 30 + (daysUntil - 3) * 3
    } else {
      // Due later — not urgent by date
      score += 55 + Math.min(daysUntil - 7, 30)
    }
  } else {
    // No due date — moderate baseline, let priority + age decide
    score += 40
  }

  // ── Priority factor ───────────────────────────────────
  if (task.priority === 1) score += -10  // Urgent gets a boost
  if (task.priority === 2) score += 10   // Normal
  if (task.priority === 3) score += 25   // Low

  // ── Age factor — prevents tasks from languishing ──────
  const created = new Date(task.created_at)
  const ageDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  if (ageDays > 3) {
    // Gradual escalation: tasks older than 3 days start bubbling up
    // Max bonus of -25 at 30+ days old
    score -= Math.min(ageDays - 3, 25)
  }

  return score
}

/**
 * Rank tasks for the focus batch.
 * Starred tasks always come first, ordered by starred_at (FIFO).
 * Remaining slots filled by the scoring algorithm.
 */
export function rankTasks(tasks: Task[]): Task[] {
  const incomplete = tasks.filter(t => !t.completed && !t.waiting)

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

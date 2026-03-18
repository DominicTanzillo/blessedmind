import type { Item } from '../types'
import { getEffectiveStepDueDate } from './hydra'

/**
 * Score an item for prioritization. Lower score = higher priority.
 */
export function scoreItem(item: Item): number {
  let score = 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // For hydra tasks (multi-step), use the effective step due date
  const isHydra = item.steps && item.steps.length > 1
  const effectiveDueDate = isHydra
    ? getEffectiveStepDueDate(item).date
    : item.due_date

  // ── Due date factor (primary driver) ──────────────────
  if (effectiveDueDate) {
    const due = new Date(effectiveDueDate + 'T00:00:00')
    const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      score += -50 + daysUntil * 20
    } else if (daysUntil === 0) {
      score += -40
    } else if (daysUntil === 1) {
      score += -20
    } else if (daysUntil <= 3) {
      score += daysUntil * 5
    } else if (daysUntil <= 7) {
      score += 30 + (daysUntil - 3) * 3
    } else {
      score += 55 + Math.min(daysUntil - 7, 30)
    }
  } else {
    score += 40
  }

  if (isHydra) score -= 3

  // ── Priority factor ───────────────────────────────────
  if (item.priority === 1) score += -10
  if (item.priority === 2) score += 10
  if (item.priority === 3) score += 25

  // ── Age factor — prevents tasks from languishing ──────
  const created = new Date(item.created_at)
  const ageDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  if (ageDays > 3) {
    score -= Math.min(ageDays - 3, 25)
  }

  return score
}

/**
 * Rank items for the focus batch.
 * Starred items always come first, ordered by starred_at (FIFO).
 * Remaining slots filled by the scoring algorithm.
 */
export function rankItems(items: Item[]): Item[] {
  const incomplete = items.filter(t => !t.completed && !t.waiting)

  const starred = incomplete
    .filter(t => t.starred)
    .sort((a, b) => {
      const aTime = a.starred_at ? new Date(a.starred_at).getTime() : 0
      const bTime = b.starred_at ? new Date(b.starred_at).getTime() : 0
      return aTime - bTime
    })

  const unstarred = incomplete
    .filter(t => !t.starred)
    .sort((a, b) => scoreItem(a) - scoreItem(b))

  return [...starred, ...unstarred]
}

// Backward compat aliases
export const scoreTask = scoreItem
export const rankTasks = rankItems

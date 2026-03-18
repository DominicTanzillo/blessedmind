import type { Item } from '../types'

/**
 * Calculate default step due dates by grouping steps in batches of 3
 * working backward from the final due date.
 *
 * Steps 10-12 get the due date, 7-9 one day earlier, 4-6 two days earlier, etc.
 */
export function calculateDefaultStepDates(
  totalSteps: number,
  finalDueDate: string,
): (string | null)[] {
  if (!finalDueDate || totalSteps === 0) return Array(totalSteps).fill(null)

  const due = new Date(finalDueDate + 'T00:00:00')
  const dates: (string | null)[] = Array(totalSteps).fill(null)

  // Work backward from the last step
  for (let i = totalSteps - 1; i >= 0; i--) {
    const batchFromEnd = Math.floor((totalSteps - 1 - i) / 3)
    const d = new Date(due)
    d.setDate(d.getDate() - batchFromEnd)
    dates[i] = d.toLocaleDateString('en-CA') // YYYY-MM-DD
  }

  return dates
}

/**
 * Get the effective due date for the current (first incomplete) step of a task.
 * Priority: explicit step due_date > calculated default > parent due_date.
 * Works with Item.steps (populated from children) or Item.children directly.
 */
export function getEffectiveStepDueDate(task: Item): { date: string | null; isDefault: boolean } {
  const steps = task.steps
  if (!steps || steps.length <= 1) {
    return { date: task.due_date, isDefault: false }
  }

  const currentStepIndex = steps.findIndex(s => !s.completed)
  if (currentStepIndex === -1) {
    return { date: task.due_date, isDefault: false }
  }

  const currentStep = steps[currentStepIndex]

  // Explicit step due date takes priority
  if (currentStep.due_date) {
    return { date: currentStep.due_date, isDefault: false }
  }

  // Calculate default from parent due date
  if (task.due_date) {
    const defaults = calculateDefaultStepDates(steps.length, task.due_date)
    if (defaults[currentStepIndex]) {
      return { date: defaults[currentStepIndex], isDefault: true }
    }
  }

  // Fallback to parent
  return { date: task.due_date, isDefault: false }
}

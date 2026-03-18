import type { Task } from '../types'

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
    // Which batch of 3 does this step fall in, counting from the end?
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
 */
export function getEffectiveStepDueDate(task: Task): { date: string | null; isDefault: boolean } {
  if (!task.steps || task.steps.length <= 1) {
    return { date: task.due_date, isDefault: false }
  }

  const currentStepIndex = task.steps.findIndex(s => !s.completed)
  if (currentStepIndex === -1) {
    // All steps complete
    return { date: task.due_date, isDefault: false }
  }

  const currentStep = task.steps[currentStepIndex]

  // Explicit step due date takes priority
  if (currentStep.due_date) {
    return { date: currentStep.due_date, isDefault: false }
  }

  // Calculate default from parent due date
  if (task.due_date) {
    const defaults = calculateDefaultStepDates(task.steps.length, task.due_date)
    if (defaults[currentStepIndex]) {
      return { date: defaults[currentStepIndex], isDefault: true }
    }
  }

  // Fallback to parent
  return { date: task.due_date, isDefault: false }
}

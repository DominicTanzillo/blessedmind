export interface Step {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  due_date: string | null
  priority: 1 | 2 | 3
  category: string
  completed: boolean
  completed_at: string | null
  starred: boolean
  starred_at: string | null
  waiting: boolean
  steps: Step[] | null
  created_at: string
  updated_at: string
}

export type NewTask = Pick<Task, 'title'> &
  Partial<Pick<Task, 'description' | 'due_date' | 'priority' | 'category' | 'steps'>>

export interface TaskFilter {
  search: string
  category: string
  priority: number | null
  showCompleted: boolean
}

export interface ActiveBatch {
  id: string
  task_ids: string[]
  completed_task_ids: string[]
  created_at: string
}

export interface Grind {
  id: string
  title: string
  disabled_days: number[]       // 0=Sun..6=Sat (JS getDay)
  current_streak: number
  best_streak: number
  last_completed_date: string | null
  last_checked_date: string | null
  created_at: string
  updated_at: string
}

export type NewGrind = Pick<Grind, 'title'> & Partial<Pick<Grind, 'disabled_days'>>

export interface MissedDay {
  grindId: string
  grindTitle: string
  date: string                  // YYYY-MM-DD
}

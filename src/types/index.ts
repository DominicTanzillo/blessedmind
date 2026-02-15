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

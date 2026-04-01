// ── Lightweight step representation (used by edit forms) ──
export interface Step {
  id: string
  title: string
  completed: boolean
  due_date?: string | null  // YYYY-MM-DD, optional override
}

export interface AuditEntry {
  block: number        // 1-32
  note: string
  recorded_at: string
}

export interface TimeAudit {
  id: string
  started_at: string
  completed_at: string | null
  entries: AuditEntry[]
  created_at: string
}

// ── Unified Item model ─────────────────────────────────────
export type ItemType = 'task' | 'step' | 'habit_entry' | 'prayer' | 'audit' | 'friction'

export interface Item {
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
  waiting_reminder_date: string | null
  parent_id: string | null
  position: number | null
  item_type: ItemType
  source_id: string | null
  created_at: string
  updated_at: string
  children?: Item[]       // populated client-side, not stored
  steps?: Step[] | null   // backward compat, derived from children
}

export type NewTask = Pick<Item, 'title'> &
  Partial<Pick<Item, 'description' | 'due_date' | 'priority' | 'category'>> &
  { steps?: Step[] | null }

export interface TaskFilter {
  search: string
  category: string
  priority: number | null
  showCompleted: boolean
}

// ── Habit Templates (replaces Grinds) ──────────────────────
export interface HabitTemplate {
  id: string
  title: string
  description: string
  disabled_days: number[]       // 0=Sun..6=Sat (JS getDay)
  current_streak: number
  best_streak: number
  last_completed_date: string | null
  last_checked_date: string | null
  retired: boolean
  color_variant: number         // 0–4
  created_at: string
  updated_at: string
}

// ── Focus Batch (replaces Active Batch) ────────────────────
export interface FocusBatch {
  id: string
  item_ids: string[]
  created_at: string
}

// ── Garden Artifacts (persistent garden) ───────────────────
export interface GardenArtifact {
  id: string
  artifact_type: 'plant' | 'bush' | 'trophy' | 'rose' | 'bouquet'
  item_id: string | null
  template_id: string | null
  variant: number
  tier: number
  name: string
  placed_at: string
  position_x: number | null
  position_y: number | null
}

// ── Pomodoro (rebuilt with proper FK) ──────────────────────
export interface Pomodoro {
  id: string
  item_id: string | null
  task_title: string
  template_id: string | null
  duration_minutes: number
  completed_at: string
  created_at: string
}

export type PlantHealth = 'healthy' | 'wilting' | 'sick' | 'withered'

export interface MissedDay {
  grindId: string
  grindTitle: string
  date: string                  // YYYY-MM-DD
}

// ── Backward compat aliases ────────────────────────────────
export type Task = Item
export type Grind = HabitTemplate
export type NewGrind = Pick<HabitTemplate, 'title'> & Partial<Pick<HabitTemplate, 'disabled_days' | 'description'>>
export type ActiveBatch = FocusBatch & { completed_task_ids?: string[] }

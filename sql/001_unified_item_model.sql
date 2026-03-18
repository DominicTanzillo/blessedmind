-- ============================================================
-- Database Restructure: Unified Item Model
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create items table
CREATE TABLE items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL DEFAULT '',
  description           TEXT NOT NULL DEFAULT '',
  due_date              DATE,
  priority              SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  category              TEXT NOT NULL DEFAULT 'general',
  completed             BOOLEAN NOT NULL DEFAULT false,
  completed_at          TIMESTAMPTZ,
  starred               BOOLEAN NOT NULL DEFAULT false,
  starred_at            TIMESTAMPTZ,
  waiting               BOOLEAN NOT NULL DEFAULT false,
  waiting_reminder_date DATE,
  parent_id             UUID REFERENCES items(id) ON DELETE CASCADE,
  position              INTEGER,
  item_type             TEXT NOT NULL DEFAULT 'task'
                        CHECK (item_type IN ('task','step','habit_entry','prayer','audit')),
  source_id             UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create habit_templates table
CREATE TABLE habit_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL DEFAULT '',
  description         TEXT NOT NULL DEFAULT '',
  disabled_days       INTEGER[] NOT NULL DEFAULT '{}',
  current_streak      INTEGER NOT NULL DEFAULT 0,
  best_streak         INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  last_checked_date   DATE,
  retired             BOOLEAN NOT NULL DEFAULT false,
  color_variant       INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from items.source_id to habit_templates
ALTER TABLE items ADD CONSTRAINT fk_items_source
  FOREIGN KEY (source_id) REFERENCES habit_templates(id) ON DELETE SET NULL;

-- 3. Create focus_batch table
CREATE TABLE focus_batch (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_ids   UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create garden_artifacts table
CREATE TABLE garden_artifacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('plant','bush','trophy','rose','bouquet')),
  item_id       UUID REFERENCES items(id) ON DELETE SET NULL,
  template_id   UUID REFERENCES habit_templates(id) ON DELETE SET NULL,
  variant       INTEGER NOT NULL DEFAULT 0,
  tier          INTEGER NOT NULL DEFAULT 1,
  name          TEXT NOT NULL DEFAULT '',
  placed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  position_x    INTEGER,
  position_y    INTEGER
);

-- 5. Create pomodoros_v2 table
CREATE TABLE pomodoros_v2 (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          UUID REFERENCES items(id) ON DELETE SET NULL,
  task_title       TEXT NOT NULL DEFAULT '',
  template_id      UUID REFERENCES habit_templates(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_items_parent ON items(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_items_incomplete ON items(due_date, priority) WHERE completed = false AND waiting = false;
CREATE INDEX idx_items_type ON items(item_type);
CREATE INDEX idx_items_parent_pos ON items(parent_id, position) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_garden_type ON garden_artifacts(artifact_type);

-- ============================================================
-- RLS (single-user, allow all)
-- ============================================================
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE habit_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON habit_templates FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE focus_batch ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON focus_batch FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE garden_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON garden_artifacts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE pomodoros_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON pomodoros_v2 FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE habit_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE focus_batch;
ALTER PUBLICATION supabase_realtime ADD TABLE garden_artifacts;
ALTER PUBLICATION supabase_realtime ADD TABLE pomodoros_v2;

-- ============================================================
-- Data Migration
-- ============================================================

-- 1. Migrate tasks → items (parent tasks)
INSERT INTO items (id, title, description, due_date, priority, category,
  completed, completed_at, starred, starred_at, waiting, item_type, created_at, updated_at)
SELECT id, title, description, due_date, priority, category,
  completed, completed_at, starred, starred_at, waiting, 'task',
  created_at, updated_at
FROM tasks;

-- 2. Expand JSONB steps → child items (gen_random_uuid since step IDs aren't valid UUIDs)
INSERT INTO items (id, title, due_date, priority, category, completed, completed_at,
  parent_id, position, item_type, created_at, updated_at)
SELECT
  gen_random_uuid(),
  s->>'title',
  CASE WHEN s->>'due_date' IS NOT NULL AND s->>'due_date' != 'null'
       THEN (s->>'due_date')::date ELSE NULL END,
  t.priority, t.category,
  (s->>'completed')::boolean,
  CASE WHEN (s->>'completed')::boolean THEN t.completed_at ELSE NULL END,
  t.id,
  (ord - 1)::integer,
  'step',
  t.created_at, t.updated_at
FROM tasks t, jsonb_array_elements(t.steps) WITH ORDINALITY AS x(s, ord)
WHERE t.steps IS NOT NULL AND jsonb_array_length(t.steps) > 0;

-- 3. Migrate grinds → habit_templates
INSERT INTO habit_templates (id, title, description, disabled_days, current_streak, best_streak,
  last_completed_date, last_checked_date, retired, color_variant, created_at, updated_at)
SELECT id, title, description, disabled_days::integer[], current_streak, best_streak,
  last_completed_date, last_checked_date, retired, color_variant, created_at, updated_at
FROM grinds;

-- 4. Migrate prayers → items
INSERT INTO items (title, item_type, completed, completed_at, created_at, updated_at)
SELECT 'Prayer', 'prayer', true, completed_at, created_at, created_at FROM prayers;

-- 5. Migrate active_batch → focus_batch
INSERT INTO focus_batch (id, item_ids, created_at)
SELECT id, task_ids, created_at FROM active_batch;

-- 6. Migrate pomodoros
INSERT INTO pomodoros_v2 (id, task_title, template_id, duration_minutes, completed_at, created_at)
SELECT id, task_title, grind_id, duration_minutes, completed_at, created_at FROM pomodoros;

-- 7. Waiting tasks: copy due_date to waiting_reminder_date
UPDATE items SET waiting_reminder_date = due_date WHERE waiting = true AND due_date IS NOT NULL;

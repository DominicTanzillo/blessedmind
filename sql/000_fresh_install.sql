-- ============================================================
-- BlessedMind — fresh install schema
-- Run this ONCE in the Supabase SQL Editor on a brand-new project.
--
-- This is the consolidated, current schema. It supersedes
-- schema.sql (v1) and sql/001_unified_item_model.sql (the migration
-- that upgraded an existing v1 database). If you are starting from
-- scratch, run ONLY this file.
-- ============================================================

-- ── items ───────────────────────────────────────────────────
-- One table for everything the user "does": tasks, their sub-steps,
-- habit check-ins, prayers, time audits and sticky notes ("friction").
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
                        CHECK (item_type IN ('task','step','habit_entry','prayer','audit','friction')),
  source_id             UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── habit_templates ─────────────────────────────────────────
-- The recurring habit definitions ("grinds") with streak state.
CREATE TABLE habit_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL DEFAULT '',
  description         TEXT NOT NULL DEFAULT '',
  disabled_days       INTEGER[] NOT NULL DEFAULT '{}',   -- 0=Sun .. 6=Sat (JS getDay)
  current_streak      INTEGER NOT NULL DEFAULT 0,
  best_streak         INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  last_checked_date   DATE,
  retired             BOOLEAN NOT NULL DEFAULT false,
  color_variant       INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A habit check-in item points back at the habit it came from.
ALTER TABLE items ADD CONSTRAINT fk_items_source
  FOREIGN KEY (source_id) REFERENCES habit_templates(id) ON DELETE SET NULL;

-- ── focus_batch ─────────────────────────────────────────────
-- The current "3 things" surfaced on the dashboard.
CREATE TABLE focus_batch (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_ids   UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── garden_artifacts ────────────────────────────────────────
-- Permanent rewards placed in the terrarium when work is finished.
CREATE TABLE garden_artifacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_type TEXT NOT NULL
                CHECK (artifact_type IN ('plant','bush','trophy','rose','bouquet','note_stack')),
  item_id       UUID REFERENCES items(id) ON DELETE SET NULL,
  template_id   UUID REFERENCES habit_templates(id) ON DELETE SET NULL,
  variant       INTEGER NOT NULL DEFAULT 0,
  tier          INTEGER NOT NULL DEFAULT 1,
  name          TEXT NOT NULL DEFAULT '',
  placed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  position_x    INTEGER,
  position_y    INTEGER
);

-- ── pomodoros_v2 ────────────────────────────────────────────
CREATE TABLE pomodoros_v2 (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          UUID REFERENCES items(id) ON DELETE SET NULL,
  task_title       TEXT NOT NULL DEFAULT '',
  template_id      UUID REFERENCES habit_templates(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── time_audits ─────────────────────────────────────────────
-- An 8-hour audit = 32 blocks of 15 minutes, entries appended as JSONB.
CREATE TABLE time_audits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  entries      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_items_parent      ON items(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_items_incomplete  ON items(due_date, priority) WHERE completed = false AND waiting = false;
CREATE INDEX idx_items_type        ON items(item_type);
CREATE INDEX idx_items_parent_pos  ON items(parent_id, position) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_garden_type       ON garden_artifacts(artifact_type);
CREATE INDEX idx_audits_created    ON time_audits(created_at DESC);

-- ── Row Level Security ──────────────────────────────────────
-- This is a SINGLE-USER personal app. The anon key is allowed to do
-- everything; the only gate is the app password (see README).
-- Do NOT reuse this policy shape for a multi-user app.
ALTER TABLE items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_batch      ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoros_v2     ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_audits      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON items            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON habit_templates  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON focus_batch      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON garden_artifacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pomodoros_v2     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON time_audits      FOR ALL USING (true) WITH CHECK (true);

-- ── Realtime ────────────────────────────────────────────────
-- The UI subscribes to postgres_changes on each of these.
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE habit_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE focus_batch;
ALTER PUBLICATION supabase_realtime ADD TABLE garden_artifacts;
ALTER PUBLICATION supabase_realtime ADD TABLE pomodoros_v2;
ALTER PUBLICATION supabase_realtime ADD TABLE time_audits;

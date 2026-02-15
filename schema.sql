-- Run this in the Supabase SQL Editor

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date DATE,
  priority SMALLINT NOT NULL DEFAULT 2,  -- 1=urgent, 2=normal, 3=low
  category TEXT DEFAULT 'general',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  steps JSONB DEFAULT NULL,              -- null = simple task, [] = multi-step task
  starred BOOLEAN DEFAULT FALSE,
  starred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_active ON tasks (completed, due_date, priority);

-- Track which batch of 3 is currently active
CREATE TABLE active_batch (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_ids UUID[] NOT NULL DEFAULT '{}',
  completed_task_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: allow all via anon key (single-user personal app)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON tasks FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE active_batch ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON active_batch FOR ALL USING (true) WITH CHECK (true);

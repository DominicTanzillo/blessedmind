-- ============================================================
-- Require a signed-in session for all data access
-- Run this in the Supabase SQL Editor — but ONLY after the
-- auth-enabled build is deployed and you have confirmed you can
-- sign in. Until then the live app still uses the bare anon key
-- and these policies would lock it out.
--
-- No data is touched. This only replaces access rules.
-- Safe to run more than once.
-- ============================================================

-- Before: policies granting the anon key full read/write. Since the anon key
-- ships inside the published JavaScript bundle, that meant anyone who opened
-- the site could read and modify everything via the REST API.
--
-- After: only the `authenticated` role can touch these tables, so a session
-- token from a real sign-in is required. The anon key alone gets nothing.
--
-- Every existing policy is dropped by name rather than by a guessed list.
-- Postgres ORs permissive policies together, so one surviving open policy
-- re-opens the whole table — leaving any behind would undo the entire script.

DO $$
DECLARE
  t     text;
  pol   record;
  found boolean;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    -- current schema
    'items', 'habit_templates', 'focus_batch',
    'garden_artifacts', 'pomodoros_v2', 'time_audits',
    -- v1 leftovers: unused by the app, but they still hold readable copies
    'tasks', 'grinds', 'active_batch', 'prayers', 'pomodoros'
  ]
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t
    ) INTO found;

    IF NOT found THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY "Signed in only" ON public.%I '
      'FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);

    RAISE NOTICE 'Locked table: %', t;
  END LOOP;
END $$;

-- ── Verify ──────────────────────────────────────────────────
-- Every row must show {authenticated}. A single {public} or {anon} row means
-- that table is still readable and writable by anyone holding the anon key.
SELECT
  tablename,
  policyname,
  roles,
  CASE WHEN roles = '{authenticated}' THEN 'ok' ELSE 'STILL OPEN' END AS status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY status DESC, tablename;

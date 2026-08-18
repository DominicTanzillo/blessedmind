-- ============================================================
-- Require a signed-in session for all data access
-- Run this in the Supabase SQL Editor — but ONLY after the
-- auth-enabled build is deployed and you have confirmed you can
-- sign in. Until then the live app still uses the bare anon key
-- and these policies would lock it out.
--
-- No data is touched. This only replaces access rules.
-- ============================================================

-- Before: "Allow all" granted the anon key full read/write. Since the anon
-- key ships inside the published JavaScript bundle, that meant anyone who
-- opened the site could read and modify everything via the REST API.
--
-- After: only the `authenticated` role can touch these tables, so a session
-- token from a real sign-in is required. The anon key alone gets nothing.

DROP POLICY IF EXISTS "Allow all" ON items;
CREATE POLICY "Signed in only" ON items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON habit_templates;
CREATE POLICY "Signed in only" ON habit_templates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON focus_batch;
CREATE POLICY "Signed in only" ON focus_batch
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON garden_artifacts;
CREATE POLICY "Signed in only" ON garden_artifacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON pomodoros_v2;
CREATE POLICY "Signed in only" ON pomodoros_v2
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON time_audits;
CREATE POLICY "Signed in only" ON time_audits
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Legacy tables from the v1 schema ────────────────────────
-- These are no longer read by the app but may still exist with wide-open
-- policies, which leaves the old data readable. Close them too if present.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tasks','grinds','active_batch','prayers','pomodoros']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "Allow all for anon" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "Allow all" ON public.%I', t);
      EXECUTE format(
        'CREATE POLICY "Signed in only" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
      RAISE NOTICE 'Locked legacy table: %', t;
    END IF;
  END LOOP;
END $$;

-- ── Verify ──────────────────────────────────────────────────
-- Every row should show {authenticated} under roles. Anything showing
-- {public} or {anon} is still open to the world.
SELECT tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

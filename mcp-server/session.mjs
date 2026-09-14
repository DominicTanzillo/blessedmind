/**
 * A Supabase client that holds a signed-in session — shared by both transports.
 *
 * Since sql/002_require_auth.sql every table grants access `FOR ALL TO
 * authenticated`, so the anon key alone satisfies no policy. RLS *hides* rows
 * rather than erroring, which means an unauthenticated read returns an empty
 * list that looks exactly like "you have no tasks". Signing in first is what
 * turns that silent wrong answer into either real data or a loud failure.
 */

import { createClient } from "@supabase/supabase-js";

export function createSession({ url, anonKey, email, password }) {
  const missing = Object.entries({ url, anonKey, email, password })
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(`Missing Supabase configuration: ${missing.join(", ")}`);
  }

  // persistSession would write to disk/localStorage; this process is the only
  // holder of the session and it is short-lived, so keep it in memory.
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: true },
  });

  let signIn = null;

  /** Sign in if there is no live session. Concurrent callers share one attempt. */
  async function ensureSession() {
    const { data } = await supabase.auth.getSession();
    if (data.session) return;

    if (!signIn) {
      signIn = supabase.auth
        .signInWithPassword({ email, password })
        .then(({ error }) => {
          signIn = null;
          if (error) throw new Error(`Supabase sign-in failed: ${error.message}`);
        })
        .catch((err) => {
          signIn = null;
          throw err;
        });
    }
    await signIn;
  }

  return { supabase, ensureSession };
}

/**
 * Verify one set of credentials without disturbing a client you already hold.
 * The connector's login page uses this: the password is checked against
 * Supabase Auth itself, so the Worker never stores or compares one.
 */
export async function verifyCredentials({ url, anonKey, email, password }) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  // Nothing is kept: the session dies with this client. The grant that the
  // OAuth provider stores is what carries authority from here on.
  await client.auth.signOut();
  return { ok: true, userId: data.user?.id ?? null, email: data.user?.email ?? null };
}

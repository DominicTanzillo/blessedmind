import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// The account this app signs into. Not a secret — it only identifies which
// Supabase user to authenticate. The password is verified server-side and
// never leaves Supabase, so nothing sensitive ships in the bundle.
const AUTH_EMAIL = import.meta.env.VITE_AUTH_EMAIL as string

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  // Restore an existing session, then track sign-in/sign-out and token refresh.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session)
      setChecking(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = useCallback(async (password: string) => {
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: AUTH_EMAIL,
      password,
    })

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Incorrect password'
          : signInError.message,
      )
      return false
    }

    return true
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setAuthenticated(false)
  }, [])

  return { authenticated, checking, login, logout, error }
}

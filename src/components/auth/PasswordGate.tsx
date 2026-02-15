import { useState, type FormEvent } from 'react'
import { playWelcome } from '../../lib/sounds'

interface Props {
  onLogin: (password: string) => Promise<boolean>
  error: string
}

export default function PasswordGate({ onLogin, error }: Props) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const success = await onLogin(password)
    if (success) {
      playWelcome()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-sage-400 rounded-full mx-auto mb-5 animate-breathe" />
          <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">BlessedMind</h1>
          <p className="text-stone-400 mt-2 text-sm leading-relaxed">
            Come to me, all who are weary<br />
            and heavy laden, and I will give you rest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-sage-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition text-center tracking-widest"
            placeholder="Enter your password"
            autoFocus
          />
          {error && (
            <p className="text-terracotta text-sm mt-3 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-4 py-3.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Opening...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

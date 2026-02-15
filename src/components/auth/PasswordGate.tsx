import { useState, type FormEvent } from 'react'
import { playWelcome } from '../../lib/sounds'

const VERSES = [
  // Ora et Labora — pray and work
  { text: 'Ora et Labora.\nPray and work.', ref: 'Rule of St. Benedict' },
  { text: 'Whatever you do, work heartily,\nas for the Lord and not for men.', ref: 'Colossians 3:23' },
  { text: 'Commit your work to the Lord,\nand your plans will be established.', ref: 'Proverbs 16:3' },
  { text: 'Whatever your hand finds to do,\ndo it with all your might.', ref: 'Ecclesiastes 9:10' },
  { text: 'The soul of the sluggard craves\nand gets nothing,\nwhile the soul of the diligent\nis richly supplied.', ref: 'Proverbs 13:4' },
  { text: 'Do not grow weary of doing good,\nfor in due season we will reap,\nif we do not give up.', ref: 'Galatians 6:9' },
  { text: 'Laborare est orare.\nTo work is to pray.', ref: 'Benedictine motto' },
  { text: 'The harvest is plentiful,\nbut the laborers are few.', ref: 'Matthew 9:37' },
  { text: 'He who began a good work in you\nwill bring it to completion.', ref: 'Philippians 1:6' },
  { text: 'I can do all things through Him\nwho strengthens me.', ref: 'Philippians 4:13' },
  { text: 'Well done, good and faithful servant.\nYou have been faithful over a little;\nI will set you over much.', ref: 'Matthew 25:21' },
  { text: 'In all toil there is profit,\nbut mere talk tends only to poverty.', ref: 'Proverbs 14:23' },
  { text: 'The plans of the diligent\nlead surely to abundance.', ref: 'Proverbs 21:5' },
  { text: 'Unless the Lord builds the house,\nthose who build it labor in vain.', ref: 'Psalm 127:1' },
  { text: 'Be steadfast, immovable,\nalways abounding in the work of the Lord,\nknowing that your labor\nis not in vain.', ref: '1 Corinthians 15:58' },
  { text: 'Start by doing what is necessary;\nthen do what is possible;\nand suddenly you are doing\nthe impossible.', ref: 'St. Francis of Assisi' },
  { text: 'Take therefore no thought for the morrow:\nfor the morrow shall take thought\nfor the things of itself.\nSufficient unto the day\nis the evil thereof.', ref: 'Matthew 6:34' },
  { text: 'God does not ask for\nthe impossible,\nbut wants you to do what you can.', ref: 'St. Alphonsus Liguori' },
]

function getVerse() {
  return VERSES[Math.floor(Math.random() * VERSES.length)]
}

interface Props {
  onLogin: (password: string) => Promise<boolean>
  error: string
}

export default function PasswordGate({ onLogin, error }: Props) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [verse] = useState(getVerse)

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
          <div className="w-20 h-20 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 bg-sage-400 rounded-full animate-breathe" />
          </div>
          <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">BlessedMind</h1>
          <p className="text-stone-400 mt-4 text-sm leading-relaxed whitespace-pre-line italic">
            {verse.text}
          </p>
          <p className="text-stone-300 text-xs mt-2">{verse.ref}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
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
            <p className="text-terracotta text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Opening...' : 'Enter His Rest'}
          </button>
        </form>

        <p className="text-center text-stone-300 text-xs mt-6">
          Lay down what weighs on you.
        </p>
      </div>
    </div>
  )
}
